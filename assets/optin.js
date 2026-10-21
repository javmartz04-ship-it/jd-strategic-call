/* JD Strategic Franchising: the opt-in (VSL) page. ASCII only. */
(function(){
  'use strict';
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* arrival waits for the webfonts, with a failsafe */
  function ready(){ root.classList.add('is-ready'); }
  if (RM) { ready(); }
  else if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function(){ requestAnimationFrame(ready); }); setTimeout(ready, 1500); }
  else { ready(); }

  /* reveals: a fade on scroll, with a failsafe */
  var rev = [].slice.call(document.querySelectorAll('[data-r]'));
  function revealAll(){ rev.forEach(function(el){ el.classList.add('in'); }); }
  if (RM || !('IntersectionObserver' in window)) { revealAll(); }
  else {
    var io = new IntersectionObserver(function(en){ en.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: .06 });
    rev.forEach(function(el){ io.observe(el); });
    setTimeout(revealAll, 4000);
  }

  /* ---------------- the VSL ----------------
     A silent preview loops until the visitor presses play. Play starts the full video from 0:00 with sound.
     After that: click the picture or press Space to pause, a real bar to seek and mute, an end card with the button. */
  var box = document.getElementById('vsl');
  if (box) {
    var prev = document.getElementById('vPrev'), main = document.getElementById('vMain');
    var start = document.getElementById('vStart'), hit = document.getElementById('vHit');
    var toggle = document.getElementById('vToggle'), mute = document.getElementById('vMute'), fs = document.getElementById('vFs');
    var scrub = document.getElementById('vScrub'), fill = document.getElementById('vFill'), time = document.getElementById('vTime');
    var again = document.getElementById('vAgain');
    var DUR = 264;

    if (RM && prev) { prev.removeAttribute('autoplay'); try { prev.pause(); } catch (e) {} }

    function fmt(s){ s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
    function icon(btn, id, label){ btn.querySelector('use').setAttribute('href', '#' + id); btn.setAttribute('aria-label', label); }
    function state(s){ box.classList.remove('playing', 'paused', 'ended'); if (s) box.classList.add(s); }
    function sync(){
      var d = main.duration || DUR, t = main.currentTime || 0;
      fill.style.transform = 'scaleX(' + Math.min(1, t / d) + ')';
      time.textContent = fmt(t) + ' / ' + fmt(d);
      scrub.setAttribute('aria-valuenow', Math.round(t)); scrub.setAttribute('aria-valuemax', Math.round(d));
    }
    function play(){ var p = main.play(); if (p && p.catch) p.catch(function(){}); }
    function begin(){
      box.classList.add('started');
      if (prev) { try { prev.pause(); } catch (e) {} prev.style.visibility = 'hidden'; }
      main.muted = false; main.currentTime = 0;
      box.classList.add('waiting');
      play();
      toggle.focus({ preventScroll: true });
    }
    start.addEventListener('click', begin);
    hit.addEventListener('click', function(){ if (main.paused) play(); else main.pause(); });
    toggle.addEventListener('click', function(){ if (main.paused) play(); else main.pause(); });
    mute.addEventListener('click', function(){ main.muted = !main.muted; icon(mute, main.muted ? 'i-mute' : 'i-vol', main.muted ? 'Unmute' : 'Mute'); });
    fs.addEventListener('click', function(){
      var el = box;
      if (document.fullscreenElement) { document.exitFullscreen(); return; }
      if (el.requestFullscreen) el.requestFullscreen(); else if (main.webkitEnterFullscreen) main.webkitEnterFullscreen();
    });
    again.addEventListener('click', function(){ main.currentTime = 0; play(); });
    main.addEventListener('play', function(){ state('playing'); icon(toggle, 'i-pause', 'Pause'); });
    main.addEventListener('pause', function(){ if (!main.ended) { state('paused'); icon(toggle, 'i-play', 'Play'); } });
    main.addEventListener('ended', function(){ state('ended'); icon(toggle, 'i-play', 'Play'); });
    main.addEventListener('waiting', function(){ box.classList.add('waiting'); });
    ['playing', 'pause', 'ended', 'canplay'].forEach(function(ev){ main.addEventListener(ev, function(){ box.classList.remove('waiting'); }); });
    main.addEventListener('timeupdate', sync);
    main.addEventListener('loadedmetadata', sync);

    /* seek with pointer or arrow keys */
    function seekAt(x){ var r = scrub.getBoundingClientRect(), d = main.duration || DUR; main.currentTime = Math.max(0, Math.min(d - .2, (x - r.left) / r.width * d)); sync(); }
    var dragging = false;
    scrub.addEventListener('pointerdown', function(e){ dragging = true; scrub.setPointerCapture(e.pointerId); seekAt(e.clientX); });
    scrub.addEventListener('pointermove', function(e){ if (dragging) seekAt(e.clientX); });
    scrub.addEventListener('pointerup', function(){ dragging = false; });
    scrub.addEventListener('keydown', function(e){
      if (e.key === 'ArrowRight') { main.currentTime = Math.min((main.duration || DUR) - .2, main.currentTime + 5); e.preventDefault(); sync(); }
      if (e.key === 'ArrowLeft') { main.currentTime = Math.max(0, main.currentTime - 5); e.preventDefault(); sync(); }
    });
    /* Space toggles while the player has focus */
    box.addEventListener('keydown', function(e){
      if ((e.key === ' ' || e.key === 'k') && box.classList.contains('started') && e.target !== scrub) { e.preventDefault(); if (main.paused) play(); else main.pause(); }
    });
    /* touch shows the bar for three seconds */
    var tt = null;
    box.addEventListener('touchstart', function(){ box.classList.add('touch'); clearTimeout(tt); tt = setTimeout(function(){ box.classList.remove('touch'); }, 3000); }, { passive: true });
    /* leaving for the calendar pauses the video */
    [].slice.call(document.querySelectorAll('a.btn')).forEach(function(a){ a.addEventListener('click', function(){ if (!main.paused) main.pause(); }); });
  }


  /* ---------------- faq: one open at a time, real height ---------------- */
  [].slice.call(document.querySelectorAll('.faq-i')).forEach(function(item){
    var q = item.querySelector('.faq-q'), a = item.querySelector('.faq-a');
    q.addEventListener('click', function(){
      var open = item.classList.contains('open');
      [].slice.call(document.querySelectorAll('.faq-i.open')).forEach(function(o){ if (o !== item) { o.classList.remove('open'); o.querySelector('.faq-q').setAttribute('aria-expanded', 'false'); o.querySelector('.faq-a').style.height = '0px'; } });
      item.classList.toggle('open', !open); q.setAttribute('aria-expanded', open ? 'false' : 'true');
      a.style.height = open ? '0px' : a.scrollHeight + 'px';
    });
  });

  /* ---------------- phones: one button in reach after the hero button leaves the screen ---------------- */
  var dock = document.getElementById('dock');
  if (dock && 'IntersectionObserver' in window) {
    var blockers = [document.getElementById('heroAct'), document.getElementById('close')].filter(Boolean), shown = {};
    var past = false;
    function syncDock(){ var blocked = blockers.some(function(b){ return shown[b.id]; }); dock.classList.toggle('on', past && !blocked); }
    var dio = new IntersectionObserver(function(en){ en.forEach(function(x){ shown[x.target.id] = x.isIntersecting; }); syncDock(); }, { threshold: 0 });
    blockers.forEach(function(b){ dio.observe(b); });
    window.addEventListener('scroll', function(){ var p = (window.pageYOffset || 0) > 400; if (p !== past) { past = p; syncDock(); } }, { passive: true });
  }
})();
