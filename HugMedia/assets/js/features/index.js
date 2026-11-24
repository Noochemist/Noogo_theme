/* Phase 3 · features/index.js — 功能模块统一挂载
   依据 document.documentElement.dataset.features 决定启用哪些模块，
   并订阅 swup 的 theme:content-replaced 以在 SPA 导航后重挂 DOM 相关功能。
   挂载结果写入 window.__HUGO_THEME__.features。 */
async function loadModule(name) {
  switch (name) {
    case 'darkmode':
      return import('./darkmode.js');
    case 'toc':
      return import('./toc.js');
    case 'codecopy':
      return import('./code-copy.js');
    case 'smoothscroll':
      return import('./smooth-scroll.js');
    case 'i18n':
      return import('./lang-switch.js');
    case 'search':
      return import('./search.js');
    case 'viewtoggle':
      return import('./view-toggle.js');
    case 'share':
      return import('./share.js');
    case 'infinitescroll':
      return import('./infinite.js');
    case 'topbar':
      return import('./topbar.js');
    default:
      return null;
  }
}

/** 读取启用的功能集合；Hugo 会小写化参数 key，统一转小写便于大小写无关匹配。
    兼容历史模板 bug：data-features 曾输出为无分隔符拼接串（如 "abcinfinite..."），
    此时整串无法按逗号拆分，改为按已知模块键名做子串匹配还原。 */
const MODULE_KEYS = [
  'darkmode', 'toc', 'codecopy', 'smoothscroll',
  'i18n', 'search', 'viewtoggle', 'infinitescroll', 'share',
];
const enabled = () => {
  const raw = (document.documentElement.dataset.features || '')
    .toLowerCase()
    .replace(/\s+/g, '');
  const list = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (list.length === 1) {
    return MODULE_KEYS.filter((k) => list[0].includes(k));
  }
  return list;
};

/** DOM 尚未解析完成（经典脚本在 <head> 中同步执行）时，等 DOMContentLoaded 再继续。 */
const whenDomReady = () =>
  document.readyState === 'loading'
    ? new Promise((resolve) =>
        document.addEventListener('DOMContentLoaded', resolve, { once: true })
      )
    : Promise.resolve();

/** 读取 <html data-config> 中的运行时配置。 */
function readConfig() {
  const el = document.documentElement;
  try {
    return JSON.parse(el.getAttribute('data-config') || '{}');
  } catch (_e) {
    return {};
  }
}

/** 首次初始化（含那些只跑一次/全局的模块）。 */
async function initOnce() {
  await whenDomReady();
  const list = enabled();
  window.__HUGO_THEME__ = window.__HUGO_THEME__ || {};
  const config = readConfig();

  if (list.includes('darkmode')) {
    const mod = await loadModule('darkmode');
    const mode = config?.dark?.defaultMode || 'auto';
    mod.init({ mode });
    window.__HUGO_THEME__.darkmode = mod;
  }
  if (list.includes('smoothscroll')) {
    const mod = await loadModule('smoothscroll');
    mod.init();
    window.__HUGO_THEME__.smoothScroll = mod;
  }
  if (list.includes('viewtoggle')) {
    const mod = await loadModule('viewtoggle');
    mod.init();
    window.__HUGO_THEME__.viewToggle = mod;
  }
  if (list.includes('share')) {
    const mod = await loadModule('share');
    mod.init();
    window.__HUGO_THEME__.share = mod;
  }
  // 顶栏交互（汉堡抽屉 / 搜索折叠）：导航固有行为，不随 features 开关控制
  const topbar = await loadModule('topbar');
  if (topbar) {
    topbar.init();
    window.__HUGO_THEME__.topbar = topbar;
  }
}

/** 内容替换后重跑 DOM 相关模块。 */
async function rewire() {
  await whenDomReady();
  const list = enabled();
  const win = (window.__HUGO_THEME__ = window.__HUGO_THEME__ || {});

  if (list.includes('toc')) {
    const mod = await loadModule('toc');
    win.toc?.destroy?.();
    win.toc = mod.init();
  }
  if (list.includes('codecopy')) {
    const mod = await loadModule('codecopy');
    mod.init();
    win.codeCopy = mod;
  }
  if (list.includes('i18n')) {
    const mod = await loadModule('i18n');
    win.langSwitch?.destroy?.();
    win.langSwitch = mod.init();
  }
  if (list.includes('search')) {
    const mod = await loadModule('search');
    win.search?.destroy?.();
    win.search = mod.init();
  }
  if (list.includes('infinitescroll')) {
    const mod = await loadModule('infinitescroll');
    win.infiniteScroll?.destroy?.();
    win.infiniteScroll = mod.init();
  }
}

/** 挂载入口：由 main.js 或 core/init.js 调用。 */
export const mount = () => {
  if (window.__HUGO_THEME__?.featuresMounted) return;
  window.__HUGO_THEME__.featuresMounted = true;
  initOnce();
  rewire();
  // SPA：swup 替换 #main-content 后重新绑定 DOM 相关功能
  browserListeners();
  return true;
};

function browserListeners() {
  // 订阅 swup 内容替换事件（swup-loader 在 document 上派发 DOM 事件）
  document.addEventListener('theme:content-replaced', () => rewire());
}