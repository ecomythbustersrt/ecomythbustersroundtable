document.addEventListener('DOMContentLoaded', function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Force Blogs nav link active (main.js IIFE runs before DOMContentLoaded and clears it)
  document.querySelectorAll('.nav-links a').forEach(function (a) { a.classList.remove('active'); });
  var blogsLink = document.getElementById('blogs-nav-link');
  if (blogsLink) blogsLink.classList.add('active');

  // MYTH / REALITY SWITCH
  var mythBtn = document.getElementById('switch-myth-btn');
  var realityBtn = document.getElementById('switch-reality-btn');
  var mythPanel = document.getElementById('switch-myth-panel');
  var realityPanel = document.getElementById('switch-reality-panel');

  function showPanel(which) {
    var toMyth = which === 'myth';
    mythBtn.classList.toggle('active', toMyth);
    realityBtn.classList.toggle('active', !toMyth);
    mythBtn.setAttribute('aria-selected', toMyth ? 'true' : 'false');
    realityBtn.setAttribute('aria-selected', !toMyth ? 'true' : 'false');
    mythPanel.classList.toggle('active', toMyth);
    realityPanel.classList.toggle('active', !toMyth);
  }
  if (mythBtn && realityBtn) {
    mythBtn.addEventListener('click', function () { showPanel('myth'); });
    realityBtn.addEventListener('click', function () { showPanel('reality'); });
  }

  // ACCORDION CARDS + PROGRESS TRACKER
  var items = document.querySelectorAll('.summary-item[data-item]');
  var total = items.length;
  // Tracks sections ever opened; only ever grows, so re-collapsing a card
  // doesn't decrement the "explored" count.
  var explored = new Set();
  var progressLabel = document.getElementById('progress-label');
  var progressFill = document.getElementById('progress-fill');

  function updateProgress() {
    var count = explored.size;
    progressLabel.textContent = count === total
      ? 'All ' + total + ' sections explored'
      : count + ' of ' + total + ' sections explored';
    progressFill.style.width = (count / total * 100) + '%';
  }

  function setCardOpen(item, open) {
    var card = item.querySelector('[data-card]');
    var head = card.querySelector('.summary-card-head');
    var body = card.querySelector('.summary-card-body');
    card.classList.toggle('open', open);
    item.classList.toggle('opened', open);
    head.setAttribute('aria-expanded', open ? 'true' : 'false');
    body.style.maxHeight = open ? body.scrollHeight + 'px' : '0';
    if (open) explored.add(item);
  }

  function toggleCard(item) {
    var card = item.querySelector('[data-card]');
    setCardOpen(item, !card.classList.contains('open'));
    updateProgress();
  }

  items.forEach(function (item) {
    var head = item.querySelector('.summary-card-head');
    head.addEventListener('click', function () { toggleCard(item); });
  });

  var expandAllBtn = document.getElementById('expand-all-btn');
  var collapseAllBtn = document.getElementById('collapse-all-btn');
  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', function () {
      items.forEach(function (item) { setCardOpen(item, true); });
      updateProgress();
    });
  }
  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', function () {
      items.forEach(function (item) { setCardOpen(item, false); });
      updateProgress();
    });
  }

  // Keep open card heights correct on resize (wrapped text reflow)
  window.addEventListener('resize', function () {
    items.forEach(function (item) {
      var card = item.querySelector('[data-card]');
      if (card.classList.contains('open')) {
        var body = card.querySelector('.summary-card-body');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  updateProgress();
});
