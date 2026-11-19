/* Phase 3 · features/toc.js — 目录滚动高亮
   监听滚动，高亮当前可见章节对应的目录链接。
   需在打开目录时调用 init()；swup 内容替换后需重新调用（见 features/index.js）。 */
import { $, $$ } from '../core/dom-utils.js';

/** 收集正文标题与目录链接，构建映射并开启滚动监听。 */
export const init = (scope = document) => {
  const toc = $( '.toc', scope);
  const content = $('.post-content, article .content, article, main', scope);
  if (!toc || !content) return;

  const links = $$('a[href^="#"]', toc);
  if (links.length === 0) return;

  const ids = links
    .map((a) => a.getAttribute('href').slice(1))
    .filter((id) => id && $(`#${id}`, content));

  const listeners = [];
  const setActive = (id) => {
    links.forEach((a) => {
      const on = a.getAttribute('href') === `#${id}`;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  };

  const onScroll = () => {
    const marker = Math.min(window.innerHeight * 0.35, 200);
    let current = null;
    for (const id of ids) {
      const node = document.getElementById(id);
      if (node && node.getBoundingClientRect().top <= marker) current = id;
    }
    if (current) setActive(current);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  return {
    destroy() {
      listeners.forEach((off) => off());
      window.removeEventListener('scroll', onScroll);
    },
    setActive,
  };
};