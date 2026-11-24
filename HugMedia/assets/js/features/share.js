/* Phase 3 · features/share.js — 文章页分享模块
   按钮与卡片常驻顶栏（SPA 下 header 不重挂），因此只做一次事件绑定 + 全局状态刷新：
   - 刷新 body.has-article：文章页显示分享按钮、隐藏视图切换；列表页反之
   - 用当前 location.href + document.title 逐个重填平台分享链接
   - 平台→分享端点 URL 模板集中在本文件（新增平台只需补一行 + 图标 + i18n）
   由 features/index.js 挂载；监听 theme:content-replaced 在 SPA 换页后刷新。 */

/** 平台分享端点模板：url = 编码后的文章链接，title = 编码后的页面标题。
    客户端解析按钮 data-share-link → 端点模板；新增平台只需补一行 + 图标 + i18n 键。
    网页无公开分享端点的平台（小红书/知乎/微信）已从默认列表移除：
    其分享必须在对应 App 内完成，网页无法调起，故不做分享按钮。 */
const SHARE_URLS = {
  qq:       (u, t) => `https://connect.qq.com/widget/shareqq/index.html?url=${u}&title=${t}`,
  weibo:    (u, t) => `https://service.weibo.com/share/share.php?url=${u}&title=${t}`,
  x:        (u, t) => `https://x.com/intent/post?url=${u}&text=${t}`,
  facebook: (u)   => `https://www.facebook.com/sharer/sharer.php?u=${u}`,
  reddit:   (u, t) => `https://www.reddit.com/submit?url=${u}&title=${t}`,
  mastodon: (u, t) => `https://mastodon.social/share?text=${t}%20${u}`,
  /* 存量平台端点（未默认启用，配置后即可用） */
  twitter:  (u, t) => `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
  telegram: (u, t) => `https://t.me/share/url?url=${u}&text=${t}`,
  whatsapp: (u, t) => `https://api.whatsapp.com/send?text=${t}%20${u}`,
  linkedin: (u)   => `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
  email:    (u, t) => `mailto:?subject=${t}&body=${u}`,
};

/** 文章上下文判定：正文容器打点 data-pagefind-body（Pagefind 索引约定，各风格通用）。
    有正文→文章页；没有（首页/section/归档）→列表页。 */
const isArticlePage = () =>
  !!document.querySelector('#main-content [data-pagefind-body]');

const $ = (sel) => document.querySelector(sel);

/** 刷新按钮显隐与平台链接（每次 content-replaced 后调用）。 */
function refresh() {
  // 1) 顶栏按钮显隐：文章页显示分享、隐藏视图切换；列表页反之
  document.body.classList.toggle('has-article', isArticlePage());

  const card = $('[data-share-card]');
  if (!card) return;

  // 2) 平台链接：header 常驻但 URL 每次变，必须运行时重填。
  //    未登记端点的平台标记 data-share-copy：点击退化为“复制链接”。
  const url = encodeURIComponent(window.location.href.split(/[?#]/)[0]);
  const title = encodeURIComponent(document.title);
  card.querySelectorAll('[data-share-link]').forEach((a) => {
    const build = SHARE_URLS[a.dataset.shareLink];
    if (build) {
      a.href = build(url, title);
      a.removeAttribute('data-share-copy');
    } else {
      a.href = '#';
      a.setAttribute('data-share-copy', '');
    }
  });

  // 3) “更多”按钮 = 系统分享入口，常驻可见。
  //    点击优先调浏览器原生分享面板；浏览器不支持 Web Share API 时降级为复制链接，
  //    保证任何环境下按钮都可用、不消失（模板内联 hidden 需清掉）。
  const native = card.querySelector('[data-share-native]');
  if (native) native.hidden = false;
}

function close() {
  const toggle = $('[data-share-toggle]');
  const card = $('[data-share-card]');
  if (card) card.classList.remove('is-open');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
}

function open() {
  const toggle = $('[data-share-toggle]');
  const card = $('[data-share-card]');
  if (!card) return;
  const willOpen = !card.classList.contains('is-open');
  if (willOpen) {
    refresh(); // 打开前再刷一遍链接，确保最新
    card.classList.add('is-open');
    alignCard(); // 窄屏把卡片水平位置夹进视口，保证完全显示
  } else {
    close();
  }
  if (toggle) toggle.setAttribute('aria-expanded', String(willOpen));
}

/** 第一性原理：卡片 absolute 定位的 containing block 是分享按钮(.share-wrap)，
    left 写死都相对按钮而非屏幕——所以“卡片左缘贴屏幕”在 CSS 层做不到。
    只能在运行时测量 wrap 与视口，把期望的视口左坐标 clamp 进安全区间
    [gap, vw - cardW - gap]，再折算成相对 wrap 的 left 偏移：
    - 左缘恒 ≥ gap（不超出屏幕左端）
    - 右缘恒 ≤ vw - gap（不超出屏幕右端）
    - 尽量保持右缘对齐按钮右端；超界即贴安全边界。 */
function alignCard() {
  const card = $('[data-share-card]');
  const wrap = $('.share-wrap');
  if (!card || !wrap) return;
  if (window.innerWidth > 768) {
    // 回到宽屏：清除临时内联定位，恢复默认 right:0 对齐按钮
    card.style.left = '';
    card.style.right = '';
    return;
  }
  if (!card.classList.contains('is-open')) return;
  const gap = 8;
  const wrapRect = wrap.getBoundingClientRect();
  const cardW = Math.min(card.offsetWidth, window.innerWidth - gap * 2);
  const minX = gap;
  const maxX = Math.max(minX, window.innerWidth - cardW - gap);
  const preferX = wrapRect.right - cardW; // 默认右缘对齐按钮右端
  const viewX = Math.min(Math.max(minX, preferX), maxX);
  card.style.left = `${viewX - wrapRect.left}px`;
  card.style.right = 'auto';
}

/** 卡片“更多”（系统分享）：可用则委托浏览器原生分享面板，否则降级复制链接。 */
async function onNativeShare() {
  const title = document.title;
  const url = window.location.href.split(/[?#]/)[0];
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text: title, url });
    } catch (_e) {
      /* 用户取消分享，保持静默 */
    }
  } else {
    // 浏览器不支持系统分享（常见于 http 非安全上下文 / 旧 WebView）：
    // 降级复制链接，并给出与「普通复制」不同的说明文案
    const nativeLabel = $('[data-share-native-label]');
    copyUrlAndToast(nativeLabel && nativeLabel.textContent.trim());
  }
  close();
}

/** 复制当前链接并弹出轻提示（无端点平台与系统分享降级共用）。 */
function copyUrlAndToast(text) {
  const url = window.location.href.split(/[?#]/)[0];
  const done = () => showToast(text);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(done).catch(() => fallbackCopy(url, done));
  } else {
    fallbackCopy(url, done);
  }
}

function fallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (_e) { /* 忽略 */ }
  ta.remove();
  done();
}

let toastTimer = 0;
function showToast(text) {
  let tip = $('.share-toast');
  if (!tip) {
    tip = document.createElement('div');
    tip.className = 'share-toast';
    tip.setAttribute('role', 'status');
    document.body.appendChild(tip);
  }
  const label = $('[data-share-copy-label]');
  const fallback = (label && label.textContent.trim()) || 'Link copied';
  tip.textContent = text || fallback;
  tip.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => tip.classList.remove('is-visible'), 1800);
}

/** 唯一入口：一次性绑定 + 初始刷新。 */
export function init() {
  refresh();

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-share-toggle]')) {
      e.preventDefault();
      open();
      return;
    }
    const card = $('[data-share-card]');
    if (!card || !card.classList.contains('is-open')) return;
    if (e.target.closest('[data-share-native]')) {
      e.preventDefault();
      onNativeShare();
      return;
    }
    const link = e.target.closest('[data-share-link]');
    if (link) {
      if (link.hasAttribute('data-share-copy')) {
        e.preventDefault(); // 无端点的平台：就地复制链接，不触发 “#” 跳转
        copyUrlAndToast();
        close();
      }
      return; // 有真实分享端点的链接正常新标签打开
    }
    // 点卡片外任意处关闭
    if (!card.contains(e.target)) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // 视口变化：刷新平台链接；卡片正打开时重算水平安全位置（横竖屏/窗口缩放）
  window.addEventListener('resize', () => {
    refresh();
    alignCard();
  });

  // SPA 换页：刷新上下文并收起卡片
  document.addEventListener('theme:content-replaced', () => {
    refresh();
    close();
  });
}