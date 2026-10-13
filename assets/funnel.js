/* JD Strategic Franchising: the consultation funnel. One script for index, book and confirmed. */
(function(){
  'use strict';
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PAGE = document.body.getAttribute('data-page') || 'index';

  /* ---------- the GHL side, in one place ----------
     CALENDAR: Josh's live booking calendar (20 min). The three answers are appended as query parameters; GoHighLevel
     prefills a calendar's custom form fields from matching keys, so once the calendar carries a custom form with these
     three keys the answers arrive on the appointment. Until then they are stored locally and echoed on the confirmation.
     QUAL_WEBHOOK: optional GoHighLevel inbound webhook for the three answers on their own. Empty = nothing is sent. */
  var CALENDAR = 'https://api.leadconnectorhq.com/widget/booking/P9QsS5fdmp3TZWbOhvYY';
  var QUAL_WEBHOOK = '';
  var KEY = 'jds_call_qual';

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

  /* phones: the action bar shows after the first screen and steps aside for the closing block */
  var bar = document.getElementById('mbar');
  if (bar && 'IntersectionObserver' in window) {
    var blockers = [].slice.call(document.querySelectorAll('#book, .hero-act')), past = false, blocked = 0;
    function sync(){ bar.classList.toggle('on', past && blocked === 0); }
    var bio = new IntersectionObserver(function(en){ en.forEach(function(x){ x.target.__in = x.isIntersecting; }); blocked = blockers.filter(function(b){ return b.__in; }).length; sync(); }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    blockers.forEach(function(b){ bio.observe(b); });
    window.addEventListener('scroll', function(){ var p = (window.pageYOffset || 0) > 560; if (p !== past) { past = p; sync(); } }, { passive: true });
  }

  /* ---------- storage ---------- */
  function load(){ try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(e){ return null; } }
  function save(v){ try { localStorage.setItem(KEY, JSON.stringify(v)); } catch(e){} }

  /* ================= book: three questions, then the calendar ================= */
  if (PAGE === 'book') {
    /* the three questions, option lists verbatim from Josh's own fit finder and his five paths */
    var QUAL = [
      { id: 'capital', k: 'Investment range', q: 'How much liquid capital could you invest?',
        h: 'Liquid capital is money you can access quickly without selling long-term investments or major assets: cash, savings, money market. Not home equity or retirement funds.',
        cols: 3, foot: 'Most opportunities I work with start around $50K liquid.',
        o: ['$50K to $75K', '$75K to $100K', '$100K to $150K', '$150K to $200K', '$200K to $250K', '$250K to $500K', '$500K to $1M', '$1M to $2M', '$2M+'] },
      { id: 'timeline', k: 'Timeline', q: 'What is your investment timeline?', h: 'No wrong answer. This helps me calibrate the approach.', cols: 1,
        o: [['Ready now', 'let’s move'], ['1 to 3 months', 'almost there'], ['3 to 6 months', 'still evaluating'], ['6 to 12 months', 'long-range planning'], ['1 year+', 'just trying to better understand options']] },
      { id: 'path', k: 'Where you stand', q: 'Which of these sounds like you?', h: 'Pick the closest. It tells me where to start.', cols: 1,
        o: [['Open to ownership', 'you want to own a business but are not sure what that looks like yet'], ['Interested in one brand', 'you found a brand you like and want to learn more'], ['Comparing one industry', 'you know the industry, now you want the best brand in it'], ['Interested in a few brands', 'a few brands across a couple of industries'], ['Already talking with a brand', 'you are in discovery and want a second set of eyes']] }
    ];
    var core = document.getElementById('qCore'), qualStage = document.getElementById('qualStage'), calStage = document.getElementById('calStage');
    var lab = document.getElementById('stepsLab'), st1 = document.getElementById('st1'), st2 = document.getElementById('st2');
    var ans = load() || {}, step = 0, advancing = null;
    var BACK = '<svg aria-hidden="true"><use href="#i-back"/></svg>';
    function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

    function render(){
      var Q = QUAL[step], html = '';
      html += '<div class="q-k q-in"><span>Question <b>0' + (step + 1) + '</b> of 03</span><span>' + esc(Q.k) + '</span></div>';
      html += '<p class="q-q q-in" id="qq">' + esc(Q.q) + '</p><p class="q-h q-in">' + esc(Q.h) + '</p>';
      html += '<div class="opts" role="group" aria-labelledby="qq" style="--cols:' + Q.cols + '">';
      Q.o.forEach(function(o, i){
        var v = Array.isArray(o) ? o[0] : o, s = Array.isArray(o) ? o[1] : '';
        var on = ans[Q.id] === v;
        html += '<button type="button" class="opt" data-v="' + esc(v) + '" style="--i:' + i + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + esc(v) + (s ? '<small>' + esc(s) + '</small>' : '') + '<span class="key" aria-hidden="true">' + (i + 1) + '</span></button>';
      });
      html += '</div>';
      html += '<div class="q-foot q-in"><button type="button" class="q-back' + (step > 0 ? ' show' : '') + '" id="qBack">' + BACK + 'Back</button><span>' + esc(Q.foot || 'Pick one to continue.') + '</span></div>';
      core.innerHTML = html;
      lab.innerHTML = '<b>Step 1 of 3</b> &middot; Question ' + (step + 1) + ' of 3';
      var back = document.getElementById('qBack'); if (back) back.addEventListener('click', function(){ if (step > 0) { step--; render(); } });
      var first = core.querySelector('.opt'); if (first && document.activeElement && document.activeElement !== document.body) first.focus({ preventScroll: true });
    }
    function pick(v){
      var Q = QUAL[step];
      ans[Q.id] = v; ans.updated = new Date().toISOString(); save(ans);
      [].slice.call(core.querySelectorAll('.opt')).forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-v') === v ? 'true' : 'false'); });
      clearTimeout(advancing);
      advancing = setTimeout(function(){ if (step < QUAL.length - 1) { step++; render(); } else { showCal(); } }, RM ? 60 : 320);
    }
    core.addEventListener('click', function(e){ var b = e.target.closest('.opt'); if (b) pick(b.getAttribute('data-v')); });
    document.addEventListener('keydown', function(e){
      if (calStage.classList.contains('open')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= 9) { var b = core.querySelectorAll('.opt')[n - 1]; if (b) { e.preventDefault(); pick(b.getAttribute('data-v')); } }
      if (e.key === 'Backspace' && step > 0 && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); step--; render(); }
    });

    function summary(){ return QUAL.map(function(Q){ return Q.k + ': ' + (ans[Q.id] || ''); }).join(' | '); }
    function calURL(){
      var p = [];
      QUAL.forEach(function(Q){ if (ans[Q.id]) p.push(encodeURIComponent({ capital: 'investment_range', timeline: 'timeline', path: 'where_you_stand' }[Q.id]) + '=' + encodeURIComponent(ans[Q.id])); });
      p.push('source=' + encodeURIComponent('JD Strategic Call Funnel'));
      return CALENDAR + '?' + p.join('&');
    }
    function post(){
      if (!QUAL_WEBHOOK || ans.sent) return;
      var body = { source: 'JD Strategic Call Funnel', qual_id: ans.qual_id, investment_range: ans.capital, timeline: ans.timeline, where_you_stand: ans.path, submitted_at: new Date().toISOString(), summary: summary() };
      fetch(QUAL_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function(r){ return r.text(); })
        .then(function(t){ if (/Success/.test(t)) { ans.sent = true; save(ans); } })
        .catch(function(){});
    }
    var calLoaded = false;
    function showCal(){
      if (!ans.qual_id) { ans.qual_id = 'q' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); save(ans); }
      qualStage.hidden = true; calStage.hidden = false; calStage.classList.add('open');
      st1.classList.remove('on'); st1.classList.add('done'); st2.classList.add('on');
      lab.innerHTML = '<b>Step 2 of 3</b> &middot; Pick your time';
      var a = document.getElementById('answers'), h = '';
      QUAL.forEach(function(Q){ if (ans[Q.id]) h += '<span><i></i>' + esc(ans[Q.id]) + '</span>'; });
      h += '<button type="button" id="qEdit">Change an answer</button>';
      a.innerHTML = h;
      document.getElementById('qEdit').addEventListener('click', function(){ calStage.hidden = true; calStage.classList.remove('open'); qualStage.hidden = false; st2.classList.remove('on'); st1.classList.remove('done'); st1.classList.add('on'); step = 0; render(); window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); });
      if (!calLoaded) {
        calLoaded = true;
        var body = document.getElementById('calBody'), skel = document.getElementById('calSkel');
        var f = document.createElement('iframe');
        f.src = calURL(); f.title = 'Book a call with Josh DuBois'; f.id = 'P9QsS5fdmp3TZWbOhvYY_book'; f.setAttribute('scrolling', 'no');
        f.addEventListener('load', function(){ setTimeout(function(){ if (skel) skel.remove(); }, 400); });
        body.appendChild(f);
        /* GHL resizes the frame per step; when it shrinks while the visitor is below its top, bring it back into view */
        if ('ResizeObserver' in window) { var last = 0; new ResizeObserver(function(){ var hgt = f.getBoundingClientRect().height; if (last && hgt < last - 120) { var top = body.getBoundingClientRect().top + window.pageYOffset - 24; if (window.pageYOffset > top) window.scrollTo({ top: top, behavior: RM ? 'auto' : 'smooth' }); } last = hgt; }).observe(f); }
        post();
      }
      window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' });
    }

    var want = /[?&]step=cal\b/.test(location.search) || location.hash === '#cal';
    if (want && ans.capital && ans.timeline && ans.path) { showCal(); }
    else { render(); }
  }

  /* ================= confirmed: echo the answers, play the episode in place ================= */
  if (PAGE === 'confirmed') {
    var got = load() || {};
    [].slice.call(document.querySelectorAll('[data-echo]')).forEach(function(el){
      var v = got[el.getAttribute('data-echo')];
      if (v) { el.querySelector('span').textContent = 'You told me: ' + v; el.hidden = false; }
    });
    var vid = document.getElementById('video');
    if (vid) vid.addEventListener('click', function(){
      if (vid.querySelector('iframe')) return;
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + vid.getAttribute('data-id') + '?autoplay=1&rel=0&modestbranding=1';
      f.title = 'Conquer the Mind, episode 36: Meet Doc Cohen'; f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.setAttribute('allowfullscreen', '');
      vid.appendChild(f); vid.setAttribute('aria-label', 'Playing episode 36');
    });
  }
})();
