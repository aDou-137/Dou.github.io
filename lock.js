// ============================================
// Dou's Space — 密码门禁
// --------------------------------------------
// ⚠️ 这是"软门禁"：防止路人/搜索引擎随意浏览。
// 正文仍在网页源码里，懂技术的人查看源码仍能看到。
//
// ▸ 修改密码：
//   1. 选一个新密码，例如 my-new-password
//   2. 在终端执行（生成 PBKDF2 校验值）：
//      python3 -c "import hashlib,os;s=os.urandom(16);print('salt:',s.hex());print('hash:',hashlib.pbkdf2_hmac('sha256',b'YOUR-NEW-PASSWORD',s,100000,32).hex())"
//   3. 把输出的 salt / hash 填到下面 CONFIG 里即可。
// ============================================

(function () {
  'use strict';

  const CONFIG = {
    salt: '999391d4e1d6e78c2bb789a06ba91bc5',   // 16 字节 hex
    hash: 'de41de55111a61375d058c56f3e3e60d4df57082ae20535ad27496dddd355c1a',
    iterations: 100000,
    hint: '密码忘了？问问 Dou',
  };

  const STORAGE_KEY = 'dou-unlocked-v1';

  const html = document.documentElement;

  function isUnlocked() {
    try { return !!localStorage.getItem(STORAGE_KEY); } catch (e) { return false; }
  }

  function hexToBytes(hex) {
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
    return out;
  }

  async function verify(password) {
    if (!window.crypto || !window.crypto.subtle) return false;
    const keyMaterial = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: hexToBytes(CONFIG.salt), iterations: CONFIG.iterations, hash: 'SHA-256' },
      keyMaterial,
      256
    );
    const derived = Array.from(new Uint8Array(bits))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    return derived === CONFIG.hash;
  }

  function unlock() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
    const screen = document.querySelector('.lock-screen');
    if (screen) screen.remove();
    html.classList.remove('locked');
    html.classList.add('gate-ready');
  }

  function lock() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    window.location.reload();
  }

  function buildLockScreen() {
    const screen = document.createElement('div');
    screen.className = 'lock-screen';
    screen.innerHTML = `
      <div class="lock-card">
        <div class="brand-seal seal-lg" aria-hidden="true">D</div>
        <h1 class="lock-title">Dou's Space</h1>
        <p class="lock-sub">这是 Dou 的私人小站<br>输入密码，推门进来</p>
        <form class="lock-form" autocomplete="off">
          <input class="lock-input" type="password" name="password"
                 placeholder="密码" autocomplete="current-password" required>
          <button class="lock-btn" type="submit">进入</button>
        </form>
        <p class="lock-error" role="alert"></p>
        <p class="lock-hint">${CONFIG.hint}</p>
      </div>`;
    document.body.appendChild(screen);

    const form = screen.querySelector('.lock-form');
    const input = screen.querySelector('.lock-input');
    const error = screen.querySelector('.lock-error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const value = input.value.trim();
      const btn = screen.querySelector('.lock-btn');
      btn.disabled = true;
      btn.textContent = '…';
      const ok = await verify(value);
      btn.disabled = false;
      btn.textContent = '进入';

      if (ok) {
        unlock();
      } else {
        error.textContent = window.crypto && window.crypto.subtle
          ? '密码不对，再试一次'
          : '当前浏览器环境无法校验密码（需要 HTTPS）';
        const card = screen.querySelector('.lock-card');
        card.classList.remove('lock-shake');
        void card.offsetWidth; // 重新触发动画
        card.classList.add('lock-shake');
        input.select();
      }
    });

    input.focus();
  }

  // ---------- 启动 ----------
  if (isUnlocked()) {
    html.classList.remove('locked');
    html.classList.add('gate-ready');
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', buildLockScreen);
    } else {
      buildLockScreen();
    }
  }

  // 页脚「锁定本站」按钮
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lock-btn]');
    if (btn) lock();
  });

  // 暴露给控制台外的调试（无副作用）
  window.DouLock = { lock };
})();
