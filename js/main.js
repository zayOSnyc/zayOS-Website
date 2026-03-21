/* ============================================================
   ZayOS — main.js
   "NYC Never Sleeps. So Why Should We?"

   Sections:
   1. Scroll Reveal (IntersectionObserver)
   2. Sticky Nav / Scroll Shadow
   3. Mobile Nav Toggle (Slide-in)
   4. Smooth Scroll
   5. Active Nav Link (page-based)
   6. Contact Form Handler
   7. Typing Effect (hero headline)
   8. Agent Overlay
   9. Mac Mini Modal
   10. Scroll to Top Button
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
  initAgentOverlay();
  initMacMiniModal();
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
      business: form.business.value || null,
      message: form.message.value
    };

    try {
      const response = await fetch('https://zay123.tail9c6ba3.ts.net/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
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
   8. AGENT OVERLAY
   ============================================================ */
function initAgentOverlay() {
  const overlay  = document.getElementById('agentOverlay');
  const closeBtn = document.getElementById('overlayClose');

  if (!overlay || !closeBtn) return;

  const cards = document.querySelectorAll('.card--team[data-agent-name]');
  if (!cards.length) return;

  const elEmoji   = document.getElementById('overlayEmoji');
  const elName    = document.getElementById('overlayAgentName');
  const elRole    = document.getElementById('overlayRole');
  const elDesc    = document.getElementById('overlayDesc');
  const elDaily   = document.getElementById('overlayDaily');
  const elExamples = document.getElementById('overlayExamples');

  function openOverlay(card) {
    const name     = card.dataset.agentName    || '';
    const role     = card.dataset.agentRole    || '';
    const emoji    = card.dataset.agentEmoji   || '';
    const desc     = card.dataset.agentDesc    || '';
    const daily    = card.dataset.agentDaily   || '';
    const rawEx    = card.dataset.agentExamples || '[]';

    let examples = [];
    try { examples = JSON.parse(rawEx); } catch (e) { /* silent */ }

    elEmoji.textContent   = emoji;
    elName.textContent    = name;
    elRole.innerHTML      = role;
    elDesc.textContent    = desc;
    elDaily.textContent   = daily;

    elExamples.innerHTML = examples
      .map((ex) => `<li>${ex}</li>`)
      .join('');

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    setTimeout(() => closeBtn.focus(), 50);
  }

  function closeOverlay() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  cards.forEach((card) => {
    card.addEventListener('click', () => openOverlay(card));
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openOverlay(card);
      }
    });
  });

  closeBtn.addEventListener('click', closeOverlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeOverlay();
    }
  });
}


/* ============================================================
   9. MAC MINI MODAL (Services Page)
   ============================================================ */
function initMacMiniModal() {
  const modal = document.getElementById('macMiniModal');
  if (!modal) return;

  const backdrop = modal.querySelector('.modal__backdrop');
  const closeBtn = modal.querySelector('.modal__close');
  const noThanksBtn = document.getElementById('modalNoThanks');
  const ctaButtons = document.querySelectorAll('.service-cta[data-tier]');

  function openModal(tier) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Attach to service CTA buttons (Tier 3-6)
  ctaButtons.forEach((btn) => {
    const tier = parseInt(btn.dataset.tier);
    if (tier >= 3) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(tier);
      });
    }
  });

  // Close handlers
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);
  if (noThanksBtn) noThanksBtn.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}


/* ============================================================
   10. SCROLL TO TOP BUTTON
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
