import { google } from 'googleapis';
import { assemblySdk } from './assemblySdk.js';
import 'dotenv/config';

const oauth2Client = new google.auth.OAuth2 (
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);

oauth2Client.setCredentials({refresh_token: process.env.REFRESH_TOKEN });
const drive = google.drive({version: 'v3', auth: oauth2Client});

export const getFileName = async (id) => {
    try {
        const response = await drive.files.get({ fileId: id, fields: 'name'});
        let { name } = response.data;
        return name;
    } catch(error) {
      console.log(error.message);
    }
}

export const searchFiles = async() => {
    try {
        const response = await drive.files.list({
            q: `sharedWithMe and name contains 'Sprint Planning' and mimeType contains 'video/' and not starred`,
            fields:  'files(id, name, webViewLink)',
            orderBy: 'createdTime'
        });

        let { files } = response.data;
        const summaryPromises = files.map(summarizeFile);
        const summaries = await Promise.all(summaryPromises);
    
        const starFilePromises = files.map(file => {
            return drive.files.update({
                fileId: file.id,
                requestBody: {
                    starred: true
                }
            });
        }); 

        await Promise.all(starFilePromises);

        return summaries;

    } catch(error) {
      console.log(error.message);
    }
};

export const summarizeFile = async(file) => {
    let id = typeof file !== 'string' ? file.id : file;
    try {
        const response = await drive.files.get({fileId: id, alt: 'media'}, {responseType: 'stream'});
        const chunks = [];
        const summary = await new Promise((resolve, reject) => {
            response.data.on('data', (chunk) => { chunks.push(chunk)});
            response.data.on('end', async () => {
                const buffer = Buffer.concat(chunks);
                try {
                    const summary = await assemblySdk(buffer);
                    resolve(summary); // Resolve the promise with summary
                } catch (error) {
                    console.error('Error generating summary:', error);
                    reject(error); // Reject the promise if there's an error
                }
            });
        });
        return { fileName: file.name, summary, meetingLink: file.webViewLink };
    } catch(error) {
        console.error('Error fetching file:', error);
        throw error;    
    }
}

searchFiles()

