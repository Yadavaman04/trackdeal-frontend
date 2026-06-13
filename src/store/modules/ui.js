export default {
  namespaced: true,
  state: () => ({
    sidebarCollapsed: false,
    activeThemeMode: localStorage.getItem('theme_mode') || 'light'
  }),
  mutations: {
    TOGGLE_SIDEBAR(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    SET_THEME_MODE(state, mode) {
      state.activeThemeMode = mode;
      localStorage.setItem('theme_mode', mode);
      
      // Update HTML node class list to toggle Tailwind's dark utility selectors
      if (mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },
  actions: {
    initializeTheme({ commit, state }) {
      commit('SET_THEME_MODE', state.activeThemeMode);
    }
  }
};
