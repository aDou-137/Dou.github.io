// ============================================
// Dou's Space - Liquid Glass Interactions
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initScrollAnimations();
  initNavbar();
  initPageTransitions();
  initLiquidShimmer();
  initReadingProgress();
  initBackToTop();
  initDynamicGreeting();
  initReadingTime();
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
// Reading Progress Bar
// ============================================
function initReadingProgress() {
  const articleBody = document.querySelector('.article-body');
  if (!articleBody) return;

  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const rect = articleBody.getBoundingClientRect();
    const articleTop = rect.top + window.scrollY;
    const articleHeight = articleBody.offsetHeight;
    const windowHeight = window.innerHeight;
    const scrolled = window.scrollY - articleTop + windowHeight * 0.3;
    const progress = Math.min(Math.max(scrolled / articleHeight * 100, 0), 100);
    progressBar.style.width = progress + '%';
  }, { passive: true });
}

// ============================================
// Back to Top Button
// ============================================
function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.innerHTML = '↑';
  btn.setAttribute('aria-label', '回到顶部');
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============================================
// Dynamic Greeting (Hero Section)
// ============================================
function initDynamicGreeting() {
  const heroDate = document.querySelector('.hero-date');
  if (!heroDate) return;

  const hour = new Date().getHours();
  let greeting, emoji;

  if (hour >= 5 && hour < 9) {
    greeting = '早安';
    emoji = '🌅';
  } else if (hour >= 9 && hour < 12) {
    greeting = '上午好';
    emoji = '☀️';
  } else if (hour >= 12 && hour < 14) {
    greeting = '午安';
    emoji = '🌤️';
  } else if (hour >= 14 && hour < 18) {
    greeting = '下午好';
    emoji = '🌇';
  } else if (hour >= 18 && hour < 22) {
    greeting = '晚上好';
    emoji = '🌙';
  } else {
    greeting = '夜深了';
    emoji = '✨';
  }

  heroDate.innerHTML = `<span class="greeting-emoji">${emoji}</span> ${greeting}`;
}

// ============================================
// Estimated Reading Time
// ============================================
function initReadingTime() {
  const articleBody = document.querySelector('.article-body');
  if (!articleBody) return;

  // Count Chinese characters + English words
  const text = articleBody.textContent || '';
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = (text.replace(/[\u4e00-\u9fff]/g, ' ').match(/[a-zA-Z]+/g) || []).length;
  const totalWords = chineseChars + englishWords;
  const readingTime = Math.max(1, Math.ceil(totalWords / 400)); // ~400 words per minute

  // Insert reading time into article meta
  const articleMeta = document.querySelector('.article-header .article-meta');
  if (articleMeta) {
    const timeSpan = document.createElement('span');
    timeSpan.className = 'reading-time';
    timeSpan.textContent = `${readingTime} 分钟阅读`;
    articleMeta.appendChild(timeSpan);
  }
}

// ============================================
// Article Card Click-to-Navigate
// First click: reveal "阅读全文" button
// Second click (on button): navigate to article
// ============================================
function initArticleCards() {
  document.querySelectorAll('.article-card[data-href]').forEach(card => {
    card.addEventListener('click', (e) => {
      // If clicking on the read-more link, let it navigate naturally
      if (e.target.closest('.read-more')) return;

      // If card already activated, allow click-through to title link
      if (card.classList.contains('card-activated')) {
        const titleLink = card.querySelector('.article-title a');
        if (titleLink && !e.target.closest('a')) {
          e.preventDefault();
          document.body.style.opacity = '0';
          setTimeout(() => {
            window.location.href = card.getAttribute('data-href');
          }, 300);
        }
        return;
      }

      // First click: activate card, show read-more button
      e.preventDefault();
      e.stopPropagation();
      card.classList.add('card-activated');

      // Remove activation from other cards
      document.querySelectorAll('.article-card.card-activated').forEach(other => {
        if (other !== card) other.classList.remove('card-activated');
      });
    });
  });

  // Click outside to deactivate
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.article-card')) {
      document.querySelectorAll('.article-card.card-activated').forEach(card => {
        card.classList.remove('card-activated');
      });
    }
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
