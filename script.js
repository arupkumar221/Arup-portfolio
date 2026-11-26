/* ==========================================================
   Arup Kumar Dash | Portfolio scripts
   ========================================================== */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: shadow on scroll ---------- */
  var header = $('.top');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('.menu-btn');
  var nav = $('#nav');

  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    setMenu(!nav.classList.contains('open'));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setMenu(false);
  });
  document.addEventListener('click', function (e) {
    if (!header.contains(e.target)) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---------- Scroll-spy: highlight current section in nav ---------- */
  var links = $$('.nav a[href^="#"]').filter(function (a) { return !a.classList.contains('nav-cta'); });
  var targets = links
    .map(function (a) { return $(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && targets.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    targets.forEach(function (t) { spy.observe(t); });
  }

  /* ---------- Pipeline animation ---------- */
  var stages  = $$('#stages li');
  var runBtn  = $('#runBtn');
  var runMsg  = $('#runMsg');
  var running = false;
  var timers  = [];

  function runPipeline() {
    if (running) return;
    running = true;
    runBtn.disabled = true;
    runMsg.textContent = 'Running…';
    stages.forEach(function (s) { s.className = ''; });

    var step = reduceMotion ? 0 : 750;

    stages.forEach(function (stage, i) {
      timers.push(setTimeout(function () {
        stage.classList.add('run');
        timers.push(setTimeout(function () {
          stage.classList.remove('run');
          stage.classList.add('done');
          if (i === stages.length - 1) {
            runMsg.textContent = 'Deployed. All ' + stages.length + ' stages passed.';
            runBtn.disabled = false;
            runBtn.textContent = 'Run again';
            running = false;
            timers = [];
          }
        }, step));
      }, i * step));
    });
  }

  runBtn.addEventListener('click', runPipeline);

  // Auto-run once when the pipeline scrolls into view
  var stagesEl = $('#stages');
  if ('IntersectionObserver' in window && stagesEl) {
    var autoRun = new IntersectionObserver(function (entries, obs) {
      if (entries[0].isIntersecting) {
        obs.disconnect();
        runPipeline();
      }
    }, { threshold: 0.5 });
    autoRun.observe(stagesEl);
  }

  /* ---------- Project filters ---------- */
  var chips    = $$('.chip');
  var projects = $$('.proj');
  var status   = document.createElement('p');
  status.className = 'sr-only';
  status.setAttribute('role', 'status');
  $('.filters').insertAdjacentElement('afterend', status);

  chips.forEach(function (chip) {
    chip.setAttribute('aria-pressed', chip.classList.contains('on'));
    chip.addEventListener('click', function () {
      var f = chip.dataset.f;
      var shown = 0;

      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('on', on);
        c.setAttribute('aria-pressed', on);
      });

      projects.forEach(function (p) {
        var match = f === 'all' || p.dataset.tags.split(' ').indexOf(f) > -1;
        p.classList.toggle('hide', !match);
        if (match) shown++;
      });

      status.textContent = 'Showing ' + shown + (shown === 1 ? ' project' : ' projects');
    });
  });

  /* ---------- Goals: progress + remember ticks ---------- */
  var boxes    = $$('#goals-list input');
  var progress = $('#progress');
  var KEY      = 'arup-portfolio-goals';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function save() {
    var state = boxes.map(function (b) { return b.checked; });
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }
  function updateProgress() {
    var n = boxes.filter(function (b) { return b.checked; }).length;
    progress.textContent = n + ' of ' + boxes.length + ' goals done';
  }

  var saved = load();
  boxes.forEach(function (b, i) {
    b.checked = !!saved[i];
    b.addEventListener('change', function () { save(); updateProgress(); });
  });
  updateProgress();

  /* ---------- Copy email ---------- */
  var copyBtn = $('#copyMail');
  var copyTimer;

  function flash(text) {
    copyBtn.textContent = text;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(function () { copyBtn.textContent = 'Copy email address'; }, 2000);
  }

  copyBtn.addEventListener('click', function () {
    var mail = copyBtn.dataset.mail;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(mail).then(
        function () { flash('Copied'); },
        function () { window.location.href = 'mailto:' + mail; }
      );
    } else {
      // Fallback for http:// or file:// where the clipboard API is blocked
      var ta = document.createElement('textarea');
      ta.value = mail;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); flash('Copied'); }
      catch (e) { window.location.href = 'mailto:' + mail; }
      document.body.removeChild(ta);
    }
  });

  /* ---------- Footer year ---------- */
  var yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
