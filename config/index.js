const dotenv = require('dotenv');

dotenv.config();

const environment = process.env.NODE_ENV || 'development';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const stripeClient = null;
const chapaSecretKey = process.env.CHAPA_SECRET_KEY || 'chapa-test-secret';
const chapaApiBaseUrl = process.env.CHAPA_API_BASE_URL || 'https://api.chapa.co/v1';
const chapaCallbackUrl = process.env.CHAPA_CALLBACK_URL || `${frontendUrl}/api/payments/chapa/callback`;
const chapaReturnUrl = process.env.CHAPA_RETURN_URL || `${frontendUrl}/booking/success`;

module.exports = {
  environment,
  frontendUrl,
  stripeClient,
  chapaSecretKey,
  chapaApiBaseUrl,
  chapaCallbackUrl,
  chapaReturnUrl
};
