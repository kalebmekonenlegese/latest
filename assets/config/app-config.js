// filepath: assets/config/app-config.js

const defaultApiUrl = 'https://hatsey-kaleb-backend.onrender.com';

const configuredApiUrl =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_API_URL
    : '';

const hostname =
  typeof window !== 'undefined' && window.location
    ? window.location.hostname
    : '';

const isLocal =
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname === '0.0.0.0';

const apiUrl = configuredApiUrl || (isLocal ? `http://${hostname}:3000` : defaultApiUrl);

// Optional runtime overrides.
const runtimeOverrides =
  typeof window !== 'undefined'
    ? window.__HOTEL_RUNTIME_CONFIG__ || {}
    : {};

const getRuntimeValue = (key, fallback = '') => {
  const value = runtimeOverrides[key];

  return value !== undefined && value !== null && value !== ''
    ? value
    : fallback;
};

const runtimeEnv = {
  MODE: isLocal ? 'development' : 'production',

  VITE_API_URL: getRuntimeValue('VITE_API_URL', apiUrl),

  VITE_GA_MEASUREMENT_ID:
    getRuntimeValue('VITE_GA_MEASUREMENT_ID', ''),

  VITE_GTM_ID:
    getRuntimeValue('VITE_GTM_ID', ''),

  VITE_CLARITY_PROJECT_ID:
    getRuntimeValue('VITE_CLARITY_PROJECT_ID', ''),

  VITE_GOOGLE_ANALYTICS_ID:
    getRuntimeValue('VITE_GOOGLE_ANALYTICS_ID', ''),

  VITE_GOOGLE_SITE_VERIFICATION:
    getRuntimeValue('VITE_GOOGLE_SITE_VERIFICATION', ''),

  VITE_BING_SITE_VERIFICATION:
    getRuntimeValue('VITE_BING_SITE_VERIFICATION', '')
};

window.HotelAppConfig = {
  // Runtime environment
  env: runtimeEnv,
  isProduction: !isLocal,

  getEnvValue(key, fallback = '') {
    const value = runtimeEnv[key];

    return value !== undefined &&
      value !== null &&
      value !== ''
      ? value
      : fallback;
  },

  // API
  apiBaseUrl: runtimeEnv.VITE_API_URL,
  backendApiUrl: runtimeEnv.VITE_API_URL,
  apiTimeout: 30000,

  // Authentication
  authTokenKey: null,
  userIdKey: 'hotel_user_id',

  // Application
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'am', 'ti'],

  // Analytics
  analytics: {
    enabled: Boolean(
      runtimeEnv.VITE_GA_MEASUREMENT_ID ||
      runtimeEnv.VITE_GTM_ID ||
      runtimeEnv.VITE_CLARITY_PROJECT_ID
    ),

    gtmId: runtimeEnv.VITE_GTM_ID || '',

    gaMeasurementId:
      runtimeEnv.VITE_GA_MEASUREMENT_ID ||
      runtimeEnv.VITE_GOOGLE_ANALYTICS_ID ||
      '',

    clarityProjectId:
      runtimeEnv.VITE_CLARITY_PROJECT_ID || '',

    googleSiteVerification:
      runtimeEnv.VITE_GOOGLE_SITE_VERIFICATION || '',

    bingSiteVerification:
      runtimeEnv.VITE_BING_SITE_VERIFICATION || '',

    heatmapEnabled: true,
    funnelTrackingEnabled: true,
    conversionTrackingEnabled: true
  },

  // Notifications
  notifications: {
    autoClose: 4200,
    maxVisible: 4
  },

  // Booking
  booking: {
    minStay: 1,
    maxStay: 90,
    cancellationDeadline: 168,
    currencyCode: 'USD',
    currencySymbol: '$'
  },

  // Rooms
  rooms: {
    'standard-room': {
      name: 'Standard Room',
      basePrice: 145
    },
    'deluxe-room': {
      name: 'Deluxe Room',
      basePrice: 195
    },
    'executive-suite': {
      name: 'Executive Suite',
      basePrice: 285
    },
    'family-room': {
      name: 'Family Room',
      basePrice: 250
    }
  },

  // Payment
  payment: {
    provider: 'stripe',
    stripePublicKey: getRuntimeValue('VITE_STRIPE_PUBLIC_KEY', ''),
    currency: 'usd',
    taxRate: 0.15,
    processingFee: 0.029
  },

  // Hotel
  hotel: {
    name: 'Hatsey Kaleb Hotel',
    phone: '+251 914 754 143',
    email: 'info@hatseykalebhotel.com',
    address: 'Abiy Adi, Tigray Region, Ethiopia',
    timezone: 'Africa/Addis_Ababa'
  },

  // Features
  features: {
    requireLogin: false,
    enablePayments: true,
    enableReviews: true,
    enableChat: false,
    enableVirtualTour: true
  }
};