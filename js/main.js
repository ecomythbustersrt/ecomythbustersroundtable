// NAVIGATION TOGGLE
const navToggle = document.querySelector('.nav-toggle');
const nav       = document.querySelector('.site-nav');
const closeNav  = document.querySelector('.close-nav');

if (navToggle) {
  navToggle.addEventListener('click', () => nav.classList.toggle('nav-open'));
}

if (closeNav) {
  closeNav.addEventListener('click', () => nav.classList.remove('nav-open'));
}

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => nav.classList.remove('nav-open'));
});

// ACTIVE NAV LINK
// Marks the current page's nav link as active based on the URL
(function () {
  const path  = window.location.pathname;
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(link => {
    // Remove any class="active" already set in HTML, then re-evaluate
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (!href) return;
    // Normalise both paths to just the filename for comparison
    const linkFile    = href.split('/').pop();
    const currentFile = path.split('/').pop() || 'index.html';
    if (
      linkFile === currentFile ||
      (currentFile === '' && linkFile === 'index.html')
    ) {
      link.classList.add('active');
    }
  });
})();

// SCROLL REVEAL
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.07}s`;
  revealObserver.observe(el);
});

// CONTACT FORM
document.addEventListener('DOMContentLoaded', () => {
  const selectEl      = document.getElementById('subject-select');
  const otherGroup    = document.getElementById('other-subject-group');
  const otherInput    = document.getElementById('other-subject');
  const hiddenSubject = document.getElementById('subject');
  const form          = document.querySelector('.contact-form');

  if (!selectEl) return;

  // Sync the hidden subject field on every change
  function syncSubject() {
    if (selectEl.value === 'other') {
      // Show the custom topic box with a smooth slide-down
      otherGroup.style.display  = 'block';
      // Trigger reflow then animate
      requestAnimationFrame(() => {
        otherGroup.style.maxHeight = '120px';
        otherGroup.style.opacity   = '1';
      });
      otherInput.required       = true;
      hiddenSubject.value       = otherInput.value.trim() || '';
    } else {
      // Hide with slide-up
      otherGroup.style.maxHeight = '0';
      otherGroup.style.opacity   = '0';
      setTimeout(() => {
        if (selectEl.value !== 'other') otherGroup.style.display = 'none';
      }, 300);
      otherInput.required   = false;
      hiddenSubject.value   = selectEl.value;
    }
  }

  selectEl.addEventListener('change', syncSubject);

  // Keep hidden field in sync as user types their custom topic
  otherInput.addEventListener('input', () => {
    hiddenSubject.value = otherInput.value.trim();
  });

  // On submit, do a final sync & validate
  if (form) {
    form.addEventListener('submit', (e) => {
      if (selectEl.value === 'other' && !otherInput.value.trim()) {
        e.preventDefault();
        otherInput.focus();
        otherInput.style.borderColor = '#dc2626';
        otherInput.placeholder = 'Please enter your topic before sending';
        return;
      }
      // Final sync
      hiddenSubject.value = selectEl.value === 'other'
        ? otherInput.value.trim()
        : selectEl.value;
    });
  }
});

// TYPING CARET
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('hero-heading');
  if (!el) return;

  const spanNodes = Array.from(el.querySelectorAll('span'));
  const segments  = [];

  if (spanNodes.length > 0) {
    spanNodes.forEach(s => segments.push({ node: s, full: s.textContent }));
  } else {
    segments.push({ node: el, full: el.textContent });
  }

  segments.forEach(seg => { seg.node.textContent = ''; });

  const typingSpeed  = 100;
  const initialDelay = 200;
  const fullText     = segments.map(s => s.full).join('');
  let globalIndex    = 0;
  let prevSegNode    = null;

  function typeNext() {
    if (globalIndex < fullText.length) {
      let running = 0;
      for (const seg of segments) {
        if (globalIndex < running + seg.full.length) {
          const charIndex = globalIndex - running;
          if (prevSegNode && prevSegNode !== seg.node) {
            prevSegNode.classList.remove('typing-caret');
          }
          seg.node.classList.add('typing-caret');
          prevSegNode = seg.node;
          seg.node.textContent += seg.full.charAt(charIndex);
          break;
        }
        running += seg.full.length;
      }
      globalIndex += 1;
      setTimeout(typeNext, typingSpeed);
    } else {
      if (prevSegNode) prevSegNode.classList.remove('typing-caret');
    }
  }

  setTimeout(typeNext, initialDelay);
});