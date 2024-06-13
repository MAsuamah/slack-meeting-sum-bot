import pkg from '@slack/bolt';
import 'dotenv/config';
import { summarizeFile, getFileName, searchFiles } from './googleDrive.js';

const { App } = pkg;
const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	socketMode: true,
	appToken: process.env.SLACK_APP_TOKEN,
});

const publishSummary = async() => {
  const posts = await searchFiles();
  const postPromises = posts.map(post => {
    return app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: 'C06C7LU2N73',
      text: `⏩ *_${post.fileName}_* \n ${post.summary} \n\n 🔗 *Meeting Link:* ${post.meetingLink}`
    });
  });

  await Promise.all(postPromises);
};

app.command('/mtg', async ({ command, ack, say }) => {
	await ack();

  let meetingURL = command.text;
  let urlSplit = meetingURL.split('/');
  let meetingId = urlSplit[5];
  const title = await getFileName(meetingId);

  try {
    const response = await summarizeFile(meetingId);
    await say(`⏩ *_${title}_* \n ${response.summary} \n\n 🔗 *Meeting Link:* ${meetingURL}`);
  } catch (error) {
      console.error('Error:', error);
  }
});

const startApp = async () => {
  await app.start(process.env.PORT || 3000);
  console.log(`⚡️ Bot app is running on port ${process.env.PORT || 3000}!`);
  await publishSummary();
};

startApp();
