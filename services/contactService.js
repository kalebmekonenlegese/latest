const prisma = require('../utils/db');
const { validateEmail, validatePhoneNumber } = require('../utils/validation');

const submitContact = async ({ firstName, lastName, email, phone, subject, message }) => {
  const errors = [];
  if (!firstName || !firstName.trim()) errors.push('First name required');
  if (!lastName || !lastName.trim()) errors.push('Last name required');
  if (!validateEmail(email)) errors.push('Valid email required');
  if (!validatePhoneNumber(phone)) errors.push('Valid phone number required');
  if (!subject || !subject.trim()) errors.push('Subject required');
  if (!message || !message.trim()) errors.push('Message required');

  if (errors.length) {
    const error = new Error('Validation failed');
    error.status = 400;
    error.details = errors;
    throw error;
  }

  return prisma.contactSubmission.create({
    data: { firstName, lastName, email, phone, subject, message, status: 'new' }
  });
};

module.exports = { submitContact };