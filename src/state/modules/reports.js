export const state = {
   reportDays: {
        startDay: '',
        endDay: ''
   },
  };
  
  export const getters = {
    getReportDays: (state) => state.reportDays, 
  };
  
  export const mutations = {
    addReportDays (state, newValue) {
        state.reportDays = newValue;
        //console.log("DAus ADDED", newValue);
    } 
  };
  
  export const actions = {
    addReportDays({ commit }, data) {
        commit("addReportDays", data);
    }
  };