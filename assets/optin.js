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
    function play(retry){ var p = main.play(); if (p && p.catch) p.catch(function(){ if (!retry) setTimeout(function(){ if (main.paused && box.classList.contains('started') && !main.ended) play(true); }, 250); }); }
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
  }


  /* ---------------- click-to-play YouTube posters (no outbound links) ---------------- */
  [].slice.call(document.querySelectorAll('[data-yt]')).forEach(function(b){
    b.addEventListener('click', function(){
      if (b.querySelector('iframe')) return;
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + b.getAttribute('data-yt') + '?autoplay=1&rel=0&modestbranding=1';
      f.title = b.getAttribute('aria-label') || 'Video'; f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.setAttribute('allowfullscreen', '');
      b.appendChild(f); b.classList.add('on');
    });
  });

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


  /* ---------------- step 1 of 2: every button opens the opt-in form; submit goes to the calendar ----------------
     WEBHOOK: Josh's GHL inbound webhook for this funnel's opt-ins. Empty = preview mode: the form validates,
     stores the lead in this browser and moves on to the calendar, and nothing is sent anywhere.
     The calendar is prefilled from the lead (GHL reads first_name, last_name, email, phone from its URL). */
  var WEBHOOK = '';
  var LEAD_KEY = 'jds_lead';
  var dlg = document.getElementById('optin'), form = document.getElementById('optForm');
  if (dlg && form && typeof dlg.showModal === 'function') {
    var vMain = document.getElementById('vMain');
    function openForm(){
      if (vMain && !vMain.paused) vMain.pause();
      if (!dlg.open) dlg.showModal();
      setTimeout(function(){ var f = document.getElementById('f-name'); if (f) f.focus(); }, 60);
    }
    document.addEventListener('click', function(e){
      var a = e.target.closest('a[href="book.html"]'); if (!a || a.closest('#optin')) return;
      e.preventDefault(); openForm();
    });
    document.getElementById('optClose').addEventListener('click', function(){ dlg.close(); });
    dlg.addEventListener('click', function(e){ if (e.target === dlg) dlg.close(); });
    if (/[?&]optin=1/.test(location.search)) openForm();

    var checks = {
      name: function(v){ return v.trim().split(/\s+/).length >= 2 && v.trim().length >= 3; },
      email: function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
      phone: function(v){ return v.replace(/\D/g, '').length >= 10; }
    };
    [].slice.call(form.querySelectorAll('input')).forEach(function(i){ i.addEventListener('input', function(){ i.closest('.field').classList.remove('bad'); }); });
    var btn = document.getElementById('optSubmit'), LABEL = btn.textContent;
    window.addEventListener('pageshow', function(){ btn.disabled = false; btn.textContent = LABEL; });
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var first = null;
      Object.keys(checks).forEach(function(k){
        var el = form.elements[k], good = checks[k](el.value);
        el.closest('.field').classList.toggle('bad', !good); el.setAttribute('aria-invalid', String(!good));
        if (!good && !first) first = el;
      });
      if (first) { first.focus(); return; }
      var full = form.elements.name.value.trim().replace(/\s+/g, ' '), parts = full.split(' ');
      var qs = new URLSearchParams(location.search);
      var data = { first_name: parts[0], last_name: parts.slice(1).join(' '), full_name: full,
        email: form.elements.email.value.trim(), phone: form.elements.phone.value.trim(),
        source: 'JD Strategic Call Funnel', page_url: location.origin + location.pathname, submitted_at: new Date().toISOString() };
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'].forEach(function(k){ if (qs.get(k)) data[k] = qs.get(k).slice(0, 200); });
      data.summary = 'Franchise Fit Review opt-in: ' + full + ' | ' + data.phone + ' | ' + data.email + (data.utm_campaign ? ' | campaign: ' + data.utm_campaign : '');
      try { localStorage.setItem(LEAD_KEY, JSON.stringify({ first_name: data.first_name, last_name: data.last_name, email: data.email, phone: data.phone, t: Date.now() })); } catch (err) {}
      btn.disabled = true; btn.textContent = 'One moment...';
      var gone = false;
      function go(){ if (gone) return; gone = true; location.href = 'book.html'; }
      if (!WEBHOOK) { go(); return; }
      /* guaranteed redirect: JSON first; on any failure a keepalive backup; a 6 second guard no matter what */
      var guard = setTimeout(go, 6000);
      var body = JSON.stringify(data);
      fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body })
        .then(function(r){ return r.text().then(function(t){ if (!(r.ok && /success/i.test(t) && !/error/i.test(t))) throw new Error('rejected'); }); })
        .catch(function(){ try { fetch(WEBHOOK, { method: 'POST', mode: 'no-cors', keepalive: true, body: body }); } catch (err) {} })
        .then(function(){ clearTimeout(guard); go(); });
    });
  }

  /* ---------------- phones: one button in reach after the hero button leaves the screen ---------------- */
  var dock = document.getElementById('dock');
  if (dock && 'IntersectionObserver' in window) {
    var blockers = [].slice.call(document.querySelectorAll('#heroAct, #close, .act, .ask-act, .split-act')), shown = {};
    blockers.forEach(function(b, i){ if (!b.id) b.id = 'blk' + i; });
    var past = false;
    function syncDock(){ var blocked = blockers.some(function(b){ return shown[b.id]; }); dock.classList.toggle('on', past && !blocked); }
    var dio = new IntersectionObserver(function(en){ en.forEach(function(x){ shown[x.target.id] = x.isIntersecting; }); syncDock(); }, { threshold: 0 });
    blockers.forEach(function(b){ dio.observe(b); });
    window.addEventListener('scroll', function(){ var p = (window.pageYOffset || 0) > 400; if (p !== past) { past = p; syncDock(); } }, { passive: true });
  }
})();
