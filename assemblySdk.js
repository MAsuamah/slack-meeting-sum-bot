import { AssemblyAI } from "assemblyai";
import 'dotenv/config';

const client = new AssemblyAI({apiKey: process.env.ASSEMBLYAI_API_KEY});

export const assemblySdk = async(meetingAudio) => {
    const params = { audio: meetingAudio }
    const transcript = await client.transcripts.transcribe(params)
    const prompt = `Provide a summary of this meeting. Make sure to highlight important topics of the meeting and do so by providing a title for each topic, one sentence briefly describing the topic, 2-3 bullet points summarizing the topic, and a list action items for each topic. 
                    The format should look like this:
                    *<topic header>*
                    _<topic summary>_
                    <* bullet point list summarizing topic> \n\n
                    ✅ _Action Items_:
                    <* list of action items>
                    `
    const { response } = await client.lemur.task({transcript_ids: [transcript.id], prompt});
    
    return response;
};


