/* Phase 0 · core/event-bus.js — 事件总线（模块间解耦） */

/** 创建一个发布订阅事件总线实例。 */
export const createEventBus = () => {
  const handlers = new Map();

  return {
    /** 订阅事件，返回退订函数。 */
    on(event, handler) {
      if (!handlers.has(event)) handlers.set(event, new Set());
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
    },
  };
};

/** 全局默认总线（供各模块共享）。 */
export const bus = createEventBus();