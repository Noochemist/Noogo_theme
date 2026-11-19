/* vendur/katex-build.js — 由 js.Build 打包 KaTeX（含 auto-render）到本地，替代 unpkg CDN。
   打包后以 UMD/全局形式暴露 window.katex 与 window.renderMathInElement。 */
import katex from 'katex/dist/katex.mjs';
import renderMathInElement from 'katex/dist/contrib/auto-render.mjs';

window.katex = katex;
window.renderMathInElement = renderMathInElement;