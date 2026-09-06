require('dotenv').config();

const { sendEmail } = require('../services/emailService');

const recipient = process.env.EMAIL_TEST_RECIPIENT || process.env.HOTEL_NOTIFICATION_EMAIL;

if (!recipient) {
  console.error('Set EMAIL_TEST_RECIPIENT or HOTEL_NOTIFICATION_EMAIL before running the email test.');
  process.exit(1);
}

sendEmail({
  to: recipient,
  subject: 'Hatsey Kaleb Hotel SMTP test',
  text: 'SMTP delivery is configured and the transactional email service is reachable.'
}).then((result) => {
  if (!result.sent) {
    console.error(`Email test failed: ${result.reason || 'unknown error'}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Email test sent to ${recipient}. Message ID: ${result.messageId || 'not provided'}`);
}).catch((error) => {
  console.error(`Email test failed: ${error.message}`);
  process.exitCode = 1;
});
