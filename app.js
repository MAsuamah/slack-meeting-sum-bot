import pkg from '@slack/bolt';
import 'dotenv/config';
import { summarizeFile, getFileName, searchFiles } from './googleDrive.js';
import { CronJob } from 'cron';

const { App } = pkg;
const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	socketMode: true,
	appToken: process.env.SLACK_APP_TOKEN,
});

const job = new CronJob(
  '0 13 * * 1',
  async () => {
    try {
      await publishSummary()
    } catch (error) {
      console.error('Error publishing summary:', error);
    }
  },
  null,
  'America/New_York'
);

const publishSummary = async() => {
  const posts = await searchFiles();
  const postPromises = posts.map(post => {
    return app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: 'C076J8GLWTZ',
      text: `⏩ *_${post.fileName}_* \n ${post.summary} \n\n 🔗 *Meeting Link:* ${post.meetingLink}`
    });
  });

  await Promise.all(postPromises);
  console.log('Done!')
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
  const port = process.env.PORT || 3000;
  console.log(`Starting app on port: ${port}`);

  try {
    await app.start(port);
    console.log(`⚡️ Bot app is running on port ${port}!`);
    job.start();
  } catch (error) {
    console.error('Failed to start app:', error);
  }
};

startApp();
