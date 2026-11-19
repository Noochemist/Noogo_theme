/* Phase 3 · features/view-toggle.js — 网格 / 列表视图切换
   状态写入 <html data-view>（grid | list），持久化到 localStorage；
   由 features/index.js 挂载，暴露 window.__HUGO_THEME__.viewToggle。
   按钮位于顶栏（SPA 不重挂 header），故只需 initOnce，事件委托到 document。 */

const STORAGE_KEY = 'hugmedia-view';

const STORAGE = (() => {
  try {
    const s = window.localStorage;
    return { get: (k) => s.getItem(k), set: (k, v) => s.setItem(k, v) };
  } catch (_e) {
    return { get: () => null, set: () => {} };
  }
})();

/** 当前生效视图（默认 grid）。 */
export function currentView() {
  const root = document.documentElement;
  return root.getAttribute('data-view') === 'list' ? 'list' : 'grid';
}

/** 应用视图到 <html data-view>，并同步按钮 aria-pressed。 */
export const apply = (view) => {
  const root = document.documentElement;
  const next = view === 'list' ? 'list' : 'grid';
  root.setAttribute('data-view', next);
  document.querySelectorAll('[data-view-toggle]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(next === 'list'));
  });
};

/** 切换并持久化。 */
export const toggle = () => {
  const next = currentView() === 'list' ? 'grid' : 'list';
  apply(next);
  try {
    STORAGE.set(STORAGE_KEY, next);
  } catch (_e) {
    /* 隐私模式静默失败 */
  }
  return next;
};

/** 初始化：恢复上次视图，绑定切换事件。 */
export const init = () => {
  try {
    const stored = STORAGE.get(STORAGE_KEY);
    if (stored === 'list') document.documentElement.setAttribute('data-view', 'list');
  } catch (_e) {
    /* 空 */
  }
  apply(currentView());

  document.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-view-toggle]');
    if (btn) {
      const next = toggle();
      btn.setAttribute('aria-pressed', String(next === 'list'));
    }
  });
};