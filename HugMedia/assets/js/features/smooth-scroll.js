/* Phase 3 · features/smooth-scroll.js — 平滑滚动与锚点定位
   对站内锚点链接启用平滑滚动，并考虑 sticky 导航高度偏移。
   遵循 prefers-reduced-motion。 */
let prefersReduced =
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 初始化锚点平滑滚动（委托，可安全重复调用）。 */
export const init = () => {
  // 顶栏高度允许以 rem / px 声明；rem 需换算为像素后才是真实偏移
  const NAVBAR_H = document.documentElement.style.getPropertyValue('--navbar-height') || '3.25rem';
  const navRem = parseFloat(NAVBAR_H);
  const pxPerRem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const navHeight = (navRem || 0) * (NAVBAR_H.trim().endsWith('rem') ? pxPerRem : 1) || 52;
  // 导航下端与章节标题之间预留 1rem 呼吸间隙，数值与 CSS 的 scroll-margin-top 保持一致
  const ANCHOR_GAP = 16;
  const offset = navHeight + ANCHOR_GAP;

  document.addEventListener('click', (event) => {
    const a = event.target.closest('a[href^="#"]');
    if (!a || prefersReduced) return;
    const id = decodeURIComponent(a.getAttribute('href').slice(1));
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
    history.replaceState(null, '', `#${id}`);
  });
};

/** 跟随系统减少动效偏好（供调速用）。 */
export const setReduced = (v) => {
  prefersReduced = v;
};