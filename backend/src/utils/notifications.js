const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const twilio = require('twilio');

require('dotenv').config();

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY
  }
});

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendEmail(to, subject, text) {
  if (!to) {
    console.log('[EMAIL skipped] no email provided');
    return;
  }

  try {
    const command = new SendEmailCommand({
      Source: process.env.SES_FROM_EMAIL,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: { Text: { Data: text } }
      }
    });
    await sesClient.send(command);
    console.log('Email sent to', to);
  } catch (e) {
    console.error('SES error', e.message);
  }
}

async function sendSms(to, body) {
  if (!to || !process.env.TWILIO_FROM_NUMBER.startsWith('+')) {
    console.log('[SMS skipped] invalid config or no phone');
    return;
  }
  try {
    await twilioClient.messages.create({
      to,
      from: process.env.TWILIO_FROM_NUMBER,
      body
    });
    console.log('SMS sent to', to);
  } catch (e) {
    console.error('Twilio error', e.message);
  }
}

module.exports = { sendEmail, sendSms };
