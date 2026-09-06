// ========== SHARED UTILITIES ==========

function setInert(el, state) {
  if (!el) return;
  try {
    if ('inert' in el) {
      el.inert = !!state;
      return;
    }
  } catch (e) {
    // ignore
  }
  if (state) el.setAttribute('aria-hidden', 'true'); else el.removeAttribute('aria-hidden');
}

document.documentElement.classList.add('js-enabled');

document.querySelectorAll('.skip-link').forEach((link) => {
  if (!link.hasAttribute('tabindex')) {
    link.setAttribute('tabindex', '0');
  }
});

function setPageReady() {
  document.body.classList.add('page-visible');
  document.body.classList.remove('page-transitioning');
}

function createImageSkeletons() {
  const images = Array.from(document.querySelectorAll('img.image-skeleton'));
  images.forEach((img) => {
   const markLoaded = () => img.classList.add('img-loaded');
   if (img.complete) {
     markLoaded();
   } else {
     img.addEventListener('load', markLoaded, { once: true });
     img.addEventListener('error', markLoaded, { once: true });
   }
  });
}

// ========== HEADER & NAVIGATION ==========
(function initializeHeader() {
  document.querySelectorAll('.language-menu').forEach((menu) => menu.remove());

  const topbar = document.querySelector('.topbar');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-navigation');
  const navLinks = Array.from(nav?.querySelectorAll('a') || []);
  const languageLinks = Array.from(document.querySelectorAll('.language-list a[data-lang]'));
  const languageToggle = document.querySelector('.language-menu button');
  const languageMenu = document.getElementById('language-list');
  const scrollIndicator = document.getElementById('scroll-indicator');
  
  const sections = Array.from(document.querySelectorAll('main section[id]'));

  const supportedLanguages = ['en', 'am', 'ti'];
  const defaultLanguage = 'en';
  const translations = {
    en: {
      navHome: 'home',
      navGallery: 'gallery',
      navAbout: 'about us',
      navContact: 'contact us',
      heroTitle: 'hatsey kaleb hotel',
      heroSubtitle: 'Where every guest is treated like family. Enjoy comfortable rooms, modern event facilities, and warm Ethiopian hospitality in Tigray.',
      heroAction: 'book now!',
      storyHeading: 'Our Journey',
      storyIntro: 'Hatsey Kaleb Hotel is a family-owned establishment founded to create a welcoming space for travelers seeking comfort, culture, and outstanding hospitality in Tigray.',
      contactHeading: 'Contact',
      contactIntro: 'Reach out to us for bookings, questions, or event planning support.',
      liveChat: 'live chat'
    },
    am: {
      navHome: 'ዋና',
      navGallery: 'ጋለሪ',
      navAbout: 'ስለ እኛ',
      navContact: 'አግኙን',
      heroTitle: 'ሐፃይ ካሌብ ሆቴል',
      heroSubtitle: 'እያንዳንዱ ሰፈር እንደ ቤተሰብ ይገናኛል።',
      heroAction: 'አስያዝ',
      storyHeading: 'የጉዞ ታሪክ',
      storyIntro: 'ሐፃይ ካሌብ ሆቴል ቤተሰብ ባለቤት።',
      contactHeading: 'አግኙን',
      contactIntro: 'ለቦኪንግ ይግጦ።',
      liveChat: 'ቀጥታ ንግግር'
    },
    ti: {
      navHome: 'ቤት',
      navGallery: 'ጋለሪ',
      navAbout: 'ስለናት',
      navContact: 'ከና ይገናኙ',
      heroTitle: 'ሐፃይ ካሌብ ሆቴል',
      heroSubtitle: 'ኣብ ገጽታ ሕጂ ደንግሳስ ሓውልቲ.',
      heroAction: 'ቦኪን ኣድሓን',
      storyHeading: 'ጉዕዞና ታሪኽ',
      storyIntro: 'ሐፃይ ካሌብ ሆቴል ናይ ቤተሰብ ምሕደራ።',
      contactHeading: 'ኣገኙና',
      contactIntro: 'ንስጋታት ይግጦ።',
      liveChat: 'ቀጥታ ንግግር'
    }
  };

  // Navigation helpers
  function updateActiveLink() {
    const normalizePath = (pathname) => {
      const normalized = pathname.replace(/\/$/, '');
      return normalized || '/index.html';
    };
    const currentPath = normalizePath(window.location.pathname);
    const scrollPosition = window.scrollY + 140;
    let activeId = sections[0] ? sections[0].id : '';

    sections.forEach(section => {
      if (scrollPosition >= section.offsetTop) {
        activeId = section.id;
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      let isActive = false;
      if (href.startsWith('#')) {
        isActive = href === `#${activeId}`;
      } else {
        try {
          isActive = normalizePath(new URL(href, window.location.href).pathname) === currentPath;
        } catch {
          isActive = false;
        }
      }
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function updateStickyShadow() {
    if (topbar) topbar.classList.toggle('scrolled', window.scrollY > 10);
  }

  function closeMenu() {
    if (!topbar) return;
    topbar.classList.remove('open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('lock-scroll');
    if (menuToggle) menuToggle.focus();
  }

  function closeLanguageMenu() {
    if (languageMenu) {
      languageMenu.classList.remove('open');
      languageMenu.setAttribute('aria-hidden', 'true');
    }
    if (languageToggle) {
      languageToggle.setAttribute('aria-expanded', 'false');
      languageToggle.focus();
    }
  }

  function toggleLanguageMenu() {
    if (!languageMenu || !languageToggle) return;
    const isOpen = languageMenu.classList.toggle('open');
    languageToggle.setAttribute('aria-expanded', String(isOpen));
    languageMenu.setAttribute('aria-hidden', String(!isOpen));
    if (isOpen) {
      const first = languageMenu.querySelector('a');
      if (first) first.focus();
    }
  }

  function getStoredLanguage() {
    return localStorage.getItem('hotelLanguage');
  }

  function getQueryLanguage() {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang');
    return supportedLanguages.includes(lang) ? lang : null;
  }

  function getInitialLanguage() {
    return getQueryLanguage() || getStoredLanguage() || defaultLanguage;
  }

  function applyTranslations(language) {
    const translation = translations[language] || translations[defaultLanguage];
    document.documentElement.lang = language;

    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.dataset.i18n;
      if (!key) return;
      const text = translation[key] || translations[defaultLanguage][key];
      if (text !== undefined) {
        element.textContent = text;
      }
    });
  }

  function updateLanguageSelection(language) {
    languageLinks.forEach(link => {
      const isActive = link.dataset.lang === language;
      link.classList.toggle('selected', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  function setLanguage(language, save = true) {
    const selectedLanguage = supportedLanguages.includes(language) ? language : defaultLanguage;
    if (save) {
      localStorage.setItem('hotelLanguage', selectedLanguage);
    }
    applyTranslations(selectedLanguage);
    updateLanguageSelection(selectedLanguage);
  }

  function handleLanguageClick(event) {
    event.preventDefault();
    const language = event.currentTarget.dataset.lang;
    setLanguage(language);
  }

  // Scroll progress indicator
  let rafId = null;
  function updateScrollIndicator() {
    if (!scrollIndicator) return;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    scrollIndicator.style.width = pct + '%';
    rafId = null;
  }

  // Event listeners
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = topbar.classList.toggle('open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('lock-scroll', isOpen);
      if (isOpen) {
      const firstNav = nav?.querySelector('a');
        if (firstNav) firstNav.focus();
      }
    });
  }

  window.addEventListener('scroll', () => {
    if (rafId) return;
    rafId = requestAnimationFrame(updateScrollIndicator);
    updateActiveLink();
    updateStickyShadow();
  }, { passive: true });

  document.addEventListener('click', (event) => {
    if (!languageMenu || !languageToggle) return;
    if (!languageMenu.contains(event.target) && !languageToggle.contains(event.target)) {
      closeLanguageMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      closeLanguageMenu();
    }
  });

  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  function isInternalHtmlLink(link) {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    if (link.target === '_blank' || link.hasAttribute('download')) return false;
    try {
      const url = new URL(href, location.href);
      return url.origin === location.origin && url.pathname.endsWith('.html');
    } catch {
      return false;
    }
  }

  function handleInternalNavigation(event) {
    const link = event.currentTarget;
    if (!isInternalHtmlLink(link)) return;
    event.preventDefault();
    const url = new URL(link.getAttribute('href'), location.href);
    window.setTimeout(() => {
      window.location.href = url.href;
    }, 0);
  }

  const internalLinks = Array.from(document.querySelectorAll('a[href]'));
  internalLinks.forEach(link => {
    if (isInternalHtmlLink(link)) {
      link.addEventListener('click', handleInternalNavigation);
    }
  });

  if (languageToggle) {
    languageToggle.addEventListener('click', toggleLanguageMenu);
  }

  languageLinks.forEach(link => {
    link.addEventListener('click', handleLanguageClick);
  });

  // Initialize
  updateActiveLink();
  setPageReady();

  // Defer heavy external iframes (Google Maps) when running from file:// during local tests.
  // When served over http(s), the iframe src will be populated so the map loads in production.
  function initializeDeferredContent() {
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      document.querySelectorAll('iframe[data-src]').forEach(f => {
        if (!f.getAttribute('src')) f.setAttribute('src', f.dataset.src);
      });
    }
    createImageSkeletons();
    setPageReady();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDeferredContent);
  } else {
    initializeDeferredContent();
  }

  updateStickyShadow();
  updateScrollIndicator();
})();

// ========== AUTHENTICATION DIALOG ==========
(function initializeAuthentication() {
  const actions = document.querySelector('.top-actions');
  const api = window.hotelAPI;
  if (!actions || !api) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'auth-dialog';
  dialog.innerHTML = `
    <form method="dialog" class="auth-dialog-form" novalidate>
      <button type="submit" class="auth-dialog-close" aria-label="Close authentication dialog">×</button>
      <p class="eyebrow">Guest access</p>
      <h2 class="auth-dialog-title">Sign in</h2>
      <div class="auth-dialog-fields auth-register-fields" hidden>
        <label>First name<input name="firstName" autocomplete="given-name" required></label>
        <label>Last name<input name="lastName" autocomplete="family-name" required></label>
      </div>
      <label>Email<input name="email" type="email" autocomplete="email" required></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" minlength="8" required></label>
      <label class="auth-confirm-field" hidden>Confirm password<input name="confirmPassword" type="password" autocomplete="new-password"></label>
      <p class="auth-dialog-error" role="alert" aria-live="assertive"></p>
      <button type="button" class="buttoncall auth-submit">Sign in</button>
      <button type="button" class="button-outline auth-switch">Create an account</button>
    </form>`;
  document.body.appendChild(dialog);

  const form = dialog.querySelector('form');
  const title = dialog.querySelector('.auth-dialog-title');
  const registerFields = dialog.querySelector('.auth-register-fields');
  const confirmField = dialog.querySelector('.auth-confirm-field');
  const password = form.elements.password;
  const error = dialog.querySelector('.auth-dialog-error');
  const submit = dialog.querySelector('.auth-submit');
  const switchMode = dialog.querySelector('.auth-switch');
  let registerMode = false;

  const renderMode = () => {
    title.textContent = registerMode ? 'Create your account' : 'Sign in';
    submit.textContent = registerMode ? 'Create account' : 'Sign in';
    switchMode.textContent = registerMode ? 'Already have an account?' : 'Create an account';
    registerFields.hidden = !registerMode;
    confirmField.hidden = !registerMode;
    registerFields.querySelectorAll('input').forEach((input) => {
      input.required = registerMode;
    });
    confirmField.querySelector('input').required = registerMode;
    password.autocomplete = registerMode ? 'new-password' : 'current-password';
    error.textContent = '';
  };

  const open = (mode) => {
    registerMode = mode;
    renderMode();
    dialog.showModal();
    form.elements.email.focus();
  };

  actions.querySelector('[aria-label="Sign up"]')?.addEventListener('click', () => open(true));
  actions.querySelector('[aria-label="Sign in"]')?.addEventListener('click', () => open(false));
  const signOut = document.createElement('button');
  signOut.type = 'button';
  signOut.setAttribute('aria-label', 'Sign out');
  signOut.textContent = 'sign out';
  signOut.hidden = !api.isAuthenticated();
  actions.appendChild(signOut);
  const updateAuthActions = () => {
    const authenticated = api.isAuthenticated();
    actions.querySelector('[aria-label="Sign up"]')?.toggleAttribute('hidden', authenticated);
    actions.querySelector('[aria-label="Sign in"]')?.toggleAttribute('hidden', authenticated);
    signOut.hidden = !authenticated;
  };
  signOut.addEventListener('click', async () => {
    signOut.disabled = true;
    await api.logout();
    signOut.disabled = false;
    updateAuthActions();
  });
  updateAuthActions();
  switchMode.addEventListener('click', () => {
    registerMode = !registerMode;
    renderMode();
  });
  submit.addEventListener('click', async () => {
    error.textContent = '';
    if (!form.reportValidity()) return;
    if (registerMode && password.value !== form.elements.confirmPassword.value) {
      error.textContent = 'Passwords do not match.';
      return;
    }
    submit.disabled = true;
    submit.textContent = 'Working...';
    try {
      await api.fetchCsrfToken();
      if (registerMode) {
        await api.register(form.elements.email.value.trim(), password.value, form.elements.firstName.value.trim(), form.elements.lastName.value.trim());
      } else {
        await api.login(form.elements.email.value.trim(), password.value);
      }
      dialog.close();
      updateAuthActions();
    } catch (requestError) {
      error.textContent = requestError.error || requestError.message || 'Unable to complete authentication.';
    } finally {
      submit.disabled = false;
      submit.textContent = registerMode ? 'Create account' : 'Sign in';
    }
  });
})();

// ========== HERO SLIDER ==========
(function initializeHeroSlider() {
  const slides = Array.from(document.querySelectorAll('.banner-slide'));
  if (!slides.length) return;

  let currentIndex = 0;
  let slideInterval = null;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showSlide(index) {
    slides.forEach((s, i) => {
      const img = s.querySelector('img');
      const active = i === index;
      s.classList.toggle('active', active);
      if (img) {
        img.style.transform = active ? 'scale(1.06)' : 'scale(1.0)';
      }
    });
    currentIndex = index;
  }

  function nextSlide() {
    showSlide((currentIndex + 1) % slides.length);
  }

  function prevSlide() {
    showSlide((currentIndex - 1 + slides.length) % slides.length);
  }

  function startAutoRotate() {
    if (prefersReducedMotion) return;
    stopAutoRotate();
    slideInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoRotate() {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  }

  const heroPrev = document.getElementById('hero-prev');
  const heroNext = document.getElementById('hero-next');
  const heroEl = document.querySelector('.hero');

  if (heroPrev) heroPrev.addEventListener('click', () => { stopAutoRotate(); prevSlide(); });
  if (heroNext) heroNext.addEventListener('click', () => { stopAutoRotate(); nextSlide(); });

  if (heroEl) {
    heroEl.addEventListener('mouseenter', stopAutoRotate);
    heroEl.addEventListener('focusin', stopAutoRotate);
    heroEl.addEventListener('mouseleave', startAutoRotate);
    heroEl.addEventListener('focusout', startAutoRotate);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
  });

  showSlide(currentIndex);
  startAutoRotate();
})();

function scheduleIdleTask(task) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(task);
    return;
  }

  window.setTimeout(task, 50);
}

// ========== SCROLL REVEAL ANIMATIONS ==========
scheduleIdleTask(() => {
  (function initializeReveal() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealElements = Array.from(document.querySelectorAll('section, .hero-copy, .room-card, .service-card, .event-card, .offer-card, .benefit-card, .review-card, .gallery-grid img, .booking-form, .contact-card'));

    revealElements.forEach((element) => {
      element.classList.add('reveal');
      if (prefersReducedMotion) {
        element.classList.add('reveal-visible');
      }
    });

    if (prefersReducedMotion) return;

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

    revealElements.forEach(element => revealObserver.observe(element));
  })();
});

// ========== HOME PAGE WIDGETS ==========
scheduleIdleTask(() => {
  (function initializeHomepageWidgets() {
    const stats = Array.from(document.querySelectorAll('.stat-number[data-target]'));
    const testimonialsTrack = document.querySelector('.testimonials-track');
    const testimonials = Array.from(document.querySelectorAll('.testimonial'));
    const testimonialPrev = document.querySelector('.carousel-prev');
    const testimonialNext = document.querySelector('.carousel-next');
    const indicators = Array.from(document.querySelectorAll('.carousel-indicators button'));
    const bookingForm = document.getElementById('booking-form');

    let currentSlide = 0;
    let testimonialInterval = null;

    function setTestimonial(index) {
      if (!testimonialsTrack || !testimonials.length) return;
      const normalized = ((index % testimonials.length) + testimonials.length) % testimonials.length;
      currentSlide = normalized;
      testimonialsTrack.style.transform = `translateX(-${normalized * 100}%)`;
      indicators.forEach((button, i) => button.classList.toggle('active', i === normalized));
    }

    function stopTestimonials() {
      if (testimonialInterval) {
        clearInterval(testimonialInterval);
        testimonialInterval = null;
      }
    }

    function startTestimonials() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      stopTestimonials();
      testimonialInterval = setInterval(() => setTestimonial(currentSlide + 1), 8500);
    }

    if (testimonialPrev) testimonialPrev.addEventListener('click', () => { setTestimonial(currentSlide - 1); stopTestimonials(); startTestimonials(); });
    if (testimonialNext) testimonialNext.addEventListener('click', () => { setTestimonial(currentSlide + 1); stopTestimonials(); startTestimonials(); });
    indicators.forEach((button, index) => {
      button.addEventListener('click', () => { setTestimonial(index); stopTestimonials(); startTestimonials(); });
    });

    if (testimonialsTrack) {
      const trackContainer = testimonialsTrack.parentElement;
      if (trackContainer) {
        trackContainer.addEventListener('mouseenter', stopTestimonials);
        trackContainer.addEventListener('mouseleave', startTestimonials);
      }
    }

    if (testimonials.length && indicators.length === testimonials.length) {
      setTestimonial(0);
      startTestimonials();
    }

    if (stats.length) {
      const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const element = entry.target;
          const target = Number(element.dataset.target) || 0;
          const duration = 1800;
          const startTime = performance.now();

          function tick(timestamp) {
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const value = Math.floor(progress * target);
            element.textContent = value.toLocaleString();
            if (progress < 1) {
              requestAnimationFrame(tick);
            } else {
              element.textContent = target.toLocaleString();
            }
          }

          requestAnimationFrame(tick);
          observer.unobserve(element);
        });
      }, { threshold: 0.4 });

      stats.forEach(element => counterObserver.observe(element));
    }

    if (bookingForm) {
      const resultMessage = document.createElement('div');
      resultMessage.className = 'availability-result';
      bookingForm.appendChild(resultMessage);

      bookingForm.addEventListener('submit', (event) => {
        event.preventDefault();
        bookingForm.classList.add('searching');
        resultMessage.textContent = 'Searching availability...';
        resultMessage.classList.add('open');

        setTimeout(() => {
          bookingForm.classList.remove('searching');
          resultMessage.textContent = 'Availability search is a preview only. Please continue to the booking page to complete your reservation.';
          setTimeout(() => resultMessage.classList.remove('open'), 4200);
        }, 800);
      });
    }
  })();
});

// ========== GALLERY LIGHTBOX ==========
(function initGalleryLightbox() {
const galleryLinks = Array.from(document.querySelectorAll('.gallery-grid .gallery-item a'));
if (!galleryLinks.length) return;

const items = galleryLinks.map(a => ({
  full: a.dataset.full,
  caption: (a.querySelector('figcaption') || {}).textContent || a.querySelector('img').alt || '',
  alt: a.querySelector('img').alt || ''
}));

let current = 0;
let lastFocused = null;
let _lightboxFocusHandler = null;

function trapFocus(container) {
  const focusable = Array.from(container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el => !el.hasAttribute('disabled'));
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  _lightboxFocusHandler = function(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  document.addEventListener('keydown', _lightboxFocusHandler);
}

function releaseFocus() {
  if (_lightboxFocusHandler) document.removeEventListener('keydown', _lightboxFocusHandler);
  _lightboxFocusHandler = null;
}

const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `
  <div class="lightbox-content" role="dialog" aria-modal="true">
    <button class="close" type="button" aria-label="Close gallery">✕</button>
    <button class="btn prev" type="button" aria-label="Previous image">‹</button>
    <img class="lightbox-img" src="" alt="">
    <button class="btn next" type="button" aria-label="Next image">›</button>
    <div class="lightbox-caption"></div>
  </div>`;

document.body.appendChild(lightbox);

const lbImg = lightbox.querySelector('.lightbox-img');
const lbCaption = lightbox.querySelector('.lightbox-caption');
const btnClose = lightbox.querySelector('.close');
const btnPrev = lightbox.querySelector('.prev');
const btnNext = lightbox.querySelector('.next');

function showLightbox(i) {
  current = i;
  const item = items[current];
  lbImg.src = item.full || '';
  lbImg.alt = item.alt || '';
  lbCaption.textContent = item.caption || '';
  lightbox.classList.add('open');
  const main = document.getElementById('main-content');
  setInert(main, true);
  lastFocused = document.activeElement;
  btnClose.focus();
  trapFocus(lightbox);
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lbImg.src = '';
  const main = document.getElementById('main-content');
  setInert(main, false);
  releaseFocus();
  if (lastFocused) lastFocused.focus();
}

function next() { showLightbox((current + 1) % items.length); }
function prev() { showLightbox((current - 1 + items.length) % items.length); }

galleryLinks.forEach((a, i) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    showLightbox(i);
  });
});

btnClose.addEventListener('click', closeLightbox);
btnNext.addEventListener('click', next);
btnPrev.addEventListener('click', prev);

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft') prev();
});
})();

// ========== INTERIOR PAGE INTERACTIONS ==========
(function initializeInteriorInteractions() {
const faqSearch = document.getElementById('faq-search');
const faqItems = Array.from(document.querySelectorAll('.faq-item'));
if (faqSearch && faqItems.length) {
  faqSearch.addEventListener('input', () => {
    const query = faqSearch.value.trim().toLowerCase();
    faqItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      const matches = !query || text.includes(query);
      item.classList.toggle('is-hidden', !matches);
    });
  });
}

const reviewSearch = document.getElementById('review-search');
const reviewCards = Array.from(document.querySelectorAll('.review-card'));
if (reviewSearch && reviewCards.length) {
  reviewSearch.addEventListener('input', () => {
    const query = reviewSearch.value.trim().toLowerCase();
    reviewCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.classList.toggle('is-hidden', !!query && !text.includes(query));
    });
  });
}

const galleryFilterButtons = Array.from(document.querySelectorAll('.gallery-toolbar button'));
const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
if (galleryFilterButtons.length && galleryItems.length) {
  galleryFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
      galleryFilterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      const category = button.dataset.filter || 'all';
      galleryItems.forEach(item => {
        const matches = category === 'all' || item.dataset.category === category;
        item.classList.toggle('is-hidden', !matches);
      });
    });
  });
}

const printButtons = Array.from(document.querySelectorAll('[data-print]'));
printButtons.forEach(button => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    window.print();
  });
});
})();

// ========== FOOTER UI ==========
function footerUI() {
const newsletterForm = document.getElementById('footer-newsletter-form');
const newsletterEmail = document.getElementById('footer-newsletter-email');
const newsletterResult = document.getElementById('footer-newsletter-result');
const backToTop = document.getElementById('back-to-top');
const bookingBtn = document.getElementById('footer-booking-btn');

if (newsletterForm) {
  newsletterForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = newsletterEmail.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      newsletterResult.textContent = 'Please enter a valid email address.';
      newsletterEmail.focus();
      return;
    }
    newsletterResult.textContent = 'Saving your subscription...';
    const submitButton = newsletterForm.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      const result = await window.hotelAPI.subscribeNewsletter(email);
      newsletterResult.textContent = result.message || 'Thanks — you are subscribed!';
      newsletterEmail.value = '';
      setTimeout(()=> newsletterResult.textContent = '', 5500);
    } catch (error) {
      newsletterResult.textContent = error.status === 409
        ? 'This email is already subscribed.'
        : error.error || 'Unable to subscribe right now. Please try again.';
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

function toggleBackToTop(){
  if (!backToTop) return;
  if (window.scrollY > 300) backToTop.classList.add('visible');
  else backToTop.classList.remove('visible');
}

window.addEventListener('scroll', toggleBackToTop, { passive: true });
toggleBackToTop();

if (backToTop) {
  backToTop.addEventListener('click', ()=> window.scrollTo({ top: 0, behavior: 'smooth' }));
  backToTop.addEventListener('keydown', (e)=>{ if (e.key === 'Enter') window.scrollTo({ top:0, behavior:'smooth' }); });
}

if (bookingBtn) {
  bookingBtn.addEventListener('click', ()=>{
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}
}

footerUI();

// ========== BOOKING ENGINE ==========
(function initializeBookingEngine() {
  const form = document.getElementById('hotel-booking-form');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll('.booking-step'));
  const progressPills = Array.from(form.querySelectorAll('.booking-progress-pill'));
  const errorBox = document.getElementById('booking-error');
  const confirmationPanel = document.getElementById('booking-confirmation');
  const roomSelect = document.getElementById('room-type-select');
  const roomCountSelect = document.getElementById('room-count');
  const checkInInput = document.getElementById('check-in');
  const checkOutInput = document.getElementById('check-out');
  const adultsSelect = document.getElementById('adults');
  const childrenSelect = document.getElementById('children');
  const promoInput = document.getElementById('promo-code');
  const breakfastInput = document.getElementById('breakfast-package');
  const pickupInput = document.getElementById('airport-pickup');
  const guestNameInput = document.getElementById('guest-name');
  const guestEmailInput = document.getElementById('guest-email');
  const guestPhoneInput = document.getElementById('guest-phone');
  const guestCountryInput = document.getElementById('guest-country');
  const specialRequestInput = document.getElementById('special-request');
  const nextButton = document.getElementById('booking-next');
  const backButton = document.getElementById('booking-back');
  const confirmButton = document.getElementById('booking-confirm');
  const resetButton = document.getElementById('booking-reset');
  const calendarButton = document.getElementById('booking-calendar');
  const summaryRoom = document.getElementById('summary-room');
  const summaryStay = document.getElementById('summary-stay');
  const summaryGuests = document.getElementById('summary-guests');
  const summarySubtotal = document.getElementById('summary-room-subtotal');
  const summaryExtraGuests = document.getElementById('summary-guests-fee');
  const summaryBreakfast = document.getElementById('summary-breakfast');
  const summaryPickup = document.getElementById('summary-pickup');
  const summaryDiscount = document.getElementById('summary-discount');
  const summaryTaxes = document.getElementById('summary-taxes');
  const summaryTotal = document.getElementById('summary-total');

  const roomRates = {};

  let currentStep = 0;
  let estimate = null;

  const roomAliases = {
    standard: 'standard-room',
    deluxe: 'deluxe-room',
    executive: 'executive-suite',
    family: 'family-room',
    'standard-room': 'standard-room',
    'deluxe-room': 'deluxe-room',
    'executive-suite': 'executive-suite',
    'family-room': 'family-room'
  };

  const query = new URLSearchParams(window.location.search);
  if (query.get('checkIn')) checkInInput.value = query.get('checkIn');
  if (query.get('checkOut')) checkOutInput.value = query.get('checkOut');

  const requestedRoom = query.get('room') || query.get('roomType');
  const normalizedRoom = requestedRoom ? roomAliases[requestedRoom] || roomAliases[requestedRoom.toLowerCase()] : null;
  if (normalizedRoom && Array.from(roomSelect.options).some((option) => option.value === normalizedRoom)) {
    roomSelect.value = normalizedRoom;
  } else if (query.get('roomType') && Array.from(roomSelect.options).some((option) => option.value === query.get('roomType'))) {
    roomSelect.value = query.get('roomType');
  }
  if (query.get('guests')) {
    const guests = Math.max(1, Number.parseInt(query.get('guests'), 10) || 1);
    const matchingAdultsOption = Array.from(adultsSelect.options).find(
      (option) => Number(option.value) === guests
    );
    adultsSelect.value = matchingAdultsOption ? String(guests) : adultsSelect.value;
  }

  function formatCurrency(value) {
    return `$${value.toLocaleString()}`;
  }

  function setStep(index) {
    currentStep = index;
    steps.forEach((step, stepIndex) => step.classList.toggle('is-active', stepIndex === index));
    progressPills.forEach((pill, pillIndex) => pill.classList.toggle('active', pillIndex === index));
    if (errorBox) errorBox.textContent = '';
  }

  function getRoomLabel(value) {
    return roomSelect?.options[roomSelect.selectedIndex]?.text || 'Standard Room';
  }

  function calculateEstimate() {
    const checkIn = checkInInput?.value ? new Date(checkInInput.value) : null;
    const checkOut = checkOutInput?.value ? new Date(checkOutInput.value) : null;
    const nights = checkIn && checkOut && checkOut > checkIn ? Math.round((checkOut - checkIn) / 86400000) : 1;
    const adults = Number(adultsSelect?.value || 2);
    const children = Number(childrenSelect?.value || 0);
    const rooms = Number(roomCountSelect?.value || 1);
    const roomType = roomSelect?.value || 'standard-room';
    const basePrice = roomRates[roomType] || 0;
    const roomSubtotal = basePrice * nights * rooms;
    const extraGuestFee = Math.max(0, adults - 2) * 35 + children * 15;
    const breakfastFee = breakfastInput?.checked ? nights * rooms * 24 : 0;
    const pickupFee = pickupInput?.checked ? rooms * 35 : 0;
    const promoCode = (promoInput?.value || '').trim().toUpperCase();
    const discount = promoCode === 'HATSEY10' ? Math.round(roomSubtotal * 0.1) : 0;
    const taxes = Math.round((roomSubtotal + extraGuestFee + breakfastFee + pickupFee - discount) * 0.15);
    const total = roomSubtotal + extraGuestFee + breakfastFee + pickupFee - discount + taxes;

    estimate = {
      roomType,
      roomLabel: getRoomLabel(roomType),
      nights,
      adults,
      children,
      rooms,
      roomSubtotal,
      extraGuestFee,
      breakfastFee,
      pickupFee,
      discount,
      taxes,
      total,
      promoCode,
      checkIn,
      checkOut
    };

    if (summaryRoom) summaryRoom.textContent = estimate.roomLabel;
    if (summaryStay) summaryStay.textContent = `${estimate.nights} night${estimate.nights > 1 ? 's' : ''}`;
    if (summaryGuests) summaryGuests.textContent = `${estimate.adults} adult${estimate.adults > 1 ? 's' : ''}${estimate.children ? `, ${estimate.children} child${estimate.children > 1 ? 'ren' : ''}` : ''}`;
    if (summarySubtotal) summarySubtotal.textContent = formatCurrency(estimate.roomSubtotal);
    if (summaryExtraGuests) summaryExtraGuests.textContent = formatCurrency(estimate.extraGuestFee);
    if (summaryBreakfast) summaryBreakfast.textContent = formatCurrency(estimate.breakfastFee);
    if (summaryPickup) summaryPickup.textContent = formatCurrency(estimate.pickupFee);
    if (summaryDiscount) summaryDiscount.textContent = formatCurrency(estimate.discount);
    if (summaryTaxes) summaryTaxes.textContent = formatCurrency(estimate.taxes);
    if (summaryTotal) summaryTotal.textContent = formatCurrency(estimate.total);
    return estimate;
  }

  function showError(message) {
    if (errorBox) errorBox.textContent = message;
  }

  function validateStep(stepIndex) {
    if (stepIndex === 0) {
      if (!checkInInput.value || !checkOutInput.value) {
        showError('Please choose your check-in and check-out dates.');
        return false;
      }
      if (new Date(checkOutInput.value) <= new Date(checkInInput.value)) {
        showError('Check-out must be later than check-in.');
        return false;
      }
      if (!roomSelect.value || !roomCountSelect.value) {
        showError('Please choose a room type and number of rooms.');
        return false;
      }
      return true;
    }

    if (stepIndex === 1) {
      if (!guestNameInput.value.trim()) {
        showError('Please add your full name.');
        guestNameInput.focus();
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmailInput.value.trim())) {
        showError('Please provide a valid email address.');
        guestEmailInput.focus();
        return false;
      }
      if (!guestPhoneInput.value.trim()) {
        showError('Please share your phone number.');
        guestPhoneInput.focus();
        return false;
      }
      return true;
    }

    return true;
  }

  async function submitBooking() {
    const estimateData = calculateEstimate();
    const api = window.hotelAPI;

    if (!api) {
      showError('Booking service is unavailable. Please try again shortly.');
      return false;
    }

    const requestedRooms = Number(roomCountSelect.value);
    const availability = await api.checkAvailability(
      checkInInput.value,
      checkOutInput.value,
      roomSelect.value,
      Number(adultsSelect.value) + Number(childrenSelect.value),
      requestedRooms
    );
    const availableRooms = availability?.availability?.[roomSelect.value] ?? 0;
    if (availableRooms < requestedRooms) {
      showError('The selected room type is not available for those dates.');
      return false;
    }

    const nameParts = guestNameInput.value.trim().split(/\s+/);
    const result = await api.createBooking({
      checkIn: checkInInput.value,
      checkOut: checkOutInput.value,
      roomType: roomSelect.value,
      rooms: requestedRooms,
      guests: Number(adultsSelect.value) + Number(childrenSelect.value),
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' ') || nameParts[0],
      email: guestEmailInput.value.trim(),
      phone: guestPhoneInput.value.trim(),
      specialRequests: document.getElementById('special-request')?.value || ''
    });

    const booking = result?.booking;
    if (!booking?.id) {
      throw new Error('The booking service did not return a booking record.');
    }

    confirmationPanel.innerHTML = `
      <h3>Reservation request received</h3>
      <p><strong>Booking ID:</strong> ${booking.id}</p>
      <p><strong>Guest:</strong> ${guestNameInput.value.trim()}</p>
      <p><strong>Dates:</strong> ${checkInInput.value} to ${checkOutInput.value}</p>
      <p><strong>Room:</strong> ${estimateData.roomLabel}</p>
      <p><strong>Total estimate:</strong> ${formatCurrency(booking.totalPrice)}</p>
      <p>Your booking is pending payment. It is not confirmed until payment is completed.</p>
      ${booking.emailSent ? '<p>A confirmation email has been sent to your email address.</p>' : '<p>Email confirmation will be available once email delivery is configured.</p>'}
    `;

    if (window.HotelAppConfig?.features?.enablePayments) {
      setupPayment(booking);
    }
    return true;
  }

  async function loadStripe() {
    if (window.Stripe) return window.Stripe;
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Unable to load secure payment tools.'));
      document.head.appendChild(script);
    });
    return window.Stripe;
  }

  async function setupPayment(booking) {
    const paymentPanel = document.createElement('div');
    paymentPanel.className = 'payment-panel';
    paymentPanel.innerHTML = `
      <h4>Complete payment</h4>
      <p class="payment-amount">Your one-night deposit will be calculated securely.</p>
      <div class="payment-card-element" hidden></div>
      <p class="payment-message" role="status" aria-live="polite"></p>
      <button type="button" class="buttoncall payment-button">Continue to secure payment</button>
    `;
    confirmationPanel.appendChild(paymentPanel);

    const paymentButton = paymentPanel.querySelector('.payment-button');
    const cardElementContainer = paymentPanel.querySelector('.payment-card-element');
    const paymentMessage = paymentPanel.querySelector('.payment-message');
    let stripeCard = null;
    let intent = null;

    paymentButton.onclick = async () => {
      paymentButton.disabled = true;
      paymentMessage.textContent = 'Preparing secure payment...';

      try {
        intent ||= await window.hotelAPI.createPaymentIntent(
          booking.id,
          guestEmailInput.value.trim()
        );
        paymentPanel.querySelector('.payment-amount').textContent =
          `One-night deposit: ${formatCurrency(intent.amount)}`;

        const publishableKey = window.HotelAppConfig?.payment?.stripePublicKey;
        if (!publishableKey) {
          throw new Error('Secure payment is not configured. Please contact the reservations team.');
        }

        const Stripe = await loadStripe();
        const stripe = Stripe(publishableKey);
        const elements = stripe.elements();
        stripeCard = elements.create('card');
        stripeCard.mount(cardElementContainer);
        cardElementContainer.hidden = false;
        paymentButton.textContent = 'Pay now';
        paymentButton.disabled = false;
        paymentMessage.textContent = 'Enter your card details, then select Pay now.';
        paymentButton.onclick = async () => {
          paymentButton.disabled = true;
          paymentMessage.textContent = 'Confirming payment...';
          const payment = await stripe.confirmCardPayment(intent.clientSecret, {
            payment_method: {
              card: stripeCard,
              billing_details: {
                name: guestNameInput.value.trim(),
                email: guestEmailInput.value.trim()
              }
            }
          });
          if (payment.error) throw payment.error;
          const result = await window.hotelAPI.confirmPayment(
            booking.id,
            intent.paymentIntentId,
            payment.paymentIntent?.payment_method || '',
            guestEmailInput.value.trim()
          );
          paymentMessage.textContent = result.booking?.status === 'CONFIRMED'
            ? 'Deposit confirmed. Your stay is confirmed.'
            : 'Payment is still processing.';
          paymentButton.remove();
        };
      } catch (error) {
        paymentMessage.textContent = error.error || error.message || 'Unable to process payment.';
        paymentButton.disabled = false;
      }
    };
  }

  nextButton?.addEventListener('click', () => {
    if (!validateStep(0)) return;
    calculateEstimate();
    setStep(1);
  });

  backButton?.addEventListener('click', () => setStep(0));

  confirmButton?.addEventListener('click', async () => {
    if (!validateStep(1)) return;
    confirmButton.disabled = true;
    confirmButton.textContent = 'Submitting...';
    try {
      if (await submitBooking()) setStep(2);
    } catch (error) {
      showError(error.error || error.message || 'Unable to submit the reservation.');
    } finally {
      confirmButton.disabled = false;
      confirmButton.textContent = 'Reserve stay';
    }
  });

  resetButton?.addEventListener('click', () => {
    form.reset();
    checkInInput.value = '';
    checkOutInput.value = '';
    setStep(0);
    confirmationPanel.innerHTML = '<h3>Your reservation is almost ready</h3><p>Complete the details to receive a confirmation summary and secure your stay.</p>';
    calculateEstimate();
  });

  calendarButton?.addEventListener('click', () => {
    confirmationPanel.insertAdjacentHTML('beforeend', '<p class="summary-note">The calendar invitation feature is ready for integration with your preferred calendar service.</p>');
  });

  [checkInInput, checkOutInput, roomSelect, roomCountSelect, adultsSelect, childrenSelect, promoInput, breakfastInput, pickupInput].forEach((element) => {
    if (element) element.addEventListener('input', calculateEstimate);
    if (element) element.addEventListener('change', calculateEstimate);
  });

  form.addEventListener('input', () => {
    if (errorBox.textContent) errorBox.textContent = '';
  });

  checkInInput?.addEventListener('change', () => {
    if (checkOutInput.value && checkOutInput.value <= checkInInput.value) {
      checkOutInput.value = '';
    }
    checkOutInput.min = checkInInput.value;
  });

  calculateEstimate();
  setStep(0);

  async function loadRoomRates() {
    if (window.location.port === '5000') return;

    for (let attempt = 0; attempt < 20; attempt += 1) {
      if (window.hotelAPI?.getRooms) {
        const result = await window.hotelAPI.getRooms();
        result.rooms.forEach((room) => {
          roomRates[room.roomType] = room.pricePerNight;
        });
        calculateEstimate();
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  loadRoomRates().catch((error) => {
    console.error('Room pricing API error:', error);
  });
})();

// ========== STICKY BOOKING WIDGETS ==========
(function initializeStickyBookingWidgets() {
  document.querySelectorAll('.sticky-booking-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const [checkInInput, checkOutInput] = form.querySelectorAll('input[type="date"]');
      const guestsInput = form.querySelector('select');

      if (!checkInInput?.value || !checkOutInput?.value || !guestsInput?.value) return;
      if (checkOutInput.value <= checkInInput.value) {
        checkOutInput.setCustomValidity('Check-out must be after check-in.');
        form.reportValidity();
        checkOutInput.setCustomValidity('');
        return;
      }

      const guests = Number.parseInt(guestsInput.value, 10) || 1;
      const params = new URLSearchParams({
        checkIn: checkInInput.value,
        checkOut: checkOutInput.value,
        guests: String(guests)
      });
      window.location.href = `booking.html?${params.toString()}`;
    });
  });
})();

// ========== HOTEL AVAILABILITY FORM ==========
(function initializeHotelAvailabilityForm() {
  const form = document.getElementById('booking-form');
  if (!form || document.getElementById('hotel-booking-form')) return;

  const result = document.getElementById('availability-result');
  const roomTypeMap = {
    standard: 'standard-room',
    deluxe: 'deluxe-room',
    suite: 'executive-suite',
    family: 'family-room'
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const checkIn = form.elements.checkin?.value;
    const checkOut = form.elements.checkout?.value;
    const roomType = roomTypeMap[form.elements.roomType?.value];
    const guests = Number(form.elements.adults?.value || 0) + Number(form.elements.children?.value || 0);

    if (!checkIn || !checkOut || checkOut <= checkIn || !roomType) {
      if (result) result.textContent = 'Please choose valid stay dates and a room type.';
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    if (result) result.textContent = 'Checking live availability...';

    try {
      const response = await window.hotelAPI.checkAvailability(checkIn, checkOut, roomType);
      const available = response?.availability?.[roomType] ?? 0;
      if (available < 1) {
        if (result) result.textContent = 'That room type is not available for those dates.';
        return;
      }

      const params = new URLSearchParams({ checkIn, checkOut, roomType, guests: String(Math.max(1, guests)) });
      window.location.href = `booking.html?${params.toString()}`;
    } catch (error) {
      if (result) result.textContent = error.error || 'Unable to check availability right now.';
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
})();

// ========== ROOM AVAILABILITY + WISHLIST ==========
(function initializeRoomAvailability() {
  const roomCards = Array.from(document.querySelectorAll('.room-card'));
  if (!roomCards.length) return;

  const roomSearch = document.getElementById('room-search');
  const guestFilter = document.getElementById('room-guest-filter');
  const priceFilter = document.getElementById('room-price-filter');
  const availabilityFilter = document.getElementById('room-availability-filter');
  const sortSelect = document.getElementById('room-sort');
  const favoriteSummary = document.getElementById('favorite-summary');
  const favoritesList = document.getElementById('favorite-room-list');
  const compareHeaders = [document.getElementById('compare-room-1'), document.getElementById('compare-room-2'), document.getElementById('compare-room-3')];
  const compareRows = document.getElementById('room-compare-rows');
  const favoriteKey = 'hatseyFavoriteRooms';
  const compareKey = 'hatseyCompareRooms';
  let favorites = [];
  let compareSelection = [];

  function loadStoredState() {
    try {
      favorites = JSON.parse(localStorage.getItem(favoriteKey) || '[]');
      compareSelection = JSON.parse(localStorage.getItem(compareKey) || '[]');
    } catch (error) {
      favorites = [];
      compareSelection = [];
    }
  }

  function saveState() {
    localStorage.setItem(favoriteKey, JSON.stringify(favorites));
    localStorage.setItem(compareKey, JSON.stringify(compareSelection));
  }

  function updateFavoritesUI() {
    if (favoriteSummary) favoriteSummary.textContent = `${favorites.length} saved room${favorites.length === 1 ? '' : 's'}`;
    if (favoritesList) favoritesList.innerHTML = favorites.length ? favorites.map((id) => `<li>${id}</li>`).join('') : '<li>No favorites yet</li>';
    roomCards.forEach((card) => {
      const button = card.querySelector('.favorite-toggle');
      if (button) {
        const isSaved = favorites.includes(card.dataset.roomId);
        button.classList.toggle('active', isSaved);
        button.setAttribute('aria-pressed', String(isSaved));
        button.textContent = isSaved ? '♥ Saved' : '♡ Save';
      }
    });
  }

  function filterAndSort() {
    const query = (roomSearch?.value || '').trim().toLowerCase();
    const selectedGuests = guestFilter?.value || 'all';
    const selectedBudget = priceFilter?.value || 'all';
    const selectedAvailability = availabilityFilter?.value || 'all';
    const sortValue = sortSelect?.value || 'featured';

    const visible = roomCards.filter((card) => {
      const text = `${card.dataset.name} ${card.dataset.type} ${card.dataset.amenities} ${card.dataset.status}`.toLowerCase();
      const matchesQuery = !query || text.includes(query);
      const matchesGuests = selectedGuests === 'all' || Number(card.dataset.guests) <= Number(selectedGuests);
      let matchesBudget = true;
      if (selectedBudget === 'under-70') matchesBudget = Number(card.dataset.price) < 70;
      if (selectedBudget === '70-100') matchesBudget = Number(card.dataset.price) >= 70 && Number(card.dataset.price) <= 100;
      if (selectedBudget === 'over-100') matchesBudget = Number(card.dataset.price) > 100;
      const matchesAvailability = selectedAvailability === 'all' || card.dataset.status === selectedAvailability;
      return matchesQuery && matchesGuests && matchesBudget && matchesAvailability;
    });

    const sorted = [...visible].sort((a, b) => {
      if (sortValue === 'price-asc') return Number(a.dataset.price) - Number(b.dataset.price);
      if (sortValue === 'price-desc') return Number(b.dataset.price) - Number(a.dataset.price);
      if (sortValue === 'popularity') return Number(b.dataset.popularity) - Number(a.dataset.popularity);
      if (sortValue === 'size') return Number(b.dataset.size) - Number(a.dataset.size);
      return 0;
    });

    roomCards.forEach((card) => {
      const shouldShow = sorted.includes(card);
      card.style.display = shouldShow ? '' : 'none';
    });
    updateComparisonUI();
  }

  function updateComparisonUI() {
    const selectedCards = roomCards.filter((card) => compareSelection.includes(card.dataset.roomId));
    compareHeaders.forEach((header, index) => {
      if (header) {
        const card = selectedCards[index];
        header.textContent = card ? card.dataset.name : 'Select a room';
      }
    });

    const rows = [
      { label: 'Price', values: selectedCards.map((card) => `$${card.dataset.price}`) },
      { label: 'Room size', values: selectedCards.map((card) => `${card.dataset.size} m²`) },
      { label: 'Guests', values: selectedCards.map((card) => card.dataset.guests) },
      { label: 'Bed type', values: selectedCards.map((card) => card.dataset.bed || '—') },
      { label: 'WiFi', values: selectedCards.map((card) => card.dataset.amenities.includes('wifi') ? 'Yes' : 'No') },
      { label: 'Breakfast', values: selectedCards.map((card) => card.dataset.breakfast === 'yes' ? 'Yes' : 'No') },
      { label: 'TV', values: selectedCards.map((card) => card.dataset.tv === 'yes' ? 'Yes' : 'No') },
      { label: 'Bathroom', values: selectedCards.map((card) => card.dataset.bathroom || '—') },
      { label: 'View', values: selectedCards.map((card) => card.dataset.view || '—') },
      { label: 'Air conditioning', values: selectedCards.map((card) => card.dataset.ac === 'yes' ? 'Yes' : 'No') },
      { label: 'Room service', values: selectedCards.map((card) => card.dataset.roomService === 'yes' ? 'Yes' : 'No') }
    ];

    if (compareRows) {
      compareRows.innerHTML = rows.map((row) => {
        const values = [null, null, null].map((_, index) => `<td>${row.values[index] || '—'}</td>`).join('');
        return `<tr><td>${row.label}</td>${values}</tr>`;
      }).join('');
    }
  }

  roomCards.forEach((card) => {
    const favoriteButton = card.querySelector('.favorite-toggle');
    const compareButton = card.querySelector('.compare-toggle');

    favoriteButton?.addEventListener('click', () => {
      const id = card.dataset.roomId;
      if (favorites.includes(id)) favorites = favorites.filter((item) => item !== id);
      else favorites.push(id);
      saveState();
      updateFavoritesUI();
    });

    compareButton?.addEventListener('click', () => {
      const id = card.dataset.roomId;
      if (compareSelection.includes(id)) compareSelection = compareSelection.filter((item) => item !== id);
      else if (compareSelection.length < 3) compareSelection.push(id);
      compareButton.classList.toggle('active', compareSelection.includes(id));
      saveState();
      updateComparisonUI();
    });
  });

  [roomSearch, guestFilter, priceFilter, availabilityFilter, sortSelect].forEach((control) => {
    control?.addEventListener('input', filterAndSort);
    control?.addEventListener('change', filterAndSort);
  });

  loadStoredState();
  updateFavoritesUI();
  updateComparisonUI();
  filterAndSort();
})();

// ========== RESTAURANT RESERVATION ==========
(function initializeRestaurantReservation() {
  const form = document.getElementById('restaurant-reservation-form');
  if (!form) return;

  const modal = document.getElementById('restaurant-confirmation-modal');
  const modalMessage = document.getElementById('restaurant-modal-message');
  const closeButton = document.getElementById('restaurant-modal-close');
  const seatingField = document.getElementById('restaurant-seating');
  const guestsField = document.getElementById('restaurant-guests');
  const summarySeating = document.getElementById('restaurant-summary-seating');
  const summaryGuests = document.getElementById('restaurant-summary-guests');
  const summaryPrice = document.getElementById('restaurant-summary-price');

  function updatePreview() {
    const guests = Number(guestsField?.value || 4);
    const seating = seatingField?.value || 'Indoor';
    const estimatedSpend = 70 + guests * 12 + (seating === 'Private' ? 40 : 0);
    summarySeating.textContent = seating;
    summaryGuests.textContent = `${guests}`;
    summaryPrice.textContent = formatCurrency(estimatedSpend);
  }

  function formatCurrency(value) {
    return `$${value.toLocaleString()}`;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const date = document.getElementById('restaurant-date').value;
    const time = document.getElementById('restaurant-time').value;
    const name = document.getElementById('restaurant-name').value.trim();
    const email = document.getElementById('restaurant-email').value.trim();
    const phone = document.getElementById('restaurant-phone').value.trim();
    const request = document.getElementById('restaurant-request').value.trim() || 'None';
    if (!date || !time || !name || !email || !phone) {
      modalMessage.textContent = 'Please complete your name, email, phone, date, and time.';
      modal.hidden = false;
      return;
    }
    modalMessage.textContent = 'Sending your restaurant reservation inquiry...';
    modal.hidden = false;

    try {
      const nameParts = name.split(/\s+/);
      const result = await window.hotelAPI.submitContact({
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || nameParts[0],
        email,
        phone,
        subject: 'Restaurant reservation inquiry',
        message: [
          `Requested date: ${date}`,
          `Requested time: ${time}`,
          `Guests: ${guestsField.value}`,
          `Seating: ${seatingField.value}`,
          `Special request: ${request}`
        ].join('\n')
      });
      modalMessage.textContent = result.message || 'Your restaurant reservation inquiry was sent. Our team will confirm availability shortly.';
    } catch (error) {
      modalMessage.textContent = error.error || 'Unable to send the reservation inquiry. Please try again.';
    }
  });

  closeButton?.addEventListener('click', () => {
    modal.hidden = true;
  });

  modal?.addEventListener('click', (event) => {
    if (event.target === modal) modal.hidden = true;
  });

  [seatingField, guestsField].forEach((field) => field?.addEventListener('change', updatePreview));
  updatePreview();
})();

// ========== EVENT BOOKING ==========
(function initializeEventBooking() {
  const form = document.getElementById('event-booking-form');
  if (!form) return;

  const eventType = document.getElementById('event-type');
  const guestCount = document.getElementById('event-guests');
  const hallField = document.getElementById('event-hall');
  const budgetField = document.getElementById('event-budget');
  const cateringField = document.getElementById('event-catering');
  const preview = document.getElementById('event-price-preview');
  const hallPreview = document.getElementById('event-hall-preview');
  const guestPreview = document.getElementById('event-guests-preview');
  const cateringPreview = document.getElementById('event-catering-preview');

  function updatePreview() {
    const typeFactor = eventType?.value === 'wedding' ? 1.25 : eventType?.value === 'conference' ? 1.1 : 1;
    const hallFee = hallField?.value === 'Grand Ballroom' ? 900 : hallField?.value === 'Garden Terrace' ? 650 : 400;
    const guestFee = Number(guestCount?.value || 80) * 18;
    const cateringFee = cateringField?.value === 'premium' ? 320 : cateringField?.value === 'luxury' ? 520 : 220;
    const total = Math.round((hallFee + guestFee + cateringFee + Number(budgetField?.value || 1500)) * typeFactor);
    preview.textContent = `$${total.toLocaleString()}`;
    hallPreview.textContent = hallField?.value || 'Grand Ballroom';
    guestPreview.textContent = guestCount?.value || '80';
    cateringPreview.textContent = cateringField?.value || 'Standard catering';
  }

  form.addEventListener('input', updatePreview);
  form.addEventListener('change', updatePreview);

  updatePreview();
})();
