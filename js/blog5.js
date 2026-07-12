document.addEventListener('DOMContentLoaded', function () {
  var rmq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = rmq.matches;

  // Mark blog5 as read in localStorage so blogs.html badge updates
  try {
    var saved = localStorage.getItem('ecoBlogStatus-blog5');
    if (saved !== 'downloaded') localStorage.setItem('ecoBlogStatus-blog5', 'read');
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

  // FLIP CARD (Myth vs Reality)
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
    var prefix  = el.getAttribute('data-prefix') || '';
    var suffix  = el.getAttribute('data-suffix') || '';
    var dec     = parseInt(el.getAttribute('data-decimal') || '0', 10);
    if (reduced) { el.textContent = prefix + (dec ? target.toFixed(dec) : Math.round(target)) + suffix; return; }
    var duration = 1500;
    var start    = null;
    function step(ts) {
      if (!start) start = ts;
      var prog = Math.min((ts - start) / duration, 1);
      var ease = 1 - Math.pow(1 - prog, 3);
      var val  = target * ease;
      el.textContent = prefix + (dec ? val.toFixed(dec) : Math.round(val)) + suffix;
      if (prog < 1) requestAnimationFrame(step);
      else el.textContent = prefix + (dec ? target.toFixed(dec) : Math.round(target)) + suffix;
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

  // HIERARCHY LOOP STAGES
  document.querySelectorAll('.loop-stage').forEach(function (stage) {
    function toggle() {
      var open = stage.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.loop-stage').forEach(function (s) { s.setAttribute('aria-expanded', 'false'); });
      stage.setAttribute('aria-expanded', open ? 'false' : 'true');
    }
    stage.addEventListener('click', toggle);
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  // MATERIAL / CYCLE COMPARATOR
  var materialData = {
    plastic: { value: 15, max: 100, warn: true, label: '~1-2 high-value cycles', fact: 'When thermoplastics are melted and reformed, their polymer chains shorten and weaken. A 2021 paper in the Journal of the American Chemical Society described plastic recycling as "spiral," not circular. Only around 9% of all plastic ever produced has been recycled.' },
    paper: { value: 55, max: 100, warn: false, label: '5-7 cycles before fibres are too short', fact: 'Cellulose fibres shorten with every recycling cycle. Most paper can be recycled between five and seven times before the fibres become too short for further use.' },
    steel: { value: 88, max: 100, warn: false, label: 'Many cycles, but quality drifts', fact: 'Steel can be melted and recast almost indefinitely without significant quality loss, but mixed scrap accumulates tramp elements like copper and tin that gradually degrade the recovered alloy.' },
    aluminium: { value: 97, max: 100, warn: false, label: 'Near-indefinite recyclability', fact: 'Aluminium keeps its properties across repeated recycling far better than most materials, and recycled aluminium requires roughly 95% less energy than smelting virgin bauxite ore.' },
    composites: { value: 8, max: 100, warn: true, label: 'Often technically unrecoverable', fact: 'Materials combining two or more substances, like carbon fibre reinforced polymers or multilayer food packaging, often resist separation entirely, making recovery of either component commercially or technically impractical.' }
  };

  var mcChips = document.querySelectorAll('.mc-chip');
  var mcFill = document.getElementById('mc-bar-fill');
  var mcValue = document.getElementById('mc-value');
  var mcFact = document.getElementById('mc-fact');

  function setMaterial(key) {
    var d = materialData[key];
    if (!d || !mcFill || !mcValue || !mcFact) return;
    mcFill.classList.toggle('mc-warn', !!d.warn);
    var pct = Math.max((d.value / d.max) * 100, 3);
    mcFill.style.width = pct + '%';
    mcValue.textContent = d.label;
    mcFact.textContent = d.fact;
  }

  mcChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      mcChips.forEach(function (c) { c.classList.remove('active'); c.setAttribute('aria-selected', 'false'); });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      setMaterial(this.getAttribute('data-material'));
    });
  });

  // QUIZ + DUEL BAR
  var quizOpts = document.querySelectorAll('#recycling-quiz .quiz-opt');
  var quizFeedback = document.getElementById('quiz-feedback');
  var duelWrap = document.getElementById('duel-bar-wrap');

  quizOpts.forEach(function (opt) {
    opt.addEventListener('click', function () {
      var isCorrect = this.getAttribute('data-correct') === 'true';
      quizOpts.forEach(function (o) {
        o.disabled = true;
        if (o.getAttribute('data-correct') === 'true') o.classList.add('correct-choice');
      });
      if (!isCorrect) this.classList.add('wrong-choice');

      if (quizFeedback) {
        quizFeedback.classList.add(isCorrect ? 'fb-correct' : 'fb-wrong');
        quizFeedback.textContent = isCorrect
          ? 'Correct. The EU’s packaging recycling rate of roughly 41-42% is close to a best case globally, and it still leaves well over half of packaging unrecycled.'
          : 'Not quite. Even Europe’s comparatively mature recycling infrastructure only recovers roughly 41-42% of packaging plastic.';
      }
      if (duelWrap) duelWrap.classList.add('revealed');
    });
  });

  // CIRCULARITY TREND BARS
  var trendBtn = document.getElementById('trend-run-btn');
  var trendCaption = document.getElementById('trend-caption');
  var trendData = [
    { fill: document.getElementById('trend-fill-1'), val: document.getElementById('trend-val-1'), pct: 9.1, scale: 91 },
    { fill: document.getElementById('trend-fill-2'), val: document.getElementById('trend-val-2'), pct: 7.2, scale: 72 },
    { fill: document.getElementById('trend-fill-3'), val: document.getElementById('trend-val-3'), pct: 6.9, scale: 69 }
  ];

  function runTrend() {
    trendBtn.disabled = true;
    trendBtn.innerHTML = '<i class="fa-solid fa-hourglass-half"></i> Revealing...';
    trendData.forEach(function (d) { d.fill.style.width = '0%'; d.val.textContent = '0%'; });
    if (trendCaption) trendCaption.classList.remove('trend-revealed');

    trendData.forEach(function (d, i) {
      setTimeout(function () {
        d.fill.style.width = d.scale + '%';
        d.val.textContent = d.pct + '%';
        if (i === trendData.length - 1) {
          setTimeout(function () {
            if (trendCaption) trendCaption.classList.add('trend-revealed');
            trendBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Run again';
            trendBtn.disabled = false;
          }, reduced ? 0 : 700);
        }
      }, reduced ? 0 : i * 1400);
    });
  }

  if (trendBtn) trendBtn.addEventListener('click', runTrend);

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

  var firstPanel = document.getElementById('tab-works');
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
