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
  posgroup: [],
};

export const getters = {
  posgroup: (state) => state.posgroup,
};

export const mutations = {
  setPOSGroup(state, newValue) {
    state.posgroup = newValue;
  },
};

export const actions = {
  addPOSGroup({ commit }, data) {
    commit("setPOSGroup", data);
  },
  // async addPOSData({ dispatch }, payload) {
  //   // console.log(dispatch, payload);
  //   // return;
  //   // eslint-disable-next-line no-unreachable
  //   dispatch("layout/changeLoaderValue", { loader: true }, { root: true });

  //   await axios
  //     .post(`${apiUrl}/Pos/upsertPos`, payload.requestParam)
  //     .then((res) => {
  //       // console.log(res);
  //       dispatch("layout/changeLoaderValue", { loader: false }, { root: true });

  //       router.push({
  //         name: "pos-list",
  //       });
  //       toastMixin.methods.displayToastAlert(payload.message, "success");

  //       // return res;
  //     })
  //     .catch((error) => {
  //       dispatch("layout/changeLoaderValue", { loader: false }, { root: true });

  //       // console.log("error", error);
  //       // console.log(error.response);

  //       if (error.response.status === 401) {
  //         dispatch("authapi/logoutauthapi");
  //         router.push("/login");
  //       } else if (error.response.status === 400) {
  //         toastMixin.methods.displayToastAlert(error.response.data, "error");
  //       } else {
  //         toastMixin.methods.displayToastAlert(
  //           this.$t("alerts.something_went_wrong"),
  //           "error"
  //         );
  //       }
  //     });
  // },
  // async deletePOSData({ dispatch }, merchantId) {
  //   // console.log("merchantId", merchantId, apiUrl);
  //   // alert(i18n.t("alerts.record_delete_success"));
  //   // return false;

  //   // eslint-disable-next-line no-unreachable
  //   dispatch("layout/changeLoaderValue", { loader: true }, { root: true });
  //   await axios
  //     .delete(`${apiUrl}/Pos?id=${merchantId}`, this.form)
  //     .then(() => {
  //       dispatch("layout/changeLoaderValue", { loader: false }, { root: true });

  //       toastMixin.methods.displayToastAlert(
  //         i18n.t("alerts.record_delete_success"),
  //         "success"
  //       );
  //     })
  //     .catch((error) => {
  //       dispatch("layout/changeLoaderValue", { loader: false }, { root: true });

  //       // console.log("error", error);
  //       // console.log(error.response.status);

  //       if (error.response.status === 401) {
  //         dispatch("authapi/logoutauthapi");
  //         router.push("/login");
  //       } else if (error.response.status === 400) {
  //         toastMixin.methods.displayToastAlert(error.response.data, "error");
  //       } else {
  //         toastMixin.methods.displayToastAlert(
  //           this.$t("alerts.something_went_wrong"),
  //           "error"
  //         );
  //       }
  //     });
  // },
  async getPosGroupByMerchant({ commit, dispatch }) {
    // eslint-disable-next-line no-unreachable
    dispatch("layout/changeLoaderAPIValue", { loader: true }, { root: true });
    await axios
      .get(
        `${apiUrl}/PosGroup/posGroupByMerchant?id=${store.state.authapi.user.merchant_Id}`
      )
      .then((response) => {
        var res = JSON.parse(JSON.stringify(response.data));
        // console.log("res.items pos", res);
        try {
          // sorting pos groups by it's name
          res = res.sort((a,b)=> (a.posGroup_Name > b.posGroup_Name ? 1 : -1))
        } catch (error) {
          console.log("seomthing went wrong while sorting pos groups");
        }

        commit("setPOSGroup", res);
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
