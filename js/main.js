/* ============================================================
   ZayOS — main.js
   "NYC Never Sleeps. So Why Should We?"

   Sections:
   1. Scroll Reveal (IntersectionObserver)
   2. Sticky Nav / Scroll Shadow
   3. Mobile Nav Toggle
   4. Smooth Scroll
   5. Active Nav Link (page-based)
   6. Contact Form Handler
   7. Typing Effect (hero headline)
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

});


/* ============================================================
   1. SCROLL REVEAL
   Watches `.fade-in` elements and adds `.visible` when
   they enter the viewport — CSS handles the actual animation.
   ============================================================ */
function initScrollReveal() {
  const elements = document.querySelectorAll('.fade-in');

  if (!elements.length) return;

  // Immediately show elements already in view on page load
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Stop watching once it's been revealed
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,       // 12% of element must be visible to trigger
      rootMargin: '0px 0px -40px 0px', // slight upward bias so it triggers a beat early
    }
  );

  elements.forEach((el) => observer.observe(el));
}


/* ============================================================
   2. STICKY NAV / SCROLL SHADOW
   Adds `.scrolled` class to the nav when the user
   has scrolled down — CSS handles the shadow + bg change.
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
  onScroll(); // Run once on load in case page is already scrolled
}


/* ============================================================
   3. MOBILE NAV TOGGLE
   Toggles `.nav__links` visibility when the hamburger
   button is clicked. Also animates the hamburger lines
   into an X icon when open.
   ============================================================ */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (!toggle || !navLinks) return;

  let isOpen = false;

  // Show/hide the nav links menu
  toggle.addEventListener('click', () => {
    isOpen = !isOpen;

    // Toggle menu visibility
    navLinks.style.display = isOpen ? 'flex' : '';

    // Animate hamburger → X
    const bars = toggle.querySelectorAll('span');
    if (isOpen) {
      bars[0].style.transform = 'translateY(7px) rotate(45deg)';
      bars[1].style.opacity   = '0';
      bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      toggle.setAttribute('aria-label', 'Close menu');
    } else {
      bars[0].style.transform = '';
      bars[1].style.opacity   = '';
      bars[2].style.transform = '';
      toggle.setAttribute('aria-label', 'Open menu');
    }
  });

  // Close the nav when a link is clicked (mobile UX)
  navLinks.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      if (isOpen) {
        isOpen = false;
        navLinks.style.display = '';
        const bars = toggle.querySelectorAll('span');
        bars[0].style.transform = '';
        bars[1].style.opacity   = '';
        bars[2].style.transform = '';
        toggle.setAttribute('aria-label', 'Open menu');
      }
    });
  });

  // Close nav if window is resized past mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && isOpen) {
      isOpen = false;
      navLinks.style.display = '';
      const bars = toggle.querySelectorAll('span');
      bars[0].style.transform = '';
      bars[1].style.opacity   = '';
      bars[2].style.transform = '';
      toggle.setAttribute('aria-label', 'Open menu');
    }
  });
}


/* ============================================================
   4. SMOOTH SCROLL
   Intercepts clicks on anchor links (href="#section")
   and scrolls smoothly, accounting for the sticky nav height.
   ============================================================ */
function initSmoothScroll() {
  const NAV_OFFSET = 80; // a bit more than --nav-height for breathing room

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

      // Update URL hash without jumping
      history.pushState(null, '', hash);
    });
  });
}


/* ============================================================
   5. ACTIVE NAV LINK
   Marks the current page's nav link as `.active` based
   on the current URL filename (e.g., "about.html").
   Falls back to "index.html" for root paths.
   ============================================================ */
function setActiveNavLink() {
  // Get the current page filename
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav__link').forEach((link) => {
    const href = link.getAttribute('href');

    // Match current page, treating empty/root as index.html
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
   Intercepts the contact form submission, shows a success
   message inline, and resets the form — no page reload.
   ============================================================ */
function initContactForm() {
  const form = document.querySelector('form[name="contact"]');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation — just make sure name + email are filled
    const name  = form.querySelector('#name');
    const email = form.querySelector('#email');

    if (name && !name.value.trim()) {
      name.focus();
      return;
    }
    if (email && !email.value.trim()) {
      email.focus();
      return;
    }

    // Show success message
    showFormSuccess(form);

    // Reset the form after a short delay
    setTimeout(() => form.reset(), 400);
  });
}

/**
 * Replaces the form with a success message.
 * @param {HTMLFormElement} form
 */
function showFormSuccess(form) {
  const wrapper = form.closest('.fade-in') || form.parentElement;

  // Build the success card
  const successEl = document.createElement('div');
  successEl.className = 'form form--success';
  successEl.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 16px;
    min-height: 320px;
  `;
  successEl.innerHTML = `
    <div style="
      font-size: 3rem;
      animation: successPop 0.4s ease;
    ">✅</div>
    <h3 style="font-size: 1.4rem; font-weight: 700; color: #fff;">You're on our radar.</h3>
    <p style="color: #CCCCCC; font-size: 1rem; max-width: 360px; line-height: 1.6;">
      Thanks! We'll be in touch within 24 hours.
    </p>
  `;

  // Inject keyframe animation once
  if (!document.getElementById('zayos-success-style')) {
    const style = document.createElement('style');
    style.id = 'zayos-success-style';
    style.textContent = `
      @keyframes successPop {
        0%   { transform: scale(0.5); opacity: 0; }
        70%  { transform: scale(1.2); }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  // Fade the form out, swap in the success message
  form.style.transition = 'opacity 0.3s ease';
  form.style.opacity = '0';

  setTimeout(() => {
    wrapper.replaceChild(successEl, form);
    // Fade success card in
    successEl.style.opacity = '0';
    successEl.style.transition = 'opacity 0.4s ease';
    requestAnimationFrame(() => {
      successEl.style.opacity = '1';
    });
  }, 300);
}


/* ============================================================
   7. AGENT OVERLAY
   Opens a modal with expanded agent details when a
   .card--team is clicked. Closes on X, backdrop click, or Esc.
   ============================================================ */
function initAgentOverlay() {
  const overlay  = document.getElementById('agentOverlay');
  const closeBtn = document.getElementById('overlayClose');

  if (!overlay || !closeBtn) return;

  const cards = document.querySelectorAll('.card--team[data-agent-name]');
  if (!cards.length) return;

  // Elements inside the overlay
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
    elRole.innerHTML      = role;    // may contain &amp;
    elDesc.textContent    = desc;
    elDaily.textContent   = daily;

    elExamples.innerHTML = examples
      .map((ex) => `<li>${ex}</li>`)
      .join('');

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus the close button for accessibility
    setTimeout(() => closeBtn.focus(), 50);
  }

  function closeOverlay() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Attach click handlers to each card
  cards.forEach((card) => {
    card.addEventListener('click', () => openOverlay(card));

    // Keyboard accessibility: Enter/Space opens overlay
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openOverlay(card);
      }
    });
  });

  // Close button
  closeBtn.addEventListener('click', closeOverlay);

  // Click outside the card (on the backdrop)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay();
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeOverlay();
    }
  });
}


/* ============================================================
   8. TYPING EFFECT
   Subtle typewriter on the hero headline's first line.
   Only runs on the homepage (index.html / root path).
   Non-destructive: if the element doesn't exist, skip it.
   ============================================================ */
function initTypingEffect() {
  // Only run on the homepage
  const path   = window.location.pathname;
  const page   = path.split('/').pop() || 'index.html';
  const isHome = page === 'index.html' || page === '' || page === '/';

  if (!isHome) return;

  const heroTitle = document.querySelector('.hero__title');
  if (!heroTitle) return;

  // We only animate the plain text node "NYC Never Sleeps." —
  // the second line with .highlight stays static.
  // Strategy: pull the first text node out, type it back in.

  // Find the raw "NYC Never Sleeps." text node
  const firstTextNode = Array.from(heroTitle.childNodes).find(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
  );

  if (!firstTextNode) return;

  const fullText = firstTextNode.textContent; // "NYC Never Sleeps.\n        "
  const displayText = fullText.trim();        // "NYC Never Sleeps."

  // Replace with a span we can type into
  const typingSpan = document.createElement('span');
  typingSpan.className = 'hero__typing';
  typingSpan.setAttribute('aria-label', displayText);
  heroTitle.replaceChild(typingSpan, firstTextNode);

  // Also insert the line break that was there
  const br = heroTitle.querySelector('br');
  // br is already in the DOM from the HTML, no need to re-insert

  let i = 0;
  const DELAY_START = 400;  // ms before typing starts
  const CHAR_SPEED  = 55;   // ms per character

  // Cursor element
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

  // Start typing after a short delay
  setTimeout(() => {
    const interval = setInterval(() => {
      typingSpan.textContent = displayText.slice(0, ++i);

      if (i >= displayText.length) {
        clearInterval(interval);
        // Remove the cursor after a beat
        setTimeout(() => cursor.remove(), 1800);
      }
    }, CHAR_SPEED);
  }, DELAY_START);
}
