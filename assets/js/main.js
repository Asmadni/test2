'use strict';
/* ================================================================
   LEVEL UP — main.js
   All interactions are keyboard-accessible and AT-friendly.
   Respects prefers-reduced-motion throughout.
   WCAG criteria: 2.1.1, 2.4.3, 3.3.1, 3.3.3, 4.1.2, 4.1.3
================================================================ */

const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── 1. MOBILE NAV ──────────────────────────────────────────── */
(function () {
  var btn = document.getElementById('menu-toggle');
  var nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;

  function open() {
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
    nav.classList.add('is-open');
    nav.setAttribute('aria-hidden', 'false');
    var first = nav.querySelector('a, button');
    if (first) setTimeout(function () { first.focus(); }, 50);
  }
  function close() {
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
    nav.classList.remove('is-open');
    nav.setAttribute('aria-hidden', 'true');
  }

  btn.addEventListener('click', function () {
    btn.getAttribute('aria-expanded') === 'true' ? close() : open();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
      close(); btn.focus();
    }
  });

  document.addEventListener('click', function (e) {
    if (!btn.contains(e.target) && !nav.contains(e.target)) close();
  });

  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
}());

/* ── 2. STICKY CTA ──────────────────────────────────────────── */
(function () {
  var bar     = document.getElementById('sticky-cta');
  var dismiss = document.getElementById('sticky-dismiss');
  var hero    = document.getElementById('hero');
  if (!bar || !hero) return;
  if (sessionStorage.getItem('cta') === 'off') return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      bar.classList.toggle('is-visible', !e.isIntersecting);
    });
  }, { threshold: 0.1 });
  io.observe(hero);

  if (dismiss) {
    dismiss.addEventListener('click', function () {
      bar.classList.remove('is-visible');
      sessionStorage.setItem('cta', 'off');
      io.disconnect();
    });
  }
}());

/* ── 3. TABS (APG pattern) ──────────────────────────────────── */
(function () {
  document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    var tabs   = Array.from(list.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });

    function activate(i) {
      tabs.forEach(function (t, j) {
        t.setAttribute('aria-selected', j === i ? 'true' : 'false');
        t.setAttribute('tabindex', j === i ? '0' : '-1');
      });
      panels.forEach(function (p, j) {
        if (!p) return;
        if (j === i) { p.classList.add('is-active'); p.removeAttribute('hidden'); }
        else          { p.classList.remove('is-active'); p.setAttribute('hidden', ''); }
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { activate(i); });
      tab.addEventListener('keydown', function (e) {
        var next;
        if      (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); next = (i + 1) % tabs.length; }
        else if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); next = (i - 1 + tabs.length) % tabs.length; }
        else if (e.key === 'Home')  { e.preventDefault(); next = 0; }
        else if (e.key === 'End')   { e.preventDefault(); next = tabs.length - 1; }
        if (next !== undefined) { activate(next); tabs[next].focus(); }
      });
    });
  });
}());

/* ── 4. SMOOTH SCROLL + FOCUS MANAGEMENT ───────────────────── */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();

      /* Close mobile nav if open */
      var nav = document.getElementById('mobile-nav');
      if (nav && nav.classList.contains('is-open')) {
        document.getElementById('menu-toggle').click();
      }

      target.scrollIntoView({ behavior: noMotion ? 'instant' : 'smooth', block: 'start' });
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      setTimeout(function () { target.focus({ preventScroll: true }); }, noMotion ? 0 : 380);
    });
  });
}());

/* ── 5. FORM VALIDATION ─────────────────────────────────────── */
(function () {
  var form    = document.getElementById('audit-form-el');
  var success = document.getElementById('form-success');
  if (!form) return;

  var tried = false;

  var rules = {
    'f-name':    function (v)    { return v.trim().length >= 2 ? null : 'Please enter your name'; },
    'f-email':   function (v)    { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Please enter a valid email address'; },
    'f-url':     function (v)    {
      try { var u = new URL(v); return (u.protocol === 'https:' || u.protocol === 'http:') ? null : 'URL must start with https://'; }
      catch (x) { return 'Please enter a valid URL (e.g. https://yoursite.com)'; }
    },
    'f-consent': function (v, el) { return el.checked ? null : 'Please accept to receive your report'; }
  };

  function setErr(id, msg) {
    var field = document.getElementById(id);
    var err   = document.getElementById('e-' + id.replace('f-', ''));
    if (!field) return;
    if (msg) {
      field.setAttribute('aria-invalid', 'true');
      if (err) { err.lastChild.textContent = msg; err.classList.add('is-visible'); }
    } else {
      field.setAttribute('aria-invalid', 'false');
      if (err) err.classList.remove('is-visible');
    }
  }

  function validate(id) {
    var field = document.getElementById(id);
    if (!field || !rules[id]) return true;
    var msg = rules[id](field.value, field);
    setErr(id, msg);
    return !msg;
  }

  Object.keys(rules).forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', function () {
      if (tried) validate(id);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    tried = true;
    var ids    = Object.keys(rules);
    var ok     = ids.every(function (id) { return validate(id); });
    if (!ok) {
      var first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }

    var btn = form.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    setTimeout(function () {
      form.querySelectorAll('.form-group, .form-check, .form-note').forEach(function (el) {
        el.style.display = 'none';
      });
      if (btn) btn.style.display = 'none';
      success.classList.add('is-visible');
      success.focus();
    }, 1200);
  });
}());

/* ── 6. SCORE METER ANIMATION ───────────────────────────────── */
(function () {
  if (noMotion) return;
  var fills = document.querySelectorAll('.meter__fill');
  if (!fills.length) return;
  var targets = [];
  fills.forEach(function (f) {
    targets.push({ el: f, w: f.style.width });
    f.style.width = '0%'; f.style.transition = 'none';
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var t = targets.find(function (x) { return x.el === entry.target; });
        if (t) {
          setTimeout(function () {
            t.el.style.transition = 'width .9s cubic-bezier(.4,0,.2,1)';
            t.el.style.width = t.w;
          }, 80);
          io.unobserve(entry.target);
        }
      }
    });
  }, { threshold: 0.2 });
  fills.forEach(function (f) { io.observe(f); });
}());

/* ── 7. SCROLL REVEAL ───────────────────────────────────────── */
(function () {
  if (noMotion) return;
  var s = document.createElement('style');
  s.textContent = '.reveal{opacity:0;transform:translateY(20px);transition:opacity .45s ease,transform .45s ease}.reveal.in{opacity:1;transform:none}';
  document.head.appendChild(s);
  var els = document.querySelectorAll('.svc-card,.testi-card,.stat-card,.trust-badge,.case-card,.audit-benefit,.issue');
  els.forEach(function (el) { el.classList.add('reveal'); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  els.forEach(function (el) { io.observe(el); });
}());

/* ── 8. ACTIVE NAV ──────────────────────────────────────────── */
(function () {
  var links    = document.querySelectorAll('.primary-nav__link');
  var sections = document.querySelectorAll('section[id]');
  if (!links.length || !sections.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        links.forEach(function (l) {
          l.getAttribute('href') === '#' + e.target.id
            ? l.setAttribute('aria-current', 'page')
            : l.removeAttribute('aria-current');
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(function (s) { io.observe(s); });
}());

/* ── 9. FOOTER YEAR ─────────────────────────────────────────── */
(function () {
  var el = document.getElementById('yr');
  if (el) el.textContent = new Date().getFullYear();
}());

/* ── 10. EXTERNAL LINK NOTICES ──────────────────────────────── */
(function () {
  document.querySelectorAll('a[target="_blank"]').forEach(function (a) {
    if (!a.querySelector('[data-ext]')) {
      var sp = document.createElement('span');
      sp.className = 'sr-only'; sp.setAttribute('data-ext', '');
      sp.textContent = ' (opens in new tab)';
      a.appendChild(sp);
    }
  });
}());
