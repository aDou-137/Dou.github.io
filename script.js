// ============================================
// Dou's Space - Interactions
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Scroll-based fade-in animations
  initScrollAnimations();
  
  // Navbar background on scroll
  initNavbar();
  
  // Smooth page transitions
  initPageTransitions();
});

// ============================================
// Scroll Animations
// ============================================
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Add fade-in class to elements
  const animateElements = document.querySelectorAll(
    '.article-card, .section-header, .about-card, .timeline, .comments-section'
  );
  
  animateElements.forEach((el, i) => {
    el.classList.add('fade-in');
    el.style.transitionDelay = `${i * 0.1}s`;
    observer.observe(el);
  });
}

// ============================================
// Navbar
// ============================================
function initNavbar() {
  const nav = document.querySelector('.nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      nav.style.background = 'rgba(10, 10, 25, 0.85)';
      nav.style.borderBottomColor = 'rgba(255, 255, 255, 0.1)';
    } else {
      nav.style.background = 'var(--glass-bg)';
      nav.style.borderBottomColor = 'var(--glass-border)';
    }

    lastScroll = currentScroll;
  }, { passive: true });
}

// ============================================
// Page Transitions
// ============================================
function initPageTransitions() {
  // Add a subtle entrance animation
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s ease';
  
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });

  // Smooth transition for internal links
  document.querySelectorAll('a[href^=""]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.endsWith('.html') && !href.startsWith('http')) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.style.opacity = '0';
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      });
    }
  });
}

// ============================================
// Particle Effect on Click (subtle)
// ============================================
document.addEventListener('click', (e) => {
  createRipple(e.clientX, e.clientY);
});

function createRipple(x, y) {
  const ripple = document.createElement('div');
  ripple.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(167, 139, 250, 0.4);
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    animation: ripple-out 0.6s ease-out forwards;
  `;
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple-out {
    to {
      width: 80px;
      height: 80px;
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
