import { mapState, mapGetters, mapActions } from "vuex";

export const apiUrl = process.env.VUE_APP_API_URL;

export const reportURL = process.env.VUE_APP_REPORT_URL;

export const superadminRole = process.env.VUE_APP_SUPERADMIN_ROLE;

export const merchantRole = process.env.VUE_APP_MERCHANT_ROLE;

export const authComputed = {
  ...mapState("auth", {
    currentUser: (state) => state.currentUser,
  }),
  ...mapGetters("auth", ["loggedIn"]),
  ...mapGetters("authapi", ["loggedIn"]),
};

export const layoutComputed = {
  ...mapState("layout", {
    layoutType: (state) => state.layoutType,
    leftSidebarType: (state) => state.leftSidebarType,
    layoutWidth: (state) => state.layoutWidth,
    topbar: (state) => state.topbar,
    loader: (state) => state.loader,
  }),
};

export const authMethods = mapActions("auth", [
  "logIn",
  "logOut",
  "register",
  "resetPassword",
]);

export const layoutMethods = mapActions("layout", [
  "changeLayoutType",
  "changeLayoutWidth",
  "changeLeftSidebarType",
  "changeTopbar",
  "changeLoaderValue",
  "changeLoaderAPIValue",
]);

export const authFackMethods = mapActions("authfack", [
  "login",
  "registeruser",
  "logout",
]);

export const authAPIMethods = mapActions("authapi", [
  "loginauthapi",
  "registeruserauthapi",
  "logoutauthapi",
]);

export const notificationMethods = mapActions("notification", [
  "success",
  "error",
  "clear",
]);

export const merchantMethods = mapActions("merchant", [
  "addMerchants",
  "addMerchantData",
  "deleteMerchantData",
  "updateUserData",
]);

export const POSMethods = mapActions("pos", [
  "addPOS",
  "addPOSData",
  "deletePOSData",
  "getPosByMerchant",
]);

export const POSGroupMethods = mapActions("posgroup", [
  // "addPOS",
  // "addPOSData",
  // "deletePOSData",
  "getPosGroupByMerchant",
]);

export const ProductMethods = mapActions("product", [
  "addProduct",
  "addProductData",
  "deleteProductData",
  "importProductData",
]);

export const PagingMethods = mapActions("paging", ["addPaging"]);
