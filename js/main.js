(function () {
  'use strict';

  /* ---------- Menú móvil ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  var mobileNavClose = document.querySelector('.mobile-nav-close');

  function openMobileNav() {
    mobileNav.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileNav() {
    mobileNav.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', openMobileNav);
    if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileNav);
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMobileNav);
    });
  }

  /* ---------- Animación al hacer scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Banner de cookies (RGPD) ----------
     Solo se cargan cookies de analítica (Google Analytics) si el
     usuario pulsa "Aceptar". Rechazar/cerrar deja únicamente las
     cookies técnicas necesarias para el funcionamiento de la web. */
  var CONSENT_KEY = 'bp_cookie_consent'; // 'accepted' | 'rejected'
  var GA_ID = 'G-MGG30E063W';

  function loadGoogleAnalytics() {
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
  }

  function initCookieBanner() {
    var banner = document.querySelector('.cookie-banner');
    if (!banner) return;
    var stored = null;
    try { stored = localStorage.getItem(CONSENT_KEY); } catch (e) {}

    if (stored === 'accepted') {
      loadGoogleAnalytics();
      return;
    }
    if (stored === 'rejected') {
      return;
    }

    // Sin decisión previa: mostrar banner
    requestAnimationFrame(function () {
      banner.classList.add('is-visible');
    });

    var acceptBtn = banner.querySelector('.cookie-accept');
    var rejectBtn = banner.querySelector('.cookie-reject');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        try { localStorage.setItem(CONSENT_KEY, 'accepted'); } catch (e) {}
        loadGoogleAnalytics();
        banner.classList.remove('is-visible');
      });
    }
    if (rejectBtn) {
      rejectBtn.addEventListener('click', function () {
        try { localStorage.setItem(CONSENT_KEY, 'rejected'); } catch (e) {}
        banner.classList.remove('is-visible');
      });
    }
  }
  initCookieBanner();

  /* ---------- Formulario de contacto (FormSubmit.co) ----------
     Envío por AJAX sin recargar la página. FormSubmit entrega el
     mensaje directamente a info@bpconsultores.es; la primera vez
     que llegue un envío, FormSubmit manda un correo de activación
     a esa misma dirección que hay que confirmar una única vez. */
  var form = document.querySelector('#contact-form');
  if (form) {
    var statusEl = form.querySelector('.form-status');
    var submitBtn = form.querySelector('.form-submit');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot anti-spam
      var honey = form.querySelector('input[name="_honey"]');
      if (honey && honey.value) return;

      var original = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';
      statusEl.className = 'form-status';
      statusEl.textContent = '';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (res.ok) {
            statusEl.textContent = 'Gracias, hemos recibido tu mensaje. Te responderemos lo antes posible.';
            statusEl.classList.add('ok', 'is-visible');
            form.reset();
          } else {
            throw new Error('Respuesta no válida');
          }
        })
        .catch(function () {
          statusEl.textContent = 'No se ha podido enviar el mensaje. Prueba de nuevo o escríbenos a info@bpconsultores.es.';
          statusEl.classList.add('err', 'is-visible');
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = original;
        });
    });
  }
})();
