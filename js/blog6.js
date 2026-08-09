document.addEventListener('DOMContentLoaded', function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  try {
    var saved = localStorage.getItem('ecoBlogStatus-blog6');
    if (saved !== 'downloaded') localStorage.setItem('ecoBlogStatus-blog6', 'read');
  } catch (e) {}

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
  var sections = document.querySelectorAll('.blog-section[id]');
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
  var backBtn = document.getElementById('flip-back-btn');
  function doFlip() { if (flipCard) flipCard.classList.toggle('flipped'); }
  if (revealBtn) {
    revealBtn.addEventListener('click', doFlip);
    revealBtn.addEventListener('touchstart', function (e) { e.preventDefault(); doFlip(); }, { passive: false });
  }
  if (backBtn) {
    backBtn.addEventListener('click', doFlip);
    backBtn.addEventListener('touchstart', function (e) { e.preventDefault(); doFlip(); }, { passive: false });
  }
  window.addEventListener('load', function () {
    if (!flipCard) return;
    var front = flipCard.querySelector('.flip-front');
    var back = flipCard.querySelector('.flip-back');
    if (!front || !back) return;
    back.style.transform = 'none'; back.style.position = 'relative'; back.style.visibility = 'hidden';
    var bh = back.offsetHeight;
    back.style.transform = ''; back.style.position = ''; back.style.visibility = '';
    var fh = front.offsetHeight;
    flipCard.style.minHeight = Math.max(fh, bh) + 'px';
  });

  // STAT COUNTERS
  var counters = document.querySelectorAll('.counter-num[data-target]');
  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-target'));
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var dec = parseInt(el.getAttribute('data-decimal') || '0', 10);
    if (reduced) { el.textContent = prefix + (dec ? target.toFixed(dec) : Math.round(target)) + suffix; return; }
    var duration = 1500, start = null;
    function step(ts) {
      if (!start) start = ts;
      var prog = Math.min((ts - start) / duration, 1);
      var ease = 1 - Math.pow(1 - prog, 3);
      var val = target * ease;
      el.textContent = prefix + (dec ? val.toFixed(dec) : Math.round(val)) + suffix;
      if (prog < 1) requestAnimationFrame(step);
      else el.textContent = prefix + (dec ? target.toFixed(dec) : Math.round(target)) + suffix;
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    var cntObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); cntObs.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    counters.forEach(function (el) { cntObs.observe(el); });
  }

  // TERM COMPARATOR
  var termData = {
    'zero-emissions': {
      def: 'No greenhouse gases released at all: no combustion, no industrial process emissions, no agricultural methane, no aviation fuel burn. The strictest possible standard, and one net zero deliberately does not require.',
      tags: ['<i class="fa-solid fa-ban"></i> No residual emissions allowed', '<i class="fa-solid fa-xmark"></i> No offsets needed or used']
    },
    'net-zero': {
      def: 'Residual emissions, after deep cuts, are balanced tonne-for-tonne by removals: natural (forests, soils) or technological (direct air capture). In its most rigorous form (IPCC, Oxford Net Zero Initiative), it requires all greenhouse gases balanced, not just CO₂, with only genuinely unavoidable residuals covered by removals.',
      tags: ['<i class="fa-solid fa-leaf"></i> All greenhouse gases', '<i class="fa-solid fa-arrow-down"></i> Deep cuts first', '<i class="fa-solid fa-recycle"></i> High-quality removals for the rest']
    },
    'carbon-neutral': {
      def: 'Balances carbon dioxide emissions alone through offsets, with no requirement for emissions reductions along a defined scientific pathway. The loosest of the four terms.',
      tags: ['<i class="fa-solid fa-cloud"></i> CO₂ only', '<i class="fa-solid fa-circle-question"></i> No reduction pathway required']
    },
    'climate-neutral': {
      def: 'The broadest term: zero net impact on the climate system across all greenhouse gases and other climate-forcing factors, including those not captured by standard carbon accounting.',
      tags: ['<i class="fa-solid fa-globe"></i> All climate-forcing factors', '<i class="fa-solid fa-ruler"></i> Broadest, least standardised term']
    }
  };
  var termChips = document.querySelectorAll('.term-chip');
  var termDef = document.getElementById('term-def');
  var termReq = document.getElementById('term-req');
  termChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      termChips.forEach(function (c) { c.classList.remove('active'); c.setAttribute('aria-selected', 'false'); });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      var d = termData[this.getAttribute('data-term')];
      if (!d || !termDef || !termReq) return;
      termDef.textContent = d.def;
      termReq.innerHTML = d.tags.map(function (t) { return '<span class="term-req-tag">' + t + '</span>'; }).join('');
    });
  });

  // SCOPE BREAKDOWN
  var scopeData = {
    '12': {
      title: 'Scope 1 + 2: what a company directly controls',
      text: 'Scope 1 covers direct emissions from sources an organisation owns or operates: furnaces, vehicles, on-site processes. Scope 2 covers indirect emissions from purchased energy, mainly electricity and heat. Together these are the easiest emissions to measure and the ones most net-zero plans tackle first.'
    },
    '3': {
      title: 'Scope 3: everything else in the value chain',
      text: 'Emissions from purchased materials, logistics, and how customers use the product: a car’s lifetime tailpipe emissions, a bank’s loan portfolio, an airline’s aircraft manufacturing. Real and significant, but the hardest to measure, verify, and control. A 2024 SBTi report found roughly half of participating companies cite Scope 3 complexity as their primary obstacle to setting science-aligned targets.'
    }
  };
  var scopeSegs = document.querySelectorAll('.scope-seg');
  var scopeTitle = document.getElementById('scope-title');
  var scopeText = document.getElementById('scope-text');
  function setScope(key) {
    var d = scopeData[key];
    if (!d) return;
    scopeSegs.forEach(function (s) { s.classList.toggle('active', s.getAttribute('data-scope') === key); });
    scopeTitle.textContent = d.title;
    scopeText.textContent = d.text;
  }
  scopeSegs.forEach(function (seg) {
    seg.addEventListener('click', function () { setScope(this.getAttribute('data-scope')); });
    seg.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setScope(this.getAttribute('data-scope')); }
    });
  });

  // OFFSET COMPARATOR BARS (animate in on scroll)
  var offsetFills = document.querySelectorAll('.offset-fill');
  if (offsetFills.length) {
    var offObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var w = e.target.getAttribute('data-width');
          e.target.style.width = (reduced ? w : 0) + '%';
          if (!reduced) requestAnimationFrame(function () { e.target.style.width = w + '%'; });
          offObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    offsetFills.forEach(function (f) { offObs.observe(f); });
  }

  // CASE STUDY LOOP STAGES
  document.querySelectorAll('.loop-stage').forEach(function (stage) {
    function toggle() {
      var open = stage.getAttribute('aria-expanded') === 'true';
      stage.parentElement.querySelectorAll('.loop-stage').forEach(function (s) { s.setAttribute('aria-expanded', 'false'); });
      stage.setAttribute('aria-expanded', open ? 'false' : 'true');
    }
    stage.addEventListener('click', toggle);
    stage.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });

  // TIMING QUIZ + DUEL BAR
  var quizOpts = document.querySelectorAll('#timing-quiz .quiz-opt');
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
          ? 'Correct. Delay roughly doubles the required pace: 7.5% a year if the world acts now, versus 15% a year between 2030 and 2035 if it waits.'
          : 'Not quite. Delaying to 2030 roughly doubles the pace required afterward: from 7.5% a year to 15% a year.';
      }
      if (duelWrap) duelWrap.classList.add('revealed');
    });
  });

  // TABLE TOOLTIPS
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
  var tabBtns = document.querySelectorAll('.tab-btn');
  var tabPanels = document.querySelectorAll('.tab-panel');
  function staggerBullets(panel) {
    var items = panel.querySelectorAll('li');
    items.forEach(function (li) { li.classList.remove('vis'); });
    if (reduced) items.forEach(function (li) { li.classList.add('vis'); });
    else items.forEach(function (li, i) { setTimeout(function () { li.classList.add('vis'); }, i * 60); });
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
  var firstPanel = document.getElementById('tab-meaningful');
  if (firstPanel) setTimeout(function () { staggerBullets(firstPanel); }, 350);

  // BIBLIOGRAPHY ACCORDION
  var bibBtn = document.getElementById('bib-toggle');
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

  // CARBON BUDGET BURN-DOWN
  var budgetBtn = document.getElementById('budget-run-btn');
  var budgetFill = document.getElementById('budget-fill');
  var budgetNum = document.getElementById('budget-num');
  var budgetYears = document.getElementById('budget-years');
  var BUDGET_TOTAL = 200;
  var BUDGET_RATE = 57.7;
  var BUDGET_YEARS_LEFT = BUDGET_TOTAL / BUDGET_RATE;
  if (budgetBtn) {
    budgetBtn.addEventListener('click', function () {
      budgetBtn.disabled = true;
      budgetBtn.innerHTML = '<i class="fa-solid fa-hourglass-half"></i> Burning down...';
      budgetFill.style.transition = 'none';
      budgetFill.style.width = '100%';
      budgetNum.textContent = BUDGET_TOTAL + ' GtCO₂';
      budgetYears.textContent = '~' + BUDGET_YEARS_LEFT.toFixed(1) + ' years left';

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          budgetFill.style.transition = reduced ? 'none' : 'width ' + BUDGET_YEARS_LEFT.toFixed(2) + 's linear';
          budgetFill.style.width = '0%';
        });
      });

      var duration = reduced ? 0 : BUDGET_YEARS_LEFT * 1000;
      var start = null;
      function tick(ts) {
        if (!start) start = ts;
        var elapsed = ts - start;
        var prog = Math.min(elapsed / duration, 1);
        var remaining = BUDGET_TOTAL * (1 - prog);
        var yearsLeft = BUDGET_YEARS_LEFT * (1 - prog);
        budgetNum.textContent = Math.max(remaining, 0).toFixed(0) + ' GtCO₂';
        budgetYears.textContent = '~' + Math.max(yearsLeft, 0).toFixed(1) + ' years left';
        if (prog < 1) requestAnimationFrame(tick);
        else {
          budgetNum.textContent = '0 GtCO₂';
          budgetYears.textContent = 'Budget exhausted';
          budgetBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Run again';
          budgetBtn.disabled = false;
        }
      }
      requestAnimationFrame(tick);
    });
  }

  // ============================================================
  // EMISSIONS TRAJECTORY CHART
  // Anchor points below are grounded in figures explicitly stated
  // in the source blog: the 2024 record of 57.7 GtCO2e, and the
  // ~27 Gt gap between the pledges trajectory and the 1.5C-required
  // trajectory at 2030 (55 - 28 = 27). Historical shape reflects the
  // well-documented rise in global GHG emissions with the 2020
  // pandemic dip. The 2025-2050 pathways are illustrative scenario
  // trajectories consistent with the cited sources (UNEP, IPCC AR6,
  // IEA), not a digitisation of the original chart's exact curve.
  // ============================================================
  var chartWrap = document.getElementById('chart-svg-wrap');
  if (!chartWrap) return;

  var SERIES = [
    {
      key: 'historical', label: 'Historical', color: '#141c14', dash: null, width: 2.75,
      data: [[2000,38],[2005,43],[2010,47],[2015,50],[2019,52.5],[2020,49],[2021,52.5],[2022,54.5],[2023,57.1],[2024,57.7]]
    },
    {
      key: 'currentPolicies', label: 'Current Policies (~2.8°C)', color: '#b91c1c', dash: '6,4', width: 2.25,
      data: [[2024,57.7],[2030,60],[2035,61.5],[2040,63],[2045,64.5],[2050,65.5]]
    },
    {
      key: 'pledges', label: 'NDC / Pledges (~2.6°C)', color: '#e07b2a', dash: '6,4', width: 2.25,
      data: [[2024,57.7],[2030,55],[2035,50],[2040,44],[2045,37],[2050,30]]
    },
    {
      key: 'pathway2c', label: '2°C Pathway', color: '#2563eb', dash: null, width: 2.25,
      data: [[2024,57.7],[2030,42],[2035,32],[2040,23],[2045,15],[2050,9]]
    },
    {
      key: 'pathway15c', label: '1.5°C Pathway', color: '#12803a', dash: null, width: 2.5,
      data: [[2024,57.7],[2030,28],[2035,17],[2040,9],[2045,4],[2050,1]]
    }
  ];

  var YEAR_MIN = 2000, YEAR_MAX = 2050;
  var VAL_MIN = 0, VAL_MAX = 70;
  var W = 760, H = 400;
  var PAD_L = 42, PAD_R = 14, PAD_T = 46, PAD_B = 34;
  var plotW = W - PAD_L - PAD_R;
  var plotH = H - PAD_T - PAD_B;

  function xScale(year) { return PAD_L + ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * plotW; }
  function yScale(val) { return PAD_T + plotH - ((val - VAL_MIN) / (VAL_MAX - VAL_MIN)) * plotH; }

  function interpolate(data, year) {
    if (year <= data[0][0]) return data[0][1];
    if (year >= data[data.length - 1][0]) return data[data.length - 1][1];
    for (var i = 0; i < data.length - 1; i++) {
      var a = data[i], b = data[i + 1];
      if (year >= a[0] && year <= b[0]) {
        var t = (year - a[0]) / (b[0] - a[0]);
        return a[1] + t * (b[1] - a[1]);
      }
    }
    return null;
  }

  var svgNS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs) {
    var e = document.createElementNS(svgNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': 'Global greenhouse gas emissions, historical and projected, 2000 to 2050' });

  // Gridlines + Y axis labels
  for (var gv = VAL_MIN; gv <= VAL_MAX; gv += 10) {
    var gy = yScale(gv);
    svg.appendChild(el('line', { x1: PAD_L, x2: W - PAD_R, y1: gy, y2: gy, stroke: '#e8ede8', 'stroke-width': 1 }));
    var lbl = el('text', { x: PAD_L - 8, y: gy + 3, 'font-size': 9, fill: '#6b7280', 'text-anchor': 'end', 'font-family': 'inherit' });
    lbl.textContent = gv;
    svg.appendChild(lbl);
  }
  // X axis labels
  for (var gyr = YEAR_MIN; gyr <= YEAR_MAX; gyr += 10) {
    var gx = xScale(gyr);
    svg.appendChild(el('line', { x1: gx, x2: gx, y1: PAD_T, y2: H - PAD_B, stroke: '#f2f5f2', 'stroke-width': 1 }));
    var xlbl = el('text', { x: gx, y: H - PAD_B + 16, 'font-size': 9, fill: '#6b7280', 'text-anchor': 'middle', 'font-family': 'inherit' });
    xlbl.textContent = gyr;
    svg.appendChild(xlbl);
  }

  // Axis title
  var yTitle = el('text', { x: 10, y: PAD_T - 14, 'font-size': 9, fill: '#6b7280', 'font-family': 'inherit' });
  yTitle.textContent = 'GtCO₂e / year';
  svg.appendChild(yTitle);

  // "Today" marker (2025)
  var todayX = xScale(2025);
  svg.appendChild(el('line', { x1: todayX, x2: todayX, y1: PAD_T, y2: H - PAD_B, stroke: '#9ca3af', 'stroke-width': 1.25, 'stroke-dasharray': '3,3' }));
  var todayLbl = el('text', { x: todayX + 5, y: PAD_T + 9, 'font-size': 9, fill: '#6b7280', 'font-family': 'inherit', 'font-weight': 700 });
  todayLbl.textContent = 'Today';
  svg.appendChild(todayLbl);

  // Series paths + dots
  var pathEls = {};
  var dotGroups = {};
  SERIES.forEach(function (s) {
    var d = 'M ' + s.data.map(function (pt) { return xScale(pt[0]) + ' ' + yScale(pt[1]); }).join(' L ');
    var attrs = { d: d, fill: 'none', stroke: s.color, 'stroke-width': s.width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
    if (s.dash) attrs['stroke-dasharray'] = s.dash;
    var path = el('path', attrs);
    path.classList.add('series-path');
    path.dataset.series = s.key;
    svg.appendChild(path);
    pathEls[s.key] = path;

    var g = el('g', {});
    g.dataset.series = s.key;
    s.data.forEach(function (pt) {
      g.appendChild(el('circle', { cx: xScale(pt[0]), cy: yScale(pt[1]), r: 2.6, fill: s.color }));
    });
    svg.appendChild(g);
    dotGroups[s.key] = g;
  });

  // Record annotation (2024, 57.7)
  var rx = xScale(2024), ry = yScale(57.7);
  svg.appendChild(el('circle', { cx: rx, cy: ry, r: 4.2, fill: '#fff', stroke: '#141c14', 'stroke-width': 2 }));
  var recLbl1 = el('text', { x: rx - 6, y: ry - 26, 'font-size': 9.5, fill: '#141c14', 'text-anchor': 'end', 'font-weight': 700, 'font-family': 'inherit' });
  recLbl1.textContent = 'Record: 57.7 Gt (2024)';
  svg.appendChild(recLbl1);
  svg.appendChild(el('line', { x1: rx - 4, y1: ry - 22, x2: rx - 1, y2: ry - 4, stroke: '#141c14', 'stroke-width': 1 }));

  // Gap bracket at 2030 (pledges 55 -> 1.5C 28 = 27 Gt gap)
  var gx2030 = xScale(2030);
  var gy55 = yScale(55), gy28 = yScale(28);
  var bx = gx2030 + 16;
  svg.appendChild(el('line', { x1: bx, x2: bx, y1: gy55, y2: gy28, stroke: '#7c3aed', 'stroke-width': 1.5 }));
  svg.appendChild(el('line', { x1: bx - 4, x2: bx + 4, y1: gy55, y2: gy55, stroke: '#7c3aed', 'stroke-width': 1.5 }));
  svg.appendChild(el('line', { x1: bx - 4, x2: bx + 4, y1: gy28, y2: gy28, stroke: '#7c3aed', 'stroke-width': 1.5 }));
  var gapLbl = el('text', { x: bx + 7, y: (gy55 + gy28) / 2 + 3, 'font-size': 9, fill: '#7c3aed', 'font-weight': 700, 'font-family': 'inherit' });
  gapLbl.textContent = '~27 Gt gap';
  svg.appendChild(gapLbl);

  // Hover guideline + capture rect
  var hoverLine = el('line', { x1: 0, x2: 0, y1: PAD_T, y2: H - PAD_B, stroke: '#9ca3af', 'stroke-width': 1, 'stroke-dasharray': '2,3', opacity: 0 });
  svg.appendChild(hoverLine);
  var captureRect = el('rect', { x: PAD_L, y: PAD_T, width: plotW, height: plotH, fill: 'transparent' });
  svg.appendChild(captureRect);

  chartWrap.insertBefore(svg, document.getElementById('chart-tooltip'));

  // LEGEND
  var legendWrap = document.getElementById('chart-legend');
  var hidden = {};
  SERIES.forEach(function (s) {
    var chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chart-chip';
    chip.dataset.series = s.key;
    var swatch = document.createElement('span');
    swatch.className = 'chip-swatch';
    swatch.style.background = s.color;
    if (s.dash) swatch.style.borderTop = '2px dashed ' + s.color;
    chip.appendChild(swatch);
    chip.appendChild(document.createTextNode(s.label));
    chip.addEventListener('click', function () {
      var key = this.dataset.series;
      hidden[key] = !hidden[key];
      this.classList.toggle('off', hidden[key]);
      pathEls[key].style.display = hidden[key] ? 'none' : '';
      dotGroups[key].style.display = hidden[key] ? 'none' : '';
    });
    legendWrap.appendChild(chip);
  });

  // TOOLTIP
  var tooltip = document.getElementById('chart-tooltip');
  function updateTooltip(clientX, clientY) {
    var rect = svg.getBoundingClientRect();
    var relX = clientX - rect.left;
    var svgX = (relX / rect.width) * W;
    var year = Math.round(YEAR_MIN + ((svgX - PAD_L) / plotW) * (YEAR_MAX - YEAR_MIN));
    year = Math.max(YEAR_MIN, Math.min(YEAR_MAX, year));

    var lineX = xScale(year);
    hoverLine.setAttribute('x1', lineX);
    hoverLine.setAttribute('x2', lineX);
    hoverLine.setAttribute('opacity', 1);

    var rowsHtml = '';
    SERIES.forEach(function (s) {
      if (hidden[s.key]) return;
      if (year < s.data[0][0] || year > s.data[s.data.length - 1][0]) return;
      var v = interpolate(s.data, year);
      rowsHtml += '<div class="tt-row"><span class="tt-dot" style="background:' + s.color + '"></span>' + s.label.replace(/\s*\(.*?\)/, '') + ': <strong>' + v.toFixed(1) + ' Gt</strong></div>';
    });
    tooltip.innerHTML = '<span class="tt-year">' + year + '</span>' + rowsHtml;
    tooltip.classList.add('show');

    var wrapRect = chartWrap.getBoundingClientRect();
    var pt = svg.createSVGPoint();
    pt.x = lineX; pt.y = PAD_T;
    var screenPt = pt.matrixTransform(svg.getScreenCTM());
    var left = screenPt.x - wrapRect.left;
    var top = screenPt.y - wrapRect.top;
    left = Math.max(30, Math.min(wrapRect.width - 30, left));
    tooltip.style.left = left + 'px';
    tooltip.style.top = Math.max(top, 20) + 'px';
  }
  function hideTooltip() {
    tooltip.classList.remove('show');
    hoverLine.setAttribute('opacity', 0);
  }

  captureRect.addEventListener('pointermove', function (e) { updateTooltip(e.clientX, e.clientY); });
  captureRect.addEventListener('pointerdown', function (e) { updateTooltip(e.clientX, e.clientY); });
  captureRect.addEventListener('pointerleave', hideTooltip);
  captureRect.style.cursor = 'crosshair';
});
