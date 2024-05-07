export const state = {
  perPage: {},
};

export const getters = {
  perPage: (state) => state.perPage,
};

export const mutations = {
  addPaging(state, newValue) {
    state.perPage = newValue;
  },
};

export const actions = {
  addPaging({ commit }, data) {
    commit("addPaging", data);
  },
};
