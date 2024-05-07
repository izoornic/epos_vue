<script>
import pagingFilterMixin from "@/mixins/pagingFilterMixin";
import { EventBus } from "@/event-bus";
import { PagingMethods } from "@/state/helpers";
export default {
  components: {},
  mixins: [pagingFilterMixin],

  created: function () {
    // console.log(
    //   "Printing from the paging filter Mixin included component",
    //   this.$data,
    //   pagingFilterMixin
    // );
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    perPage: function (val, oldval) {
      // console.log("val mixin value for paging filter", val, oldval);
      this.addPaging(val);
      EventBus.$emit("pagingfilterVal", val);
    },
    // eslint-disable-next-line no-unused-vars
    search: function (val, oldval) {
      // console.log("val mixin value for search filter", val, oldval);
      if (val == "") {
        EventBus.$emit("searchfilterVal", val);
      }
    },
  },
  methods: {
    ...PagingMethods,
    onSearchBoxEnter() {
      EventBus.$emit("searchfilterVal", this.search);
    },
  },
  mounted() {
    EventBus.$on("showsearchbox", (data) => {
      this.showsearchbox = data;
    });
  },
};
</script>

<template>
  <div class="row mt-4">
    <div class="col-sm-12 col-md-6">
      <div id="tickets-table_length" class="dataTables_length">
        <label class="d-inline-flex align-items-center">
          {{ $t("label.show") }}&nbsp;
          <b-form-select
            class="form-select form-select-sm"
            v-model="perPage"
            size="sm"
            :options="pageOptions"
          ></b-form-select
          >&nbsp;{{ $t("label.entries") }}
        </label>
      </div>
    </div>
    <!-- Search -->
    <div class="col-sm-12 col-md-6" v-if="showsearchbox">
      <div id="tickets-table_filter" class="dataTables_filter text-md-end">
        <label class="d-inline-flex align-items-center">
          {{ $t("label.search") }}:
          <b-form-input
            v-model.trim="search"
            v-on:keyup.enter="onSearchBoxEnter"
            type="search"
            :placeholder="$t('label.search_place_holder')"
            class="form-control form-control-sm ms-2"
          ></b-form-input>
        </label>
      </div>
    </div>
    <!-- End search -->
  </div>
</template>
