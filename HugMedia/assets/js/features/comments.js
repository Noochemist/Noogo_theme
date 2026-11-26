/* features/comments.js — 第三方评论系统统一注入（giscus / utterances / twikoo / waline / disqus）。
   挂载点 #comments 由 features/comments.html 输出（含 data-comments-* 配置）。
   SPA (swup) 每次内容替换后容器是全新 DOM，本模块把对应 provider 的客户端重挂到新容器；
   首次载入与 theme:content-replaced 后由 features/index.js 调用 init()。
   原则见编码规范 §7.9：<script> 不得直接写在 swup 容器内（换页 innerHTML 注入不执行），
   必须由 JS 在运行时 appendChild 注入（runtime append 的 script 会正常执行）。 */

/** CDN 兜底加载：同一脚本全局只注入一次，重复请求走缓存回调。 */
const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (loadScript.loaded.has(src)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => { loadScript.loaded.add(src); resolve(); };
    s.onerror = () => reject(new Error(`[comments] 加载脚本失败: ${src}`));
    document.head.appendChild(s);
  });
loadScript.loaded = new Set();

let walineInstance = null;

/** Disqus：首次注入 embed.js；换页用 DISQUS.reset 重挂（reset 的 config 指向当前 URL）。 */
function mountDisqus(el) {
  const shortname = el.dataset.commentsShortname;
  if (!shortname) return;
  const thread = document.createElement('div');
  thread.id = 'disqus_thread';
  el.appendChild(thread);
  if (window.DISQUS) {
    window.DISQUS.reset({
      reload: true,
      config: function () {
        this.page.url = window.location.href;
        this.page.identifier = window.location.pathname;
      },
    });
    return;
  }
  const s = document.createElement('script');
  s.src = `https://${shortname}.disqus.com/embed.js`;
  s.setAttribute('data-timestamp', String(Date.now()));
  s.async = true;
  document.head.appendChild(s);
}

/** Utterances：GitHub Issues 存评论，脚本注入容器即渲染 iframe。 */
function mountUtterances(el) {
  const repo = el.dataset.commentsUtteranceRepo;
  if (!repo) return;
  const s = document.createElement('script');
  s.src = 'https://utteranc.es/client.js';
  s.setAttribute('repo', repo);
  s.setAttribute('issue-term', 'pathname');
  s.setAttribute('theme', 'preferred-color-scheme');
  s.setAttribute('crossorigin', 'anonymous');
  s.async = true;
  el.appendChild(s);
}

/** Giscus：GitHub Discussions 存评论，属性对齐 giscus.app 官方配置。 */
function mountGiscus(el) {
  const repo = el.dataset.commentsGiscusRepo;
  if (!repo) return;
  const s = document.createElement('script');
  s.src = 'https://giscus.app/client.js';
  s.setAttribute('data-repo', repo);
  s.setAttribute('data-repo-id', el.dataset.commentsGiscusRepoid || '');
  s.setAttribute('data-category', el.dataset.commentsGiscusCategory || 'General');
  s.setAttribute('data-category-id', el.dataset.commentsGiscusCategoryid || '');
  s.setAttribute('data-mapping', 'pathname');
  s.setAttribute('data-strict', '0');
  s.setAttribute('data-reactions-enabled', '1');
  s.setAttribute('data-emit-metadata', '0');
  s.setAttribute('data-theme', 'preferred_color_scheme');
  /* giscus 语言白名单用 BCP47 大驼峰（zh-CN/zh-TW），Hugo 站点 lang 可能为语言键（如 zh-hans），
     注入前归一化，避免 giscus 按无效语言构造子页 src（/zh-hans/...）导致空白；其余语言照传。 */
  const GISCUS_LANG = { 'zh-hans': 'zh-CN', 'zh-hant': 'zh-TW' };
  const giscusLang = GISCUS_LANG[document.documentElement.lang] || document.documentElement.lang || 'zh-CN';
  s.setAttribute('data-lang', giscusLang);
  s.setAttribute('data-input-position', 'top');
  /* giscus 默认 lazy 靠滚动/交叉观察触发 iframe，超长文章（跨多视口）评论区在页面底部，
     懒加载观察可能不触发而长期空白；显式 eager 立即创建 iframe，规避该窗口。 */
  s.setAttribute('data-loading', 'eager');
  s.setAttribute('crossorigin', 'anonymous');
  s.async = true;
  el.appendChild(s);
}

/** Twikoo：自托管云函数评论，envId 即后端地址；换页先 destroy 再 init。 */
async function mountTwikoo(el) {
  const envId = el.dataset.commentsTwikooEnvid;
  if (!envId) return;
  try {
    await loadScript('https://cdn.jsdelivr.net/npm/twikoo/dist/twikoo.all.min.js');
  } catch (_e) { return; }
  if (!window.twikoo) return;
  window.twikoo.destroy(el.id);
  window.twikoo.init({ envId, el: el.id });
}

/** Waline：自托管评论，serverURL 为后端；换页销毁旧实例再 init 到空容器。 */
async function mountWaline(el) {
  const serverURL = el.dataset.commentsWalineServerurl;
  if (!serverURL) return;
  try {
    await loadScript('https://cdn.jsdelivr.net/npm/@waline/client@2/dist/waline.js');
  } catch (_e) { return; }
  if (!window.Waline) return;
  walineInstance?.destroy?.();
  el.innerHTML = '';
  walineInstance = window.Waline.init({
    el,
    serverURL,
    lang: document.documentElement.lang || 'zh-CN',
  });
}

const PROVIDERS = new Set(['giscus', 'utterances', 'twikoo', 'waline', 'disqus']);

/** 供 features/index.js 在首载与 theme:content-replaced 后调用。 */
export function init() {
  const el = document.getElementById('comments');
  if (!el) return;
  const provider = el.dataset.commentsProvider;
  if (!PROVIDERS.has(provider)) return;
  switch (provider) {
    case 'giscus': mountGiscus(el); break;
    case 'utterances': mountUtterances(el); break;
    case 'twikoo': mountTwikoo(el); break;
    case 'waline': mountWaline(el); break;
    case 'disqus': mountDisqus(el); break;
  }
}