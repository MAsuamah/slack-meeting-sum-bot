import pkg from '@slack/bolt';
import { AssemblyAI } from "assemblyai";
import 'dotenv/config'

const { App } = pkg;

const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	socketMode: true,
	appToken: process.env.SLACK_APP_TOKEN,
});

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

app.command('/sum', async ({ command, ack, say }) => {
	await ack();
  
  let meetingURL = command.text;
  let urlSplit = meetingURL.split('/');
  let meetingId = urlSplit[5];
  let audioUrl = `https://drive.google.com/u/0/uc?id=${meetingId}&export=download`
  const params = { audio: audioUrl }
  const transcript = await client.transcripts.transcribe(params)
  const prompt = `Provide a summary of this meeting. Make sure to highlight important topics of the meeting and do so by providing a title for each topic, one sentence briefly describing the topic, 2-3 bullet points summarizing the topic, and a list action items for each topic. 
                  The format should look like this:
                  *<topic header>*
                  _<topic summary>_
                  <* bullet point list summarizing topic> \n\n
                  :white_check_mark: _Action Items_:
                  <* list of action items>
                  `
  const {response}  = await client.lemur.task({
    transcript_ids: [transcript.id],
    prompt
  })

  console.log(response)

  await say(`⏩ *_Meeting Summary:_* \n ${response} \n\n 🔗 *Meeting Link:* ${meetingURL} `)

});

(async () => {
	// Start your app
	await app.start(process.env.PORT || 3000);
	console.log(`⚡️ Bot app is running on port ${process.env.PORT || 3000}!`);
})();