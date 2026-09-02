const { submitContact } = require('../services/contactService');
const auditEvent = require('../middlewares/audit');
const { sendContactNotification } = require('../services/emailService');

const contact = async (req, res) => {
  try {
    const submission = await submitContact(req.body);
    const email = await sendContactNotification(submission);
    auditEvent(req, 'contact_submission', 'success', { submissionId: submission.id });
    res.status(201).json({ success: true, message: 'Your message has been sent. We will respond shortly.', emailSent: email.sent, submissionId: submission.id, requestId: req.id });
  } catch (error) {
    auditEvent(req, 'contact_submission', 'failed', { error: error.message });
    res.status(error.status || 500).json({ error: error.message, details: error.details || undefined, requestId: req.id });
  }
};

module.exports = { contact };