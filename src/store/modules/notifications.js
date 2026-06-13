export default {
  namespaced: true,
  state: () => ({
    toasts: []
  }),
  mutations: {
    ADD_TOAST(state, toast) {
      state.toasts.push(toast);
    },
    REMOVE_TOAST(state, id) {
      state.toasts = state.toasts.filter((t) => t.id !== id);
    }
  },
  actions: {
    triggerToast({ commit }, { message, type = 'info', duration = 4000 }) {
      const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      commit('ADD_TOAST', { id, message, type });
      
      setTimeout(() => {
        commit('REMOVE_TOAST', id);
      }, duration);
    }
  }
};
