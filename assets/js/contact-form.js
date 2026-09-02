import '../config/app-config.js';
import './api-client.js';

// ========== INLINE VALIDATORS (Previously in validators.js) ==========
const validators = {
  isEmail: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || ''),
  isRequired: (value) => Boolean((value || '').toString().trim()),
  strength: (password) => {
    let score = 0;
    if (!password) {
      return 0;
    }
    if (password.length >= 8) {
      score += 1;
    }
    if (/[A-Z]/.test(password)) {
      score += 1;
    }
    if (/\d/.test(password)) {
      score += 1;
    }
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    }
    return score;
  }
};

// ========== FORM HANDLING ==========
function initializeContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const showError = (fieldName, message) => {
    let error = form.querySelector(`.field-error[data-for="${fieldName}"]`);
    if (!error && fieldName === 'form') {
      error = document.createElement('div');
      error.className = 'field-error';
      error.dataset.for = 'form';
      error.setAttribute('role', 'alert');
      error.setAttribute('aria-live', 'assertive');
      form.appendChild(error);
    }
    if (error) {
      error.textContent = message;
      error.style.display = 'block';
    }
  };

  const clearErrors = () => {
    form.querySelectorAll('.field-error').forEach((error) => {
      error.textContent = '';
      error.style.display = 'none';
    });

    const success = form.querySelector('.success');
    if (success) success.style.display = 'none';
  };

  const showSuccess = (message = 'Thank you! Your message has been received.') => {
    let success = form.querySelector('.success');
    if (!success) {
      success = document.createElement('div');
      success.className = 'success';
      success.setAttribute('role', 'status');
      success.setAttribute('aria-live', 'polite');
      success.style.marginTop = '12px';
      success.style.padding = '12px';
      success.style.borderRadius = '6px';
      success.style.background = '#d4edda';
      success.style.color = '#155724';
      success.textContent = message;
      form.appendChild(success);
    }
    success.style.display = 'block';
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    clearErrors();

    const name = form.querySelector('input[name="name"]');
    const email = form.querySelector('input[name="email"]');
    const phone = form.querySelector('input[name="phone"]');
    const subject = form.querySelector('select[name="subject"]');
    const message = form.querySelector('textarea[name="message"]');

    let invalid = false;

    if (!name || !validators.isRequired(name.value)) {
      showError('name', 'Please enter your name');
      invalid = true;
    }

    if (!email || !validators.isEmail(email.value)) {
      showError('email', 'Please enter a valid email');
      invalid = true;
    }

    if (phone && phone.value && !/^[+\d\s()-]{7,}$/.test(phone.value)) {
      showError('phone', 'Please enter a valid phone number');
      invalid = true;
    }

    if (!subject || !subject.value) {
      showError('subject', 'Please select a subject');
      invalid = true;
    }

    if (!message || !validators.isRequired(message.value)) {
      showError('message', 'Please enter a message');
      invalid = true;
    }

    if (invalid) {
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton?.textContent;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    try {
      const nameParts = name.value.trim().split(/\s+/);
      const result = await window.hotelAPI.submitContact({
        firstName: nameParts[0] || 'Guest',
        lastName: nameParts.slice(1).join(' ') || 'User',
        email: email.value.trim(),
        phone: phone?.value.trim() || '',
        subject: subject.value,
        message: message.value.trim()
      });

      showSuccess(result.message || 'Thank you! Your message has been received.');
      form.reset();
    } catch (error) {
      showError('form', error.error || 'Unable to send your message. Please try again.');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
}

// Initialize on DOMContentLoaded with requestIdleCallback for better performance
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => initializeContactForm(), { timeout: 2000 });
    } else {
      initializeContactForm();
    }
  });
} else {
  // Document already loaded
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => initializeContactForm(), { timeout: 2000 });
  } else {
    initializeContactForm();
  }
}
