// ============================================
// Dou's Space - Liquid Glass Interactions
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initScrollAnimations();
  initNavbar();
  initPageTransitions();
  initLiquidShimmer();
});

// ============================================
// Theme Toggle
// ============================================
function initTheme() {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  // Load saved theme or default to dark
  const saved = localStorage.getItem('dou-theme') || 'dark';
  setTheme(saved, false);

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next, true);
  });
}

function setTheme(theme, animate) {
  if (animate) {
    document.documentElement.classList.add('theme-transitioning');
    setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 600);
  }

  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('dou-theme', theme);

  // Update toggle icon
  const icon = document.querySelector('.theme-toggle-icon');
  if (icon) {
    icon.textContent = theme === 'dark' ? '🌙' : '☀️';
  }

  // Update Giscus theme if present
  const giscusFrame = document.querySelector('.giscus-comments iframe');
  if (giscusFrame) {
    giscusFrame.contentWindow.postMessage(
      { giscus: { setConfig: { theme: theme === 'dark' ? 'dark' : 'light' } } },
      'https://giscus.app'
    );
  }
}

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
    const isDark = !document.documentElement.getAttribute('data-theme') ||
                   document.documentElement.getAttribute('data-theme') === 'dark';

    if (currentScroll > 50) {
      nav.style.background = isDark
        ? 'rgba(10, 10, 25, 0.85)'
        : 'rgba(255, 255, 255, 0.7)';
      nav.style.borderBottomColor = isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.08)';
    } else {
      nav.style.background = '';
      nav.style.borderBottomColor = '';
    }

    lastScroll = currentScroll;
  }, { passive: true });
}

// ============================================
// Page Transitions
// ============================================
function initPageTransitions() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s ease';

  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;
    // Skip links that are handled by card click
    if (link.closest('.article-card[data-href]') && link.classList.contains('read-more')) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.style.opacity = '0';
      setTimeout(() => {
        window.location.href = href;
      }, 300);
    });
  });
}

// ============================================
// Liquid Glass - Dynamic Shimmer on Mouse Move
// ============================================
function initLiquidShimmer() {
  const cards = document.querySelectorAll('.glass-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Move the refraction highlight to follow cursor
      const afterEl = card.querySelector(':after') || card;
      card.style.setProperty('--shimmer-x', `${x}%`);
      card.style.setProperty('--shimmer-y', `${y}%`);
    });
  });

  // Add dynamic shimmer CSS
  const style = document.createElement('style');
  style.textContent = `
    .glass-card::after {
      background: radial-gradient(
        ellipse at var(--shimmer-x, 30%) var(--shimmer-y, 20%),
        rgba(255, 255, 255, 0.05) 0%,
        transparent 50%
      ) !important;
    }
  `;
  document.head.appendChild(style);
}

// ============================================
// Article Card Click-to-Navigate
// ============================================
function initArticleCards() {
  document.querySelectorAll('.article-card[data-href]').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't navigate if clicking on an existing link
      if (e.target.closest('a')) return;
      const href = card.getAttribute('data-href');
      if (href) {
        // Page transition effect
        document.body.style.opacity = '0';
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      }
    });
  });
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initArticleCards);

// ============================================
// Click Ripple (subtle)
// ============================================
document.addEventListener('click', (e) => {
  createRipple(e.clientX, e.clientY);
});

function createRipple(x, y) {
  const ripple = document.createElement('div');
  const isDark = !document.documentElement.getAttribute('data-theme') ||
                 document.documentElement.getAttribute('data-theme') === 'dark';
  const color = isDark
    ? 'rgba(167, 139, 250, 0.4)'
    : 'rgba(124, 58, 237, 0.25)';

  ripple.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${color};
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    animation: ripple-out 0.6s ease-out forwards;
  `;
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

// Ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes ripple-out {
    to {
      width: 80px;
      height: 80px;
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleStyle);
