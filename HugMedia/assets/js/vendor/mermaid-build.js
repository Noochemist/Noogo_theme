/* vendur/mermaid-build.js — 由 js.Build 打包 Mermaid 到本地，替代 unpkg CDN。
   暴露 window.mermaid（含 initialize / run）。 */
import mermaid from 'mermaid/dist/mermaid.core.mjs';

window.mermaid = mermaid;