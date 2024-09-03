export const state = {
   reportDays: {
        startDay: '',
        endDay: '',
        startTime: '',
        endTime: ''
   },
   reportType: {
    repType: ''
   },
   selectedTids:{
    tids: []
   },
   viewDateP: {
    vDate: ''
   }
  };
  
  export const getters = {
    getReportDays: (state) => state.reportDays, 
    getReportType: (state) => state.reportType,
    getSelectedTids: (state) => state.selectedTids,
    getViewDate: (state) => state.viewDateP,
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
    addViewDate (state, newValue) {
      state.viewDateP = newValue;
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
    addViewDate ({commit}, data) {
      commit("addViewDate", data);
    },
  };