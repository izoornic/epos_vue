import { userService } from "../../helpers/authservice/user.service";
import router from "../../router/index";
import store from "@/state/store.js";
const user = JSON.parse(localStorage.getItem("user"));

// const user = store.state.authapi
//   ? JSON.parse(JSON.stringify(store.state.authapi.user))
//   : JSON.parse(localStorage.getItem("user"));
export const state = user
  ? { status: { loggeduser: true }, user }
  : { status: {}, user: null };

export const getters = {
  // Whether the user is currently logged in.
  loggedIn(state) {
    // // console.log("state authapi", state.user);
    return !!state.user;
  },
};

export const actions = {
  // Logs in the user.
  // eslint-disable-next-line no-unused-vars
  loginauthapi({ dispatch, commit }, { email, password }) {
    commit("loginRequest", { email });

    userService.login(email, password).then(
      (user) => {
        commit("loginSuccess", user);
        dispatch("paging/addPaging", process.env.VUE_APP_REC_PERPAGE, {
          root: true,
        });
        // console.log("current user in store", store.state.authapi);
        
        // removing current folder to avoid unnecessary navigations
        localStorage.removeItem("currentFolder");

        //check auth
        if (
          store.state.authapi.user.roleName.toLowerCase() ==
          process.env.VUE_APP_SUPERADMIN_ROLE
        ) {
          router.push({
            name: "merchant-list",
          });
        } else {
          router.push({ name: "profile" });
        }
      },
      (error) => {
        commit("loginFailure", error);
        dispatch("notification/error", error, { root: true });
      }
    );
  },
  // Logout the user
  logoutauthapi({ commit }) {
    userService.logout();
    commit("logout");
  },
  // register the user
  registeruserauthapi({ dispatch, commit }, user) {
    commit("registerRequest", user);
    userService.register(user).then(
      (user) => {
        commit("registerSuccess", user);
        dispatch("notification/success", "Registration successful", {
          root: true,
        });
        router.push("/login");
      },
      (error) => {
        commit("registerFailure", error);
        dispatch("notification/error", error, { root: true });
      }
    );
  },
};

export const mutations = {
  loginRequest(state, user) {
    state.status = { loggingIn: true };
    state.user = user;
  },
  loginSuccess(state, user) {
    state.status = { loggeduser: true };
    state.user = user;
  },
  loginFailure(state) {
    state.status = {};
    state.user = null;
  },
  logout(state) {
    state.status = {};
    state.user = null;
  },
  registerRequest(state) {
    state.status = { registering: true };
  },
  registerSuccess(state) {
    state.status = {};
  },
  registerFailure(state) {
    state.status = {};
  },
};
