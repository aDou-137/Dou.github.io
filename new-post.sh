#!/bin/bash
# 用法: ./new-post.sh "文章标题"
# 会在 posts/ 下创建文章，更新首页和归档页，然后推送
# 提示：发布后如需同步 RSS，请手动更新 feed.xml

set -e

TITLE="$1"
if [ -z "$TITLE" ]; then
  echo "用法: ./new-post.sh \"文章标题\""
  exit 1
fi

DATE=$(date +%Y-%m-%d)
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed "s/['\"]//g" | sed 's/[^a-z0-9\-]//g')
FILE="posts/${SLUG}.html"

if [ -f "$FILE" ]; then
  echo "错误: $FILE 已存在"
  exit 1
fi

# 1. 创建文章
cat > "$FILE" <<EOF
<!DOCTYPE html>
<html lang="zh-CN" class="locked">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script>try{if(localStorage.getItem('dou-unlocked-v1'))document.documentElement.classList.remove('locked')}catch(e){}</script>
  <title>${TITLE} - Dou's Space</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="alternate" type="application/rss+xml" title="RSS" href="/feed.xml">
  <meta name="description" content="在这里写摘要...">
  <meta property="og:title" content="${TITLE}">
  <meta property="og:description" content="在这里写摘要...">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://zhzxyw.space/${FILE%.html}">
  <meta property="og:site_name" content="Dou's Space">
  <meta name="twitter:card" content="summary">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <header class="site-nav" id="siteNav">
    <a class="brand" href="/">
      <span class="brand-seal" aria-hidden="true">D</span>
      <span class="brand-name">Dou's Space</span>
    </a>
    <nav class="nav-menu" id="navMenu">
      <a class="nav-link" href="/">首页</a>
      <a class="nav-link" href="/archive">归档</a>
      <a class="nav-link" href="/about">关于</a>
    </nav>
    <div class="nav-actions">
      <button class="theme-toggle" id="themeToggle" aria-label="切换主题">
        <span class="theme-toggle-label">夜</span>
      </button>
      <button class="hamburger" id="hamburger" aria-label="菜单" aria-expanded="false">
        <span></span><span></span>
      </button>
    </div>
  </header>

  <main class="wrap">
    <a class="back-link" href="/">← 返回首页</a>
    <article class="article">
      <header class="article-header">
        <p class="article-meta">
          <time datetime="${DATE}">${DATE}</time>
          <span class="dot">·</span><span>随笔</span>
          <span class="dot">·</span><span id="readingTime">1 分钟阅读</span>
        </p>
        <h1 class="article-title">${TITLE}</h1>
      </header>

      <div class="article-body">
        <p class="article-lead">在这里写摘要...</p>

        <p>在这里写正文...</p>
      </div>

      <p class="article-end">— End —</p>
    </article>

    <section class="comments">
      <h2 class="comments-title">评论</h2>
      <div class="giscus-comments">
        <script src="https://giscus.app/client.js"
          data-repo="aDou-137/Dou.github.io"
          data-repo-id="R_kgDOSlYlhQ"
          data-category="Announcements"
          data-category-id="DIC_kwDOSlYlhc4C9qTZ"
          data-mapping="pathname"
          data-strict="0"
          data-reactions-enabled="1"
          data-emit-metadata="0"
          data-input-position="top"
          data-theme="preferred_color_scheme"
          data-lang="zh-CN"
          crossorigin="anonymous"
          async>
        </script>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <p class="footer-copy">© 2026 Dou's Space</p>
    <p class="footer-links">
      <a href="/feed.xml">RSS</a>
      <a href="https://github.com/aDou-137" target="_blank" rel="noopener">GitHub</a>
      <button class="footer-lock" data-lock-btn>锁定本站</button>
    </p>
    <p class="footer-note">Powered by GitHub Pages</p>
  </footer>

  <noscript><div class="nojs-note">本站需要启用 JavaScript 并输入访问密码。</div></noscript>
  <script src="/lock.js"></script>
  <script src="/script.js"></script>
</body>
</html>
EOF

# 2. 更新首页（在标记处插入新文章，排在最前）
sed -i "/<!-- new-post-insert -->/a\\
\\
      <a class=\"post-row\" href=\"/${FILE%.html}\">\\
        <span class=\"post-date\">${DATE}</span>\\
        <div class=\"post-main\">\\
          <h3 class=\"post-title\">${TITLE}</h3>\\
          <p class=\"post-excerpt\">点击阅读...</p>\\
          <p class=\"post-meta\">随笔 · 1 分钟阅读</p>\\
        </div>\\
        <span class=\"post-arrow\" aria-hidden=\"true\">→</span>\\
      </a>" index.html

# 3. 更新归档页（在标记处插入，排在最前）
sed -i "/<!-- new-post-insert -->/a\\
\\
        <a class=\"archive-row\" href=\"/${FILE%.html}\">\\
          <span class=\"post-date\">${DATE}</span>\\
          <span class=\"post-title\">${TITLE}</span>\\
          <span class=\"post-arrow\" aria-hidden=\"true\">→</span>\\
        </a>" archive.html

# 4. 推送
git add -A
git commit -m "post: ${TITLE}"
git push

echo ""
echo "✅ 文章已发布: https://zhzxyw.space/${FILE%.html}"
