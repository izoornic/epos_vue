import moment from "moment";
export default {
  data() {
    return {
      // toastMixin: "",
    };
  },
  created: function () {
    // console.log("Printing from the date formatter Mixin");
  },
  methods: {
    formatDateDisplay(value) {
      return value == "0001-01-01T00:00:00"
        ? "-"
        : moment.utc(value).local().format("DD-MMM-YYYY");
    },
    formatDateTooltip(value) {
      return value == "0001-01-01T00:00:00"
        ? "-"
        : moment.utc(value).local().format("DD-MMM-YYYY HH:mm:ss");
    },
  },
};
