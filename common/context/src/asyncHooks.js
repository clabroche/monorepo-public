const async_hooks = require('async_hooks');
const store = new Map();
const { v4 } = require('uuid');

const asyncHook = async_hooks.createHook({
  init: (asyncId, _, triggerAsyncId) => {
    if (store.has(triggerAsyncId)) {
      store.set(asyncId, store.get(triggerAsyncId))
    }
  },
  destroy: (asyncId) => {
    if (store.has(asyncId)) {
      store.delete(asyncId);
    }
  }
});

asyncHook.enable();

module.exports.createRequestContext = (data = {}, requestId = v4()) => {
  const requestInfo = { requestId, data };
  store.set(async_hooks.executionAsyncId(), requestInfo);
  return requestInfo;
};

module.exports.getRequestContext = () => {
  return store.get(async_hooks.executionAsyncId());
};

