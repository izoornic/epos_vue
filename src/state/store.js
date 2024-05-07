import Vue from "vue";
import Vuex from "vuex";
import modules from "./modules";
import createPersistedState from "vuex-persistedstate";
Vue.use(Vuex);

const store = new Vuex.Store({
  modules,
  // Enable strict mode in development to get a warning
  // when mutating state outside of a mutation.
  // https://vuex.vuejs.org/guide/strict.html
  // strict: process.env.NODE_ENV !== "production",
  plugins: [
    createPersistedState({
      key: "vuex",
      reducer(val) {
        // console.log("valvuex", val);
        if (val.authapi.user === null) {
          // return empty state when user logged out
          return {};
        }
        return val;
      },
    }),
  ],
});

export default store;
