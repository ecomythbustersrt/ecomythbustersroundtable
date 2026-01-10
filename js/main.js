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
