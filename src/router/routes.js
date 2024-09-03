import store from "@/state/store";

export default [
  {
    path: "/merchants/list",
    name: "merchant-list",
    meta: { authRequired: true },
    component: () => import("../components/merchants/merchants-list"),
  },
  {
    path: "/merchants/create",
    name: "merchant-add",
    meta: { authRequired: true },
    component: () => import("../components/merchants/merchants-add"),
  },
  {
    path: "/merchants/edit/:id",
    name: "merchant-edit",
    meta: { authRequired: true },
    component: () => import("../components/merchants/merchants-add"),
  },
  {
    path: "/merchants/view/:id",
    name: "merchant-view",
    meta: { authRequired: true },
    component: () => import("../components/merchants/merchants-view"),
  },
  {
    path: "/pos/list",
    name: "pos-list",
    meta: { authRequired: true },
    component: () => import("../components/pos/pos-list"),
  },
  {
    path: "/pos/create",
    name: "pos-add",
    meta: { authRequired: true },
    component: () => import("../components/pos/pos-add"),
  },
  {
    path: "/pos/edit/:id",
    name: "pos-edit",
    meta: { authRequired: true },
    component: () => import("../components/pos/pos-add"),
  },
  {
    path: "/pos/view/:id",
    name: "pos-view",
    meta: { authRequired: true },
    component: () => import("../components/pos/pos-view"),
  },

  {
    path: "/pos/products/list/:posGroup_Id",
    name: "pos-product-list",
    meta: { authRequired: true },
    component: () => import("../components/posgroupproducts/product-list"),
  },
  {
    path: "/pos/products/create/:posGroup_Id",
    name: "pos-product-add",
    meta: { authRequired: true },
    component: () => import("../components/posgroupproducts/product-add"),
  },
  {
    path: "/pos/products/edit/:posGroup_Id/:id",
    name: "pos-product-edit",
    meta: { authRequired: true },
    component: () => import("../components/posgroupproducts/product-add"),
  },
  // {
  //   path: "/pos/products/view/:id",
  //   name: "pos-product-view",
  //   meta: { authRequired: true },
  //   component: () => import("../components/posgroupproducts/product-view"),
  // },

  {
    path: "/products/list",
    name: "product-list",
    meta: { authRequired: true },
    component: () => import("../components/products/product-list"),
  },
  {
    path: "/products/create",
    name: "product-add",
    meta: { authRequired: true },
    component: () => import("../components/products/product-add"),
  },
  {
    path: "/products/edit/:id",
    name: "product-edit",
    meta: { authRequired: true },
    component: () => import("../components/products/product-add"),
  },
  {
    path: "/products/view/:id",
    name: "product-view",
    meta: { authRequired: true },
    component: () => import("../components/products/product-view"),
  },
  {
    path: "/report/list",
    name: "report-list",
    meta: { authRequired: true },
    component: () => import("../components/report/report-list"),
  },
  {
    path: "/report/view/:report_type/:pos_id",
    name: "report-view",
    meta: { authRequired: true },
    component: () => import("../components/report/report-view"),
  },
  {
    path: "/pos-group/list",
    name: "pos-group-list",
    meta: { authRequired: true },
    component: () => import("../components/pos_group/pos_group_list"),
  },
  {
    path: "/pos-group/view/:id",
    name: "pos-group-view",
    meta: { authRequired: true },
    component: () => import("../components/pos_group/pos_group_view"),
  },

  {
    path: "/profile",
    name: "profile",
    meta: { authRequired: true },
    component: () => import("../components/profile/contacts-profile"),
  },
  {
    path: "/",
    name: "default",
    meta: {
      authRequired: true,
      beforeResolve(routeTo, routeFrom, next) {
        // alert(store.state.authapi.user.roleName);
        // If the user is already logged in
        if (store.getters["authapi/loggedIn"]) {
          // Redirect to the home page instead
          store.state.authapi.user.roleName.toLowerCase() ==
          process.env.VUE_APP_SUPERADMIN_ROLE
            ? next({ name: "merchant-list" })
            : next({ name: "profile" });
        } else {
          // Continue to the login page
          next();
        }
      },
    },
    // component: () => import("./views/dashboards/default"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("./views/account/login"),
    meta: {
      beforeResolve(routeTo, routeFrom, next) {
        // If the user is already logged in
        if (store.getters["auth/loggedIn"]) {
          // Redirect to the home page instead
          next({ name: "default" });
        } else {
          // Continue to the login page
          next();
        }
      },
    },
  },

  {
    path: "/forgot-password",
    name: "Forgot password",
    component: () => import("./views/account/forgot-password"),
    meta: {
      beforeResolve(routeTo, routeFrom, next) {
        // If the user is already logged in
        if (store.getters["auth/loggedIn"]) {
          // Redirect to the home page instead
          next({ name: "default" });
        } else {
          // Continue to the login page
          next();
        }
      },
    },
  },
  {
    path: "/logout",
    name: "logout",
    meta: {
      authRequired: true,
      beforeResolve(routeTo, routeFrom, next) {
        if (process.env.VUE_APP_DEFAULT_AUTH === "firebase") {
          store.dispatch("auth/logOut");
        } else {
          store.dispatch("authfack/logout");
        }
        const authRequiredOnPreviousRoute = routeFrom.matched.some((route) =>
          route.push("/login")
        );
        // Navigate back to previous page, or home as a fallback
        next(
          authRequiredOnPreviousRoute ? { name: "default" } : { ...routeFrom }
        );
      },
    },
  },
  {
    path: "/404",
    name: "404",
    component: require("./views/utility/404").default,
  },
  // Redirect any unmatched routes to the 404 page. This may
  // require some server configuration to work in production:
  // https://router.vuejs.org/en/essentials/history-mode.html#example-server-configurations
  {
    path: "*",
    redirect: "404",
  },
];
