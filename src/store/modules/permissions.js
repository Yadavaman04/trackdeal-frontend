export default {
  namespaced: true,
  state: () => {
    let stored = [];
    try {
      const val = localStorage.getItem('capabilities');
      stored = val ? JSON.parse(val) : [];
    } catch (e) {
      stored = [];
    }
    return {
      capabilities: stored
    };
  },
  mutations: {
    SET_CAPABILITIES(state, capabilities) {
      state.capabilities = Array.isArray(capabilities) ? capabilities : [];
      localStorage.setItem('capabilities', JSON.stringify(state.capabilities));
    },
    CLEAR_CAPABILITIES(state) {
      state.capabilities = [];
      localStorage.removeItem('capabilities');
    }
  },
  getters: {
    hasCapability: (state) => (permission) => {
      if (!permission) return true;
      const normalized = permission.replace(/:/g, '.');
      return state.capabilities.includes(normalized);
    }
  }
};
