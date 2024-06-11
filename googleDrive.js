import { google } from 'googleapis';
import 'dotenv/config'

const oauth2Client = new google.auth.OAuth2 (
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
)

oauth2Client.setCredentials({refresh_token: process.env.REFRESH_TOKEN })

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
})

const searchFiles = async() => {
    try {
        const response = await drive.files.list({
            q: `sharedWithMe and name contains 'Sprint Planning' and not starred`,
            fields:  'files(id, name)',
        })
        console.log(response.data);
    } catch(error) {
      console.log(error.message);
    }
}

searchFiles()