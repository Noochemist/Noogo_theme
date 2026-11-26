/* Phase 3 · features/infinite.js — 列表页双向无限滚动 + 页码跳转
   机制：Hugo 服务端按 paginate 生成静态分页页（/page/2/ ...）。
   列表根模板渲染卡片网格 [data-infinite-grid] 与分页控件 [data-infinite-pagination]，
   本模块驱动双向加载：

   · 向下滚动（上滑手势加载）：滚到列表尾部后，继续上滑出现贴纸提示；
     上滑超过视口高度 1/5 才确认加载下一页（追加到网格末尾）；
     不足阈值松手则回弹当前分页状态、贴纸消失；已是最后一页时提示「到底啦」。
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
const TOP_SENTINEL_ATTR = 'data-infinite-sentinel-top';
const TOP_TRIGGER_ZONE = 260; // 顶部触发区间（px）：哨兵进入该区间即预取上一页
const PULL_THRESHOLD_FRACTION = 3 / 10; // 上滑超过视口高度该比例才确认触发下一页
const PULL_OVERRUN = 1.6; // 空白区可超过阈值继续拉扯的倍率上限（阻尼感）
const PULL_SETTLE_BASE = 160;  // 回落动画基础时长(ms)
const PULL_SETTLE_GAIN = 0.35; // 每上滑像素的回落时长增益(ms)：回弹速度贴合人手回速
const PULL_SETTLE_MAX = 420;   // 回落时长上限(ms)：避免高空白区落下过慢拖沓
const PULL_TEXT_NEXT = '↑↑(•̀ᴗ•́)و 上滑看更多';
const PULL_TEXT_END = '(￣▽￣)~* 到底啦，我是有底线的';
const DIRECTION_LOCK_MS = 600; // 方向互斥冷窗(ms)：确认加载下一页后的短暂窗口内忽略一切上一页请求
const PREV_GESTURE_COOLDOWN = 300; // 下拉手势防抖(ms)：同一轮下拉的连续事件只生效一次
const WHEEL_STEP_MAX = 150;   // px：单次滚轮的位移记入上限，仅防极快惯性加速瞬间拉满弹跳
const WHEEL_TAIL_MS = 400;    // ms：空白区归零后的「惯性尾段」窗口（触控板 momentum 残存期）
const WHEEL_TAIL_GAIN = 0.5;  // 尾段窗口内正向滚轮的计入权重：触控板惯性长尾打折，防贴尾冲顶误触发

/** 当前文档中可交互的实例状态。 */
const state = {
  pagination: null,      // 分页容器元素（data-infinite-pagination）
  grid: null,            // 卡片网格容器（data-infinite-grid）
  sentinelTop: null,     // 顶部哨兵（JS 插入，始终位于已加载列表最顶端）
  loading: false,        // 并发锁：一次只允许一页在途
  nextFinished: false,   // 已加载到列表末尾
  prevFinished: false,   // 已加载到列表开头
  prevArmed: false,      // 顶部触发臂：哨兵离开触发区间后重新上膛，防止追加载连发
  nextCommittedAt: 0,    // 最近一次确认加载下一页的时间戳（方向互斥基准）
  prevRequestedAt: 0,    // 最近一次显式下拉触发上一页的时间戳（手势防抖）
  topObserver: null,     // 顶部观察器
  pullEl: null,          // 底部上拉空白区（JS 动态注入文档流末尾，高度随手势变化）
  pullInner: null,       // 空白区内提示文字容器
  pullText: null,        // 提示文字（「上滑看更多」/「到底啦」）
  pullTimer: null,       // 手势空闲复位定时器
  pullCommitted: false,  // 已确认触发本页加载（防重复提交）
  settleRaf: null,       // 回弹动画 rAF 句柄（销毁时取消）
};

let overscroll = 0;       // 尾部继续上滑的累积距离（px）
let touchStartY = null;   // 触摸起点（用于累计上滑位移）
let wheelTailUntil = 0;   // 「惯性尾段」截止时间戳（performance.now 基准）：
                          // 空白区归零后的这一小窗口内，正向滚轮按折扣权重计入，
                          // 吸收触控板 momentum 长尾，防刚收起的空白区又瞬间弹起

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
  // 目标网格必须仍在文档内（防 SPA 换页后把内容拼进已离树容器）
  if (!state.grid || !state.grid.isConnected) return false;
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
  // 顶部哨兵必须仍在文档内（防 SPA 换页后把内容插进已离树容器）
  if (!state.sentinelTop?.isConnected) return false;
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
    保证「地址栏分页地址 = 当前正处分页」。
    注意：replaceState 必须继承并保留既有 history.state（swup 在 enable 时写入的
    source/index 标记），只替换其中的 url 字段——与 swup 自身的 updateHistoryRecord
    语义一致。若直接写 null 会把 swup 标记清空，导致从文章页按浏览器返回回到该分页时，
    swup 的 skipPopStateHandling 判定 event.state.source !== 'swup' 而忽略 popstate，
    表现为「地址栏回切到分页地址，但页面内容停留原地」。 */
/** 当前文档是否仍有生效的无限滚动上下文。
    SPA 换页后旧列表的分页控件/网格已脱离文档（residual 引用），
    任何基于残留引用的手势/地址栏改写都必须静默停下并就地销毁实例，
    防止非列表页（文章/单页）被误挂无限滚动行为。 */
function isLive() {
  const p = state.pagination;
  if (!p) return false;
  if (!p.isConnected || !state.grid || !state.grid.isConnected) {
    destroy();
    return false;
  }
  return true;
}

function syncUrlFromCurrent() {
  const p = state.pagination;
  // 地址栏改写的最後防线：分页控件必须仍在文档内，残留/离树引用一律不得改写 URL
  if (!p || !p.isConnected || !history.replaceState) return;
  const current = Number(p.getAttribute('data-current-page')) || 1;
  const urls = (p.getAttribute('data-page-urls') || '').trim().split(/\s+/);
  const url = urls[current - 1];
  if (!url) return;
  const target = url.startsWith('/') ? url : `/${url}`;
  if (target !== location.pathname) {
    const prev = history.state || {};
    history.replaceState(
      { ...prev, url: target, random: Math.random(), source: 'swup' },
      '',
      target
    );
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
  if (!pagination || !state.pagination?.isConnected) return;

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

/** 是否已滚到列表尾部（视口已贴文档底，无法再向下滚动）。 */
function atTail() {
  const docEl = document.documentElement;
  return window.innerHeight + window.scrollY >= docEl.scrollHeight - 2;
}

/** 获取底部「上拉空白区」（懒创建，挂文档流末尾）。
    高度由 JS 随手势控制，页面同时被钉在文档底 → 空白区从视口底部露出；
    回弹时高度归零 → 页面回落原位，空白区（含提示文字）被收进画面外。 */
function getPullEl() {
  if (state.pullEl) return state.pullEl;
  const wrap = document.createElement('div');
  wrap.className = 'infinite-pull';
  wrap.setAttribute('data-infinite-pull', '');

  const inner = document.createElement('div');
  inner.setAttribute('data-infinite-pull-inner', '');
  const text = document.createElement('div');
  text.setAttribute('data-infinite-pull-text', '');
  text.setAttribute('aria-hidden', 'true');
  inner.appendChild(text);
  wrap.appendChild(inner);
  document.body.appendChild(wrap);

  // 空白区与页面背景同色（透明则取根元素背景兜底；风格层可覆盖）
  const st = getComputedStyle(document.body);
  let bg = st.backgroundColor;
  if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') {
    bg = getComputedStyle(document.documentElement).backgroundColor;
  }
  if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
    wrap.style.backgroundColor = bg;
  }

  state.pullEl = wrap;
  state.pullInner = inner;
  state.pullText = text;
  return wrap;
}

/** 依据当前上滑距离渲染：空白区加高、文案切换、文字透明度递增。 */
function renderPull() {
  const el = getPullEl();
  const amount = Math.max(0, Math.floor(overscroll));
  el.style.height = `${amount}px`;
  if (amount <= 0) return;
  // 上拉显形期：状态槽（加载/到底提示）让位，颜文字独占提示位
  document.body.setAttribute('data-infinite-pulling', '');
  state.pullText.textContent = state.nextFinished ? PULL_TEXT_END : PULL_TEXT_NEXT;
  const t = Math.min(1, 0.1 + (amount / pullThreshold()) * 0.9);
  state.pullText.style.opacity = String(t);
  keepPinned();
}

/** 上滑时把视口钉在文档末端，使空白区从视口底部持续露出。 */
function keepPinned() {
  window.scrollTo(0, document.documentElement.scrollHeight - window.innerHeight);
}

/** 上滑确认阈值：视口高度的 1/5。 */
function pullThreshold() {
  return (window.innerHeight || document.documentElement.clientHeight) * PULL_THRESHOLD_FRACTION;
}

/** 取消进行中的回弹动画，并将手势基准同步为空白区当前高度（新手势随时接管）。 */
function cancelSettle() {
  if (state.settleRaf != null) {
    cancelAnimationFrame(state.settleRaf);
    state.settleRaf = null;
    overscroll = state.pullEl
      ? Number.parseFloat(state.pullEl.style.height || '0')
      : 0;
  }
}

/** 上滑超过阈值：立即回弹并触发下一页（末页则只回弹，「到底啦」已作反馈）。 */
function commitPull() {
  if (state.pullCommitted) return;
  state.pullCommitted = true;
  settlePull();
  if (state.nextFinished) {
    state.pullCommitted = false; // 末页：只回弹，之后仍可上滑再次查看提示
    return;
  }
  loadNext(); // 加载完成（finally）时复位 pullCommitted
}

/** 未达阈值松手 / 加载确认：空白区以贴合人手回速的平滑动画收拢。
    时长随当前高度自适应（略高则略久），三阶缓出使松开后先以释放速度
    滑动、渐近零速停下，从起点到落点全程无「硬跳」。
    回弹全程用 keepPinned 钉住文档尾，保证空白区下落肉眼可见。 */
function settlePull() {
  if (state.settleRaf != null) return;
  const el = state.pullEl;
  const start = el ? Number.parseFloat(el.style.height || '0') : 0;
  if (!el || start <= 0.5) {
    finishPull();
    return;
  }
  const t0 = performance.now();
  const duration = Math.min(PULL_SETTLE_MAX, PULL_SETTLE_BASE + start * PULL_SETTLE_GAIN);
  const easeOut = (u) => 1 - Math.pow(1 - u, 3);
  const step = () => {
    const u = Math.min(1, (performance.now() - t0) / duration);
    const h = start * (1 - easeOut(u));
    if (h > 0.5) {
      el.style.height = `${h}px`;
      keepPinned();
      state.settleRaf = requestAnimationFrame(step);
    } else {
      state.settleRaf = null;
      finishPull();
    }
  };
  state.settleRaf = requestAnimationFrame(step);
}

/** 手势结束：清零位移、收起空白区与文字透明度（幂等，供任何路径复用）。
    soft=true 且回落动画进行中（如确认加载后的收尾）时，交由动画自然走完
    最后一程，避免把仍在滑落的空白区直接「跳回」0px；
    只有「用户滚动离开尾部/反向滚动」这类主动离开路径才做硬收拢。
    注意：不改动 pullCommitted——锁定/解锁由 commitPull 与 loadNext 完成。 */
function finishPull({ soft = false } = {}) {
  clearTimeout(state.pullTimer);
  if (soft && state.settleRaf != null) return; // 交给回落动画自然归零
  cancelSettle();
  overscroll = 0;
  // 空白区归零 → 进入「惯性尾段」窗口：此后一小段时间内触控板 momentum
  // 长尾仍在放电，把正向滚轮打折扣计入，防止刚收起的空白区又被残存惯性弹起。
  wheelTailUntil = performance.now() + WHEEL_TAIL_MS;
  const el = state.pullEl;
  if (el) {
    el.style.height = '0px';
    const t = state.pullText;
    if (t) t.style.opacity = '';
  }
  // 空白区收起：状态槽恢复可显示（若正处于 loading/end/error）
  document.body.removeAttribute('data-infinite-pulling');
}

/** 手势空闲复位：未达阈值前松手 → 回弹至当前分页状态。 */
function resetPull() {
  if (state.pullCommitted || state.loading || overscroll <= 0) return;
  settlePull();
}

/** 手势空闲计时：滚轮/触控板无法感知「手指是否按压」，
    以长空闲（1.5s）近似「已松手」；持续滚动期间每次事件都会重置该计时，
    一旦真正停手才触发回落——避免贴尾部稍作停顿就被弹回。
    触摸手势不走此路径：回落判定只在 touchend 触发。 */
function armPullReset() {
  clearTimeout(state.pullTimer);
  state.pullTimer = setTimeout(resetPull, 1500);
}

/** 滚轮手势：贴尾部继续上滑时空白区随手上抬，超过阈值即确认加载下一页。
    与触摸手势对齐做「软处理」——

    - 回弹动画进行中：整个动画期（≤几百毫秒）完全吸纳滚轮输入并忽略——
      触控板 momentum 长尾与回弹动画天然重叠，任何微小事件都可能掐掉动画
      再重新拉起，从根上杜绝这种「取消回弹-再拉起」的反复跳动；
      同时阻断原生滚动，避免浏览器惯性滚动与 keepPinned 钉底互相拉锯。
    - 空白区归零后的「惯性尾段」窗口（400ms）内，正向滚轮按折扣权重计入，
      吸收触控板 momentum 的拖尾放电，防止刚收起的空白区又被残存惯性弹起。
    - 反向滚轮先软性回退空白区位移（归零后才收起），而不是任何负 delta 都
      瞬间硬收，避免触控板正负毛刺高频触发「收起-重拉」。

    页面已离开尾部（向上恢复正常滚动）时收起空白区。 */
function onWheel(e) {
  if (!isLive()) return;
  if (!atTail()) {
    // 非尾部：顶部触发区内的反向滚动 = 显式「回上一页」手势。
    // 覆盖「仅轻微可滚动」的分页页（scrollRange ≤ 顶部区间），
    // 此类页面没有足以武装 prevArmed 的离顶滚动，自动触发全失效。
    if (e.deltaY < 0 && window.scrollY <= TOP_TRIGGER_ZONE) requestPrev();
    finishPull();
    return;
  }
  const delta = e.deltaY;
  if (Math.abs(delta) < 1) return;

  // 回弹动画进行中：整个动画期完全吸纳滚轮输入并忽略（正反向同此），
  // 让动画自然走完，杜绝「取消回弹-再拉起」的拉锯跳动。
  if (state.settleRaf != null) {
    e.preventDefault(); // 同时阻断原生滚动，避免与 keepPinned 钉底互相拉锯
    return;
  }

  // 反向（视角返回上方）+ 顶部触发区 + 无空白区 = 显式「回上一页」手势
  //（与触摸尾部逻辑对齐）。关键覆盖：直达分页页后首页列表不足一屏、
  // atTail 恒真、滚动范围归零时，非尾部分支与 prevArmed 自动触发全部失效，
  // 此处的回拉是达到上一页的唯一信号。空白区存在时仍走下方软回退收起，互不干扰。
  if (delta < 0 && window.scrollY <= TOP_TRIGGER_ZONE && overscroll <= 0) {
    requestPrev();
    return;
  }
  // 反向（视角返回上方）：无空白区时放行浏览器正常滚动，不做任何拦截；
  // 有空白区则软性回退位移，避免负 delta 高频毛刺造成「收起-重拉」跳动。
  if (delta < 0) {
    if (overscroll <= 0) return;
    e.preventDefault();
    if (state.pullCommitted) return; // 已确认加载：锁定，等待回弹/新内容
    overscroll = Math.max(0, overscroll + delta);
    renderPull();
    armPullReset();
    if (overscroll <= 0) finishPull();
    return;
  }

  // 正向（继续上滑探更多）：拦截原生滚动，把位移计入上拉空白区。
  // 「惯性尾段」窗口内（空白区刚归零）触控板 momentum 拖尾按折扣计入。
  e.preventDefault();
  if (state.pullCommitted) return; // 已确认加载：锁定，等待回弹/新内容
  const step = Math.min(delta, WHEEL_STEP_MAX);
  const gained =
    performance.now() < wheelTailUntil ? step * WHEEL_TAIL_GAIN : step;
  overscroll = Math.min(
    overscroll + gained,
    pullThreshold() * PULL_OVERRUN
  );
  renderPull();
  armPullReset();
  if (overscroll >= pullThreshold()) commitPull();
}

/** 触摸手势：贴尾部时空白区随手指上移，超过阈值即确认加载下一页。
    未松手期间绝不回落（位移持续累加，仅当 touchend 才做回落判定）。 */
function onTouchMove(e) {
  if (!isLive() || !e.touches) return;
  const y = e.touches[0].clientY;
  if (touchStartY == null) touchStartY = y;
  const dy = touchStartY - y; // 手指上移为正（内容向上 = 意图查看更多）
  touchStartY = y;
  if (!atTail()) {
    // 非尾部：顶部触发区内的下拉（手指下移） = 显式「回上一页」手势
    if (dy < 0 && window.scrollY <= TOP_TRIGGER_ZONE) {
      e.preventDefault();
      requestPrev();
    }
    finishPull(); // 离开尾部：收起空白区，恢复正常滚动
    return;
  }
  // 尾部：短页（列表不足一屏）上 atTail 恒真，手势方向成为唯一可用信号——
  // 上移=加载下一页，下移=回上一页，二者按方向严格分流，避免互相误触发。
  if (dy < 0 && window.scrollY <= TOP_TRIGGER_ZONE) {
    e.preventDefault();
    requestPrev();
    return;
  }
  if (dy > 0) e.preventDefault();
  if (state.pullCommitted) return; // 已确认加载：锁定，等待回弹/新内容
  cancelSettle();
  overscroll = Math.max(0, Math.min(overscroll + dy, pullThreshold() * PULL_OVERRUN));
  renderPull();
  if (overscroll >= pullThreshold()) commitPull();
}

function onTouchEnd() {
  touchStartY = null;
  clearTimeout(state.pullTimer);
  state.pullTimer = null;
  // 松手即回落判定：不足阈值回弹原位，超过阈值（已随 move 提交）由加载流程收尾
  resetPull();
}

/** 顶部滚动兜底：与顶部 IO 互为保险，离开触发区上膛、回拉触发上一页。 */
function checkScroll() {
  if (!isLive()) return;
  if (window.scrollY <= TOP_TRIGGER_ZONE) {
    if (!state.loading && state.prevArmed && !state.prevFinished) {
      // 方向互斥：刚确认加载下一页后的冷窗内，不因回滚到顶瞬间误触发上一页
      if (performance.now() - state.nextCommittedAt < DIRECTION_LOCK_MS) return;
      state.prevArmed = false;
      loadPrev();
    }
  } else {
    state.prevArmed = true;
  }
}

/** 显式「下拉回上一页」请求：位于顶部触发区且下拉方向明确时触发。
    不依赖 prevArmed（显式手势即意图，覆盖跳转分页后列表过短、
    滚动事件/哨兵 IO 均无法武装的短页与欠一档页），但受三重守卫：
    - loading/prevFinished：与自动触发共享并发锁；
    - 方向互斥冷窗：确认加载下一页后的短暂窗口内忽略上一页请求，
      杜绝「上滑加载下一页」期间连带触发上一页；
    - 手势防抖：同一轮下拉的连续事件只生效一次。 */
function requestPrev() {
  if (!isLive()) return;
  if (state.loading || state.prevFinished) return;
  if (performance.now() - state.nextCommittedAt < DIRECTION_LOCK_MS) return;
  if (performance.now() - state.prevRequestedAt < PREV_GESTURE_COOLDOWN) return;
  state.prevRequestedAt = performance.now();
  state.prevArmed = false;
  loadPrev();
}

let scrollListener = null; // 当前顶部滚动兜底监听（destroy 时移除）

/** 加载下一页并追加到网格末尾。 */
async function loadNext() {
  if (state.loading || state.nextFinished) return;
  if (!isLive()) return;
  const p = state.pagination;
  const url = p && p.getAttribute('data-next-url');
  if (!url) {
    state.nextFinished = true;
    setStatus('end');
    return;
  }

  state.nextCommittedAt = performance.now(); // 方向互斥基准：未来短暂窗口内忽略上一页触发
  state.loading = true;
  setStatus('loading');
  try {
    const response = await fetchPage(url);
    // 异步返回后上下文必须仍在（防 fetch 在途时 SPA 换页，拼进已离树容器）
    if (!isLive()) return;
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
    if (!isLive()) return; // 已换页/已销毁：丢弃本次加载的收尾动作
    state.pullCommitted = false;
    // 收拢空白区：若回落动画仍在进行（加载较快时常见）就交给它自然走完，
    // 不让「新增内容就位」瞬间把空白区硬拉回 0 造成跳变；否则直接归零。
    finishPull({ soft: true });
    // 兜底：若刚才加载下一页期间用户已回拉到顶，补一次上拉评估。
    maybeAutoPrev();
  }
}

/** 加载上一页并插入到列表顶端，同步补偿滚动偏移以保持阅读位置。 */
async function loadPrev() {
  if (state.loading || state.prevFinished) return;
  if (!isLive()) return;
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
    // 异步返回后上下文必须仍在（防 fetch 在途时 SPA 换页，插入已离树容器）
    if (!isLive()) return;
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
  // 状态提示只作用于仍在文档内的分页控件；残留/离树引用一律静默
  if (!state.pagination?.isConnected) return;
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
  // 方向互斥：下一页加载完成的收尾瞬间，哨兵仍可能在顶部触发区内，
  // 必须忽略该窗口内的上一页请求，防止「上滑加载下一页」连带加载上一页
  if (performance.now() - state.nextCommittedAt < DIRECTION_LOCK_MS) return;
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
      // 方向互斥：紧跟下一页加载之后哨兵复位的瞬间不连带触发上一页
      if (performance.now() - state.nextCommittedAt < DIRECTION_LOCK_MS) return;
      state.prevArmed = false;
      loadPrev();
    }
  } else {
    state.prevArmed = true;
  }
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
  if (state.topObserver) destroy();

  state.pagination = document.querySelector(PAGINATION_SEL);
  state.grid = document.querySelector(GRID_SEL);

  // 无分页或首页未启用（如文章页）→ 直接结束，避免空转
  if (!state.pagination || !state.grid) {
    // 非列表页（文章/单页等）：统一走清理路径，确保上一页残留的任何监听
    // 与引用被彻底移除，杜绝「文章页被误挂无限滚动行为」的空窗。
    destroy();
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

  state.nextFinished = !state.pagination.hasAttribute('data-next-url');
  state.prevFinished = !state.pagination.hasAttribute('data-prev-url');
  state.loading = false;
  // 初始不武装：直达分页页（page/3/ 等）时哨兵已在触发区内，
  // 需先经一次「下拉离开视口再回拉」手势才触发上一页，避免进场即跳页。
  state.prevArmed = false;
  state.pullCommitted = false;
  state.nextCommittedAt = 0;
  state.prevRequestedAt = 0;
  overscroll = 0;

  // 禁文档末尾浏览器原生 overscroll 橡皮筋回弹（Safari/Chrome 触控板贴底
  // 会与 keepPinned 钉底逻辑互相拉锯，是「到底后反复跳动」的隐藏成因）。
  // 仅对启用了无限滚动的列表页生效，destroy 时恢复默认。
  document.documentElement.style.overscrollBehaviorY = 'none';

  bindJump();
  bindButtons();
  refreshControls();

  state.topObserver = new IntersectionObserver(handleTop, { threshold: 0 });
  state.topObserver.observe(state.sentinelTop);

  setStatus('idle');

  // 顶部滚动兜底：与顶部 IO 互为保险（底部改由上滑手势驱动，不做自动预取）
  if (!scrollListener) {
    scrollListener = () => {
      if (!isLive()) return;
      checkScroll();
      // 离开尾部时，把"到底"状态复位：提示只在贴尾部时显示
      if (!atTail() && state.pagination?.getAttribute('data-state') === 'end') {
        setStatus('idle');
      }
      // 贴尾部且已是末页时，显式"已全部加载"
      else if (atTail() && state.nextFinished
               && state.pagination?.getAttribute('data-state') === 'idle') {
        setStatus('end');
      }
    };
    window.addEventListener('scroll', scrollListener, { passive: true });
  }
  // 上滑手势：贴尾部后拉出空白区显示提示，超阈值确认加载下一页
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: true });

  return { destroy };
};

/** 清理：断开观察、移除监听、复位状态。供 SPA 重建前调用或模块重挂时使用。 */
export function destroy() {
  if (scrollListener) {
    window.removeEventListener('scroll', scrollListener);
    scrollListener = null;
  }
  window.removeEventListener('wheel', onWheel);
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend', onTouchEnd);
  clearTimeout(state.pullTimer);
  state.pullTimer = null;
  cancelSettle();
  state.topObserver?.disconnect();
  state.topObserver = null;
  state.sentinelTop?.remove();
  state.sentinelTop = null;
  if (state.pullEl) {
    state.pullEl.remove();
    state.pullEl = null;
  }
  state.pullInner = null;
  state.pullText = null;
  state.pagination = null;
  state.grid = null;
  state.nextFinished = false;
  state.prevFinished = false;
  state.loading = false;
  state.prevArmed = false;
  state.pullCommitted = false;
  state.nextCommittedAt = 0;
  state.prevRequestedAt = 0;
  overscroll = 0;
  touchStartY = null;
  wheelTailUntil = 0;

  // 退出列表页后恢复浏览器默认贴底行为
  document.documentElement.style.overscrollBehaviorY = '';
}