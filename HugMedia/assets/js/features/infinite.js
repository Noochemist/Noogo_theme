/* Phase 3 · features/infinite.js — 列表页双向无限滚动 + 页码跳转
   机制：Hugo 服务端按 paginate 生成静态分页页（/page/2/ ...）。
   列表根模板渲染卡片网格 [data-infinite-grid] 与分页控件 [data-infinite-pagination]，
   本模块用两个 IntersectionObserver 驱动双向加载：

   · 向下滚动（页面向上滑）：观察底部哨兵 [data-infinite-sentinel]，提前 600px
     预取下一页，卡片追加到网格末尾。
   · 回拉到顶：JS 在网格顶部插入顶部哨兵，当哨兵进入视口顶部约 260px 区间时
     触发加载上一页；新卡片插到哨兵之后（哨兵始终位于已加载列表最顶端），
     并以「追加前的首张卡片」为锚点即时补偿滚动偏移，保持阅读位置不跳变。
   · 页码跳转：表单输入页码回车 / 点击「跳转」，按 data-page-urls 映射出目标 URL
     后触发跳转（swup 拦截同源 <a> 点击走 SPA；无 JS 时上一页/下一页链接原生可点）。

   功能层/风格层解耦约定：
   - 只认 data-* 属性（data-infinite-pagination / data-infinite-grid /
     data-infinite-sentinel / data-prev-url / data-next-url / data-page-urls /
     data-current-page / data-total-pages / data-state）与 .infinite-* 通用类；
   - 不写 .xhs-* 等风格类名；网格外观仍由风格层 CSS 全权负责。
   - 无 JS（禁用 JS / SEO 抓取）：分页链接仍可直接跳转，本模块不阻断功能。 */

const PAGINATION_SEL = '[data-infinite-pagination]';
const GRID_SEL = '[data-infinite-grid]';
const SENTINEL_SEL = '[data-infinite-sentinel]';
const TOP_SENTINEL_ATTR = 'data-infinite-sentinel-top';
const TOP_TRIGGER_ZONE = 260;   // 顶部触发区间（px）：哨兵进入该区间即预取上一页
const NEXT_PREFETCH_ZONE = 600; // 底部预取区间（px）：提前 600px 预取下一页

/** 当前文档中可交互的实例状态。 */
const state = {
  pagination: null,     // 分页容器元素（data-infinite-pagination）
  grid: null,           // 卡片网格容器（data-infinite-grid）
  sentinelTop: null,    // 顶部哨兵（JS 插入，始终位于已加载列表最顶端）
  sentinelBottom: null, // 底部哨兵（模板内置）
  loading: false,       // 并发锁：一次只允许一页在途
  nextFinished: false,  // 已加载到列表末尾
  prevFinished: false,  // 已加载到列表开头
  prevArmed: true,      // 顶部触发臂：哨兵离开触发区间后重新上膛，防止追加载连发
  bottomDrainId: null,  // 底部预填 rAF 句柄（销毁时取消）
  bottomObserver: null, // 底部观察器
  topObserver: null,    // 顶部观察器
};

/** 提取响应 HTML 中的卡片网格与分页状态。 */
function parseDocument(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const grid = doc.querySelector(GRID_SEL);
  const pagination = doc.querySelector(PAGINATION_SEL);
  return { grid, pagination };
}

/** 追加本页卡片到网格末尾（下一页方向）。返回是否有卡片可追加。 */
function appendPage(grid) {
  if (!grid) return false;
  const cards = Array.from(grid.children);
  if (!cards.length) return false;

  const frag = document.createDocumentFragment();
  cards.forEach((card) => {
    card.classList.add('infinite-page-enter');
    frag.appendChild(card);
  });
  state.grid.appendChild(frag);
  return true;
}

/** 插入上一页卡片到顶部哨兵之后（哨兵保持在列表最顶端）。返回是否有卡片可插入。 */
function prependPage(grid) {
  if (!grid) return false;
  const cards = Array.from(grid.children);
  if (!cards.length) return false;

  const frag = document.createDocumentFragment();
  cards.forEach((card) => {
    card.classList.add('infinite-page-enter');
    frag.appendChild(card);
  });
  state.sentinelTop.after(frag);
  return true;
}

/** 依据当前页码把地址栏同步到对应分页地址（replaceState，不产生新历史条目），
    保证「地址栏分页地址 = 当前正处分页」。 */
function syncUrlFromCurrent() {
  const p = state.pagination;
  if (!p || !history.replaceState) return;
  const current = Number(p.getAttribute('data-current-page')) || 1;
  const urls = (p.getAttribute('data-page-urls') || '').trim().split(/\s+/);
  const url = urls[current - 1];
  if (!url) return;
  const target = url.startsWith('/') ? url : `/${url}`;
  if (target !== location.pathname) {
    history.replaceState(null, '', target);
  }
}

/** 加载完成后同步分页状态（页码 + 相邻链接 + 控件 + 地址栏）：
    以「本次加载所在页」为准推进当前页码（输入框/地址栏随之对齐），
    只刷新「近叠加端」的相邻链接（指向未加载的内容），
    保留「远固定端」仍指向远端未加载区域，供反向滚动继续取用。
    side='next'（向下追加）：推进下一页链接，上一页链接保持；
    side='prev'（向上插入）：推进上一页链接，下一页链接保持。 */
function syncAfterLoad(response, { side = 'prev' } = {}) {
  const { pagination } = response;
  if (!pagination || !state.pagination) return;

  const setAttr = (name) => {
    if (pagination.hasAttribute(name)) {
      state.pagination.setAttribute(name, pagination.getAttribute(name));
    } else {
      state.pagination.removeAttribute(name);
    }
  };

  // 当前页码：同步到本次加载页（用户此刻正处的一端）
  setAttr('data-current-page');

  // 近叠加端：跟随本次响应页推进；远固定端：维持既有
  setAttr(side === 'next' ? 'data-next-url' : 'data-prev-url');

  // 全局页码映射始终以最新为准
  const pageUrls = pagination.getAttribute('data-page-urls');
  if (pageUrls) state.pagination.setAttribute('data-page-urls', pageUrls);

  refreshControls();
}

/** 刷新控件：页码输入框、上一页/下一页的 href 与禁用态。 */
function refreshControls() {
  const p = state.pagination;
  if (!p) return;

  const current = Number(p.getAttribute('data-current-page')) || 1;
  const input = p.querySelector('[data-infinite-page-input]');
  if (input && document.activeElement !== input) input.value = String(current);

  applyLinkState(p.querySelector('[data-infinite-prev]'), p.getAttribute('data-prev-url'));
  applyLinkState(p.querySelector('[data-infinite-next]'), p.getAttribute('data-next-url'));

  syncUrlFromCurrent();
}

/** 更新单个方向按钮的可点态：有 URL 则保持可点并同步 href，无则置灰。 */
function applyLinkState(el, url) {
  if (!el) return;
  el.classList.toggle('is-muted', !url);
  el.setAttribute('aria-disabled', String(!url));
  if (url) {
    if (el.tagName === 'A') el.setAttribute('href', url);
  } else if (el.tagName === 'A') {
    el.removeAttribute('href');
  }
}

/** 请求某分页页的 HTML 并解析为 { grid, pagination }。 */
async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { accept: 'text/html', 'x-requested-with': 'infinite-scroll' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseDocument(await res.text());
}

/** 底部预填：每帧评估是否续载下一页。触发条件（任一）：
     1) 底部哨兵已进入本屏（分页页数据不足一屏时自动补齐到满屏/末页）；
     2) 文档滚动位置已接近末尾（距底部不足 NEXT_PREFETCH_ZONE）。
   以 rAF 单节奏执行，兼作「下滚滚动兜底」——即使哨兵 IO 失效，
   任何布局下滚到接近文档底部都能触发下一页加载。 */
function drainBottom() {
  if (state.loading || state.nextFinished) return;
  const p = state.pagination;
  if (!p || !p.hasAttribute('data-next-url')) return;
  const sentinel = state.sentinelBottom;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const sentinelNear =
    sentinel && sentinel.getBoundingClientRect().top < viewportHeight - 1;
  const docNearBottom =
    viewportHeight + window.scrollY + NEXT_PREFETCH_ZONE >=
    document.documentElement.scrollHeight;
  if (!sentinelNear && !docNearBottom) return;
  if (state.bottomDrainId != null) return; // 已有预填在途，避免重复排队
  state.bottomDrainId = requestAnimationFrame(() => {
    state.bottomDrainId = null;
    if (state.loading || state.nextFinished) return;
    loadNext();
  });
}

/** 滚动兜底：任一 scroll 事件都做一次双向评估——与 IO 哨兵互为保险，
    使「向下滚」与「回拉到顶」在任意布局/浏览器下都有确定性触发通道。 */
function checkScroll() {
  // 顶部：离开触发区间则上膛；回拉到触发区间且已上膛则加载上一页。
  // 初始 prevArmed=false：直达分页页（page/2/ 等）进场不自动跳页。
  if (window.scrollY <= TOP_TRIGGER_ZONE) {
    if (!state.loading && state.prevArmed && !state.prevFinished) {
      state.prevArmed = false;
      loadPrev();
    }
  } else {
    state.prevArmed = true;
  }
  // 底部：文档滚动接近末尾即预填下一页。
  drainBottom();
}

let scrollListener = null; // 当前滚动兜底监听（destroy 时移除）

/** 加载下一页并追加到网格末尾。 */
async function loadNext() {
  if (state.loading || state.nextFinished) return;
  const p = state.pagination;
  const url = p && p.getAttribute('data-next-url');
  if (!url) {
    state.nextFinished = true;
    setStatus('end');
    return;
  }

  state.loading = true;
  setStatus('loading');
  try {
    const response = await fetchPage(url);
    if (!appendPage(response.grid)) {
      state.nextFinished = true;
      setStatus('end');
      return;
    }
    syncAfterLoad(response, { side: 'next' });
    state.nextFinished =
      !(response.pagination && response.pagination.hasAttribute('data-next-url'));
    setStatus(state.nextFinished ? 'end' : 'idle');
  } catch (_e) {
    setStatus('error');
  } finally {
    state.loading = false;
    // 兜底 1：矮页面不足一屏时按一屏节奏续载下一段（消除下滚失灵）。
    drainBottom();
    // 兜底 2：若刚才加载下一页期间用户已回拉到顶，补一次上拉评估，
    // 避免「首次回拉丢失、需二次手势」的失灵感。
    maybeAutoPrev();
  }
}

/** 加载上一页并插入到列表顶端，同步补偿滚动偏移以保持阅读位置。 */
async function loadPrev() {
  if (state.loading || state.prevFinished) return;
  const p = state.pagination;
  const url = p && p.getAttribute('data-prev-url');
  if (!url) {
    state.prevFinished = true;
    return;
  }

  // 锚点：追加前网格的首张真实卡片（哨兵位于其上方）
  const anchor = state.sentinelTop && state.sentinelTop.nextElementSibling;
  const anchorTop = anchor ? anchor.getBoundingClientRect().top : null;

  state.loading = true;
  setStatus('loading');
  try {
    const response = await fetchPage(url);
    if (!prependPage(response.grid)) {
      state.prevFinished = true;
      setStatus('idle');
      return;
    }
    syncAfterLoad(response);
    state.prevFinished =
      !(response.pagination && response.pagination.hasAttribute('data-prev-url'));

    // 滚动补偿：让「追加前的首张卡片」保持原视口位置，避免整页跳动
    if (anchor && anchor.isConnected && anchorTop != null) {
      const top = anchor.getBoundingClientRect().top;
      const dy = top - anchorTop;
      if (Math.abs(dy) > 1) window.scrollBy({ top: dy, behavior: 'auto' });
    }

    if (state.nextFinished) setStatus('end');
    else setStatus('idle');
  } catch (_e) {
    setStatus('error');
  } finally {
    state.loading = false;
  }
}

/** 更新 aria-live 状态提示与 data-state。 */
function setStatus(next) {
  if (!state.pagination) return;
  state.pagination.setAttribute('data-state', next);
  const statusEl = state.pagination.querySelector('[data-infinite-status]');
  if (!statusEl) return;
  statusEl.textContent = state.pagination.getAttribute(`data-status-${next}`) || '';
  statusEl.hidden = next === 'idle';
}

/** 补一次「上拉评估」：仅在哨兵此刻已进入顶部触发区间时补加载上一页。
    用于加载下一页 finishing 后兜底，杜绝上一页触发的首次失感；由 prevArmed
    （用户曾离开顶部再回来）与 prevFinished 双重守卫，避免直达分页页自动加载。 */
function maybeAutoPrev() {
  const s = state.sentinelTop;
  if (!s) return;
  if (!state.prevArmed || state.prevFinished || state.loading) return;
  const r = s.getBoundingClientRect();
  if (r.top > TOP_TRIGGER_ZONE) return;
  if (r.bottom < 0) return;
  state.prevArmed = false;
  loadPrev();
}

/** 顶部触发：哨兵进入顶部触发区间 → 加载上一页；离开视口后重新上膛。 */
function handleTop(entries) {
  const anyIn = entries.some((entry) => entry.isIntersecting);
  if (anyIn) {
    const inZone = entries.some(
      (entry) => entry.isIntersecting && entry.boundingClientRect.top < TOP_TRIGGER_ZONE
    );
    if (inZone && !state.loading && state.prevArmed) {
      state.prevArmed = false;
      loadPrev();
    }
  } else {
    state.prevArmed = true;
  }
}

/** 底部触发：进入视口即加载下一页（提前预取，追加无缝）。 */
function handleBottom(entries) {
  if (entries.some((entry) => entry.isIntersecting)) loadNext();
}

/** 绑定页码跳转：回车 / 点击「跳转」按目标页码导航。 */
function bindJump() {
  const p = state.pagination;
  const form = p.querySelector('[data-infinite-jump]');
  const input = p.querySelector('[data-infinite-page-input]');
  if (!form || !input) return;

  const go = () => {
    const total = Number(p.getAttribute('data-total-pages')) || 1;
    const current = Number(p.getAttribute('data-current-page')) || 1;
    const target =
      Math.min(Math.max(1, Math.round(Number(input.value) || current)), total);
    input.value = String(target);
    if (target === current) return;

    const urls = (p.getAttribute('data-page-urls') || '').trim().split(/\s+/);
    const url = urls[target - 1];
    if (!url) return;

    // 派发一次真实点击：swup 以 SPA 接管同源 <a>（非 SPA 环境同样可导航）
    const a = document.createElement('a');
    a.href = url;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    go();
  });
  input.addEventListener('focus', () => input.select());
}

/** 上一页/下一页按钮：JS 环境下改为「就地加载」，保持浏览连续。 */
function bindButtons() {
  const p = state.pagination;
  const prevEl = p.querySelector('[data-infinite-prev]');
  const nextEl = p.querySelector('[data-infinite-next]');
  if (prevEl) {
    prevEl.addEventListener('click', (event) => {
      if (p.hasAttribute('data-prev-url')) {
        event.preventDefault();
        loadPrev();
      }
    });
  }
  if (nextEl) {
    nextEl.addEventListener('click', (event) => {
      if (p.hasAttribute('data-next-url')) {
        event.preventDefault();
        loadNext();
      }
    });
  }
}

/** 绑定当前列表页（SPA 替换后由 rewire 重新调用）。 */
export const init = () => {
  if (state.bottomObserver || state.topObserver) destroy();

  state.pagination = document.querySelector(PAGINATION_SEL);
  state.grid = document.querySelector(GRID_SEL);

  // 无分页或首页未启用（如文章页）→ 直接结束，避免空转
  if (!state.pagination || !state.grid) {
    state.pagination = null;
    state.grid = null;
    return { destroy };
  }

  // 顶部哨兵（JS 增强的一部分）：始终位于已加载列表最顶端
  state.sentinelTop = state.grid.querySelector(`[${TOP_SENTINEL_ATTR}]`);
  if (!state.sentinelTop) {
    state.sentinelTop = document.createElement('span');
    state.sentinelTop.setAttribute(TOP_SENTINEL_ATTR, '');
    state.sentinelTop.setAttribute('aria-hidden', 'true');
    state.grid.prepend(state.sentinelTop);
  }
  state.sentinelBottom =
    state.pagination.querySelector(SENTINEL_SEL) || state.pagination;

  state.nextFinished = !state.pagination.hasAttribute('data-next-url');
  state.prevFinished = !state.pagination.hasAttribute('data-prev-url');
  state.loading = false;
  // 初始不武装：直达分页页（page/3/ 等）时哨兵已在触发区内，
  // 需先经一次「下拉离开视口再回拉」手势才触发上一页，避免进场即跳页。
  state.prevArmed = false;

  bindJump();
  bindButtons();
  refreshControls();

  state.bottomObserver = new IntersectionObserver(handleBottom, {
    rootMargin: `0px 0px ${NEXT_PREFETCH_ZONE}px 0px`,
  });
  state.bottomObserver.observe(state.sentinelBottom);

  state.topObserver = new IntersectionObserver(handleTop, { threshold: 0 });
  state.topObserver.observe(state.sentinelTop);

  setStatus(state.nextFinished ? 'end' : 'idle');

  // 滚动兜底：任何滚动都做双向评估，与 IO 哨兵互为保险
  if (!scrollListener) {
    scrollListener = () => checkScroll();
    window.addEventListener('scroll', scrollListener, { passive: true });
  }
  // 矮页面预填：进场内容不足一屏时自动补齐，保证「下滚」始终有页面可续
  drainBottom();

  return { destroy };
};

/** 清理：断开观察、移除监听、复位状态。供 SPA 重建前调用或模块重挂时使用。 */
export function destroy() {
  if (scrollListener) {
    window.removeEventListener('scroll', scrollListener);
    scrollListener = null;
  }
  if (state.bottomDrainId != null) {
    cancelAnimationFrame(state.bottomDrainId);
    state.bottomDrainId = null;
  }
  state.bottomObserver?.disconnect();
  state.bottomObserver = null;
  state.topObserver?.disconnect();
  state.topObserver = null;
  state.sentinelTop?.remove();
  state.sentinelTop = null;
  state.sentinelBottom = null;
  state.pagination = null;
  state.grid = null;
  state.nextFinished = false;
  state.prevFinished = false;
  state.loading = false;
  state.prevArmed = false;
}