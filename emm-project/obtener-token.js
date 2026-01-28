const { google } = require('googleapis');
require('dotenv').config();

async function getToken() {
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/androidmanagement'],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    console.log(token.token);
}
getToken();