// ============================================
// Dou's Space — 纸上墨 交互
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavScroll();
  initHamburger();
  initReveal();
  initPageTransitions();
  initGreeting();
  initHeroQuote();
  initTypingEffect();
  initPostCount();
  initPostIndex();
  initReadingTime();
  initReadingProgress();
  initBackToTop();
});

// ---------- 主题 ----------
function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const saved = localStorage.getItem('dou-theme') || 'light';
  setTheme(saved, false);
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(current === 'dark' ? 'light' : 'dark', true);
  });
}

function setTheme(theme, animate) {
  if (animate) {
    document.documentElement.classList.add('theme-transitioning');
    setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 600);
  }
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('dou-theme', theme); } catch (e) {}

  const label = document.querySelector('.theme-toggle-label');
  if (label) label.textContent = theme === 'dark' ? '昼' : '夜';
  const toggle = document.getElementById('themeToggle');
  if (toggle) toggle.setAttribute('aria-label', theme === 'dark' ? '切换到日间主题' : '切换到夜间主题');

  // 同步 Giscus 主题
  const giscusFrame = document.querySelector('.giscus-comments iframe');
  if (giscusFrame && giscusFrame.contentWindow) {
    giscusFrame.contentWindow.postMessage(
      { giscus: { setConfig: { theme: theme === 'dark' ? 'dark' : 'light' } } },
      'https://giscus.app'
    );
  }
}

// ---------- 导航滚动状态 ----------
function initNavScroll() {
  const nav = document.getElementById('siteNav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ---------- 移动端菜单 ----------
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('navMenu');
  if (!hamburger || !menu) return;

  const toggleMenu = (open) => {
    const isOpen = open !== undefined ? open : !menu.classList.contains('open');
    menu.classList.toggle('open', isOpen);
    hamburger.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    hamburger.setAttribute('aria-expanded', String(isOpen));
  };

  hamburger.addEventListener('click', () => toggleMenu());
  menu.querySelectorAll('.nav-link').forEach(link =>
    link.addEventListener('click', () => toggleMenu(false))
  );
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleMenu(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 720) toggleMenu(false);
  });
}

// ---------- 入场动画 ----------
function initReveal() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll(
    '.hero, .section-head, .post-row, .archive-year, .archive-row, ' +
    '.about-section, .article-header, .article-body > *, .comments, .post-nav, .page-404 > *'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  let groupIndex = 0;
  let lastParent = null;
  targets.forEach((el) => {
    el.classList.add('reveal');
    // 同一组内的元素做轻微错落
    const parent = el.parentElement;
    if (parent !== lastParent) { groupIndex = 0; lastParent = parent; }
    el.style.transitionDelay = `${Math.min(groupIndex * 0.07, 0.42)}s`;
    groupIndex++;
    observer.observe(el);
  });
}

// ---------- 页面过渡 ----------
function initPageTransitions() {
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || link.target === '_blank') return;

    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      document.body.style.opacity = '0';
      window.setTimeout(() => { window.location.href = href; }, 260);
    });
  });
}

// ---------- 问候语 + 日期 ----------
function initGreeting() {
  const el = document.getElementById('greeting');
  if (!el) return;
  const hour = new Date().getHours();
  const map = [
    [0, 5, '夜深了'], [5, 9, '早安'], [9, 12, '上午好'],
    [12, 14, '午安'], [14, 18, '下午好'], [18, 24, '晚上好'],
  ];
  const hit = map.find(([a, b]) => hour >= a && hour < b);
  el.textContent = hit ? hit[2] : '欢迎';

  const dateEl = document.getElementById('heroDate');
  if (dateEl) {
    const d = new Date();
    const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
    dateEl.textContent = `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 · 星期${week}`;
  }
}

// ---------- 随机一言 ----------
function initHeroQuote() {
  const el = document.getElementById('heroQuote');
  if (!el) return;
  const quotes = [
    '生活不是等待暴风雨过去，而是学会在雨中翩翩起舞。',
    '世界上只有一种英雄主义，就是认清生活的真相后依然热爱它。',
    '温柔地对待自己，你也不过是宇宙中一个努力发光的孩子。',
    '所有的大人都曾经是小孩，虽然，只有少数人记得。',
    '人间值得，未来可期。',
    '你不能把这个世界让给你所鄙视的人。',
    '慢慢来，比较快。',
    '凡是过往，皆为序章。',
    '种一棵树最好的时间是十年前，其次是现在。',
    '你不需要很厉害才能开始，但你需要开始才能变得很厉害。',
    '日子很长，不必慌张。',
    '保持热爱，奔赴山海。',
  ];
  el.textContent = quotes[Math.floor(Math.random() * quotes.length)];
}

// ---------- 打字机 ----------
function initTypingEffect() {
  const el = document.getElementById('heroTagline');
  if (!el) return;
  const fullText = el.textContent.trim();
  el.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  el.appendChild(cursor);

  let i = 0;
  const speed = 75;
  const typeNext = () => {
    if (i < fullText.length) {
      el.insertBefore(document.createTextNode(fullText.charAt(i)), cursor);
      i++;
      setTimeout(typeNext, speed + Math.random() * 35);
    } else {
      setTimeout(() => {
        cursor.style.animation = 'none';
        cursor.style.opacity = '0';
        cursor.style.transition = 'opacity 0.5s ease';
      }, 2200);
    }
  };
  setTimeout(typeNext, 550);
}

// ---------- 文章计数 / 序号 ----------
function initPostCount() {
  const el = document.getElementById('postCount');
  if (!el) return;
  const count = document.querySelectorAll('.post-row').length;
  if (count) el.textContent = String(count).padStart(2, '0');
}

function initPostIndex() {
  document.querySelectorAll('.post-rows .post-row').forEach((row, i) => {
    const index = document.createElement('span');
    index.className = 'post-index';
    index.setAttribute('aria-hidden', 'true');
    index.textContent = String(i + 1).padStart(2, '0');
    row.prepend(index);
  });
}

// ---------- 阅读时间 ----------
function initReadingTime() {
  const body = document.querySelector('.article-body');
  const target = document.getElementById('readingTime');
  if (!body || !target) return;

  const text = body.textContent || '';
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = (text.replace(/[\u4e00-\u9fff]/g, ' ').match(/[a-zA-Z]+/g) || []).length;
  const minutes = Math.max(1, Math.ceil((chineseChars + englishWords) / 400));
  target.textContent = `${minutes} 分钟阅读`;
}

// ---------- 阅读进度 ----------
function initReadingProgress() {
  const articleBody = document.querySelector('.article-body');
  if (!articleBody) return;

  const bar = document.createElement('div');
  bar.className = 'reading-progress';
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const rect = articleBody.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const height = articleBody.offsetHeight;
    const scrolled = window.scrollY - top + window.innerHeight * 0.3;
    const progress = Math.min(Math.max(scrolled / height * 100, 0), 100);
    bar.style.width = progress + '%';
  }, { passive: true });
}

// ---------- 回到顶部 ----------
function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.innerHTML = '↑';
  btn.setAttribute('aria-label', '回到顶部');
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
