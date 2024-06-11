import pkg from '@slack/bolt';
import 'dotenv/config'
import { downloadAndGetInsight, getFileName } from './googleDrive.js';

const { App } = pkg;
const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	socketMode: true,
	appToken: process.env.SLACK_APP_TOKEN,
});

app.command('/sum', async ({ command, ack, say }) => {
	await ack();

  let meetingURL = command.text;
  let urlSplit = meetingURL.split('/');
  let meetingId = urlSplit[5];
  const title = await getFileName(meetingId)

  try {
    const response = await downloadAndGetInsight(meetingId);
    await say(`⏩ *_${title}_* \n ${response.summary} \n\n 🔗 *Meeting Link:* ${meetingURL}`)
  } catch (error) {
      console.error('Error:', error);
  }
});

(async () => {
	await app.start(process.env.PORT || 3000);
	console.log(`⚡️ Bot app is running on port ${process.env.PORT || 3000}!`);
})();