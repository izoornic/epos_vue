// import axios from "axios";
import { apiUrl } from "@/state/helpers";
import toastMixin from "../../mixins/sweetAlertMixin";
import router from "../../router/index";
import axios from "@/axios.js";
import i18n from "@/i18n";
// import store from "@/state/store.js";

// axios.defaults.headers.common = {
//   Authorization: `Bearer ${store.state.authfack.token}`,
// };

export const state = {
  product: [],
  draftProducts: [],
};

export const getters = {
  product: (state) => state.product,
};

export const mutations = {
  setProduct(state, newValue) {
    state.product = newValue;
  },
  setDraftProducts(state, data) {
    state.draftProducts = data;
  },
  clearDraftProducts(state) {
    state.draftProducts = [];
  }
};

export const actions = {
  addProduct({ commit }, data) {
    commit("setProduct", data);
  },
  async addProductData({ dispatch }, payload) {
    // console.log(dispatch, payload);
    // return;
    // eslint-disable-next-line no-unreachable
    dispatch("layout/changeLoaderAPIValue", { loader: true }, { root: true });

    await axios
      .post(`${apiUrl}/Product/upsertProduct`, payload.requestParam)
      // eslint-disable-next-line no-unused-vars
      .then((res) => {
        // console.log(res);

        if (payload.posgroup == true) {
          router.push({
            name: "pos-product-list",
            params: { posGroup_Id: payload.requestParam.posGroup_Id },
          });
        } else {
          router.push({
            name: "product-list",
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
  async deleteProductData({ dispatch }, merchantId) {
    // console.log("merchantId", merchantId, apiUrl);
    console.log("Ovo je api URL ",apiUrl);
    dispatch("layout/changeLoaderAPIValue", { loader: true }, { root: true });
    await axios
      .delete(`${apiUrl}/Product?id=${merchantId}`, this.form)
      .then(() => {
        toastMixin.methods.displayToastAlert(
          i18n.t("alerts.record_delete_success"),
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

  async deleteAllProductData({ dispatch }, productIds) {
    dispatch("layout/changeLoaderAPIValue", { loader: true }, { root: true });
    await Promise.all(
        productIds.map((id) =>
            axios
                .delete(`${apiUrl}/Product?id=${id}`, this.form)
                .catch((error) => {
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
        )
    );
    dispatch(
        "layout/changeLoaderAPIValue",
        { loader: false },
        { root: true }
    );
  }
  ,


  async importProductData({ dispatch }, payload) {
    // console.log(dispatch, payload);
    dispatch("layout/changeLoaderAPIValue", { loader: true }, { root: true });

    // eslint-disable-next-line no-unreachable
    await axios
      .post(`${apiUrl}/Product/importProduct`, payload.requestParam)
      .then((res) => {
        // console.log(res);

        // router.push({
        //   name: "product-list",
        // });
        // toastMixin.methods.displayToastAlert(payload.message, "success");
        toastMixin.methods.displayImportAlert(
          i18n.t("alerts.import_result_title"),
          `${i18n.t("alerts.total_inserted_record")} <b>${
            res.data.insertCount
          }</b><br/>` +
            `${i18n.t("alerts.total_updated_record")} <b>${
              res.data.updateCount
            }</b>`,
          "info",
          i18n.t("alerts.import_product_ok_button_text")
        );
      })
      .catch((error) => {
        console.log("error", error);
        console.log(error.response);

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
  saveProductToDraftsProducts({ commit, state}, productDetails) {
    return new Promise((resolve, reject) => {
      try {
        let products = state.draftProducts;
    
        // find and update the product details if exist
        let index = products.findIndex(p => {
          return p.product_Id == productDetails.product_Id;
        });

        index != -1 ? products[index] = productDetails : products.push(productDetails);
        
        commit('setDraftProducts', products);

        resolve(true);
      } catch (error) {
        reject(false);
      }
    })
  },
  clearDraftProducts({ commit }) {
    commit('clearDraftProducts');
  }
};
