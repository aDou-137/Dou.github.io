#!/bin/bash
# 用法: ./new-post.sh "文章标题"
# 会在 posts/ 下创建文章，更新首页和归档页，然后推送

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
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${TITLE} - Dou's Space</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta name="description" content="在这里写摘要...">
  <meta property="og:title" content="${TITLE}">
  <meta property="og:description" content="在这里写摘要...">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://zhzxyw.space/${FILE%.html}">
  <meta name="twitter:card" content="summary">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div class="bg-wrapper">
    <div class="bg-image"></div>
    <div class="bg-gradient"></div>
    <div class="floating-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>
  </div>

  <nav class="nav glass">
    <a href="/" class="nav-logo">✦ Dou's Space</a>
    <div class="nav-right">
      <div class="nav-links" id="navLinks">
        <a href="/" class="nav-link">首页</a>
        <a href="/archive" class="nav-link">归档</a>
        <a href="/about" class="nav-link">关于</a>
      </div>
      <button class="theme-toggle" aria-label="切换主题">
        <span class="theme-toggle-icon">🌙</span>
      </button>
      <button class="hamburger" id="hamburger" aria-label="菜单">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
  <div class="nav-overlay" id="navOverlay"></div>

  <main class="container article-page">
    <article class="article-full glass-card">
      <div class="article-header">
        <div class="article-meta">
          <span class="article-date">${DATE}</span>
          <span class="article-tag">随笔</span>
        </div>
        <h1 class="article-full-title">${TITLE}</h1>
      </div>

      <div class="article-body">
        <p class="article-lead">在这里写摘要...</p>

        <p>在这里写正文...</p>

        <p class="article-end">— End —</p>
      </div>
    </article>

    <section class="comments-section glass-card">
      <h2 class="comments-title">💬 评论区</h2>
      <script src="https://giscus.app/client.js"
        data-repo="aDou-137/Dou.github.io"
        data-repo-id="R_kgDOSlYlhQ"
        data-category="Announcements"
        data-category-id="DIC_kwDOSlYlhc4C9qTZ"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="dark"
        data-lang="zh-CN"
        data-loading="lazy"
        crossorigin="anonymous"
        async>
      </script>
    </section>

    <div class="back-link">
      <a href="/" class="back-button glass">← 返回首页</a>
    </div>
  </main>

  <footer class="footer glass">
    <p>&copy; 2026 Dou's Space · Powered by GitHub Pages</p>
  </footer>

  <script src="/script.js"></script>
</body>
</html>
EOF

# 2. 更新首页（在标记处插入新文章卡片）
sed -i "/<!-- new-post-insert -->/a\\
\\
      <article class=\"article-card glass-card\">\\
        <div class=\"article-meta\">\\
          <span class=\"article-date\">${DATE}</span>\\
          <span class=\"article-tag\">随笔</span>\\
        </div>\\
        <h3 class=\"article-title\"><a href=\"/${FILE%.html}\">${TITLE}</a></h3>\\
        <p class=\"article-excerpt\">点击阅读...</p>\\
        <div class=\"article-footer\">\\
          <span class=\"read-more\">阅读全文 →</span>\\
        </div>\\
      </article>" index.html

# 3. 更新归档页（在第一个 </ul> 前插入）
sed -i "/<\\/ul>/i\\
        <li class=\"archive-item\">\\
          <span class=\"archive-date\">${DATE}</span>\\
          <a class=\"archive-title\" href=\"/${FILE%.html}\">${TITLE}</a>\\
        </li>" archive.html

# 4. 推送
git add -A
git commit -m "post: ${TITLE}"
git push

echo ""
echo "✅ 文章已发布: https://zhzxyw.space/${FILE%.html}"
