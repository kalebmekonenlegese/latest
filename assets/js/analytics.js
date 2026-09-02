(function () {
  const storageKey = 'hatseyAnalyticsMetrics';

  function readMetrics() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch (error) {
      return {};
    }
  }

  function writeMetrics(next) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch (error) {
      // ignore storage failures
    }
  }

  function ensureMetrics() {
    const metrics = readMetrics();
    if (!metrics.events) {
      metrics.events = {};
    }
    if (!metrics.funnel) {
      metrics.funnel = {};
    }
    if (!metrics.heatmap) {
      metrics.heatmap = [];
    }
    if (!metrics.scrollDepth) {
      metrics.scrollDepth = [];
    }
    return metrics;
  }

  function bumpMetric(metrics, key) {
    metrics.events[key] = (metrics.events[key] || 0) + 1;
    return metrics;
  }

  function trackEvent(name, params = {}) {
    const metrics = ensureMetrics();
    bumpMetric(metrics, name);

    if (params.funnelStage) {
      metrics.funnel[params.funnelStage] = (metrics.funnel[params.funnelStage] || 0) + 1;
    }

    writeMetrics(metrics);

    if (window.dataLayer) {
      window.dataLayer.push({ event: name, ...params });
    }

    if (window.gtag) {
      window.gtag('event', name, params);
    }

    const config = window.HotelAppConfig?.analytics || {};
    if (config.conversionTrackingEnabled) {
      if (name === 'booking_confirmed') {
        sendConversionEvent('purchase', {
          currency: 'USD',
          value: params.value || params.totalPrice || 0,
          transaction_id: params.transactionId || `txn_${Date.now()}`,
          funnel_stage: params.funnelStage || 'booking-confirmed'
        });
      }

      if (name === 'contact_form_success' || name === 'contact_form_submitted') {
        sendConversionEvent('generate_lead', {
          ...params,
          funnel_stage: params.funnelStage || 'lead-capture'
        });
      }

      if (name === 'newsletter_subscribe_success') {
        sendConversionEvent('generate_lead', {
          ...params,
          funnel_stage: 'newsletter-signup'
        });
      }
    }
  }

  function sendConversionEvent(eventName, params = {}) {
    if (window.dataLayer) {
      window.dataLayer.push({ event: eventName, ...params });
    }
    if (window.gtag) {
      window.gtag('event', eventName, params);
    }
  }

  function trackPageview() {
    const params = {
      page_title: document.title,
      page_location: window.location.pathname,
      page_path: window.location.pathname
    };
    trackEvent('page_view', params);
  }

  function trackClick(event) {
    const metrics = ensureMetrics();
    const target = event.target;
    const label = target?.id || target?.className || target?.tagName || 'unknown';
    metrics.heatmap.push({
      page: window.location.pathname,
      label,
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now()
    });
    metrics.heatmap = metrics.heatmap.slice(-80);
    writeMetrics(metrics);
    trackEvent('interaction_click', { element: label, page: window.location.pathname });
  }

  function trackScrollDepth() {
    const metrics = ensureMetrics();
    const scrollTop = window.scrollY || window.pageYOffset || 0;
    const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
    const depth = maxHeight > 0 ? Math.round((scrollTop / maxHeight) * 100) : 0;
    const bucket = Math.min(100, Math.max(0, Math.floor(depth / 25) * 25));
    if (!metrics.scrollDepth.includes(bucket)) {
      metrics.scrollDepth.push(bucket);
      writeMetrics(metrics);
      trackEvent('scroll_depth', { depth: bucket });
    }
  }

  function init(analyticsConfig) {
    const config = analyticsConfig || window.HotelAppConfig?.analytics || {};

    const googleVerification = config.googleSiteVerification || config.searchConsoleVerification || '';
    if (googleVerification) {
      const verificationMeta = document.createElement('meta');
      verificationMeta.name = 'google-site-verification';
      verificationMeta.content = googleVerification;
      document.head.appendChild(verificationMeta);
    }

    if (config.bingSiteVerification) {
      const bingMeta = document.createElement('meta');
      bingMeta.name = 'msvalidate.01';
      bingMeta.content = config.bingSiteVerification;
      document.head.appendChild(bingMeta);
    }

    const analyticsEnabled = config.enabled || config.gtmId || config.gaMeasurementId || config.clarityProjectId;
    if (!analyticsEnabled) {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };

    if (config.gtmId) {
      (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        const f = d.getElementsByTagName(s)[0];
        const j = d.createElement(s);
        const dl = l !== 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        f.parentNode.insertBefore(j, f);
      })(window, document, 'script', 'dataLayer', config.gtmId);

      const noscript = document.createElement('noscript');
      noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${config.gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.insertBefore(noscript, document.body.firstChild);
    }

    if (config.gaMeasurementId) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + config.gaMeasurementId;
      document.head.appendChild(script);

      window.gtag('js', new Date());
      window.gtag('config', config.gaMeasurementId, {
        send_page_view: false,
        anonymize_ip: true
      });
    }

    if (config.clarityProjectId) {
      (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () {
          (c[a].q = c[a].q || []).push(arguments);
        };
        t = l.createElement(r);
        t.async = 1;
        t.src = 'https://www.clarity.ms/tag/' + i;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
      })(window, document, 'clarity', 'script', 'clarity', config.clarityProjectId);
    }

    if (config.heatmapEnabled) {
      document.addEventListener('click', trackClick, { passive: true });
      window.addEventListener('scroll', trackScrollDepth, { passive: true });
    }

    trackPageview();
    if (config.heatmapEnabled) {
      trackScrollDepth();
    }

    if (config.gtmId) {
      (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        const f = d.getElementsByTagName(s)[0];
        const j = d.createElement(s);
        const dl = l !== 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        f.parentNode.insertBefore(j, f);
      })(window, document, 'script', 'dataLayer', config.gtmId);

      const noscript = document.createElement('noscript');
      noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${config.gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.insertBefore(noscript, document.body.firstChild);
    }

    if (config.gaMeasurementId) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + config.gaMeasurementId;
      document.head.appendChild(script);

      window.gtag('js', new Date());
      window.gtag('config', config.gaMeasurementId, { send_page_view: false });
    }

    if (config.clarityProjectId) {
      (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () {
          (c[a].q = c[a].q || []).push(arguments);
        };
        t = l.createElement(r);
        t.async = 1;
        t.src = 'https://www.clarity.ms/tag/' + i;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
      })(window, document, 'clarity', 'script', 'clarity', config.clarityProjectId);
    }

    document.addEventListener('click', trackClick, { passive: true });
    window.addEventListener('scroll', trackScrollDepth, { passive: true });
    trackPageview();
    trackScrollDepth();
  }

  window.HotelAnalytics = {
    init,
    trackEvent,
    trackPageview,
    getMetrics: ensureMetrics,
    clearMetrics: function () {
      writeMetrics({ events: {}, funnel: {} });
      return ensureMetrics();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
