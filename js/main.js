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
  function handleNavScroll() { nav.classList.toggle('scrolled', window.scrollY > 40); }
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
        const target = parseInt(e.target.dataset.count, 10);
        const suffix = e.target.dataset.suffix || '';
        const dur = 1600;
        const t0 = performance.now();
        (function step(now) {
          const p = Math.min((now - t0) / dur, 1);
          e.target.textContent = Math.round((1 - Math.pow(1 - p, 4)) * target) + suffix;
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      }
    }),
    { threshold: 0.5 }
  );
  document.querySelectorAll('[data-count]').forEach((el) => counterObserver.observe(el));

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

  // ── Hero highlighter (full h1 underline; delay aligns with mobile stagger) ──
  const highlight = document.querySelector('.hero .hero-highlight');
  if (highlight) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 1100px)').matches;
    const delay = reduce ? 0 : mobile ? 680 : 420;
    setTimeout(() => highlight.classList.add('active'), delay);
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

  // ═══════════════════════════════════════════════════════
  // MISSION BURST — Whirlwind → Random Explosion → Free Float
  // ═══════════════════════════════════════════════════════

  (function initBurst() {
    if (window.innerWidth < 1100) return;

    const heroEl    = document.querySelector('.hero');
    const contentEl = document.querySelector('.hero-content');
    const container = document.querySelector('.hero-missions');
    if (!heroEl || !contentEl || !container) return;

    // Fewer, cleaner missions. Photo missions show "Name Pic" format.
    const MISSIONS = [
      { icon: '🏋️',   label: 'Push-ups' },
      { icon: '🧘',   label: 'Plank' },
      { icon: '⭐',   label: 'Jumping Jacks' },
      { icon: '🏃',   label: 'High Knees' },
      { icon: '📸',   label: 'Made Bed Pic' },
      { icon: '💧',   label: 'Water Bottle Pic' },
      { icon: '☀️',   label: 'Sunlight Pic' },
      { icon: '🪥',   label: 'Toothbrush Pic' },
      { icon: '🪞',   label: 'Mirror Selfie Pic' },
      { icon: '📖',   label: 'Bible Prayer' },
      { icon: '📜',   label: 'Torah Reading' },
      { icon: '🕌',   label: 'Quran Verse' },
      { icon: '💬',   label: 'Affirmation' },
      { icon: '😊',   label: 'Smile Check' },
      { icon: '🎰',   label: 'Roulette' },
      { icon: '🔵',   label: 'Find Colors' },
    ];

    // Build DOM
    container.innerHTML = '';
    MISSIONS.forEach((m) => {
      const el = document.createElement('div');
      el.className = 'burst-item';
      el.innerHTML = `<span class="burst-icon">${m.icon}</span><span class="burst-label">${m.label}</span>`;
      el.style.cssText = 'position:absolute;top:0;left:0;opacity:0;pointer-events:none;will-change:transform,opacity;';
      container.appendChild(el);
    });

    const burstEls = Array.from(container.querySelectorAll('.burst-item'));
    const items = [];
    let mouseX = -9999, mouseY = -9999;
    let phase = 'init';
    let springStrength = 0; // 0 during explosion, set weakly after settling

    requestAnimationFrame(() => requestAnimationFrame(() => {
      const hr = heroEl.getBoundingClientRect();
      const W  = hr.width, H = hr.height;
      const cx = W / 2, cy = H / 2;

      burstEls.forEach((el) => {
        const w = el.offsetWidth  || 120;
        const h = el.offsetHeight || 58;
        el.style.transform = `translate(${cx - w/2}px,${cy - h/2}px) scale(0.05)`;
        items.push({ el, x: cx, y: cy, vx: 0, vy: 0, w, h, homeX: cx, homeY: cy });
      });

      setTimeout(() => doWhirlwind(cx, cy, W, H), 120);
    }));

    // ── Phase 1: Quick whirlwind orbiting around the content ─
    function doWhirlwind(cx, cy, W, H) {
      phase = 'whirl';
      const ORBIT_R  = Math.min(Math.max(Math.min(W, H) * 0.48, 400), 470);
      const DURATION = 1100;
      const ROTATIONS = 0.85;
      const t0 = performance.now();

      function tick(now) {
        const elapsed = now - t0;
        const t = Math.min(elapsed / DURATION, 1);
        const rEase = t < 0.2 ? (t / 0.2) : 1;
        const r = ORBIT_R * (1 - Math.pow(1 - rEase, 3));
        const opacity = Math.min(elapsed / 280, 0.5);
        const scale   = 0.50 + t * 0.22;

        items.forEach((s, i) => {
          const base  = (i / items.length) * Math.PI * 2;
          const angle = base + t * ROTATIONS * Math.PI * 2;
          s.x = cx + Math.cos(angle) * r;
          s.y = cy + Math.sin(angle) * r;
          s.el.style.opacity   = String(opacity);
          s.el.style.transform = `translate(${s.x - s.w/2}px,${s.y - s.h/2}px) scale(${scale})`;
        });

        if (t < 1) requestAnimationFrame(tick);
        else doExplode();
      }
      requestAnimationFrame(tick);
    }

    // ── Phase 2: Simultaneous explosion in RANDOM directions ─
    function doExplode() {
      items.forEach((s) => {
        // Truly random angle — fills the whole space, not just toward edges
        const angle = Math.random() * Math.PI * 2;
        const speed = 16 + Math.random() * 22;
        s.vx = Math.cos(angle) * speed;
        s.vy = Math.sin(angle) * speed;
      });
      phase = 'exploding';
      startPhysics();

      // After 2.2s, boxes have settled → record their position as "home"
      // A very weak spring then keeps them loosely near where they landed
      setTimeout(() => {
        items.forEach((s) => { s.homeX = s.x; s.homeY = s.y; });
        springStrength = 0.006;
        phase = 'floating';
      }, 2200);
    }

    // ── Phase 3: Free-floating liquid physics ─────────────
    function startPhysics() {
      heroEl.addEventListener('mousemove', (e) => {
        const r = heroEl.getBoundingClientRect();
        mouseX = e.clientX - r.left;
        mouseY = e.clientY - r.top;
      });
      heroEl.addEventListener('mouseleave', () => { mouseX = mouseY = -9999; });

      const DAMP  = 0.93;
      const REP_R = 220;   // cursor radius — react from far away
      const REP_F = 35;    // cursor force

      function getFz() {
        const hr = heroEl.getBoundingClientRect();
        const cr = contentEl.getBoundingClientRect();
        return {
          l: cr.left   - hr.left - 60,
          t: cr.top    - hr.top  - 32,
          r: cr.right  - hr.left + 60,
          b: cr.bottom - hr.top  + 32,
        };
      }

      function loop() {
        const hr = heroEl.getBoundingClientRect();
        const W = hr.width, H = hr.height;
        const fz = getFz();
        const fzStrength = phase === 'exploding' ? 4.0 : 2.2;

        items.forEach((s) => {
          // Weak spring to wherever each box landed after explosion
          if (springStrength > 0) {
            s.vx += (s.homeX - s.x) * springStrength;
            s.vy += (s.homeY - s.y) * springStrength;
          }

          // Gentle random drift — organic float feel
          s.vx += (Math.random() - 0.5) * 0.06;
          s.vy += (Math.random() - 0.5) * 0.06;

          // Box-to-box soft repulsion — keeps them nicely spread
          items.forEach((other) => {
            if (other === s) return;
            const ex = s.x - other.x, ey = s.y - other.y;
            const ed = Math.sqrt(ex * ex + ey * ey);
            const minD = 140;
            if (ed < minD && ed > 0.5) {
              const f = (1 - ed / minD) * 0.09;
              s.vx += (ex / ed) * f;
              s.vy += (ey / ed) * f;
              // Keep home away from other homes too (after settling)
              if (springStrength > 0) {
                const hx = s.homeX - other.homeX, hy = s.homeY - other.homeY;
                const hd = Math.sqrt(hx * hx + hy * hy);
                if (hd < minD && hd > 0.5) {
                  s.homeX += (hx / hd) * 0.5;
                  s.homeY += (hy / hd) * 0.5;
                }
              }
            }
          });

          // Cursor repulsion — smooth quadratic falloff
          const dx = s.x - mouseX, dy = s.y - mouseY;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < REP_R && d > 0.5) {
            const strength = Math.pow(1 - d / REP_R, 2) * REP_F;
            s.vx += (dx / d) * strength;
            s.vy += (dy / d) * strength;
          }

          // Damping
          s.vx *= DAMP;
          s.vy *= DAMP;

          // Integrate
          s.x += s.vx;
          s.y += s.vy;

          // Reflective boundary — boxes bounce off hero edges
          const hw = s.w / 2 + 6, hh = s.h / 2 + 6;
          if (s.x < hw)     { s.x = hw;     s.vx =  Math.abs(s.vx) * 0.55; }
          if (s.x > W - hw) { s.x = W - hw; s.vx = -Math.abs(s.vx) * 0.55; }
          if (s.y < hh)     { s.y = hh;     s.vy =  Math.abs(s.vy) * 0.55; }
          if (s.y > H - hh) { s.y = H - hh; s.vy = -Math.abs(s.vy) * 0.55; }

          // Forbidden zone: push boxes out of hero content area
          const il = s.x - s.w/2 - 8, ir = s.x + s.w/2 + 8;
          const it = s.y - s.h/2 - 8, ib = s.y + s.h/2 + 8;
          if (il < fz.r && ir > fz.l && it < fz.b && ib > fz.t) {
            const pL = ir - fz.l, pR = fz.r - il, pT = ib - fz.t, pB = fz.b - it;
            const mn = Math.min(pL, pR, pT, pB);
            const str = fzStrength;
            if      (mn === pL) { s.vx -= pL * 0.12 + str; }
            else if (mn === pR) { s.vx += pR * 0.12 + str; }
            else if (mn === pT) { s.vy -= pT * 0.12 + str; }
            else                { s.vy += pB * 0.12 + str; }
            // Nudge home away from forbidden zone too
            if (springStrength > 0) { s.homeX = s.x; s.homeY = s.y; }
          }

          s.el.style.transform = `translate(${s.x - s.w/2}px,${s.y - s.h/2}px)`;
          s.el.style.opacity   = '0.76';
        });

        requestAnimationFrame(loop);
      }
      loop();
    }
  })();

})();
