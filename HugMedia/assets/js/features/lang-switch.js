/* Phase 4 · features/lang-switch.js — 语言切换下拉交互
   纯展开/收起状态管理，不影响 URL 切换（链接由 Hugo 渲染）。
   采用与 darkmode.js 一致的 document 级事件委托：
   - 脚本在 <head> 同步加载时 body 尚未解析，直接绑定元素会失效；
     委托到 document 则无论何时执行 init 都能命中已渲染的按钮。
   - 点击触发按钮开合；点击空白关闭已打开的下拉。
   - Esc 关闭；ArrowDown 在未展开时展开。
   由 features/index.js 挂载；SPA 内容替换后重跑 init()（header 常驻故幂等）。 */
import { $, $$ } from '../core/dom-utils.js';

let onDocClick = null;
let onKey = null;

/** 关闭所有已展开的语言下拉。 */
function closeAll() {
  $$('[data-lang-switch].is-open', document).forEach((wrapper) => {
    wrapper.classList.remove('is-open');
    const trigger = $('[data-lang-toggle]', wrapper);
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  });
}

/** 初始化：在 document 上注册委托（委托仅在 document 上，不受 body 时序影响）。 */
export const init = () => {
  if (onDocClick) return { destroy: cleanup, }; // 已初始化，避免重复绑定

  onDocClick = (event) => {
    const trigger = event.target.closest('[data-lang-toggle]');
    if (trigger) {
      const wrapper = trigger.closest('[data-lang-switch]');
      if (!wrapper) return;
      const willOpen = !wrapper.classList.contains('is-open');
      closeAll(); // 确保同一时间只有一个展开
      if (willOpen) {
        wrapper.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    } else {
      closeAll(); // 点击既非触发器亦非菜单内部 → 收起
    }
  };
  onKey = (event) => {
    if (event.key === 'Escape') closeAll();
  };

  document.addEventListener('click', onDocClick);
  document.addEventListener('keydown', onKey);

  return { destroy: cleanup, };
};

/** 清理：移除委托监听。供 SPA 重建前调用，或页面卸载时使用。 */
export function cleanup() {
  if (onDocClick) document.removeEventListener('click', onDocClick);
  if (onKey) document.removeEventListener('keydown', onKey);
  onDocClick = null;
  onKey = null;
}

/** 为兼容 features/index.js 的 destroy 调用约定暴露别名。 */
export const destroy = cleanup;