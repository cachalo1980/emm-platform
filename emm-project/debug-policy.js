const { google } = require('googleapis');
require('dotenv').config();

async function checkPolicy() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            scopes: ['https://www.googleapis.com/auth/androidmanagement'],
        });
        const client = await auth.getClient();
        const amapi = google.androidmanagement({ version: 'v1', auth: client });

        const policyName = 'enterprises/LC035ekk1v/policies/policy1';
        console.log(`Checking policy: ${policyName}`);

        const res = await amapi.enterprises.policies.get({ name: policyName });
        console.log("Policy Info:", JSON.stringify(res.data, null, 2));

    } catch (e) {
        console.error("Error:", e.message);
        console.error("Details:", e.response ? e.response.data : '');
    }
}

checkPolicy();
