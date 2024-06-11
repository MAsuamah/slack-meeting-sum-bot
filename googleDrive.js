import { google } from 'googleapis';
import 'dotenv/config';
import { generateSummary } from './generateSummary.js';

const oauth2Client = new google.auth.OAuth2 (
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);

oauth2Client.setCredentials({refresh_token: process.env.REFRESH_TOKEN });
const drive = google.drive({version: 'v3', auth: oauth2Client});

const searchFiles = async() => {
    try {
        const response = await drive.files.list({
            q: `sharedWithMe and name contains 'Sprint Planning' and not starred`,
            fields:  'files(id, name)',
            orderBy: 'createdTime'
        })
        let { files } = response.data
        for (const file of files) {
            await downloadAndGetInsight(file);
        }
        return response.status;
    } catch(error) {
      console.log(error.message);
    }
}

export const downloadAndGetInsight = async(file) => {
    let id = typeof file !== 'string' ? file.id : file;
    try {
        const response = await drive.files.get(
            {fileId: id, alt: 'media'},
            {responseType: 'stream'}
        )

        const chunks = [];
        response.data.on('data', (chunk) => {chunks.push(chunk);});
        return new Promise((resolve, reject) => {
            response.data.on('end', async () => {
                const buffer = Buffer.concat(chunks);
                try {
                    const summary = await generateSummary(buffer);
                    resolve(summary); // Resolve the promise with summary
                } catch (error) {
                    console.error('Error generating summary:', error);
                    reject(error); // Reject the promise if there's an error
                }
            });
        });
    } catch(error) {
        console.error('Error fetching file:', error);
        throw error;    
    }
}

searchFiles()