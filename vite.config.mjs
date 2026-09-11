import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import { resolve } from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function seoHeadersPlugin(seoConfig) {
  return {
    name: 'seo-headers',

    transformIndexHtml(html) {
      const verificationMeta = [];
      const nonce = crypto.randomBytes(16).toString('base64');

      if (seoConfig.googleSiteVerification) {
        verificationMeta.push(
          `<meta name="google-site-verification" content="${seoConfig.googleSiteVerification}">`
        );
      }

      if (seoConfig.bingSiteVerification) {
        verificationMeta.push(
          `<meta name="msvalidate.01" content="${seoConfig.bingSiteVerification}">`
        );
      }

      const htmlWithNonces = html.replace(
        /<script\b([^>]*?)>([\s\S]*?)<\/script>/gi,
        (match, attrs, body) => {
          if (/\bsrc\b/i.test(attrs) || /\bnonce\b/i.test(attrs)) {
            return match;
          }

          return `<script nonce="${nonce}"${attrs}>${body}</script>`;
        }
      );

      if (html.includes('<head>')) {
        return htmlWithNonces.replace(
          '<head>',
          `<head>

<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="robots" content="index,follow">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=()">
${verificationMeta.join('\n')}
`
        );
      }

      return htmlWithNonces;
    },

    closeBundle() {
      const rootDir = process.cwd();

      const distDir = path.join(rootDir, 'dist');

      fs.mkdirSync(distDir, { recursive: true });

      const staticFiles = ['robots.txt', 'sitemap.xml'];

      staticFiles.forEach((file) => {
        const source = path.join(rootDir, file);

        const destination = path.join(distDir, file);

        if (fs.existsSync(source)) {
          fs.copyFileSync(source, destination);
        }
      });
    }
  };
}

function copyStaticAssetsPlugin() {
  return {
    name: 'copy-static-assets',

    closeBundle() {
      const rootDir = process.cwd();
      const distDir = path.join(rootDir, 'dist');
      const sourceDir = path.join(rootDir, 'images');
      const targetDir = path.join(distDir, 'images');
      const sourceMediaDir = path.join(rootDir, 'assets', 'images');
      const targetMediaDir = path.join(distDir, 'assets', 'images');

      if (fs.existsSync(sourceDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        fs.cpSync(sourceDir, targetDir, { recursive: true, force: true });
      }

      if (fs.existsSync(sourceMediaDir)) {
        fs.mkdirSync(targetMediaDir, { recursive: true });
        fs.cpSync(sourceMediaDir, targetMediaDir, { recursive: true, force: true });
      }
    }
  };
}

const pages = {
  index: resolve(__dirname, 'index.html'),

  rooms: resolve(__dirname, 'rooms.html'),

  'standard-room': resolve(__dirname, 'standard-room.html'),

  'deluxe-room': resolve(__dirname, 'deluxe-room.html'),

  'executive-suite': resolve(__dirname, 'executive-suite.html'),

  'family-room': resolve(__dirname, 'family-room.html'),

  restaurant: resolve(__dirname, 'restaurant.html'),

  'dining-experience': resolve(__dirname, 'dining-experience.html'),

  events: resolve(__dirname, 'events.html'),

  gallery: resolve(__dirname, 'gallery.html'),

  'virtual-tour': resolve(__dirname, 'virtual-tour.html'),

  about: resolve(__dirname, 'about.html'),

  contact: resolve(__dirname, 'contact.html'),

  faq: resolve(__dirname, 'faq.html'),

  booking: resolve(__dirname, 'booking.html'),

  attractions: resolve(__dirname, 'attractions.html'),

  'spa-wellness': resolve(__dirname, 'spa-wellness.html'),

  facilities: resolve(__dirname, 'facilities.html'),

  weddings: resolve(__dirname, 'weddings.html'),

  offers: resolve(__dirname, 'offers.html'),

  reviews: resolve(__dirname, 'reviews.html'),

  sustainability: resolve(__dirname, 'sustainability.html'),

  transportation: resolve(__dirname, 'transportation.html'),

  'ai-assistant': resolve(__dirname, 'ai-assistant.html'),

  careers: resolve(__dirname, 'careers.html'),

  blog: resolve(__dirname, 'blog.html'),

  conferences: resolve(__dirname, 'conferences.html'),

  privacy: resolve(__dirname, 'privacy.html'),

  terms: resolve(__dirname, 'terms.html'),

  'cookie-policy': resolve(__dirname, 'cookie-policy.html'),

  hotel: resolve(__dirname, 'hotel.html'),

  'analytics-dashboard': resolve(__dirname, 'analytics-dashboard.html')
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const seoConfig = {
    googleSiteVerification: env.VITE_GOOGLE_SITE_VERIFICATION || '',

    bingSiteVerification: env.VITE_BING_SITE_VERIFICATION || ''
  };

  return {
    base: '/',

    server: {
      port: 5173,

      strictPort: false,

      host: 'localhost',

      open: false,

      cors: true,

      hmr: {
        host: 'localhost',

        port: 5173
      },

      watch: {
        usePolling: false
      }
    },

    preview: {
      port: 5000,

      strictPort: true,

      host: '127.0.0.1',

      open: false,

      cors: true,

      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',

        Pragma: 'no-cache',

        Expires: '0'
      }
    },

    build: {
      outDir: 'dist',

      assetsDir: 'assets',

      sourcemap: false,

      minify: 'terser',

      terserOptions: {
        compress: {
          drop_console: false,

          drop_debugger: true
        },

        mangle: true,

        format: {
          comments: false
        }
      },

      cssMinify: true,
      cssTarget: 'chrome100',

      reportCompressedSize: true,

      chunkSizeWarningLimit: 1000,

      rollupOptions: {
        input: pages,

        output: {
          entryFileNames: 'js/[name]-[hash].js',

          chunkFileNames: 'js/[name]-[hash].js',

          assetFileNames(assetInfo) {
            const ext = assetInfo.name.split('.').pop();

            if (/png|jpe?g|gif|svg/.test(ext)) {
              return 'images/[name]-[hash][extname]';
            }

            if (/woff|woff2|ttf|otf|eot/.test(ext)) {
              return 'fonts/[name]-[hash][extname]';
            }

            if (ext === 'css') {
              return 'css/[name]-[hash][extname]';
            }

            return '[name]-[hash][extname]';
          }
        },

        external: [],

        treeshake: {
          // Preserve side-effect-only scripts referenced directly from HTML pages.
          // This is required for modules like assets/utils/validators.js that initialize
          // global state instead of exporting values.
          moduleSideEffects: true,

          propertyReadSideEffects: false
        }
      },

      emptyOutDir: true,

      target: 'es2020',

      manifest: true,

      cssCodeSplit: true,

      modulePreload: {
        polyfill: false
      }
    },

    optimizeDeps: {
      include: [],

      exclude: []
    },

    plugins: [seoHeadersPlugin(seoConfig), copyStaticAssetsPlugin()],

    envPrefix: 'VITE_'
  };
});
