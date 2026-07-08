/* ============================================================
   Strata — interactions
   ============================================================ */
(function () {
  'use strict';

  /* ---- Sticky nav shadow ---- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 20) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  const burger = document.getElementById('burger');
  const navMobile = document.getElementById('navMobile');
  if (burger && navMobile) {
    const toggle = (open) => {
      burger.classList.toggle('is-open', open);
      navMobile.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    };
    burger.addEventListener('click', () =>
      toggle(!navMobile.classList.contains('is-open'))
    );
    navMobile.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => toggle(false))
    );
  }

  /* ---- Reveal on scroll ---- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---- Operational Ledger masonry ---- */
  const grids = document.querySelectorAll('.ledger__grid');
  const layoutMasonry = () => {
    grids.forEach((grid) => {
      const styles = getComputedStyle(grid);
      const rowH = parseFloat(styles.gridAutoRows) || 6;
      const gap = parseFloat(styles.rowGap) || 0;
      const single = grid.style.gridTemplateColumns === '1fr' ||
        styles.gridTemplateColumns.split(' ').length < 2;
      grid.querySelectorAll('.card').forEach((card) => {
        card.style.gridRowEnd = '';
        const h = card.getBoundingClientRect().height;
        const span = Math.ceil((h + gap) / (rowH + gap));
        card.style.gridRowEnd = 'span ' + span;
      });
    });
  };
  if (grids.length) {
    layoutMasonry();
    // re-run after fonts settle and images (if any) load
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutMasonry);
    window.addEventListener('load', layoutMasonry);
    let rz;
    window.addEventListener('resize', () => {
      clearTimeout(rz);
      rz = setTimeout(layoutMasonry, 120);
    });
    document.querySelectorAll('.ledger .media').forEach((m) => {
      const bg = m.style.backgroundImage;
      const url = bg && bg.match(/url\(['"]?([^'")]+)['"]?\)/);
      if (url) {
        const im = new Image();
        im.onload = layoutMasonry;
        im.src = url[1];
      }
    });
  }

  /* ---- Atmospheric field parallax drift ---- */
  const fieldLayers = document.querySelector('.field__layers');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (fieldLayers && !reduceMotion) {
    let ticking = false;
    const drift = () => {
      // drift the whole field a few px against the content
      fieldLayers.style.transform = `translateY(${window.scrollY * 0.04}px)`;
      ticking = false;
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(drift);
        }
      },
      { passive: true }
    );
  }

  /* ---- Update footer year ---- */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
