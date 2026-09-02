/**
 * Hatsey Kaleb Hotel - API Integration Module
 * Connects all frontend forms to backend API endpoints
 *
 * Phase 14: Backend API Integration
 */

(function initializeAPIIntegration() {
  // Wait for API client to be available
  const maxAttempts = 20;
  let attempts = 0;

  function checkAPIReady() {
    if (window.hotelAPI) {
      setupFormIntegration();
      return;
    }

    if (attempts < maxAttempts) {
      attempts++;
      setTimeout(checkAPIReady, 250);
    } else {
      console.warn('API client not loaded, forms will work in local mode');
    }
  }

  function setupFormIntegration() {
    setupContactFormIntegration();
    setupNewsletterFormIntegration();
    setupEventFormIntegration();
    setupReviewFormIntegration();
  }

  // ============================================================
  // CONTACT FORM INTEGRATION
  // ============================================================

  function setupContactFormIntegration() {
    // Find all contact forms
    const contactForms = document.querySelectorAll('[id*="contact"], [class*="contact-form"]');

    contactForms.forEach((form) => {
      if (form.tagName === 'FORM' && form.id !== 'contact-form') {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();

          try {
            // Gather form data
            const nameField = form.querySelector('[name="name"], [id*="name"]');
            const emailField = form.querySelector('[name="email"], [id*="email"]');
            const phoneField = form.querySelector('[name="phone"], [id*="phone"]');
            const subjectField = form.querySelector('[name="subject"], [id*="subject"]');
            const messageField = form.querySelector('[name="message"], [id*="message"]');

            if (!nameField || !emailField || !messageField) {
              console.warn('Contact form missing required fields');
              return;
            }

            const nameParts = nameField.value.trim().split(/\s+/);
            const contactData = {
              firstName: nameParts[0] || 'Guest',
              lastName: nameParts.slice(1).join(' ') || 'User',
              email: emailField?.value || '',
              phone: phoneField?.value || '',
              subject: subjectField?.value || 'Inquiry',
              message: messageField?.value || ''
            };

            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton?.textContent;
            if (submitButton) {
              submitButton.textContent = 'Sending...';
              submitButton.disabled = true;
            }

            // Send to backend
            const result = await window.hotelAPI.submitContact(contactData);

            if (result.success) {
              // Show success message
              const resultElement =
                form.querySelector('[id*="result"], [class*="result"]') ||
                document.createElement('div');
              resultElement.textContent =
                result.message || 'Thank you! We will get back to you soon.';
              resultElement.style.color = 'green';

              if (!resultElement.parentNode) {
                form.appendChild(resultElement);
              }

              // Reset form
              form.reset();

              // Clear message after 5 seconds
              setTimeout(() => {
                resultElement.textContent = '';
              }, 5000);

              window.hotelAPI?.trackEvent('contact_form_success', {
                subject: contactData.subject
              });
            }

            if (submitButton) {
              submitButton.textContent = originalText;
              submitButton.disabled = false;
            }
          } catch (error) {
            console.error('Contact API error:', error);

            const resultElement =
              form.querySelector('[id*="result"], [class*="result"]') ||
              document.createElement('div');
            resultElement.textContent = `Error: ${error.error || 'Failed to submit form'}`;
            resultElement.style.color = 'red';

            if (!resultElement.parentNode) {
              form.appendChild(resultElement);
            }

            window.hotelAPI?.trackEvent('contact_form_error', {
              error: error.error
            });
          }
        });
      }
    });
  }

  // ============================================================
  // NEWSLETTER FORM INTEGRATION
  // ============================================================

  function setupNewsletterFormIntegration() {
    const newsletterForm = document.getElementById('newsletter-form');
    if (!newsletterForm) {
      return;
    }

    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      try {
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        if (!emailInput) {
          return;
        }

        const email = emailInput.value.trim();

        // Show loading state
        const resultElement = document.getElementById('newsletter-result');
        if (resultElement) {
          resultElement.textContent = 'Subscribing...';
        }

        // Send to backend
        const result = await window.hotelAPI.subscribeNewsletter(email);

        if (result.success) {
          if (resultElement) {
            resultElement.textContent = result.message || 'Successfully subscribed!';
            resultElement.style.color = 'green';
          }

          emailInput.value = '';

          // Clear message after 5 seconds
          setTimeout(() => {
            if (resultElement) {
              resultElement.textContent = '';
            }
          }, 5000);

          window.hotelAPI?.trackEvent('newsletter_subscribe_success', {
            email: email
          });
        }
      } catch (error) {
        console.error('Newsletter API error:', error);

        const resultElement = document.getElementById('newsletter-result');
        if (resultElement) {
          if (error.status === 409) {
            resultElement.textContent = error.error || 'Already subscribed';
          } else {
            resultElement.textContent = `Error: ${error.error || 'Failed to subscribe'}`;
          }
          resultElement.style.color = 'orange';
        }

        window.hotelAPI?.trackEvent('newsletter_subscribe_error', {
          error: error.error
        });
      }
    });
  }

  // ============================================================
  // EVENT FORM INTEGRATION
  // ============================================================

  function setupEventFormIntegration() {
    const eventForm = document.getElementById('event-booking-form');
    if (!eventForm || eventForm.dataset.eventSubmitBound === 'true') {
      return;
    }

    eventForm.dataset.eventSubmitBound = 'true';

    eventForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Collect event data and send as contact inquiry
      const eventType = document.getElementById('event-type')?.value || 'event';
      const guestCount = document.getElementById('event-guests')?.value || '0';
      const hallField = document.getElementById('event-hall')?.value || 'Not specified';
      const dateField = document.getElementById('event-date')?.value || 'Not specified';
      const name = document.getElementById('event-name')?.value.trim() || '';
      const email = document.getElementById('event-email')?.value.trim() || '';
      const phone = document.getElementById('event-phone')?.value.trim() || '';
      const budget = document.getElementById('event-budget')?.value || 'Not specified';
      const catering = document.getElementById('event-catering')?.value || 'Not specified';
      const notes = document.getElementById('event-notes')?.value.trim() || 'None';

      if (!name || !email || !phone || !dateField) {
        const resultElement = document.getElementById('event-result');
        if (resultElement) resultElement.textContent = 'Please complete your name, email, phone, and preferred date.';
        return;
      }

      try {
        const nameParts = name.split(/\s+/);
        const eventData = {
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' ') || nameParts[0],
          email,
          phone,
          subject: `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} Inquiry`,
          message: `Event Type: ${eventType}\nGuest Count: ${guestCount}\nHall: ${hallField}\nDate: ${dateField}\nBudget: ${budget}\nCatering: ${catering}\nNotes: ${notes}`
        };

        const resultElement = document.getElementById('event-result');
        if (resultElement) resultElement.textContent = 'Sending your event inquiry...';
        const result = await window.hotelAPI.submitContact(eventData);
        if (result.success) {
          if (resultElement) {
            resultElement.textContent = result.message || 'Your event inquiry was sent. Our team will confirm availability shortly.';
          }
          window.hotelAPI?.trackEvent('event_inquiry_success', {
            eventType: eventType,
            guestCount: guestCount
          });
        }
      } catch (error) {
        console.error('Event inquiry error:', error);
        const resultElement = document.getElementById('event-result');
        if (resultElement) resultElement.textContent = error.error || 'Unable to send your event inquiry.';
        window.hotelAPI?.trackEvent('event_inquiry_error', {
          error: error.error
        });
      }
    });
  }

  // ============================================================
  // REVIEW FORM INTEGRATION
  // ============================================================

  function setupReviewFormIntegration() {
    // Find review forms
    const reviewForms = document.querySelectorAll('[id*="review"], [class*="review-form"]');

    reviewForms.forEach((form) => {
      if (form.tagName === 'FORM' && !form.hasAttribute('data-api-integrated')) {
        form.setAttribute('data-api-integrated', 'true');

        form.addEventListener('submit', async (e) => {
          e.preventDefault();

          // Only submit if user is authenticated
          if (!window.hotelAPI?.isAuthenticated()) {
            alert('Please log in to submit a review');
            return;
          }

          try {
            const ratingField = form.querySelector('[name="rating"]');
            const titleField = form.querySelector('[name="title"]');
            const commentField = form.querySelector('[name="comment"]');

            if (!ratingField || !titleField || !commentField) {
              console.warn('Review form missing required fields');
              return;
            }

            const reviewData = {
              bookingId: form.dataset.bookingId || `booking_${Date.now()}`,
              rating: parseInt(ratingField.value),
              title: titleField.value,
              comment: commentField.value
            };

            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton?.textContent;
            if (submitButton) {
              submitButton.textContent = 'Submitting...';
              submitButton.disabled = true;
            }

            // Send to backend
            const result = await window.hotelAPI.submitReview(reviewData);

            if (result.success) {
              const resultElement =
                form.querySelector('[id*="result"]') || document.createElement('div');
              resultElement.textContent = 'Thank you for your review!';
              resultElement.style.color = 'green';

              if (!resultElement.parentNode) {
                form.appendChild(resultElement);
              }

              form.reset();

              setTimeout(() => {
                resultElement.textContent = '';
              }, 5000);

              window.hotelAPI?.trackEvent('review_submit_success', {
                rating: reviewData.rating
              });
            }

            if (submitButton) {
              submitButton.textContent = originalText;
              submitButton.disabled = false;
            }
          } catch (error) {
            console.error('Review API error:', error);

            const resultElement =
              form.querySelector('[id*="result"]') || document.createElement('div');
            resultElement.textContent = `Error: ${error.error || 'Failed to submit review'}`;
            resultElement.style.color = 'red';

            if (!resultElement.parentNode) {
              form.appendChild(resultElement);
            }

            window.hotelAPI?.trackEvent('review_submit_error', {
              error: error.error
            });
          }
        });
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAPIReady);
  } else {
    checkAPIReady();
  }
})();
