/* ============================================================
   ZayOS — main.js
   "NYC Never Sleeps. So Why Should We?"

   Sections:
   1. Scroll Reveal (IntersectionObserver)
   2. Sticky Nav / Scroll Shadow
   3. Mobile Nav Toggle (Slide-in)
   4. Smooth Scroll
   5. Active Nav Link (page-based)
   6. Contact Form (prefill + submit handler)
   7. Typing Effect (hero headline)
   8. Scroll to Top Button
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   Utility: Run after DOM is ready
   ------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {

  initScrollReveal();
  initStickyNav();
  initMobileNav();
  initSmoothScroll();
  setActiveNavLink();
  initContactForm();
  initTypingEffect();
  initScrollTopButton();

});


/* ============================================================
   1. SCROLL REVEAL
   Watches `.fade-in` elements and adds `.visible` when
   they enter the viewport — CSS handles the actual animation.
   ============================================================ */
function initScrollReveal() {
  const elements = document.querySelectorAll('.fade-in');

  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
}


/* ============================================================
   2. STICKY NAV / SCROLL SHADOW
   ============================================================ */
function initStickyNav() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}


/* ============================================================
   3. MOBILE NAV TOGGLE (Smooth Slide-in)
   ============================================================ */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (!toggle || !navLinks) return;

  let isOpen = false;

  toggle.addEventListener('click', () => {
    isOpen = !isOpen;

    // Toggle classes for CSS animations
    if (isOpen) {
      navLinks.classList.add('active');
      toggle.classList.add('active');
      toggle.setAttribute('aria-label', 'Close menu');
      document.body.style.overflow = 'hidden';
    } else {
      navLinks.classList.remove('active');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    }
  });

  // Close nav when a link is clicked (mobile UX)
  navLinks.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      if (isOpen) {
        isOpen = false;
        navLinks.classList.remove('active');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-label', 'Open menu');
        document.body.style.overflow = '';
      }
    });
  });

  // Close nav if window is resized past mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && isOpen) {
      isOpen = false;
      navLinks.classList.remove('active');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    }
  });
}


/* ============================================================
   4. SMOOTH SCROLL
   ============================================================ */
function initSmoothScroll() {
  const NAV_OFFSET = 80;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;

      const target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;

      window.scrollTo({
        top,
        behavior: 'smooth',
      });

      history.pushState(null, '', hash);
    });
  });
}


/* ============================================================
   5. ACTIVE NAV LINK
   ============================================================ */
function setActiveNavLink() {
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav__link').forEach((link) => {
    const href = link.getAttribute('href');

    const isActive =
      href === page ||
      (page === '' && href === 'index.html') ||
      (page === '/' && href === 'index.html');

    if (isActive) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}


/* ============================================================
   6. CONTACT FORM HANDLER
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Auto-select tier from URL query param (?tier=starter etc.)
  const params = new URLSearchParams(window.location.search);
  const tierParam = params.get('tier');
  if (tierParam && form.tier) {
    for (const opt of form.tier.options) {
      if (opt.value === tierParam) { opt.selected = true; break; }
    }
  }

  // Preferred call date can't be in the past
  if (form.preferredDate) {
    form.preferredDate.min = new Date().toISOString().split('T')[0];
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending...';

    const data = {
      name: form.name.value,
      email: form.email.value,
      business: form.business.value || 'Not provided',
      tier: form.tier ? form.tier.value || 'Not selected' : 'Not selected',
      preferredDate: form.preferredDate ? form.preferredDate.value || 'Not provided' : 'Not provided',
      message: form.message.value,
      _subject: 'New ZayOS website inquiry',
      _replyto: form.email.value,
      _template: 'table'
    };

    try {
      const response = await fetch('https://formsubmit.co/ajax/founder@zayos.info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      // FormSubmit returns HTTP 200 with success:"false" when not delivered
      if (response.ok && String(result.success) === 'true') {
        submitBtn.innerHTML = '✓ Sent!';
        submitBtn.style.background = '#4ade80';
        form.reset();

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }, 3000);
      } else {
        throw new Error(result.error || 'Something went wrong');
      }
    } catch (error) {
      submitBtn.innerHTML = 'Error — Try Again';
      submitBtn.style.background = '#f87171';
      submitBtn.disabled = false;

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
      }, 3000);
    }
  });
}


/* ============================================================
   7. TYPING EFFECT
   ============================================================ */
function initTypingEffect() {
  const path   = window.location.pathname;
  const page   = path.split('/').pop() || 'index.html';
  const isHome = page === 'index.html' || page === '' || page === '/';

  if (!isHome) return;

  const heroTitle = document.querySelector('.hero__title');
  if (!heroTitle) return;

  const firstTextNode = Array.from(heroTitle.childNodes).find(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
  );

  if (!firstTextNode) return;

  const fullText = firstTextNode.textContent;
  const displayText = fullText.trim();

  const typingSpan = document.createElement('span');
  typingSpan.className = 'hero__typing';
  typingSpan.setAttribute('aria-label', displayText);
  heroTitle.replaceChild(typingSpan, firstTextNode);

  let i = 0;
  const DELAY_START = 400;
  const CHAR_SPEED  = 55;

  const cursor = document.createElement('span');
  cursor.style.cssText = `
    display: inline-block;
    width: 2px;
    height: 0.9em;
    background: var(--purple-accent);
    margin-left: 2px;
    vertical-align: middle;
    animation: cursorBlink 0.9s step-end infinite;
  `;
  typingSpan.after(cursor);

  if (!document.getElementById('zayos-cursor-style')) {
    const style = document.createElement('style');
    style.id = 'zayos-cursor-style';
    style.textContent = `
      @keyframes cursorBlink {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    const interval = setInterval(() => {
      typingSpan.textContent = displayText.slice(0, ++i);

      if (i >= displayText.length) {
        clearInterval(interval);
        setTimeout(() => cursor.remove(), 1800);
      }
    }, CHAR_SPEED);
  }, DELAY_START);
}


/* ============================================================
   8. SCROLL TO TOP BUTTON
   ============================================================ */
function initScrollTopButton() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.style.display = 'block';
    } else {
      btn.style.display = 'none';
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
