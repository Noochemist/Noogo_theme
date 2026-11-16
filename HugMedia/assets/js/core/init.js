/* Phase 0 · core/init.js — 初始化逻辑
   骨架期只负责核心就绪标记与基础订阅；
   后续 Phase（SPA / 风格交互 / 功能模块）在此统一挂载。 */
import { ready, $ } from './dom-utils.js';
import { bus } from './event-bus.js';

/** 标记运行时就绪：在 <html> 加 is-ready，禁用 initial 过度态。 */
const markReady = () => {
  const root = document.documentElement;
  if (root) {
    root.classList.add('is-ready');
    root.classList.remove('is-loading');
  }
};

/** 主题初始化入口。 */
export const init = () => {
  ready(() => {
    document.documentElement.classList.add('is-loading');
    markReady();
    bus.emit('theme:init', {});
    // 骨架期占位：集成点，后续模块在此订阅 theme:init
    bus.emit('theme:ready', {});
  });
};

// 便于开发期在控制台探测
if (typeof window !== 'undefined') {
  window.__HUGO_THEME__ = { bus, ready, $, markReady };
}