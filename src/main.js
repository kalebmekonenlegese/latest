// ========== HATSEY KALEB HOTEL - MAIN APPLICATION ENTRY POINT ==========

import '../assets/config/app-config.js';
import '../assets/js/api-client.js';
import '../assets/js/api-integration.js';

const revealPageFallback = () => {
  const body = document.body;
  if (!body) {
    return;
  }

  body.classList.add('page-visible');
  body.classList.remove('page-transitioning');
  body.style.opacity = '1';
};

import('../assets/js/app.js').catch((_err) => {
  console.warn('Application UI module failed to load');
  revealPageFallback();
});

window.addEventListener('load', () => {
  revealPageFallback();
}, { once: true });
