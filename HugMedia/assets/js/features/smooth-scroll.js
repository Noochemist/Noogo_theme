/* Phase 3 · features/smooth-scroll.js — 平滑滚动与锚点定位
   对站内锚点链接启用平滑滚动，并考虑 sticky 导航高度偏移。
   遵循 prefers-reduced-motion。 */
let prefersReduced =
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 初始化锚点平滑滚动（委托，可安全重复调用）。 */
export const init = () => {
  const NAVBAR_H = (document.documentElement.style.getPropertyValue('--navbar-height')) || '3.25rem';
  const offset = parseFloat(NAVBAR_H) || 52;

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