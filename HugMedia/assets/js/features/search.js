/* Phase 4 · features/search.js — 站内搜索（基于 Pagefind）
   与风格完全解耦：交互只认 data-search* 属性，样式只认通用类 search-ui__*，
   输入框本身的视觉样式仍归各风格（如 .xhs-search），本组件不掺风格类名。

   原理：
   - Pagefind 在构建期对 public/ 生成索引（见 README：hugo + pagefind --site public）。
   - 本组件在首次需要时懒加载 /pagefind/pagefind.js 并复用其 search() API，
     Pagefind 原生支持多关键字空格分词、模糊匹配与多语言索引，故无需自写搜索算法。
   - 无索引或加载失败时优雅降级：视作搜索不可用，仅提示不报错。

   由 features/index.js 挂载；SPA 内容替换后无需重建（搜索框常驻 header）。
   采用 document 级事件委托，脚本同步加载时 body 未解析也能命中已有输入框。 */
import { $, $$ } from '../core/dom-utils.js';

let pagefind = null;        // 缓存的 Pagefind 实例（search / options）
let pagefindPromise = null; // 首次加载的 Promise，避免并发重复加载

const UI_SEL = '[data-search]';
const INPUT_SEL = '[data-search-input]';
const RESULTS_SEL = '[data-search-results]';
const SCRIPT_SRC = '/pagefind/pagefind.js';
// 命中数据容器：Pagefind 正文包裹标记（文章页正文区）
const DATA_BODY_SEL = '[data-pagefind-body]';
// 严格匹配高亮的 <mark> 类名（搜索下拉结果与文章页正文共用）
const EXACT_CLS = 'search-ui__m-exact';

/** 防抖：延迟 ms 内重复调用只执行最后一次。 */
function debounce(fn, ms) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/** 动态加载 Pagefind ESM 模块（幂等）。neededLanguages 为当前语言，用于限定索引。 */
function loadPagefind() {
  if (pagefind) return Promise.resolve(pagefind);
  if (!pagefindPromise) {
    pagefindPromise = (async () => {
      try {
        // pagefind.js 是原生 ES Module，需用动态 import()（<script> 不挂全局命名空间）
        const mod = await import(/* @vite-ignore */ SCRIPT_SRC);
        // createInstance 会自动检测 <html lang> 限定语言、并按 basePath 加载索引；
        // search() 在首次调用时自动完成索引初始化（waitForInit）。
        const basePath = SCRIPT_SRC.replace(/pagefind\.js$/, '');
        pagefind = await mod.createInstance({ basePath });
      } catch (_e) {
        pagefind = null;
      }
      return pagefind;
    })();
  }
  return pagefindPromise;
}

/** 清空某容器的结果与相关状态。 */
function clearResults(ui) {
  const box = $(RESULTS_SEL, ui);
  if (box) {
    box.innerHTML = '';
    box.classList.remove('is-empty');
  }
  ui.classList.remove('has-results');
}

/** 渲染空态/命中列表到结果面板。 */
function renderResults(ui, results) {
  const box = $(RESULTS_SEL, ui);
  const input = $(INPUT_SEL, ui);
  if (!box) return;

  if (!results || !results.length) {
    box.classList.add('is-empty');
    box.innerHTML = '<p class="search-ui__empty">暂无相关结果</p>';
    ui.classList.remove('has-results');
    return;
  }

  box.classList.remove('is-empty');
  ui.classList.add('has-results');
  box.innerHTML = '';
  const term = (input && input.value || '').trim();
  results.forEach((r) => {
    const a = document.createElement('a');
    a.className = 'search-ui__result';
    // 链接携带当前查询词，便于到达文章页后按 ?kw= 高亮关键词
    a.href = kwToUrl(r.url, term);
    // 命中 SPA 导航的链接交给 swup 处理（不加 data-no-swup），否则整页跳转
    const title = r.meta && r.meta.title
      || (r.sub_results && r.sub_results[0] && r.sub_results[0].title)
      || r.url;
    const frag = document.createElement('div');
    // 标题以纯文本插入（避免注入），随后对其中严格命中的查询词补充高亮
    frag.innerHTML = `
      <h4 class="search-ui__result-title"></h4>
      ${r.excerpt ? `<p class="search-ui__result-excerpt">${r.excerpt}</p>` : ''}
    `;
    frag.querySelector('.search-ui__result-title').textContent = title || '';
    a.append(...frag.childNodes);
    box.appendChild(a);
  });

  // 严格匹配高亮：Pagefind 的 <mark> 标记模糊命中片段；这里把查询的
  // 每个完整词（原样）在标题/摘要中额外标亮，保证"搜研究则研究全亮"。
  const terms = extractTerms(input || ui);
  if (terms.length) {
    $$('.search-ui__result', box).forEach((a) => {
      $$('.search-ui__result-title, .search-ui__result-excerpt', a).forEach((el) => {
        highlightStrict(el, terms);
      });
    });
  }
}

/** 从当前输入解析查询词：去空格、取长度≥2 的非空词（忽略单字符噪声）。 */
function extractTerms(input) {
  const raw = (input && input.value) || '';
  return raw
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((w) => [...w].length >= 2);
}

/** 在目标 URL 上追加 ?kw=<查询词>（若已有 query/hash 则正确拼接）。 */
function kwToUrl(url, term) {
  if (!term) return url;
  try {
    const u = new URL(url, window.location.origin);
    u.searchParams.set('kw', term);
    return u.pathname + u.search + u.hash;
  } catch (_e) {
    // 兜底：去掉已有 hash、追加 query
    const hashIndex = url.indexOf('#');
    const base = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
    const sep = base.includes('?') ? '&' : '?';
    return base + sep + 'kw=' + encodeURIComponent(term);
  }
}

/** 读取地址栏 ?kw= 查询词（无则返回空数组）。 */
function kwFromUrl() {
  try {
    const kw = new URL(window.location.href).searchParams.get('kw') || '';
    return kw.split(/\s+/).map((s) => s.trim()).filter(Boolean).filter((w) => [...w].length >= 2);
  } catch (_e) {
    return [];
  }
}

/** 在文章正文（data-pagefind-body 容器）中对 ?kw= 的每个词做严格匹配高亮。 */
function highlightFromUrl() {
  clearPageHighlights();
  const terms = kwFromUrl();
  if (!terms.length) return;
  // 优先命中正文容器；回退到主内容区
  const body = $(DATA_BODY_SEL) || $('#main-content');
  if (!body) return;
  // highlightStrict 内部用 TreeWalker 遍历整棵子树，对正文做一次即可覆盖所有深度
  highlightStrict(body, terms);
  body.classList.add('has-kw-highlight');
}

/** 清除正文上的 kw 高亮标记，避免 SPA 切换后残留。 */
function clearPageHighlights() {
  const body = $(DATA_BODY_SEL) || $('#main-content');
  if (!body) return;
  $$(`mark.${EXACT_CLS}`, body).forEach((m) => {
    const span = document.createElement('span');
    span.textContent = m.textContent;
    m.replaceWith(span);
  });
  body.classList.remove('has-kw-highlight');
}

/** 对元素做"严格匹配"高亮：仅高亮未被 Pagefind <mark> 包裹、且完整命中查询词的文本节点。 */
function highlightStrict(el, terms) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    // 跳过已在 Pagefind <mark> 内的文本，避免嵌套
    if (node.parentNode && node.parentNode.tagName === 'MARK') return;
    const text = node.nodeValue || '';
    if (!terms.some((t) => text.includes(t))) return;
    node.parentNode.replaceChild(fragmentize(text, terms), node);
  });
}

/** 将文本中出现的所有查询词片段替换为带 search-ui__m-exact 标记的 <mark>。 */
function fragmentize(text, terms) {
  const frag = document.createDocumentFragment();
  let rest = text;
  while (rest.length) {
    let nextIdx = -1;
    let hitTerm = null;
    for (const term of terms) {
      const idx = rest.indexOf(term);
      if (idx !== -1 && (nextIdx === -1 || idx < nextIdx)) { nextIdx = idx; hitTerm = term; }
    }
    if (nextIdx === -1) {
      frag.appendChild(document.createTextNode(rest));
      break;
    }
    if (nextIdx > 0) frag.appendChild(document.createTextNode(rest.slice(0, nextIdx)));
    const m = document.createElement('mark');
    m.className = EXACT_CLS;
    m.textContent = hitTerm;
    frag.appendChild(m);
    rest = rest.slice(nextIdx + hitTerm.length);
  }
  return frag;
}

/** 对当前输入执行搜索。 */
async function runSearch(ui, term) {
  const input = $(INPUT_SEL, ui);
  const text = (term || (input && input.value) || '').trim();
  if (!text) {
    // 输入为空不展示下拉；清空输入时即时收起面板
    collapseUi(ui);
    return;
  }
  openUi(ui);

  const pf = await loadPagefind();
  if (!pf) {
    const box = $(RESULTS_SEL, ui);
    if (box) {
      box.classList.add('is-empty');
      box.innerHTML = '<p class="search-ui__empty">搜索索引未生成（需运行 pagefind 构建）</p>';
    }
    return;
  }

  const res = await pf.search(text);
  const items = res && res.results ? res.results.slice(0, 8) : [];
  const hydrated = await Promise.all(items.map((it) => it.data && it.data()));

  // 拉丁查询词弱结果过滤：Pagefind 会把数学公式里的单字母(如 d/D)
  // 当作独立 token 命中，导致"中文文章里根本没有这个词"却返回。
  // 对含拉丁字母/数字的查询，仅保留摘录里确实出现该词的结果。
  const latinWords = (text.match(/[a-zA-Z][a-zA-Z0-9_-]*/g) || []).filter((w) => w.length >= 2);
  let list = hydrated.filter(Boolean);
  if (latinWords.length) {
    const q = text.toLowerCase();
    list = list.filter((d) => {
      const hay = ((d.plain_excerpt || '') + ' ' + (d.meta && d.meta.title || '')).toLowerCase();
      // 只要摘录文本里实际含查询串（去空格小写），就视为有效命中
      return q.split(/\s+/).every((w) => hay.includes(w));
    });
  }
  renderResults(ui, list);
}

/** 展开/收起结果面板。 */
function openUi(ui) { ui.classList.add('is-active'); }
/** 收起结果面板但保留输入框焦点（用于输入被清空的场景）。 */
function collapseUi(ui) {
  ui.classList.remove('is-active');
  clearResults(ui);
}
function closeUi(ui) {
  collapseUi(ui);
  const input = $(INPUT_SEL, ui);
  if (input) input.blur();
}

const onInput = debounce((event) => {
  const ui = event.target.closest(UI_SEL);
  if (ui) runSearch(ui);
}, 200);

/** document 级委托：命中 data-search-input → 搜索；点击空白/按 Esc → 收起。 */
let onDocClick = null;
let onKey = null;

/** 初始化：注册 document 级委托（幂等，重复调用只生效一次）。 */
export const init = () => {
  if (onDocClick) return { destroy: cleanup, };

  onDocClick = (event) => {
    const ui = event.target.closest(UI_SEL);
    if (ui) {
      // 点击结果链接：允许默认导航（swup 接管）
      if (event.target.closest('.search-ui__result')) return;
      const input = $(INPUT_SEL, ui);
      // 仅在输入非空时展开下拉；空输入点击只负责聚焦输入框
      if (input && !input.value.trim()) {
        input.focus();
      } else {
        openUi(ui);
      }
    } else {
      // 点击面板外部 → 关闭所有打开的搜索
      $$(`${UI_SEL}.is-active`).forEach(closeUi);
    }
  };
  onKey = (event) => {
    if (event.key === 'Escape') $$(`${UI_SEL}.is-active`).forEach(closeUi);
    if (event.key === '/' ) {
      // 快捷键：聚焦第一个搜索框（可选）
      const first = $(INPUT_SEL);
      if (first) { first.focus(); first.select(); }
    }
  };

  document.addEventListener('input', onInput, true);
  document.addEventListener('click', onDocClick);
  document.addEventListener('keydown', onKey);
  // 文章页正文关键词高亮：整页首次加载立即执行一次；
  // SPA 内容替换后由 theme:content-replaced 再次触发（init 幂等，监听需独立注册）。
  highlightFromUrl();
  document.addEventListener('theme:content-replaced', highlightFromUrl);

  return { destroy: cleanup, };
};

/** 清理：移除监听。供 SPA 重建前调用或页面卸载时使用。 */
export function cleanup() {
  document.removeEventListener('input', onInput, true);
  document.removeEventListener('theme:content-replaced', highlightFromUrl);
  if (onDocClick) document.removeEventListener('click', onDocClick);
  if (onKey) document.removeEventListener('keydown', onKey);
  onDocClick = null;
  onKey = null;
}

/** 兼容 features/index.js 的 destroy 调用约定。 */
export const destroy = cleanup;