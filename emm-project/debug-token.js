const { google } = require('googleapis');
require('dotenv').config();

async function generateFreshToken() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            scopes: ['https://www.googleapis.com/auth/androidmanagement'],
        });
        const client = await auth.getClient();
        const amapi = google.androidmanagement({ version: 'v1', auth: client });

        // UPDATED Enterprise ID
        const enterpriseName = 'enterprises/LC01gv1dgb';
        const policyName = `${enterpriseName}/policies/policy1`;

        console.log(`Generating NEW token for policy: ${policyName}`);

        const tokenRes = await amapi.enterprises.enrollmentTokens.create({
            parent: enterpriseName,
            requestBody: {
                policyName: policyName,
                duration: '3600s', // 1 hour validity
                oneTimeOnly: false // Allow multiple uses
            }
        });

        console.log("\n✅ Token Created!");
        console.log("Token Value:", tokenRes.data.value);
        console.log("QR Code URL:", tokenRes.data.qrCode);

    } catch (e) {
        console.error("Error:", e.message);
        if (e.response) console.error(JSON.stringify(e.response.data, null, 2));
    }
}

generateFreshToken();
