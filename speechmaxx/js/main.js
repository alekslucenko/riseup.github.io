(function () {
  'use strict';

  // ── Scroll Animation Observer ──────────────────────
  const scrollObserver = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.animate').forEach((el) => scrollObserver.observe(el));

  // ── Navbar scroll effect ───────────────────────────
  const nav = document.querySelector('.nav');
  function handleNavScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // ── Mobile nav toggle ──────────────────────────────
  const mobileToggle = document.querySelector('.nav-mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      mobileToggle.classList.toggle('active');
    });
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileToggle.classList.remove('active');
      });
    });
  }

  // ── Smooth scroll ──────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // ── Counter animation ──────────────────────────────
  const counterObserver = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting && !e.target.dataset.counted) {
        e.target.dataset.counted = 'true';
        const target = parseFloat(e.target.dataset.count);
        const suffix = e.target.dataset.suffix || '';
        const decimals = (e.target.dataset.count.split('.')[1] || '').length;
        const dur = 1600;
        const t0 = performance.now();
        (function step(now) {
          const p = Math.min((now - t0) / dur, 1);
          const val = (1 - Math.pow(1 - p, 4)) * target;
          e.target.textContent = (decimals ? val.toFixed(decimals) : Math.round(val)) + suffix;
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      }
    }),
    { threshold: 0.5 }
  );
  document.querySelectorAll('[data-count]').forEach((el) => counterObserver.observe(el));

  // ── Analysis bar fill animation ────────────────────
  const barObserver = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting && !e.target.dataset.animated) {
        e.target.dataset.animated = 'true';
        const width = e.target.dataset.width || '80';
        setTimeout(() => { e.target.style.width = width + '%'; }, 200);
      }
    }),
    { threshold: 0.3 }
  );
  document.querySelectorAll('.analysis-bar-fill').forEach((el) => {
    el.style.width = '0%';
    el.style.transition = 'width 1.8s cubic-bezier(0.16, 1, 0.3, 1)';
    barObserver.observe(el);
  });

  // ── Parallax blobs ─────────────────────────────────
  const blobs = document.querySelectorAll('.liquid-blob');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        blobs.forEach((b, i) => { b.style.transform = `translateY(${y * (0.03 + i * 0.015)}px)`; });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ── Hero highlighter underline reveal ──────────────
  const highlight = document.querySelector('.hero .hero-highlight');
  if (highlight) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 1100px)').matches;
    const delay = reduce ? 0 : mobile ? 680 : 420;
    setTimeout(() => highlight.classList.add('active'), delay);
  }

  // ── Hero tagline rotation ──────────────────────────
  const taglineEl = document.querySelector('.hero-tagline-rotate');
  if (taglineEl) {
    const taglines = [
      'Speak with power. Command any room.',
      'Your words, your edge.',
      'Be heard. Be remembered.',
    ];
    let idx = 0;
    setInterval(() => {
      idx = (idx + 1) % taglines.length;
      taglineEl.style.opacity = '0';
      taglineEl.style.transform = 'translateY(6px)';
      setTimeout(() => {
        taglineEl.textContent = taglines[idx];
        taglineEl.style.opacity = '1';
        taglineEl.style.transform = 'translateY(0)';
      }, 400);
    }, 4200);
  }

  // ── Active nav links ───────────────────────────────
  const navItems = document.querySelectorAll('.nav-links a');
  const sectionObserver = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting)
        navItems.forEach((item) =>
          item.classList.toggle('active', item.getAttribute('href') === '#' + e.target.id));
    }),
    { threshold: 0.3, rootMargin: '-72px 0px 0px 0px' }
  );
  document.querySelectorAll('section[id]').forEach((s) => sectionObserver.observe(s));

})();
