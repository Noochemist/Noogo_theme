/* Phase 3 · features/topbar.js — 顶栏窄屏交互（纯功能层，只认 data-* 契约）
   · data-nav-drawer-toggle  → 开合左侧导航抽屉（body.nav-drawer-open）
   · data-search-toggle      → 窄屏搜索折叠/展开（body.search-open）
   按钮只在对应断点下由 CSS 显示，本模块不关心屏幕宽度；
   具体视觉（抽屉/遮罩/折叠布局）由风格层 styles/{style}.css 负责。 */
const DRAWER_OPEN = 'nav-drawer-open';
const SEARCH_OPEN = 'search-open';
const SEL_DRAWER_TOGGLE = '[data-nav-drawer-toggle]';
const SEL_SEARCH_TOGGLE = '[data-search-toggle]';
const SEL_SEARCH_UI = '[data-search]';

let backdrop = null;
let onDocClick = null;
let onKeydown = null;

const bodyHas = (cls) => document.body.classList.contains(cls);
const bodySet = (cls, on) => document.body.classList.toggle(cls, on);

const syncDrawerAria = () => {
  const btn = document.querySelector(SEL_DRAWER_TOGGLE);
  if (btn) btn.setAttribute('aria-expanded', String(bodyHas(DRAWER_OPEN)));
};

const closeDrawer = () => { bodySet(DRAWER_OPEN, false); syncDrawerAria(); };
const closeSearch = () => bodySet(SEARCH_OPEN, false);

const toggleDrawer = () => {
  bodySet(DRAWER_OPEN, !bodyHas(DRAWER_OPEN));
  syncDrawerAria();
};

const toggleSearch = () => {
  const open = !bodyHas(SEARCH_OPEN);
  bodySet(SEARCH_OPEN, open);
  if (open) {
    const input = document.querySelector('[data-search-input]');
    // 下一帧再聚焦：等 CSS 切换到展开态（input 由 display:none 恢复可见）
    if (input) requestAnimationFrame(() => input.focus());
  }
};

const onClick = (event) => {
  // 汉堡开关
  if (event.target.closest(SEL_DRAWER_TOGGLE)) { toggleDrawer(); return; }
  // 放大镜开关：本身位于 [data-search] 内，须先于下面的“区域内不收起”判断
  if (event.target.closest(SEL_SEARCH_TOGGLE)) { toggleSearch(); return; }
  // 抽屉内点击链接 → 收抽屉（SPA 切页后不残留侧栏悬浮态）
  if (bodyHas(DRAWER_OPEN) && event.target.closest('.xhs-sidenav a')) {
    closeDrawer();
    return;
  }
  // 点击搜索区外任意处 → 收起展开的搜索
  if (bodyHas(SEARCH_OPEN) && !event.target.closest(SEL_SEARCH_UI)) closeSearch();
};

const onKey = (event) => {
  if (event.key !== 'Escape') return;
  if (bodyHas(DRAWER_OPEN)) closeDrawer();
  if (bodyHas(SEARCH_OPEN)) closeSearch();
};

const ensureBackdrop = () => {
  if (backdrop) return;
  backdrop = document.createElement('div');
  backdrop.className = 'xhs-nav-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.addEventListener('click', closeDrawer);
  document.body.appendChild(backdrop);
};

/** 初始化：幂等（顶栏常驻 DOM，'theme:content-replaced 无需重建）；返回 { destroy }。 */
export const init = () => {
  ensureBackdrop();
  if (onDocClick) return { destroy: cleanup };
  onDocClick = onClick;
  onKeydown = onKey;
  document.addEventListener('click', onDocClick);
  document.addEventListener('keydown', onKeydown);
  return { destroy: cleanup };
};

/** 清理：移除监听与遮罩，恢复初始状态。 */
export const cleanup = () => {
  if (!onDocClick) return;
  document.removeEventListener('click', onDocClick);
  document.removeEventListener('keydown', onKeydown);
  onDocClick = null;
  onKeydown = null;
  if (backdrop) {
    backdrop.remove();
    backdrop = null;
  }
  bodySet(DRAWER_OPEN, false);
  bodySet(SEARCH_OPEN, false);
  syncDrawerAria();
};