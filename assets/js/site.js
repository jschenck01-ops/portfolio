/* =========================================================================
   JEFF SCHENCK — "SIGNAL"  ·  shared behaviour
   ========================================================================= */
(function(){
  "use strict";
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 1. STICKY HEADER ---------------------------------------------- */
  (function(){
    var head = document.querySelector('.site-head');
    if(!head) return;
    function onScroll(){ head.classList.toggle('solid', window.scrollY > 24); }
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  })();

  /* ---- 2. MOBILE MENU ------------------------------------------------- */
  (function(){
    var burger = document.querySelector('.burger');
    var menu   = document.querySelector('.mobile-menu');
    if(!burger || !menu) return;
    function set(open){
      burger.setAttribute('aria-expanded', open ? 'true':'false');
      menu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden':'';
    }
    burger.addEventListener('click', function(){
      set(burger.getAttribute('aria-expanded') !== 'true');
    });
    menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ set(false); }); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') set(false); });
  })();

  /* ---- 3. NOISE FIELD (hero only) ------------------------------------ */
  (function(){
    var host = document.getElementById('noise');
    if(!host || REDUCED) return;
    var slop = [
      "unlock your potential","seamless synergy","best-in-class solutions","we are passionate about",
      "leverage cutting-edge","empowering brands","transformative journey","holistic approach",
      "innovative disruption","next-generation platform","driving impact at scale","data-driven insights",
      "curated experiences","world-class excellence","reimagining the future","authentic storytelling",
      "elevate your brand","frictionless engagement","purpose-led growth","dynamic ecosystems",
      "thought leadership","robust frameworks","bespoke strategies","game-changing results"
    ];
    var rows = 24, items = [];
    for (var i = 0; i < rows; i++){
      var el = document.createElement('div');
      el.className = 'np';
      var s = '';
      for (var k = 0; k < 9; k++) s += slop[(Math.random()*slop.length)|0] + '   ·   ';
      el.textContent = s;
      var depth = Math.random();
      el.style.top = (i / rows * 100 + Math.random()*2.2) + '%';
      el.style.fontSize = (9 + depth*7).toFixed(1) + 'px';
      host.appendChild(el);
      items.push({el:el, x:-Math.random()*1400, sp:(0.20 + depth*0.6)*(i%2?1:-1), depth:depth, base:0.05 + depth*0.15});
    }
    var last = performance.now(), settle = 0, mx = 0, sc = 0;
    addEventListener('pointermove', function(e){ mx = (e.clientX / innerWidth - .5); }, {passive:true});
    addEventListener('scroll', function(){ sc = scrollY; }, {passive:true});
    (function tick(now){
      var dt = Math.min(now - last, 48); last = now;
      settle = Math.min(settle + dt/2800, 1);
      var calm = 1 - settle;
      var fade = Math.max(0, 1 - sc/700);
      for (var j=0;j<items.length;j++){
        var it = items[j];
        it.x += it.sp * dt * (0.22 + calm * 1.7);
        if (it.x > 500) it.x = -2600;
        if (it.x < -2800) it.x = 400;
        it.el.style.transform = 'translate3d('+(it.x + mx*44*it.depth)+'px,'+(-sc*(0.05 + it.depth*0.24))+'px,0)';
        it.el.style.opacity = (it.base * (0.26 + calm*0.74) * fade).toFixed(3);
      }
      requestAnimationFrame(tick);
    })(last);
  })();

  /* ---- 4. REVEAL ON SCROLL ------------------------------------------- */
  (function(){
    var els = document.querySelectorAll('.rv');
    if(!els.length) return;
    if (REDUCED){ els.forEach(function(e){ e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function(en){
      en.forEach(function(e,i){
        if(e.isIntersecting){ e.target.style.transitionDelay = (i*95)+'ms'; e.target.classList.add('in'); io.unobserve(e.target); }
      });
    },{threshold:.15, rootMargin:'0px 0px -6% 0px'});
    els.forEach(function(e){ io.observe(e); });
  })();

  /* ---- 5. COUNT-UP STATS --------------------------------------------- */
  (function(){
    var nodes = document.querySelectorAll('.n[data-count]');
    if(!nodes.length) return;
    var io = new IntersectionObserver(function(en){
      en.forEach(function(e){
        if(!e.isIntersecting) return;
        var el = e.target, target = +el.dataset.count;
        var pre = el.dataset.pre||'', post = el.dataset.post||'';
        io.unobserve(el);
        if (REDUCED){ el.textContent = pre+target.toLocaleString()+post; return; }
        var t0 = performance.now(), dur = 1400;
        (function step(now){
          var p = Math.min((now-t0)/dur,1);
          el.textContent = pre + Math.round(target*(1-Math.pow(1-p,3))).toLocaleString() + post;
          if(p<1) requestAnimationFrame(step);
        })(t0);
      });
    },{threshold:.5});
    nodes.forEach(function(n){ io.observe(n); });
  })();

  /* ---- 6. THESIS WORD REVEAL ----------------------------------------- */
  (function(){
    var h = document.getElementById('thline');
    if(!h) return;
    var tmp = document.createElement('div');
    tmp.innerHTML = h.innerHTML;
    (function wrap(node){
      [].slice.call(node.childNodes).forEach(function(n){
        if(n.nodeType===3){
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function(t){
            if(!t.trim()){ frag.appendChild(document.createTextNode(t)); return; }
            var sp = document.createElement('span'); sp.className='w'; sp.textContent=t; frag.appendChild(sp);
          });
          node.replaceChild(frag,n);
        } else if(n.nodeType===1){ wrap(n); }
      });
    })(tmp);
    h.innerHTML = tmp.innerHTML;
    var words = h.querySelectorAll('.w');
    if (REDUCED){ words.forEach(function(w){ w.classList.add('lit'); }); return; }
    var sec = h.closest('.thesis');
    function upd(){
      var r = sec.getBoundingClientRect();
      var prog = Math.min(Math.max((-r.top)/(r.height - innerHeight), 0), 1);
      var n = Math.floor(prog * words.length * 1.4);
      words.forEach(function(w,i){ w.classList.toggle('lit', i <= n); });
    }
    addEventListener('scroll', upd, {passive:true});
    addEventListener('resize', upd, {passive:true});
    upd();
  })();

  /* ---- 7. NEWSLETTER FORM (front-end only stub) ---------------------- */
  (function(){
    var form = document.querySelector('form[data-newsletter]');
    if(!form) return;
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var btn = form.querySelector('.btn');
      if(btn) btn.textContent = 'Redirecting…';
      // Replace with your provider (Beehiiv / ConvertKit / LinkedIn newsletter, etc.)
      window.location.href = form.getAttribute('data-redirect') || 'https://www.linkedin.com/in/jschenck01/';
    });
  })();

  /* ---- 8. SCROLL PROGRESS BAR ---------------------------------------- */
  (function(){
    if (REDUCED) return;
    var bar = document.createElement('div');
    bar.className = 'scroll-prog'; bar.setAttribute('aria-hidden','true');
    document.body.appendChild(bar);
    var ticking = false;
    function update(){
      var h = document.documentElement.scrollHeight - innerHeight;
      var p = h > 0 ? Math.min(scrollY / h, 1) : 0;
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      ticking = false;
    }
    addEventListener('scroll', function(){ if(!ticking){ requestAnimationFrame(update); ticking = true; } }, {passive:true});
    update();
  })();

  /* ---- 9. (hero photo is a fixed image, per Persona reference) -------- */

  /* ---- 10. STAGGERED LOGO REVEAL ------------------------------------- */
  (function(){
    var chips = document.querySelectorAll('.logo-chip');
    if(!chips.length) return;
    if (REDUCED){ chips.forEach(function(c){ c.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function(en){
      en.forEach(function(e){
        if(!e.isIntersecting) return;
        var idx = [].indexOf.call(chips, e.target);
        e.target.style.transitionDelay = ((idx % 6) * 70 + Math.floor(idx / 6) * 40) + 'ms';
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, {threshold:.2, rootMargin:'0px 0px -8% 0px'});
    chips.forEach(function(c){ io.observe(c); });
  })();

  /* ---- 11. MAGNETIC BUTTONS ------------------------------------------ */
  (function(){
    if (REDUCED || matchMedia('(hover:none)').matches) return;
    document.querySelectorAll('.btn').forEach(function(btn){
      var raf = 0, tx = 0, ty = 0;
      function move(e){
        var r = btn.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width/2)) * 0.28;
        ty = (e.clientY - (r.top + r.height/2)) * 0.4;
        if(!raf) raf = requestAnimationFrame(function(){ raf = 0; btn.style.transform = 'translate(' + tx + 'px,' + ty + 'px)'; });
      }
      function reset(){ btn.style.transform = ''; }
      btn.addEventListener('pointermove', move);
      btn.addEventListener('pointerleave', reset);
    });
  })();

  /* ---- 12. YOUTUBE CLICK-TO-LOAD FACADES ----------------------------- */
  (function(){
    var nodes = document.querySelectorAll('.yt');
    if(!nodes.length) return;
    nodes.forEach(function(el){
      var btn = el.querySelector('button');
      if(!btn) return;
      btn.addEventListener('click', function(){
        var id = el.getAttribute('data-id');
        if(!id) return;
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0';
        f.title = el.getAttribute('data-title') || 'Video';
        f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        f.setAttribute('allowfullscreen','');
        el.innerHTML = '';
        el.appendChild(f);
      });
    });
  })();
})();
