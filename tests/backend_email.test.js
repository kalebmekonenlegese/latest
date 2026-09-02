jest.mock('../utils/logger', () => ({
  warn: jest.fn(),
  error: jest.fn()
}));

describe('emailService', () => {
  test('reports delivery unavailable when SMTP is not configured', async () => {
    const { sendEmail } = require('../services/emailService');

    await expect(sendEmail({
      to: 'guest@example.com',
      subject: 'Test',
      text: 'Test message'
    })).resolves.toEqual({ sent: false, reason: 'not_configured' });
  });
});
