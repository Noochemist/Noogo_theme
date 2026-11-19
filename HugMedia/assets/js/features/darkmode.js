/* Phase 3 · features/darkmode.js — 暗黑/亮色模式切换
   遵循 [params.dark].defaultMode：auto | light | dark。
   - auto: 跟随系统 prefers-color-scheme，并监听变化。
   - 显式选择后写入 localStorage 覆盖默认，优先于默认模式。
   由 features/index.js 挂载；暴露 window.__HUGO_THEME__.darkmode。 */
import { bus } from '../core/event-bus.js';

const STORAGE_KEY = 'hugmedia-theme';

/** 读取当前主题偏好（localStorage 覆盖配置默认）。 */
export function getStored() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (_e) {
    return null;
  }
}

/** 计算应生效的主题：stored > defaultMode > 系统偏好。 */
export function resolve(mode) {
  const stored = getStored();
  if (stored === 'light' || stored === 'dark') return stored;
  if (mode === 'light' || mode === 'dark') return mode;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** 应用主题到 <html data-theme>，并在切换瞬间短暂激活 CSS 过渡。 */
export const apply = (theme) => {
  const root = document.documentElement;
  const prev = root.getAttribute('data-theme');
  // 仅当发生实际变化时才触发颜色过渡
  if (prev && prev !== theme) {
    root.classList.add('is-theme-transitioning');
    root.setAttribute('data-theme', theme);
    // 过渡结束后移除标记类（--duration=150ms，给足余量）
    window.setTimeout(() => root.classList.remove('is-theme-transitioning'), 300);
  } else {
    root.setAttribute('data-theme', theme);
  }
};

/** 切换并持久化。 */
export const toggle = () => {
  const next = resolve('auto') === 'dark' ? 'light' : 'dark';
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch (_e) {
    /* 隐私模式下静默失败 */
  }
  apply(next);
  bus.emit('theme:changed', { theme: next });
  return next;
};

/** 初始化：应用初始主题并绑定切换按钮。 */
export const init = (opts = {}) => {
  const mode = opts.mode || 'auto';
  apply(resolve(mode));

  document.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-theme-toggle]');
    if (btn) {
      const next = toggle();
      btn.setAttribute('aria-pressed', String(next === 'dark'));
    }
  });

  // 跟随系统：仅当无显式存储且默认 auto 时
  if (mode === 'auto' && !getStored()) {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (!getStored()) apply(resolve('auto'));
    };
    mq.addEventListener?.('change', handler);
  }
};