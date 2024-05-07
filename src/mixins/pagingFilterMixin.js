import store from "@/state/store.js";

export default {
  data() {
    return {
      totalRows: 1,
      currentPage: 1,
      perPage: store.state.paging.perPage,
      pageOptions: [10, 25, 50, 100, 250, 500],
      search: "",
      showsearchbox: true,
    };
  },
  created: function () {
    // console.log(
    //   "Printing from the paging filter Mixin",
    //   store.state.paging.perPage
    // );
  },
  methods: {
    headClicked(column) {
      console.log("column chaka", column);
      if (column == this._helper) {
        //change sorting order.
        this.sortDirection = this.sortDirection == "asc" ? "desc" : "asc";
      } else {
        this.sortDirection = "asc";
      }
      //set sorting column.
      this.sortBy = column;
      this._helper = column;
      let _this = this;
      this.fields.map(function (obj) {
        if (column === obj.key && obj.sortable === true) {
          _this.fetchData();
        }
      });
    },
  },
};
