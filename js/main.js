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

  // ── Hero highlighter animation ─────────────────────
  const highlight = document.querySelector('.hero-highlight');
  if (highlight) setTimeout(() => highlight.classList.add('active'), 500);

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
  // MISSION BURST SYSTEM — Whirlwind → Explosion → Physics
  // ═══════════════════════════════════════════════════════

  (function initBurst() {
    const heroEl    = document.querySelector('.hero');
    const contentEl = document.querySelector('.hero-content');
    const container = document.querySelector('.hero-missions');
    if (!heroEl || !contentEl || !container) return;

    // All missions with Pic: labels for photo tasks
    const MISSIONS = [
      { icon: '🏋️',   label: 'Push-ups' },
      { icon: '🧘',   label: 'Plank' },
      { icon: '🏋️‍♀️', label: 'Squats' },
      { icon: '⭐',   label: 'Jumping Jacks' },
      { icon: '🏃',   label: 'High Knees' },
      { icon: '🦵',   label: 'Lunges' },
      { icon: '🚶',   label: 'Walk Steps' },
      { icon: '🧍',   label: 'Stand Up' },
      { icon: '📸',   label: 'Pic: Made Bed' },
      { icon: '💧',   label: 'Pic: Water Bottle' },
      { icon: '☀️',   label: 'Pic: Sunlight' },
      { icon: '🪥',   label: 'Pic: Toothbrush' },
      { icon: '🥤',   label: 'Pic: Glass of Water' },
      { icon: '🪞',   label: 'Pic: Mirror Selfie' },
      { icon: '📖',   label: 'Bible Prayer' },
      { icon: '📜',   label: 'Torah Reading' },
      { icon: '🕌',   label: 'Quran Verse' },
      { icon: '💬',   label: 'Affirmation' },
      { icon: '🔢',   label: 'Count Down' },
      { icon: '😊',   label: 'Smile Check' },
      { icon: '👀',   label: 'Eyes Open' },
      { icon: '🔵',   label: 'Find Colors' },
      { icon: '🌅',   label: 'Show Sky' },
      { icon: '🎰',   label: 'Roulette' },
    ];

    // Home positions as [xFrac, yFrac] (center of element).
    // Validated: left/right columns at xFrac=0.05/0.95 stay outside content area.
    // Top row (y<0.13) and bottom row (y>0.88) stay outside content area vertically.
    const HOME_POS = [
      // Left outer column
      [0.05, 0.13], [0.05, 0.26], [0.05, 0.39], [0.05, 0.52],
      [0.05, 0.65], [0.05, 0.78], [0.05, 0.90],
      // Right outer column
      [0.95, 0.13], [0.95, 0.26], [0.95, 0.39], [0.95, 0.52],
      [0.95, 0.65], [0.95, 0.78], [0.95, 0.90],
      // Top strip (below nav, above hero content)
      [0.22, 0.10], [0.38, 0.09], [0.54, 0.09], [0.70, 0.10],
      // Bottom strip (below scroll indicator)
      [0.18, 0.91], [0.34, 0.92], [0.52, 0.93], [0.68, 0.92], [0.82, 0.91],
      // Extra corners
      [0.84, 0.10],
    ];

    // Build elements (JS-controlled, not from HTML)
    container.innerHTML = '';
    MISSIONS.forEach((m) => {
      const el = document.createElement('div');
      el.className = 'burst-item';
      el.innerHTML = `<span class="burst-icon">${m.icon}</span><span class="burst-label">${m.label}</span>`;
      el.style.cssText = 'position:absolute;top:0;left:0;opacity:0;pointer-events:none;will-change:transform,opacity;';
      container.appendChild(el);
    });

    const burstEls = Array.from(container.querySelectorAll('.burst-item'));
    const N = burstEls.length;
    const items = [];
    let mouseX = -9999, mouseY = -9999;
    let phase = 'init';

    // Wait for layout to settle so offsetWidth/Height are accurate
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const hr = heroEl.getBoundingClientRect();
      const W  = hr.width;
      const H  = hr.height;
      const cx = W / 2;
      const cy = H / 2;

      burstEls.forEach((el, i) => {
        const p  = HOME_POS[i] || [0.5, 0.5];
        const w  = el.offsetWidth  || 112;
        const h  = el.offsetHeight || 58;
        el.style.transform = `translate(${cx - w / 2}px,${cy - h / 2}px) scale(0.05)`;
        items.push({ el, xFrac: p[0], yFrac: p[1], homeX: p[0] * W, homeY: p[1] * H, x: cx, y: cy, vx: 0, vy: 0, w, h });
      });

      setTimeout(() => doWhirlwind(cx, cy, W, H), 150);
    }));

    // ── Phase 1: Whirlwind ──────────────────────────────
    // Orbit radius is large enough to encircle the entire hero content block.
    // Hero content max-width = 800px → half = 400px. Add clearance → ~450px.
    function doWhirlwind(cx, cy, W, H) {
      phase = 'whirl';

      // Dynamic radius: at least 380px, at most 460px, based on viewport
      const ORBIT_R  = Math.min(Math.max(Math.min(W, H) * 0.46, 380), 460);
      const DURATION = 1900;          // ms for one full whirlwind
      const ROTATIONS = 1.5;          // full rotations during whirlwind
      const t0 = performance.now();

      function tick(now) {
        const elapsed = now - t0;
        const t = Math.min(elapsed / DURATION, 1);

        // Smooth ease-in for radius (cubic ease-in over first 25% of animation)
        const rEase = t < 0.25 ? (t / 0.25) : 1;
        const r = ORBIT_R * (1 - Math.pow(1 - rEase, 3));

        // Opacity: fade in over first 400ms, hold at 0.50
        const opacity = Math.min(elapsed / 400, 0.50);

        // Scale: 0.5 → 0.72 over the whirlwind
        const scale = 0.50 + t * 0.22;

        items.forEach((s, i) => {
          const baseAngle = (i / N) * Math.PI * 2;
          const angle     = baseAngle + t * ROTATIONS * Math.PI * 2;
          s.x = cx + Math.cos(angle) * r;
          s.y = cy + Math.sin(angle) * r;
          s.el.style.opacity   = String(opacity);
          s.el.style.transform =
            `translate(${s.x - s.w / 2}px,${s.y - s.h / 2}px) scale(${scale})`;
        });

        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          doExplode(cx, cy);
        }
      }

      requestAnimationFrame(tick);
    }

    // ── Phase 2: Simultaneous Explosion ────────────────
    // All items explode from center at once toward their home positions.
    function doExplode(cx, cy) {
      items.forEach((s) => {
        const dx = s.homeX - cx;
        const dy = s.homeY - cy;
        const d  = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = 24 + Math.random() * 8;
        s.vx = (dx / d) * speed + (Math.random() - 0.5) * 5;
        s.vy = (dy / d) * speed + (Math.random() - 0.5) * 5;
      });
      phase = 'physics';
      startPhysics();
    }

    // ── Phase 3: Spring Physics + Cursor Repulsion ──────
    function startPhysics() {
      // Mouse repulsion: boxes float away from cursor
      heroEl.addEventListener('mousemove', (e) => {
        const r = heroEl.getBoundingClientRect();
        mouseX = e.clientX - r.left;
        mouseY = e.clientY - r.top;
      });
      heroEl.addEventListener('mouseleave', () => { mouseX = mouseY = -9999; });

      const SPRING   = 0.052;   // spring constant toward home
      const DAMP     = 0.80;    // velocity damping per frame
      const REP_R    = 145;     // cursor repulsion radius px
      const REP_F    = 20;      // cursor repulsion force

      // Compute forbidden zone (hero content bounding box + margin)
      function getFz() {
        const hr = heroEl.getBoundingClientRect();
        const cr = contentEl.getBoundingClientRect();
        return {
          l: cr.left   - hr.left - 52,
          t: cr.top    - hr.top  - 26,
          r: cr.right  - hr.left + 52,
          b: cr.bottom - hr.top  + 26,
        };
      }

      function loop() {
        const hr = heroEl.getBoundingClientRect();
        const W  = hr.width, H = hr.height;
        const fz = getFz();

        items.forEach((s) => {
          // Update home position for current viewport size
          s.homeX = s.xFrac * W;
          s.homeY = s.yFrac * H;

          // Spring toward home
          s.vx += (s.homeX - s.x) * SPRING;
          s.vy += (s.homeY - s.y) * SPRING;

          // Cursor repulsion
          const dx = s.x - mouseX, dy = s.y - mouseY;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < REP_R && d > 0.5) {
            const f = Math.pow(1 - d / REP_R, 1.5) * REP_F;
            s.vx += (dx / d) * f;
            s.vy += (dy / d) * f;
          }

          // Damping
          s.vx *= DAMP;
          s.vy *= DAMP;

          // Integrate
          s.x += s.vx;
          s.y += s.vy;

          // Keep within hero bounds
          const hw = s.w / 2 + 10, hh = s.h / 2 + 10;
          s.x = Math.max(hw, Math.min(W - hw, s.x));
          s.y = Math.max(hh, Math.min(H - hh, s.y));

          // Push out of forbidden zone (hero content area)
          const il = s.x - s.w / 2 - 5, ir = s.x + s.w / 2 + 5;
          const it = s.y - s.h / 2 - 5, ib = s.y + s.h / 2 + 5;
          if (il < fz.r && ir > fz.l && it < fz.b && ib > fz.t) {
            const pL = ir - fz.l, pR = fz.r - il, pT = ib - fz.t, pB = fz.b - it;
            const mn = Math.min(pL, pR, pT, pB);
            if      (mn === pL) { s.x -= pL; s.vx = Math.min(s.vx, -0.5); }
            else if (mn === pR) { s.x += pR; s.vx = Math.max(s.vx, 0.5);  }
            else if (mn === pT) { s.y -= pT; s.vy = Math.min(s.vy, -0.5); }
            else                { s.y += pB; s.vy = Math.max(s.vy, 0.5);  }
          }

          s.el.style.transform = `translate(${s.x - s.w / 2}px,${s.y - s.h / 2}px)`;
          s.el.style.opacity   = '0.62';
        });

        requestAnimationFrame(loop);
      }

      loop();
    }
  })();

})();
