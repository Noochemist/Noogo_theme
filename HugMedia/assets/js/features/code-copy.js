/* Phase 3 · features/code-copy.js — 代码块复制按钮
   为每个 .highlight 注入复制按钮（若尚未注入），点击复制高亮内容。
   支持 swup 内容替换后（页面重新渲染）重复调用而不会重复注入。 */
import { $, $$ } from '../core/dom-utils.js';

const HEAD_CLASS = 'codeblock-head';
const BTN_CLASS = 'code-copy';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_e) {
    // fallback: 旧浏览器
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (_e2) {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }
}

/** 为 scope 内所有未处理的代码块注入复制按钮。 */
export const init = (scope = document) => {
  const blocks = $$('div.highlight', scope);
  blocks.forEach((block) => {
    if (block.querySelector(`.${BTN_CLASS}`)) return;
    const pre = block.querySelector('pre');
    if (!pre) return;

    const head = document.createElement('div');
    head.className = HEAD_CLASS;

    // 语言标签：优先用 data-lang，否则从 Chroma 类名推断
    const lang = block.getAttribute('data-lang');
    const langLabel = document.createElement('span');
    langLabel.className = 'codeblock-lang';
    langLabel.textContent = lang || 'code';
    head.appendChild(langLabel);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = BTN_CLASS;
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    btn.addEventListener('click', async (event) => {
      btn.textContent = 'Copying…';
      const ok = await copyText(pre.textContent);
      btn.textContent = ok ? 'Copied' : 'Failed';
      btn.classList.toggle('copied', ok);
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 1600);
    });
    head.appendChild(btn);

    block.style.position = 'relative';
    block.insertBefore(head, block.firstChild);
  });
};