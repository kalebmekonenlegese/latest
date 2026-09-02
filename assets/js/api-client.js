/**
 * Hatsey Kaleb Hotel - Frontend API Client
 *
 * Unified API client for all backend communications
 * Handles: Auth, Bookings, Payments, Contact, Reviews, Newsletter, Analytics
 */

class HotelAPIClient {
  constructor(config = {}) {
    this.baseURL = config.apiUrl || window.location.origin;
    this.token = null;
    this.userId = localStorage.getItem('hotel_user_id') || null;
    this.csrfToken = null;
    this.csrfRequest = null;
    this.requestTimeout = config.requestTimeout || 30000;
  }

  // ============================================================
  // CORE API METHODS
  // ============================================================

  async fetchCsrfToken() {
    if (this.csrfRequest) {
      return this.csrfRequest;
    }

    const url = `${this.baseURL}/api/csrf-token`;
    this.csrfRequest = (async () => {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      });

      const result = await response.json();
      if (response.ok && result.csrfToken) {
        this.csrfToken = result.csrfToken;
        return this.csrfToken;
      }

      throw new Error(result.error || 'Failed to fetch CSRF token');
    })();

    try {
      return await this.csrfRequest;
    } finally {
      this.csrfRequest = null;
    }
  }

  async request(method, endpoint, data = null, retryOnCsrf = true) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (method !== 'GET' && endpoint !== '/api/csrf-token') {
      await this.fetchCsrfToken();
      headers['X-CSRF-Token'] = this.csrfToken;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
    const options = {
      method,
      headers,
      credentials: 'include',
      signal: controller.signal
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          error: result.error,
          details: result.details,
          requestId: result.requestId
        };
      }

      return result;
    } catch (error) {
      if (retryOnCsrf && error.status === 403 && error.error === 'Invalid CSRF token') {
        this.csrfToken = null;
        await this.fetchCsrfToken();
        return this.request(method, endpoint, data, false);
      }
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ============================================================
  // AUTHENTICATION
  // ============================================================

  async register(email, password, firstName, lastName) {
    const result = await this.request('POST', '/api/auth/register', {
      email,
      password,
      firstName,
      lastName
    });

    if (result.user?.id) {
      this.userId = result.user.id;
      localStorage.setItem('hotel_user_id', result.user.id);
    }

    return result;
  }

  async login(email, password) {
    const result = await this.request('POST', '/api/auth/login', {
      email,
      password
    });

    if (result.user?.id) {
      this.userId = result.user.id;
      localStorage.setItem('hotel_user_id', result.user.id);
    }

    return result;
  }

  async logout() {
    try {
      await this.request('POST', '/api/auth/logout', {});
    } catch (error) {
      console.warn('Logout request failed; clearing local auth state anyway.', error);
    }

    this.token = null;
    this.userId = null;
    localStorage.removeItem('hotel_user_id');
  }

  setAuthToken(token) {
    this.token = token;
  }

  isAuthenticated() {
    return Boolean(this.userId || localStorage.getItem('hotel_user_id'));
  }

  // ============================================================
  // BOOKINGS
  // ============================================================

  async createBooking(bookingData) {
    return this.request('POST', '/api/bookings', bookingData);
  }

  async getBooking(bookingId) {
    return this.request('GET', `/api/bookings/${bookingId}`);
  }

  async getMyBookings() {
    return this.request('GET', '/api/bookings');
  }

  // ============================================================
  // PAYMENTS
  // ============================================================

  async createPaymentIntent(bookingId, guestEmail = '') {
    return this.request('POST', '/api/payments/create-intent', {
      bookingId,
      guestEmail
    });
  }

  async confirmPayment(bookingId, paymentIntentId, paymentMethodId, guestEmail = '') {
    return this.request('POST', '/api/payments/confirm', {
      bookingId,
      paymentIntentId,
      paymentMethodId,
      guestEmail
    });
  }

  // ============================================================
  // CONTACT
  // ============================================================

  async submitContact(contactData) {
    return this.request('POST', '/api/contact', contactData);
  }

  // ============================================================
  // REVIEWS
  // ============================================================

  async submitReview(reviewData) {
    return this.request('POST', '/api/reviews', reviewData);
  }

  async getReviews(limit = 10) {
    return this.request('GET', `/api/reviews?limit=${limit}`);
  }

  // ============================================================
  // NEWSLETTER
  // ============================================================

  async subscribeNewsletter(email) {
    return this.request('POST', '/api/newsletter/subscribe', { email });
  }

  async unsubscribeNewsletter(email) {
    return this.request('POST', '/api/newsletter/unsubscribe', { email });
  }

  // ============================================================
  // AVAILABILITY
  // ============================================================

  async checkAvailability(checkIn, checkOut, roomType = null) {
    let url = `/api/availability?checkIn=${checkIn}&checkOut=${checkOut}`;
    if (roomType) {
      url += `&roomType=${roomType}`;
    }
    return this.request('GET', url);
  }

  async getRooms() {
    return this.request('GET', '/api/availability/rooms');
  }

  // ============================================================
  // ANALYTICS
  // ============================================================

  async trackEvent(eventType, eventData = {}) {
    return this.request('POST', '/api/analytics', {
      eventType,
      eventData,
      userId: this.userId || 'anonymous'
    });
  }

  // ============================================================
  // HEALTH CHECK
  // ============================================================

  async healthCheck() {
    return this.request('GET', '/health');
  }
}

// Global instance
window.hotelAPI = new HotelAPIClient({
  apiUrl: window.HotelAppConfig?.backendApiUrl || window.HotelAppConfig?.apiBaseUrl || window.location.origin
});

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HotelAPIClient;
}










