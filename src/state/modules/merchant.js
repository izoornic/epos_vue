// import axios from "axios";
import { apiUrl } from "@/state/helpers";
import toastMixin from "../../mixins/sweetAlertMixin";
import router from "../../router/index";
import axios from "@/axios.js";
import i18n from "@/i18n";
import { EventBus } from "@/event-bus";
// import store from "@/state/store.js";

// axios.defaults.headers.common = {
//   Authorization: `Bearer ${store.state.authfack.token}`,
// };

export const state = {
  merchants: [],
};

export const getters = {
  merchants: (state) => state.merchants,
};

export const mutations = {
  setMerchants(state, newValue) {
    state.merchants = newValue;
  },
};

export const actions = {
  addMerchants({ commit }, data) {
    commit("setMerchants", data);
  },
  async addMerchantData({ dispatch }, payload) {
    // // console.log(dispatch, payload);
    dispatch("layout/changeLoaderAPIValue", { loader: true }, { root: true });

    await axios
      .post(`${apiUrl}/merchant/upsertMerchant`, payload.requestParam)
      // eslint-disable-next-line no-unused-vars
      .then((res) => {
        // console.log(res);

        if (payload.redirect) {
          router.push({
            name: "merchant-list",
          });
        }
        toastMixin.methods.displayToastAlert(payload.message, "success");
        // return res;
      })
      .catch((error) => {
        // console.log("error", error);
        // console.log(error.response);

        if (error.response.status === 401) {
          dispatch("authapi/logoutauthapi");
          router.push("/login");
        } else if (error.response.status === 400) {
          toastMixin.methods.displayToastAlert(error.response.data, "error");
        } else {
          toastMixin.methods.displayToastAlert(
            i18n.t("alerts.something_went_wrong"),
            "error"
          );
        }
      })
      .finally(() => {
        dispatch(
          "layout/changeLoaderAPIValue",
          { loader: false },
          { root: true }
        );
      });
  },
  async deleteMerchantData({ dispatch }, merchantId) {
    // console.log("merchantId", merchantId, apiUrl);

    dispatch("layout/changeLoaderAPIValue", { loader: true }, { root: true });
    await axios
      .delete(`${apiUrl}/merchant?id=${merchantId}`, this.form)
      .then(() => {
        toastMixin.methods.displayToastAlert(
          i18n.t("alerts.merchant_delted"),
          "success"
        );
      })
      .catch((error) => {
        // console.log("error", error);
        // console.log(error.response.status);

        if (error.response.status === 401) {
          dispatch("authapi/logoutauthapi");
          router.push("/login");
        } else if (error.response.status === 400) {
          toastMixin.methods.displayToastAlert(error.response.data, "error");
        } else {
          toastMixin.methods.displayToastAlert(
            i18n.t("alerts.something_went_wrong"),
            "error"
          );
        }
      })
      .finally(() => {
        dispatch(
          "layout/changeLoaderAPIValue",
          { loader: false },
          { root: true }
        );
      });
  },
  async updateUserData({ dispatch }, payload) {
    // // console.log(dispatch, payload);
    dispatch("layout/changeLoaderAPIValue", { loader: true }, { root: true });

    await axios
      .post(`${apiUrl}/Users/upsertUsers`, payload.requestParam)
      .then((res) => {
        // console.log(res);

        if (payload.redirect) {
          router.push({
            name: "merchant-list",
          });
        }
        toastMixin.methods.displayToastAlert(payload.message, "success");
        EventBus.$emit("usernameval", res.merchant_Name);
        // this.addMerchants(res);
        dispatch("merchant/addMerchants", res);
        // return res;
      })
      .catch((error) => {
        // console.log("error", error);
        // console.log(error.response);

        if (error.response.status === 401) {
          dispatch("authapi/logoutauthapi");
          router.push("/login");
        } else if (error.response.status === 400) {
          toastMixin.methods.displayToastAlert(error.response.data, "error");
        } else {
          toastMixin.methods.displayToastAlert(
            i18n.t("alerts.something_went_wrong"),
            "error"
          );
        }
      })
      .finally(() => {
        dispatch(
          "layout/changeLoaderAPIValue",
          { loader: false },
          { root: true }
        );
      });
  },
};
