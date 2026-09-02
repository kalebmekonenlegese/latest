const dotenv = require('dotenv');
const stripe = require('stripe');

dotenv.config();

const environment = process.env.NODE_ENV || 'development';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const stripeClient = process.env.STRIPE_SECRET_KEY ? stripe(process.env.STRIPE_SECRET_KEY) : null;

module.exports = {
  environment,
  frontendUrl,
  stripeClient
};
