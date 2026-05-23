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
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <a href="/" class="site-title">Dou's Space</a>
      <nav>
        <a href="/">首页</a>
        <a href="/archive">归档</a>
        <a href="/about">关于</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <div class="post-content">
      <h1>${TITLE}</h1>
      <div class="post-meta">${DATE}</div>

      <p>在这里写正文...</p>
    </div>
  </main>

  <footer class="site-footer">
    <div class="container">
      <p>&copy; 2026 Dou's Space · Powered by GitHub Pages</p>
    </div>
  </footer>
</body>
</html>
EOF

# 2. 更新首页（在第一个 </main> 前插入）
sed -i "/<\/main>/i\\
    <article class=\"post-card\">\\
      <h2><a href=\"/${FILE%.html}\">${TITLE}</a></h2>\\
      <div class=\"post-meta\">${DATE}</div>\\
      <p class=\"post-summary\">点击阅读...</p>\\
    </article>" index.html

# 3. 更新归档页（在 </ul> 前插入）
sed -i "/<\/ul>/i\\
        <li>\\
          <span class=\"archive-date\">${DATE}</span>\\
          <a class=\"archive-title\" href=\"/${FILE%.html}\">${TITLE}</a>\\
        </li>" archive.html

# 4. 推送
git add -A
git commit -m "post: ${TITLE}"
git push

echo ""
echo "✅ 文章已发布: https://zhzxyw.space/${FILE%.html}"
