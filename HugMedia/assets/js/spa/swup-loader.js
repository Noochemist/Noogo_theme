/* Phase 2 · spa/swup-loader.js — swup SPA 初始化
   拦截同源 <a> 点击 → fetch 目标页 HTML → 替换 #main-content，
   保留 <header>/<footer> 与 <head>；swup v4 会自动更新 <title>。
   预加载与滚动还原分别由 preload / scroll 插件负责。 */
import Swup from 'swup';
import SwupPreloadPlugin from '@swup/preload-plugin';
import SwupScrollPlugin from '@swup/scroll-plugin';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** swup v4 构造函数即会调用 enable()，注册链接拦截与 popstate 监听。 */
const swup = new Swup({
  // 只替换主内容容器，其余区域（顶栏/侧栏/页脚）保持不变
  containers: ['#main-content'],
  // 语言切换等涉及整页语言态(header/Hugo i18n)的链接走整页导航，跳过 SPA。
  // data-no-swup 是 swup v4 内置约定，双保险再显式声明。
  ignore: ['[data-no-swup]', '.lang-switch__item'],
  // 让满足该选择器的元素在内容替换期间执行 CSS 过渡（html 会获得 is-changing 类）；
  // 系统偏好“减少动效”时跳过动画，直接替换
  animationSelector: prefersReducedMotion ? false : '[class*="swup-transition"]',
  plugins: [
    // 悬停 / 触摸 / 焦点时预加载链接，加速切换
    new SwupPreloadPlugin(),
    // 前进导航滚回顶部，后退/前进还原历史滚动位置；尊重系统减少动效偏好
    new SwupScrollPlugin({ animateScroll: !prefersReducedMotion }),
  ],
});

// 内容替换完成后广播主题级事件，供后续 Phase 的 features 重挂载（如 TOC、代码复制）
swup.hooks.on('content:replace', () => {
  document.dispatchEvent(new CustomEvent('theme:content-replaced'));
});

// 暴露实例，便于后续模块与开发调试
if (typeof window !== 'undefined') {
  window.__HUGO_THEME__ = window.__HUGO_THEME__ || {};
  window.__HUGO_THEME__.swup = swup;
}

export default swup;