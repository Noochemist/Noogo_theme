(() => {
  // ns-hugo-imp:/Users/schore/zscodes/drhugo_theme/HugMedia/exampleSite/themes/HugMedia/assets/js/core/dom-utils.js
  var $ = (selector, scope = document) => scope.querySelector(selector);
  var ready = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  // ns-hugo-imp:/Users/schore/zscodes/drhugo_theme/HugMedia/exampleSite/themes/HugMedia/assets/js/core/event-bus.js
  var createEventBus = () => {
    const handlers = /* @__PURE__ */ new Map();
    return {
      /** 订阅事件，返回退订函数。 */
      on(event, handler) {
        if (!handlers.has(event)) handlers.set(event, /* @__PURE__ */ new Set());
        handlers.get(event).add(handler);
        return () => handlers.get(event)?.delete(handler);
      },
      /** 只触发一次后自动退订。 */
      once(event, handler) {
        const off = this.on(event, (...args) => {
          off();
          handler(...args);
        });
        return off;
      },
      /** 派发事件，携带负载。返回是否有人订阅。 */
      emit(event, payload) {
        const set = handlers.get(event);
        if (!set || set.size === 0) return false;
        set.forEach((fn) => fn(payload, event));
        return true;
      },
      /** 清空某事件（或不传事件则全部清空）。 */
      off(event) {
        if (event) handlers.delete(event);
        else handlers.clear();
      }
    };
  };
  var bus = createEventBus();

  // ns-hugo-imp:/Users/schore/zscodes/drhugo_theme/HugMedia/exampleSite/themes/HugMedia/assets/js/core/init.js
  var markReady = () => {
    const root = document.documentElement;
    if (root) {
      root.classList.add("is-ready");
      root.classList.remove("is-loading");
    }
  };
  var init = () => {
    ready(() => {
      document.documentElement.classList.add("is-loading");
      markReady();
      bus.emit("theme:init", {});
      bus.emit("theme:ready", {});
    });
  };
  if (typeof window !== "undefined") {
    window.__HUGO_THEME__ = { bus, ready, $, markReady };
  }

  // <stdin>
  init();
})();
//# sourceMappingURL=main.js.map
