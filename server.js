const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
let Sentry = null;
try {
  Sentry = require('@sentry/node');
} catch {
  if (process.env.SENTRY_DSN) {
    console.warn('Warning: @sentry/node is not installed. Sentry monitoring will be disabled.');
  }
}

const routes = require('./routes');
const healthRoutes = require('./routes/healthRoutes');
const { webhook: paymentWebhook } = require('./controllers/paymentController');
const { apiLimiter } = require('./middlewares/rateLimit');
const sanitizeRequest = require('./middlewares/sanitize');
const logger = require('./utils/logger');
const { environment, frontendUrl } = require('./config');

const app = express();
const port = process.env.PORT || 3000;
const enableHttpsRedirect = process.env.ENABLE_HTTPS_REDIRECT === 'true';
const isProduction = environment === 'production';
const crossSiteCookiesEnabled = isProduction || process.env.ALLOW_CROSS_SITE_COOKIES === 'true';
const cookieSameSite = crossSiteCookiesEnabled ? 'none' : 'strict';
const secureCookies = crossSiteCookiesEnabled;
const backendUrl = process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL || '';
const backendConnectSources = backendUrl ? [backendUrl.replace(/\/$/, '')] : [];

app.set('trust proxy', 1);

if (enableHttpsRedirect) {
  app.use((req, res, next) => {
    if (!req.secure && req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'COOKIE_SECRET',
  'FRONTEND_URL'
];

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  const message = `Missing required environment variables: ${missingEnvVars.join(', ')}`;
  if (environment === 'production') {
    console.error(message);
    process.exit(1);
  }
  console.warn(`Warning: ${message}`);
}

if (process.env.SENTRY_DSN && Sentry) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
    release:
      process.env.SENTRY_RELEASE || `hatsey-kaleb-hotel@${process.env.npm_package_version || 'local'}`,
    attachStacktrace: true
  });
}

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : [process.env.FRONTEND_URL || 'http://localhost:5173'];

const isValidRequestId = (value) =>
  typeof value === 'string' && /^[A-Za-z0-9:_\-.]{8,128}$/.test(value);

const createRequestId = () =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : crypto.randomBytes(16).toString('hex');

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    logger.warn('Blocked CORS request from invalid origin: %s', origin);
    return callback(new Error('CORS not allowed by policy'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', process.env.CSRF_TOKEN_HEADER || 'X-CSRF-Token']
};

const analyticsEnabled = Boolean(
  process.env.VITE_GA_MEASUREMENT_ID ||
  process.env.VITE_GTM_ID ||
  process.env.VITE_CLARITY_PROJECT_ID
);

app.disable('x-powered-by');
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use((req, res, next) => {
  const incomingRequestId = req.headers['x-request-id'];
  req.id = isValidRequestId(incomingRequestId) ? incomingRequestId : createRequestId();
  req.ipAddress = (req.headers['x-forwarded-for'] || req.socket.remoteAddress)
    .toString()
    .split(',')[0]
    .trim();
  res.setHeader('X-Request-ID', req.id);
  next();
});

app.use((req, res, next) => {
  let responseLogged = false;
  const logResponse = () => {
    if (responseLogged) return;
    responseLogged = true;
    logger.info('HTTP response: %s %s %s requestId=%s', req.method, req.originalUrl, res.statusCode, req.id);
  };

  ['json', 'send', 'end', 'redirect'].forEach((method) => {
    const originalMethod = res[method];
    res[method] = function responseLogger(...args) {
      logResponse();
      return originalMethod.apply(this, args);
    };
  });

  next();
});

morgan.token('id', (req) => req.id || '-');

app.use(
  morgan(
    environment === 'production'
      ? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms :id'
      : ':method :url :status :res[content-length] - :response-time ms :id',
    {
      stream: {
        write: (message) => logger.info(message.trim())
      }
    }
  )
);

app.post('/api/payments/webhook', express.raw({ type: 'application/json', limit: '1mb' }), paymentWebhook);
app.use(express.json({ limit: '15kb' }));
app.use(express.urlencoded({ extended: true, limit: '15kb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie-secret-key'));

// Serve local static assets with safe cache headers when not serving a built 'dist' folder.
// If a production build with hashed filenames is present, the production dist static handler
// (below) will take precedence and set immutable caching for fingerprinted assets.
const assetsPath = path.join(__dirname, 'assets');
if (!(environment === 'production' && fs.existsSync(path.join(__dirname, 'dist')))) {
  app.use('/assets', express.static(assetsPath, {
    setHeaders: (res, filePath) => {
      const isFingerprint = /-[0-9a-f]{8,}\./.test(path.basename(filePath));
      if (isFingerprint) {
        // Fingerprinted assets are safe to cache for a long time.
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        // Non-fingerprinted assets: short, safe caching to allow updates.
        res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate');
      }
    }
  }));
}


app.use((req, res, next) => {
  req.audit = {
    requestId: req.id,
    ip: req.ipAddress,
    method: req.method,
    path: req.path,
    userId: req.user?.id || null
  };
  next();
});

app.use(sanitizeRequest);

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  }
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://js.stripe.com', ...(analyticsEnabled ? ["https://www.googletagmanager.com", "https://www.google-analytics.com", "https://www.clarity.ms"] : [])],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", ...backendConnectSources, 'https://api.stripe.com', ...(analyticsEnabled ? ["https://www.googletagmanager.com", "https://www.google-analytics.com", "https://www.clarity.ms"] : [])],
        fontSrc: ["'self'"],
        frameSrc: ["'self'", 'https://www.google.com', 'https://js.stripe.com', 'https://hooks.stripe.com', ...(analyticsEnabled ? ['https://www.googletagmanager.com'] : [])],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: []
      }
    },

    hsts: {
      maxAge: 63072000,
      includeSubDomains: true,
      preload: true
    },

    crossOriginEmbedderPolicy: false,

    referrerPolicy: {
      policy: 'same-origin'
    },

    frameguard: {
      action: 'deny'
    },

    permittedCrossDomainPolicies: {
      permittedPolicies: 'none'
    },

    dnsPrefetchControl: {
      allow: false
    },

    crossOriginResourcePolicy: {
      policy: 'same-origin'
    },

    hidePoweredBy: true
  })
);

app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

const csrfOptions = {
  cookie: {
    key: process.env.CSRF_COOKIE_NAME || 'csrfToken',
    httpOnly: true,
    secure: secureCookies,
    sameSite: cookieSameSite,
    maxAge: 3600000
  },
  value: (req) => {
    const headerName = (process.env.CSRF_TOKEN_HEADER || 'X-CSRF-Token').toLowerCase();
    return req.headers[headerName] || req.body?._csrf;
  }
};

let csrfProtection = null;
if (process.env.NODE_ENV !== 'test') {
  csrfProtection = csurf(csrfOptions);
  app.use(csrfProtection);
}

app.get('/api/csrf-token', (req, res) => {
  res.cookie('csrf-secure', 'true', {
    httpOnly: true,
    secure: secureCookies,
    sameSite: cookieSameSite,
    maxAge: 3600000,
    path: '/'
  });

  const csrfToken = typeof req.csrfToken === 'function' ? req.csrfToken() : 'test-csrf-token';

  res.json({
    success: true,
    csrfToken,
    requestId: req.id
  });
});

if (environment === 'production') {
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    const htmlCspNonces = new Map();

    const buildCspNonceMap = () => {
      const htmlFiles = fs.readdirSync(distPath).filter((file) => file.endsWith('.html'));
      htmlFiles.forEach((file) => {
        const filePath = path.join(distPath, file);
        const html = fs.readFileSync(filePath, 'utf8');
        const nonces = Array.from(
          new Set(
            [...html.matchAll(/nonce=(?:'([^']+)'|"([^"]+)")/g)].map((match) => match[1] || match[2]).filter(Boolean)
          )
        );
        if (nonces.length > 0) {
          htmlCspNonces.set(file, nonces);
        }
      });
    };

    const buildCspHeader = (nonces) => {
      const nonceSources = nonces.map((value) => `'nonce-${value}'`).join(' ');
      const analyticsSources = analyticsEnabled
        ? [
            'https://www.googletagmanager.com',
            'https://www.google-analytics.com',
            'https://www.clarity.ms'
          ]
        : [];

      return [
        "default-src 'self'",
        `script-src 'self' ${nonceSources} ${analyticsSources.join(' ')}`.trim(),
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        `connect-src 'self' ${backendConnectSources.join(' ')} ${analyticsSources.join(' ')}`.trim(),
        "font-src 'self'",
        "frame-src 'self' https://www.google.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'"
      ].join('; ');
    };

    buildCspNonceMap();

    app.use(
      express.static(distPath, {
        maxAge: '7d',
        immutable: true,
        setHeaders: (res, filePath) => {
          const ext = path.extname(filePath);
          const fileName = path.basename(filePath);
          const isHtml = ext === '.html';
          const isFingerprint = /-[0-9a-f]{8,}\./.test(fileName);

          if (isHtml) {
            const nonces = htmlCspNonces.get(fileName) || [];
            res.setHeader('Content-Security-Policy', buildCspHeader(nonces));
            // HTML must be revalidated to avoid caching dynamic content
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
          } else if (isFingerprint) {
            // Fingerprinted static assets (js/css/images/fonts) are immutable and safe to cache long-term
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          } else {
            // Other static assets: moderate caching
            res.setHeader('Cache-Control', 'public, max-age=604800, must-revalidate');
          }
        }
      })
    );
  }
}

app.use('/api', apiLimiter, routes);
app.use('/health', healthRoutes);

app.use((err, req, res, next) => {
  if (err && err.code === 'EBADCSRFTOKEN') {
    logger.warn('CSRF token validation failed for request %s %s', req.method, req.path);
    return res.status(403).json({
      error: 'Invalid CSRF token',
      requestId: req.id
    });
  }
  next(err);
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method,
    requestId: req.id
  });
});

if (process.env.SENTRY_DSN && Sentry) {
  app.use(Sentry.Handlers.errorHandler());
}

app.use((err, req, res, next) => {
  void next;
  if (process.env.SENTRY_DSN && Sentry) {
    Sentry.captureException(err);
  }

  const isProduction = environment === 'production';
  logger.error('Server error: %o', err);

  res.status(err.status || 500).json({
    error: isProduction ? 'An internal server error occurred.' : 'Server error',
    ...(isProduction ? {} : { message: err.message }),
    requestId: req.id,
    ...(environment === 'development' && { stack: err.stack })
  });
});

const httpsKeyPath = process.env.HTTPS_KEY_PATH;
const httpsCertPath = process.env.HTTPS_CERT_PATH;

const createServer = () => {
  const useHttps = httpsKeyPath && httpsCertPath && fs.existsSync(httpsKeyPath) && fs.existsSync(httpsCertPath);

  if (useHttps) {
    const httpsOptions = {
      key: fs.readFileSync(httpsKeyPath),
      cert: fs.readFileSync(httpsCertPath)
    };

    return https.createServer(httpsOptions, app).listen(port, () => {
      logger.info(`HTTPS server listening on port ${port} in ${environment} mode`);
    });
  }

  return app.listen(port, () => {
    logger.info(`HTTP server listening on port ${port} in ${environment} mode`);
  });
};

let server = null;

const logStartup = () => {
  logger.info('Cookie policy: environment=%s sameSite=%s secure=%s corsOrigins=%s backendUrl=%s', environment, cookieSameSite, secureCookies, corsOrigins.join(','), backendUrl || '(not configured)');
  logger.info(`\n╔════════════════════════════════════════════════════════════╗\n║  🏨 Hatsey Kaleb Hotel - Backend API Server               ║\n║  Port: ${port}                                                  ║\n║  Environment: ${environment}                                    ║\n╚════════════════════════════════════════════════════════════╝\n\nAvailable Endpoints:\n  Health: GET /health\n  Auth:\n    POST /api/auth/register\n    POST /api/auth/login\n  Bookings:\n    POST /api/bookings\n    GET /api/bookings/:bookingId\n    GET /api/bookings\n  Payments:\n    POST /api/payments/create-intent\n    POST /api/payments/confirm\n  Contact:\n    POST /api/contact\n  Reviews:\n    POST /api/reviews\n    GET /api/reviews\n  Newsletter:\n    POST /api/newsletter/subscribe\n    POST /api/newsletter/unsubscribe\n  Availability:\n    GET /api/availability\n  Analytics:\n    POST /api/analytics\n  CSRF Token: GET /api/csrf-token\nFrontend URL: ${frontendUrl}\n  `);
};

// Only start listening when not running under the test environment or when explicitly skipped.
if (process.env.NODE_ENV !== 'test' && process.env.SKIP_SERVER_START !== 'true') {
  server = createServer();
  logStartup();

  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });
}

module.exports = app;
