document.addEventListener('DOMContentLoaded', function () {
  var rmq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = rmq.matches;

  // Mark blog4 as read in localStorage so blogs.html badge updates
  try {
    var saved = localStorage.getItem('ecoBlogStatus-blog4');
    if (saved !== 'downloaded') localStorage.setItem('ecoBlogStatus-blog4', 'read');
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

  // BUILD SIMULATOR
  var simBtn = document.getElementById('sim-run-btn');
  var simDay = document.getElementById('sim-day-count');
  var simArea = document.getElementById('sim-area-count');
  var simFill = document.getElementById('sim-fill');
  var simCaption = document.getElementById('sim-caption');
  var DAILY_AREA = 12.7; // million m^2
  var PARIS_AREA = DAILY_AREA * 7; // ~ a week's worth, matches the Paris comparison in the article

  function runBuildSimulation() {
    simBtn.disabled = true;
    simBtn.innerHTML = '<i class="fa-solid fa-hourglass-half"></i> Simulating...';
    if (simFill) simFill.style.width = '0%';
    if (simDay) simDay.textContent = 'Day 0';
    if (simArea) simArea.textContent = '0 m² added';
    if (simCaption) simCaption.classList.remove('sim-revealed');

    var day = 0;
    var totalDays = 7;

    function tick() {
      day += 1;
      var area = DAILY_AREA * day;
      var pct = Math.min((area / PARIS_AREA) * 100, 100);
      if (simDay) simDay.textContent = 'Day ' + day;
      if (simArea) simArea.textContent = area.toFixed(1) + ' million m² added';
      if (simFill) simFill.style.width = pct + '%';

      if (day >= totalDays) {
        if (simCaption) simCaption.classList.add('sim-revealed');
        simBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Run again';
        simBtn.disabled = false;
        return;
      }
      setTimeout(tick, reduced ? 0 : 900);
    }
    tick();
  }

  if (simBtn) {
    simBtn.addEventListener('click', runBuildSimulation);
  }

  // QUIZ + DUEL BAR
  var quizOpts = document.querySelectorAll('#density-quiz .quiz-opt');
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
          ? 'Correct. Density and height are separable, medium-rise neighbourhoods like central Paris can match a skyscraper’s density without its embodied-carbon penalty.'
          : 'Not quite. Skyscrapers need disproportionate amounts of steel and concrete to handle their own height, so they generate far more lifecycle carbon than medium-rise buildings at the same density.';
      }
      if (duelWrap) duelWrap.classList.add('revealed');
    });
  });

  // MATERIAL COMPARATOR
  var materialData = {
    concrete: { value: 0.2, max: 20, unit: 'kg CO₂e per kg produced', fact: 'Concrete’s per-kilogram footprint is low, but the sheer volume used globally, nearly 50% of all material extraction on Earth, dwarfs every other material here.' },
    steel: { value: 2.2, max: 20, unit: 'kg CO₂e per kg produced', fact: 'Steel is energy-intensive to produce, but it is also one of the most recyclable materials in construction, if it can be cleanly separated during demolition.' },
    aluminium: { value: 20, max: 20, unit: 'kg CO₂e per kg produced', fact: 'Aluminium is the most carbon-intensive material per kilogram by far. Its growing use in facades and windows matters more than its modest share of total volume suggests.' },
    timber: { sink: true, fact: 'Engineered timber like CLT stores the carbon absorbed while the source trees were growing, acting as a net carbon sink rather than an emitter, though sustainable forestry limits how much can scale.' }
  };

  var mcChips = document.querySelectorAll('.mc-chip');
  var mcFill = document.getElementById('mc-bar-fill');
  var mcValue = document.getElementById('mc-value');
  var mcFact = document.getElementById('mc-fact');

  function setMaterial(key) {
    var d = materialData[key];
    if (!d || !mcFill || !mcValue || !mcFact) return;
    if (d.sink) {
      mcFill.classList.add('mc-sink');
      mcFill.style.width = '100%';
      mcValue.textContent = 'Net carbon sink';
      mcFact.textContent = d.fact;
    } else {
      mcFill.classList.remove('mc-sink');
      var pct = Math.max((d.value / d.max) * 100, 3);
      mcFill.style.width = pct + '%';
      mcValue.textContent = d.value + ' ' + d.unit;
      mcFact.textContent = d.fact;
    }
  }

  mcChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      mcChips.forEach(function (c) { c.classList.remove('active'); c.setAttribute('aria-selected', 'false'); });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      setMaterial(this.getAttribute('data-material'));
    });
  });

  // CIRCULAR LOOP STAGES
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
