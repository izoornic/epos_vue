export const menuItems = [
  {
    id: 1,
    label: "menuitems.menu.text",
    isTitle: true,
  },
  {
    id: 125,
    label: "menuitems.merchants.text",
    link: "/merchants/list",
    icon: "mdi mdi-account-details-outline",
    isSuperAdmin: true,
    // subItems: [
    //   {
    //     id: 126,
    //     // label: "menuitems.dashboards.list.default",
    //     // link: "/",
    //     parentId: 125,
    //   },
    // ],

    // badge: {
    //   variant: "success",
    //   text: "menuitems.chat.badge",
    // },
  },
  {
    id: 126,
    label: "menuitems.pos.text",
    link: "/pos/list",
    icon: "mdi mdi-cash-register",
    isSuperAdmin: false,
  },
  {
    id: 129,
    label: "menuitems.pos_group.text",
    link: "/pos-group/list",
    icon: "mdi mdi-file-tree-outline ",
    isSuperAdmin: false,
  },
  {
    id: 127,
    label: "menuitems.product.text",
    link: "/products/list?currentFolder=/",
    icon: "mdi mdi-archive-outline",
    isSuperAdmin: false,
  },
  /*{
    id: 128,
    label: "menuitems.report.text",
    link: "/report/list",
    icon: "mdi mdi-chart-bar",
    isSuperAdmin: false,
  },*/
];
