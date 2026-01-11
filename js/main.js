let currentSlide = 0;

const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");

function updateCarousel() {
  slides.forEach((slide, index) => {
    slide.classList.toggle("active", index === currentSlide);
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentSlide);
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  updateCarousel();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  updateCarousel();
}

function goToSlide(index) {
  currentSlide = index;
  updateCarousel();
}


// Contact form
function handleContact(e) {
  e.preventDefault();
  alert("Thank you for your message. We'll get back to you soon.");
  e.target.reset();
}

// Navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');

navToggle.addEventListener('click', () => {
    nav.classList.toggle('nav-open');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('nav-open');
    });
});

document.querySelector(".close-nav").addEventListener("click", () => {
  document.querySelector(".site-nav").classList.remove("nav-open");
});

// Typing Caret
document.addEventListener('DOMContentLoaded', () => {
	const el = document.getElementById('hero-heading');
	if (!el) return;
	const spanNodes = Array.from(el.querySelectorAll('span'));
	const segments = [];

	if (spanNodes.length > 0) {
		spanNodes.forEach(s => segments.push({ node: s, full: s.textContent }));
	} else {
		segments.push({ node: el, full: el.textContent });
	}
	segments.forEach(seg => { seg.node.textContent = ''; });
	const typingSpeed = 120;
	const initialDelay = 300;

	const fullText = segments.map(s => s.full).join('');
	let globalIndex = 0;

	let prevSegNode = null;
	function typeNext() {
		if (globalIndex < fullText.length) {
			let running = 0;
			for (const seg of segments) {
				if (globalIndex < running + seg.full.length) {
					const charIndex = globalIndex - running;
					if (prevSegNode && prevSegNode !== seg.node) {
						prevSegNode.classList.remove('typing-caret');
					}
					if (!seg.node.classList.contains('typing-caret')) {
						seg.node.classList.add('typing-caret');
					}
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
