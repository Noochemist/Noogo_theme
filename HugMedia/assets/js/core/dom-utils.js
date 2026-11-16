/* Phase 0 · core/dom-utils.js — 轻量 DOM 操作封装（ESM） */

/** 根据选择器取单个元素（可选作用域）。 */
export const $ = (selector, scope = document) => scope.querySelector(selector);

/** 根据选择器取元素集合，返回数组。 */
export const $$ = (selector, scope = document) =>
  Array.from(scope.querySelectorAll(selector));

/** 文档就绪回调（若已就绪则立即执行）。 */
export const ready = (fn) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
};

/** 创建元素。 */
export const el = (tag, attrs = {}, children = []) => {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else node.setAttribute(key, value);
  });
  children.forEach((child) =>
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child)
  );
  return node;
};

/** 在目标内或移除后执行，适合包装事件回调。 */
export const once = (node, type, handler, options) => {
  const wrapped = (event) => {
    handler(event);
    node.removeEventListener(type, wrapped, options);
  };
  node.addEventListener(type, wrapped, options);
  return () => node.removeEventListener(type, wrapped, options);
};

/** 在 document 上注册委托事件：命中 selector 才触发。 */
export const delegate = (selector, type, handler, scope = document) => {
  scope.addEventListener(type, (event) => {
    const target = event.target.closest(selector);
    if (target) handler(event, target);
  });
};