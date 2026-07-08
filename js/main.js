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

  /* ---- Floating project preview (desktop) ---- */
  const preview = document.getElementById('projectPreview');
  const projects = document.querySelectorAll('.project');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (preview && canHover) {
    let raf = null;
    let mouseX = 0;
    let mouseY = 0;

    const move = () => {
      preview.style.left = mouseX + 'px';
      preview.style.top = mouseY + 'px';
      raf = null;
    };

    projects.forEach((project) => {
      const img = project.getAttribute('data-img');
      project.addEventListener('mouseenter', () => {
        if (img) preview.style.backgroundImage = `url('${img}')`;
        preview.classList.add('is-active');
      });
      project.addEventListener('mouseleave', () => {
        preview.classList.remove('is-active');
      });
    });

    document.querySelector('.work').addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!raf) raf = requestAnimationFrame(move);
    });
  }

  /* ---- Atmospheric field parallax drift ---- */
  const bloom = document.querySelector('.field__bloom');
  const ember = document.querySelector('.field__ember');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ((bloom || ember) && !reduceMotion) {
    let ticking = false;
    const drift = () => {
      const y = window.scrollY;
      if (bloom) bloom.style.transform = `translateY(${y * 0.03}px)`;
      if (ember) ember.style.transform = `translate(-50%, calc(-50% + ${y * -0.05}px))`;
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
