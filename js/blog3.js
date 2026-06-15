document.addEventListener('DOMContentLoaded', function () {
  var rmq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = rmq.matches;

  // Mark blog3 as read in localStorage so blogs.html badge updates
  try {
    var saved = localStorage.getItem('ecoBlogStatus-blog3');
    if (saved !== 'downloaded') localStorage.setItem('ecoBlogStatus-blog3', 'read');
  } catch (e) {}

  // Force Blogs nav link active (main.js IIFE runs before DOMContentLoaded and clears it)
  document.querySelectorAll('.nav-links a').forEach(function (a) { a.classList.remove('active'); });
  var blogsLink = document.getElementById('blogs-nav-link');
  if (blogsLink) blogsLink.classList.add('active');

  // READING PROGRESS BAR
  var bar = document.getElementById('read-progress');
  if (bar) {
    window.addEventListener('scroll', function () {
      var scrolled = window.scrollY || document.documentElement.scrollTop;
      var total = document.documentElement.scrollHeight - window.innerHeight;
      var pct = total > 0 ? Math.min((scrolled / total) * 100, 100) : 0;
      bar.style.width = pct + '%';
      bar.setAttribute('aria-valuenow', Math.round(pct));
    }, { passive: true });
  }

  // MOBILE JUMP DROPDOWN
  var jumpSel = document.getElementById('section-jump');
  if (jumpSel) {
    jumpSel.addEventListener('change', function () {
      var id = this.value;
      if (!id) return;
      var target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      this.value = '';
    });
  }

  // SIDEBAR ACTIVE SECTION
  var sideLinks = document.querySelectorAll('.sidebar-link');
  var sections  = document.querySelectorAll('.blog-section[id]');
  if (sideLinks.length && sections.length) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          sideLinks.forEach(function (a) {
            a.classList.toggle('active-section', a.getAttribute('href') === '#' + e.target.id);
          });
        }
      });
    }, { threshold: 0.2, rootMargin: '-52px 0px -55% 0px' });
    sections.forEach(function (s) { secObs.observe(s); });
  }

  // FLIP CARD
  var flipCard = document.getElementById('myth-flip');
  var revealBtn = document.getElementById('flip-reveal');
  var backBtn   = document.getElementById('flip-back-btn');

  function doFlip() {
    if (flipCard) flipCard.classList.toggle('flipped');
  }

  if (revealBtn) {
    revealBtn.addEventListener('click', doFlip);
    revealBtn.addEventListener('touchstart', function (e) { e.preventDefault(); doFlip(); }, { passive: false });
  }
  if (backBtn) {
    backBtn.addEventListener('click', doFlip);
    backBtn.addEventListener('touchstart', function (e) { e.preventDefault(); doFlip(); }, { passive: false });
  }

  // Dynamically size flip card to taller face
  window.addEventListener('load', function () {
    if (!flipCard) return;
    var front = flipCard.querySelector('.flip-front');
    var back  = flipCard.querySelector('.flip-back');
    if (!front || !back) return;
    // Measure back face by temporarily surfacing it
    back.style.transform = 'none';
    back.style.position  = 'relative';
    back.style.visibility = 'hidden';
    var bh = back.offsetHeight;
    back.style.transform  = '';
    back.style.position   = '';
    back.style.visibility = '';
    var fh = front.offsetHeight;
    flipCard.style.minHeight = Math.max(fh, bh) + 'px';
  });

  // STAT COUNTERS
  var counters = document.querySelectorAll('.counter-num[data-target]');

  function runCounter(el) {
    var target  = parseFloat(el.getAttribute('data-target'));
    var suffix  = el.getAttribute('data-suffix') || '';
    var dec     = parseInt(el.getAttribute('data-decimal') || '0', 10);
    if (reduced) { el.textContent = (dec ? target.toFixed(dec) : Math.round(target)) + suffix; return; }
    var duration = 1500;
    var start    = null;
    function step(ts) {
      if (!start) start = ts;
      var prog = Math.min((ts - start) / duration, 1);
      // ease out cubic
      var ease = 1 - Math.pow(1 - prog, 3);
      var val  = target * ease;
      el.textContent = (dec ? val.toFixed(dec) : Math.round(val)) + suffix;
      if (prog < 1) requestAnimationFrame(step);
      else el.textContent = (dec ? target.toFixed(dec) : Math.round(target)) + suffix;
    }
    requestAnimationFrame(step);
  }

  if (counters.length) {
    var cntObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          runCounter(e.target);
          cntObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    counters.forEach(function (el) { cntObs.observe(el); });
  }

  // TABLE TOOLTIPS (touch fallback)
  document.querySelectorAll('.tip-wrap').forEach(function (wrap) {
    wrap.querySelector('.tip-icon').addEventListener('click', function (e) {
      e.stopPropagation();
      var was = wrap.classList.contains('show');
      document.querySelectorAll('.tip-wrap').forEach(function (w) { w.classList.remove('show'); });
      if (!was) wrap.classList.add('show');
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.tip-wrap').forEach(function (w) { w.classList.remove('show'); });
  });

  // LIFECYCLE STAGES
  document.querySelectorAll('.lc-stage').forEach(function (stage) {
    function toggle() {
      var open = stage.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.lc-stage').forEach(function (s) { s.setAttribute('aria-expanded', 'false'); });
      stage.setAttribute('aria-expanded', open ? 'false' : 'true');
    }
    stage.addEventListener('click', toggle);
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  // VERDICT METER
  var needle = document.getElementById('verdict-needle');
  if (needle) {
    var verdictObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          if (reduced) {
            needle.style.left = '65%';
          } else {
            setTimeout(function () { needle.style.left = '65%'; }, 150);
          }
          verdictObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    verdictObs.observe(needle.closest('.verdict-wrap'));
  }

  // TABS
  var tabBtns   = document.querySelectorAll('.tab-btn');
  var tabPanels = document.querySelectorAll('.tab-panel');

  function staggerBullets(panel) {
    var items = panel.querySelectorAll('li');
    items.forEach(function (li) { li.classList.remove('vis'); });
    if (reduced) {
      items.forEach(function (li) { li.classList.add('vis'); });
    } else {
      items.forEach(function (li, i) {
        setTimeout(function () { li.classList.add('vis'); }, i * 60);
      });
    }
  }

  function switchTab(btn) {
    tabBtns.forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    tabPanels.forEach(function (p) { p.classList.remove('active'); });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (panel) { panel.classList.add('active'); staggerBullets(panel); }
  }

  tabBtns.forEach(function (btn) { btn.addEventListener('click', function () { switchTab(btn); }); });

  // Initialise first tab bullets after a brief delay
  var firstPanel = document.getElementById('tab-sus');
  if (firstPanel) { setTimeout(function () { staggerBullets(firstPanel); }, 350); }

  // BIBLIOGRAPHY ACCORDION
  var bibBtn  = document.getElementById('bib-toggle');
  var bibBody = document.getElementById('bib-body');
  if (bibBtn && bibBody) {
    bibBtn.addEventListener('click', function () {
      var open = bibBtn.classList.contains('open');
      if (open) {
        bibBody.style.maxHeight = '0';
        bibBtn.classList.remove('open');
        bibBtn.setAttribute('aria-expanded', 'false');
        bibBody.setAttribute('aria-hidden', 'true');
      } else {
        bibBody.style.maxHeight = bibBody.scrollHeight + 'px';
        bibBtn.classList.add('open');
        bibBtn.setAttribute('aria-expanded', 'true');
        bibBody.setAttribute('aria-hidden', 'false');
      }
    });
  }
});
