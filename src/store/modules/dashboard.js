export default {
  namespaced: true,
  state: () => ({
    selectedBranchId: 'all',
    dateRange: {
      startDate: null,
      endDate: null
    }
  }),
  mutations: {
    SET_BRANCH(state, branchId) {
      state.selectedBranchId = branchId;
    },
    SET_DATE_RANGE(state, { startDate, endDate }) {
      state.dateRange.startDate = startDate;
      state.dateRange.endDate = endDate;
    }
  }
};
