import { apiUrl } from "@/state/helpers";
import toastMixin from "../../mixins/sweetAlertMixin";
import router from "../../router/index";
import axios from "@/axios.js";
import store from "@/state/store.js";
import i18n from "@/i18n";
// axios.defaults.headers.common = {
//   Authorization: `Bearer ${store.state.authfack.token}`,
// };

export const state = {
  pos: [],
};

export const getters = {
  pos: (state) => state.pos,
};

export const mutations = {
  setPOS(state, newValue) {
    state.pos = newValue;
  },
};

export const actions = {
  addPOS({ commit }, data) {
    commit("setPOS", data);
  },
  async addPOSData({ dispatch }, payload) {
    // console.log(dispatch, payload);
    // return;
    // eslint-disable-next-line no-unreachable
    dispatch("layout/changeLoaderAPIValue", { loader: true }, { root: true });

    await axios
      .post(`${apiUrl}/Pos/upsertPos`, payload.requestParam)
      // eslint-disable-next-line no-unused-vars
      .then((res) => {
        // console.log(res);

        router.push({
          name: "pos-list",
        });
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
  async deletePOSData({ dispatch }, merchantId) {
    // console.log("merchantId", merchantId, apiUrl);
    // alert(i18n.t("alerts.record_delete_success"));
    // return false;

    // eslint-disable-next-line no-unreachable
    dispatch("layout/changeLoaderAPIValue", { loader: true }, { root: true });
    await axios
      .delete(`${apiUrl}/Pos?id=${merchantId}`, this.form)
      .then(() => {
        toastMixin.methods.displayToastAlert(
          i18n.t("alerts.pos_group_pos_deleted"),
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
  async getPosByMerchant({ commit, dispatch }) {
    // eslint-disable-next-line no-unreachable
    dispatch("layout/changeLoaderAPIValue", { loader: true }, { root: true });
    await axios
      .get(
        `${apiUrl}/Pos/GetByMerchant?id=${store.state.authapi.user.merchant_Id}`
      )
      .then((response) => {
        var res = JSON.parse(JSON.stringify(response.data));
        // console.log("res.items pos", res);

        commit("setPOS", res);
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
