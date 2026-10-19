/* JD Strategic Franchising: the consultation funnel. One script for index, book and confirmed. */
(function(){
  'use strict';
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PAGE = document.body.getAttribute('data-page') || 'index';

  /* Josh's live booking calendar (20 min). Qualification questions live on the calendar's own booking form
     in GoHighLevel (see GHL-SETUP.md); the page is the calendar and nothing else. */
  var CALENDAR = 'https://api.leadconnectorhq.com/widget/booking/P9QsS5fdmp3TZWbOhvYY';

  /* arrival is sequenced off the webfonts so a mask reveal never plays against a fallback face */
  function ready(){ document.body.classList.add('ready'); }
  if (RM) { ready(); }
  else if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function(){ requestAnimationFrame(ready); }); setTimeout(ready, 1800); }
  else { requestAnimationFrame(ready); }

  /* the island condenses once the page moves */
  var nav = document.getElementById('nav'), tick = false;
  function onScroll(){ if (nav) nav.classList.toggle('stuck', (window.pageYOffset || document.documentElement.scrollTop) > 10); tick = false; }
  if (nav) { window.addEventListener('scroll', function(){ if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true }); onScroll(); }

  /* reveals, with a failsafe */
  var rev = [].slice.call(document.querySelectorAll('[data-r]'));
  function revealAll(){ rev.forEach(function(el){ el.classList.add('in'); }); }
  if (RM || !('IntersectionObserver' in window)) { revealAll(); }
  else {
    var io = new IntersectionObserver(function(en){ en.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: .06 });
    rev.forEach(function(el){ io.observe(el); });
    setTimeout(revealAll, 3500);
  }

  /* count up */
  var cs = [].slice.call(document.querySelectorAll('[data-count]'));
  function run(el){
    var t = parseFloat(el.getAttribute('data-count')) || 0, comma = el.getAttribute('data-fmt') === 'comma';
    if (RM) { el.textContent = comma ? t.toLocaleString('en-US') : String(t); return; }
    var d = 1500, t0 = null;
    function step(ts){ if (t0 === null) t0 = ts; var p = Math.min((ts - t0) / d, 1), e = 1 - Math.pow(1 - p, 3), v = Math.round(t * e); el.textContent = comma ? v.toLocaleString('en-US') : String(v); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  if (cs.length) {
    if ('IntersectionObserver' in window) { var cio = new IntersectionObserver(function(en){ en.forEach(function(e){ if (e.isIntersecting) { run(e.target); cio.unobserve(e.target); } }); }, { threshold: .4 }); cs.forEach(function(el){ cio.observe(el); }); setTimeout(function(){ cs.forEach(run); }, 3500); }
    else { cs.forEach(run); }
  }

  /* faq */
  [].slice.call(document.querySelectorAll('.faq-i')).forEach(function(item){
    var q = item.querySelector('.faq-q'), a = item.querySelector('.faq-a');
    q.addEventListener('click', function(){
      var open = item.classList.contains('open');
      [].slice.call(item.parentNode.querySelectorAll('.faq-i.open')).forEach(function(o){ if (o !== item) { o.classList.remove('open'); o.querySelector('.faq-q').setAttribute('aria-expanded', 'false'); o.querySelector('.faq-a').style.height = '0px'; } });
      item.classList.toggle('open', !open); q.setAttribute('aria-expanded', open ? 'false' : 'true');
      a.style.height = open ? '0px' : a.scrollHeight + 'px';
    });
  });

  /* phones: the action bar shows after the hero's button leaves the screen and steps aside for the closing block */
  var bar = document.getElementById('mbar');
  if (bar && 'IntersectionObserver' in window) {
    var blockers = [].slice.call(document.querySelectorAll('#book, .hero-act')), past = false, blocked = 0;
    function sync(){ bar.classList.toggle('on', past && blocked === 0); }
    var bio = new IntersectionObserver(function(en){ en.forEach(function(x){ x.target.__in = x.isIntersecting; }); blocked = blockers.filter(function(b){ return b.__in; }).length; sync(); }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    blockers.forEach(function(b){ bio.observe(b); });
    window.addEventListener('scroll', function(){ var p = (window.pageYOffset || 0) > 560; if (p !== past) { past = p; sync(); } }, { passive: true });
  }

  /* ================= book: the calendar, straight away ================= */
  if (PAGE === 'book') {
    var body = document.getElementById('calBody'), skel = document.getElementById('calSkel');
    if (body) {
      var f = document.createElement('iframe');
      f.src = CALENDAR + '?source=' + encodeURIComponent('JD Strategic Call Funnel');
      f.title = 'Book a call with Josh DuBois'; f.id = 'P9QsS5fdmp3TZWbOhvYY_book'; f.setAttribute('scrolling', 'no');
      f.addEventListener('load', function(){ setTimeout(function(){ if (skel) skel.remove(); }, 400); });
      body.appendChild(f);
      /* GHL resizes the frame per step; when it shrinks while the visitor is below its top, bring it back into view */
      if ('ResizeObserver' in window) { var last = 0; new ResizeObserver(function(){ var hgt = f.getBoundingClientRect().height; if (last && hgt < last - 120) { var top = body.getBoundingClientRect().top + window.pageYOffset - 24; if (window.pageYOffset > top) window.scrollTo({ top: top, behavior: RM ? 'auto' : 'smooth' }); } last = hgt; }).observe(f); }
    }
  }

  /* ================= confirmed: play the episode in place ================= */
  if (PAGE === 'confirmed') {
    var vid = document.getElementById('video');
    if (vid) vid.addEventListener('click', function(){
      if (vid.querySelector('iframe')) return;
      var fr = document.createElement('iframe');
      fr.src = 'https://www.youtube-nocookie.com/embed/' + vid.getAttribute('data-id') + '?autoplay=1&rel=0&modestbranding=1';
      fr.title = 'Conquer the Mind, episode 36: Meet Doc Cohen'; fr.allow = 'autoplay; encrypted-media; picture-in-picture'; fr.setAttribute('allowfullscreen', '');
      vid.appendChild(fr); vid.setAttribute('aria-label', 'Playing episode 36');
    });
  }
})();
