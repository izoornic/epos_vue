export const state = {
   reportDays: {
        startDay: '',
        endDay: ''
   },
   reportType: {
    repType: ''
   },
   selectedTids:{
    tids: []
   }
  };
  
  export const getters = {
    getReportDays: (state) => state.reportDays, 
    getReportType: (state) => state.reportType,
    getSelectedTids: (state) => state.selectedTids,
  };
  
  export const mutations = {
    addReportDays (state, newValue) {
        state.reportDays = newValue;
    },
    addReportType (state, newValue) {
      state.reportType = newValue;
    },
    addSelectedTids (state, newValue) {
      state.selectedTids = newValue;
    },
  };
  
  export const actions = {
    addReportDays({ commit }, data) {
      commit("addReportDays", data);
    },
    addReportType ({commit}, data) {
      commit("addReportType", data);
    },
    addSelectedTids ({commit}, data) {
      commit("addSelectedTids", data);
    },
  };