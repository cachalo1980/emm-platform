const { google } = require('googleapis');
require('dotenv').config();

async function listEnterprises() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            scopes: ['https://www.googleapis.com/auth/androidmanagement'],
        });
        const client = await auth.getClient();
        const projectId = await auth.getProjectId();
        const amapi = google.androidmanagement({ version: 'v1', auth: client });

        console.log(`Checking project: ${projectId}`);
        // List enterprises does NOT exist directly, you have to save the enterprise name 
        // when you create it. 
        // BUT we can try to get the one we hardcoded in DB.

        const enterpriseName = 'enterprises/LC035ekk1v';
        console.log(`Getting info for: ${enterpriseName}`);

        const res = await amapi.enterprises.get({ name: enterpriseName });
        console.log("Enterprise Info:", res.data);
        console.log("Status: ACTIVE");

    } catch (e) {
        console.error("Error:", e.message);
        console.error("Details:", e.response ? e.response.data : '');
    }
}

listEnterprises();
