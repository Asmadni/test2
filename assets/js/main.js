/**
 * LEVEL UP — ACCESSIBILITY AGENCY
 * main.js — Core interactive behaviours
 *
 * Principles:
 *  - All JS enhances accessible HTML — the site works without JS
 *  - No interactions that rely on colour alone
 *  - All custom widgets follow ARIA Authoring Practices Guide (APG)
 *  - Respects prefers-reduced-motion at the JS level
 *  - Keyboard navigation tested throughout
 *
 * WCAG criteria addressed here:
 *  2.1.1 Keyboard — all interactions keyboard accessible
 *  2.4.3 Focus Order — programmatic focus management on modal/panels
 *  2.4.7 Focus Visible — ensure focus is never lost
 *  3.3.1 Error Identification — form errors identified and announced
 *  3.3.3 Error Suggestion — descriptive error messages provided
 *  4.1.2 Name, Role, Value — aria-expanded, aria-selected, aria-hidden updated
 *  4.1.3 Status Messages — success/error announced without focus move
 */

'use strict';

/* ─── Utility: Reduced motion preference check ───────────────────────────── */
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

/* ─── 1. MOBILE NAVIGATION ───────────────────────────────────────────────── */
/**
 * Accessible hamburger menu.
 * WCAG 4.1.2: aria-expanded toggles on button, aria-hidden on panel.
 * Focus is managed — first link receives focus when menu opens.
 */
(function initMobileNav() {
  const toggle = document.getElementById('menu-toggle');
  const nav    = document.getElementById('mobile-nav');
  if (!toggle || !nav) return;

  // Close menu when clicking outside
  document.addEventListener('click', function (e) {
    if (!toggle.contains(e.target) && !nav.contains(e.target)) {
      closeMenu();
    }
  });

  toggle.addEventListener('click', function () {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  // Close on Escape — WCAG 2.1.2 (inverse: allow escape from open panel)
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggle.focus(); // Return focus to trigger — WCAG 2.4.3
    }
  });

  // Close menu when a nav link is activated
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  function openMenu() {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation menu');
    nav.classList.add('is-open');
    nav.setAttribute('aria-hidden', 'false');
    // Move focus to first link for keyboard users — WCAG 2.4.3
    const firstLink = nav.querySelector('a, button');
    if (firstLink) {
      setTimeout(function () { firstLink.focus(); }, 50);
    }
  }

  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
    nav.classList.remove('is-open');
    nav.setAttribute('aria-hidden', 'true');
  }
})();

/* ─── 2. STICKY CTA BAR ──────────────────────────────────────────────────── */
/**
 * Shows sticky CTA after user scrolls past the hero section.
 * Intersection Observer: performant, no scroll event polling.
 * Dismiss is stored in sessionStorage — persists for the session.
 */
(function initStickyCta() {
  const stickyCta = document.getElementById('sticky-cta');
  const dismissBtn = document.getElementById('sticky-cta-dismiss');
  const hero = document.getElementById('hero');
  if (!stickyCta || !hero) return;

  // Don't show if dismissed this session
  if (sessionStorage.getItem('stickyCta') === 'dismissed') return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          stickyCta.classList.add('is-visible');
        } else {
          stickyCta.classList.remove('is-visible');
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(hero);

  if (dismissBtn) {
    dismissBtn.addEventListener('click', function () {
      stickyCta.classList.remove('is-visible');
      sessionStorage.setItem('stickyCta', 'dismissed');
      observer.disconnect();
    });
  }
})();

/* ─── 3. ACCESSIBLE TAB WIDGET ───────────────────────────────────────────── */
/**
 * APG Tab pattern — keyboard: Arrow keys, Home, End, Tab, Enter/Space.
 * WCAG 2.1.1: Full keyboard support.
 * WCAG 4.1.2: aria-selected, tabindex, hidden managed dynamically.
 *
 * https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 */
(function initTabs() {
  const tabLists = document.querySelectorAll('[role="tablist"]');
  if (!tabLists.length) return;

  tabLists.forEach(function (tabList) {
    const tabs   = Array.from(tabList.querySelectorAll('[role="tab"]'));
    const panels = tabs.map(function (tab) {
      return document.getElementById(tab.getAttribute('aria-controls'));
    });

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () { activateTab(index); });

      tab.addEventListener('keydown', function (e) {
        let newIndex;

        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            newIndex = (index + 1) % tabs.length;
            activateTab(newIndex);
            tabs[newIndex].focus();
            break;

          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            newIndex = (index - 1 + tabs.length) % tabs.length;
            activateTab(newIndex);
            tabs[newIndex].focus();
            break;

          case 'Home':
            e.preventDefault();
            activateTab(0);
            tabs[0].focus();
            break;

          case 'End':
            e.preventDefault();
            activateTab(tabs.length - 1);
            tabs[tabs.length - 1].focus();
            break;
        }
      });
    });

    function activateTab(activeIndex) {
      tabs.forEach(function (tab, i) {
        const isActive = i === activeIndex;
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tab.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      panels.forEach(function (panel, i) {
        if (!panel) return;
        if (i === activeIndex) {
          panel.classList.add('is-active');
          panel.removeAttribute('hidden');
        } else {
          panel.classList.remove('is-active');
          panel.setAttribute('hidden', '');
        }
      });
    }
  });
})();

/* ─── 4. SMOOTH SCROLL WITH FOCUS MANAGEMENT ─────────────────────────────── */
/**
 * Intercepts anchor links that point to in-page sections.
 * After scroll, programmatically focuses the target element.
 * This ensures keyboard users don't lose their place — WCAG 2.4.3.
 *
 * Native CSS scroll-behavior:smooth is set, but we add focus for AT.
 */
(function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = anchor.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      // Close mobile nav if open
      const mobileNav = document.getElementById('mobile-nav');
      if (mobileNav && mobileNav.classList.contains('is-open')) {
        document.getElementById('menu-toggle').click();
      }

      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'instant' : 'smooth',
        block: 'start'
      });

      // Set focus after scroll — allows keyboard users to continue navigation
      // tabindex="-1" allows focus on non-interactive elements
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }

      setTimeout(function () {
        target.focus({ preventScroll: true });
      }, prefersReducedMotion ? 0 : 400);
    });
  });
})();

/* ─── 5. FORM VALIDATION ─────────────────────────────────────────────────── */
/**
 * Accessible form validation.
 *
 * WCAG 3.3.1 Error Identification: Errors described in text, not colour only.
 * WCAG 3.3.2 Labels: Labels always visible (not replaced by errors).
 * WCAG 3.3.3 Error Suggestion: Descriptive error messages with correct format.
 * WCAG 4.1.3 Status Messages: Success message announced via role="status".
 *
 * Pattern:
 *  1. Validate on submit
 *  2. Show all errors at once (not one-by-one)
 *  3. Move focus to first errored field — WCAG 2.4.3
 *  4. Re-validate field on input after first submit attempt
 */
(function initForm() {
  const form          = document.getElementById('audit-request-form');
  const successMsg    = document.getElementById('form-success');
  if (!form) return;

  let hasAttemptedSubmit = false;

  // ── Validators ──────────────────────────────────────────────────────
  const validators = {
    'field-name': function (val) {
      return val.trim().length >= 2 ? null : 'Please enter your name';
    },
    'field-email': function (val) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!val.trim()) return 'Please enter your email address';
      if (!emailRegex.test(val)) return 'Please enter a valid email address (e.g. name@company.com)';
      return null;
    },
    'field-url': function (val) {
      if (!val.trim()) return 'Please enter your website URL';
      try {
        const url = new URL(val);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return 'URL must start with https:// or http://';
        }
        return null;
      } catch {
        return 'Please enter a valid URL (e.g. https://yoursite.com)';
      }
    },
    'field-consent': function (_, el) {
      return el.checked ? null : 'Please accept to receive your report';
    }
  };

  // ── Show/hide error for a field ──────────────────────────────────────
  function setFieldError(fieldId, message) {
    const field    = document.getElementById(fieldId);
    const errorEl  = document.getElementById('error-' + fieldId.replace('field-', ''));

    if (!field) return;

    if (message) {
      field.setAttribute('aria-invalid', 'true');
      if (errorEl) {
        errorEl.textContent = message; // Update text content first
        // Prepend icon back (simple recreation)
        errorEl.insertAdjacentHTML(
          'afterbegin',
          '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg> '
        );
        errorEl.classList.add('is-visible');
      }
    } else {
      field.setAttribute('aria-invalid', 'false');
      if (errorEl) {
        errorEl.classList.remove('is-visible');
        errorEl.textContent = '';
      }
    }
  }

  // ── Validate single field ────────────────────────────────────────────
  function validateField(fieldId) {
    const validator = validators[fieldId];
    if (!validator) return true;

    const field = document.getElementById(fieldId);
    if (!field) return true;

    const error = validator(field.value, field);
    setFieldError(fieldId, error);
    return !error;
  }

  // ── Live validation after first submit attempt ───────────────────────
  Object.keys(validators).forEach(function (fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const eventType = field.type === 'checkbox' ? 'change' : 'input';
    field.addEventListener(eventType, function () {
      if (hasAttemptedSubmit) {
        validateField(fieldId);
      }
    });
  });

  // ── Submit handler ───────────────────────────────────────────────────
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hasAttemptedSubmit = true;

    // Validate all fields
    const fieldIds   = Object.keys(validators);
    const results    = fieldIds.map(validateField);
    const isValid    = results.every(Boolean);

    if (!isValid) {
      // Move focus to first errored field — WCAG 2.4.3
      const firstErrorId = fieldIds.find(function (id) { return !validateField(id); });
      // (we just ran validateField again above; find first still-invalid)
      // Re-check by aria-invalid
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    // Simulate async submission
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      submitBtn.setAttribute('aria-busy', 'true');
    }

    // Simulate network delay (replace with real fetch in production)
    setTimeout(function () {
      // Hide form fields, show success message
      Array.from(form.elements).forEach(function (el) {
        if (el !== successMsg && el.closest('.form-success-message') === null) {
          const group = el.closest('.form-group, .form-checkbox-group');
          if (group) group.style.display = 'none';
        }
      });
      if (submitBtn) submitBtn.style.display = 'none';
      const privacyNote = form.querySelector('.form-privacy-note');
      if (privacyNote) privacyNote.style.display = 'none';

      // WCAG 4.1.3: Status message announced by AT without focus move
      // role="status" + aria-live="polite" on the element handle this
      successMsg.classList.add('is-visible');
      successMsg.focus(); // Also move focus for keyboard users
    }, 1200);
  });
})();

/* ─── 6. SCORE METER ANIMATION ───────────────────────────────────────────── */
/**
 * Animate score meter fills when they scroll into view.
 * Uses IntersectionObserver — no polling.
 * Respects prefers-reduced-motion: if set, shows final state instantly.
 */
(function initScoreMeters() {
  const fills = document.querySelectorAll('.score-meter__fill');
  if (!fills.length) return;

  if (prefersReducedMotion) return; // Already at final widths via CSS inline

  // Capture target widths, reset to 0, animate on scroll-in
  const targets = [];
  fills.forEach(function (fill) {
    const targetWidth = fill.style.width;
    targets.push({ el: fill, width: targetWidth });
    fill.style.width = '0%';
    fill.style.transition = 'none';
  });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const target = targets.find(function (t) { return t.el === entry.target; });
          if (target) {
            setTimeout(function () {
              target.el.style.transition = 'width 1s cubic-bezier(0.4, 0, 0.2, 1)';
              target.el.style.width = target.width;
            }, 100);
            observer.unobserve(entry.target);
          }
        }
      });
    },
    { threshold: 0.2 }
  );

  fills.forEach(function (fill) { observer.observe(fill); });
})();

/* ─── 7. SCROLL-TRIGGERED REVEAL ANIMATIONS ─────────────────────────────── */
/**
 * Subtle fade-up for section content on scroll.
 * WCAG 2.3.3: Only runs if user has NOT set prefers-reduced-motion.
 * CSS class-based — keeps JS minimal.
 */
(function initScrollReveal() {
  if (prefersReducedMotion) return;

  // Add CSS for the animation (injected so it's only present when motion OK)
  const style = document.createElement('style');
  style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 500ms ease, transform 500ms ease;
    }
    .reveal.is-revealed {
      opacity: 1;
      transform: none;
    }
  `;
  document.head.appendChild(style);

  // Elements to reveal
  const revealEls = document.querySelectorAll(
    '.service-card, .testimonial-card, .stat-card, .trust-badge, .case-card, .audit-benefit, .demo-issue'
  );

  revealEls.forEach(function (el) { el.classList.add('reveal'); });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(function (el) { observer.observe(el); });
})();

/* ─── 8. ACTIVE NAV LINK HIGHLIGHTING ────────────────────────────────────── */
/**
 * Update aria-current="page" on nav links as user scrolls.
 * WCAG 2.4.8: Location (AAA) — helps users know where they are.
 */
(function initActiveNav() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.primary-nav__link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            const href = link.getAttribute('href');
            if (href === '#' + entry.target.id) {
              link.setAttribute('aria-current', 'page');
            } else {
              link.removeAttribute('aria-current');
            }
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(function (section) { observer.observe(section); });
})();

/* ─── 9. FOOTER YEAR ─────────────────────────────────────────────────────── */
(function updateFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();

/* ─── 10. EXTERNAL LINK ANNOUNCEMENTS ────────────────────────────────────── */
/**
 * WCAG 2.4.4: Link Purpose — external links should indicate they open a new tab.
 * Adds a screen-reader-only " (opens in new tab)" text to all target="_blank" links.
 */
(function announceExternalLinks() {
  document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
    // Only add if not already present
    if (!link.querySelector('.sr-only[data-external]')) {
      const notice = document.createElement('span');
      notice.className = 'sr-only';
      notice.setAttribute('data-external', '');
      notice.textContent = ' (opens in new tab)';
      link.appendChild(notice);
    }
  });
})();
