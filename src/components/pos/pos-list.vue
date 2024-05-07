<script>
import Layout from "@/router/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";

import { POSMethods } from "@/state/helpers";
import axios from "@/axios";
import { layoutMethods, layoutComputed, apiUrl } from "@/state/helpers";
import toastMixin from "@/mixins/sweetAlertMixin";

import PagingFilter from "@/components/filter/paging-filter";
import pagingFilterMixin from "@/mixins/pagingFilterMixin";
import dateFormatterMixin from "@/mixins/dateFormatterMixin";
import { EventBus } from "@/event-bus";
import moment from "moment";
/**
 * POS-List component
 */
export default {
  page: {
    // title: "POS List",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: { Layout, PageHeader, PagingFilter },
  mixins: [toastMixin, pagingFilterMixin, dateFormatterMixin],
  data() {
    return {
      posGridData: [],
      title: `${this.$t("label.pos_list")}`,
      items: [
        {
          text: "Kase",
          href: "/pos/list",
        },
        {
          text: `${this.$t("label.pos_list")}`,
          active: true,
        },
      ],

      filter: null,
      filterOn: [],

      sortBy: "created_Date",
      sortDesc: true,
      sortDirection: "desc",
      fields: [
        {
          key: "pos_Id",
          label: this.$t("label.pos_id"),
          sortable: true,
        },
        {
          key: "is_Master",
          label: this.$t("label.master"),
          sortable: true,
        },
        {
          key: "posGroupName",
          label: this.$t("label.group"),
          sortable: true,
        },
        // {
        //   key: "storeName",
        //   label: this.$t("label.store"),
        //   sortable: true,
        // },
        {
          key: "pos_Address",
          label: this.$t("label.address"),
          sortable: true,
        },
        {
          key: "lastProductListUpdated",
          label: this.$t("label.last_active"),
          sortable: true,
          // eslint-disable-next-line no-unused-vars
          formatter: (value, key, item) => {
            // alert(value);
            // return moment(value).format("L");
            return value == "0001-01-01T00:00:00"
              ? "-"
              : moment.utc(value).local().format("DD-MMM-YYYY HH:mm:ss");
          },
        },
        // { key: "is_Active", label: this.$t("label.active"), sortable: true },
        // {
        //   key: "is_Master",
        //   label: this.$t("label.master"),
        //   sortable: true,
        // },
        {
          key: "created_Date",
          label: this.$t("label.created_date"),
          sortable: true,
          // sortDesc: true,
          // eslint-disable-next-line no-unused-vars
          formatter: (value, key, item) => {
            // alert(value);
            // return moment(value).format("L");
            return moment.utc(value).local().format("DD-MMM-YYYY HH:mm:ss");
          },
        },
        {
          key: "updated_Date",
          label: this.$t("label.updated_date"),
          sortable: true,
          // eslint-disable-next-line no-unused-vars
          formatter: (value, key, item) => {
            return value == "0001-01-01T00:00:00"
              ? "-"
              : moment.utc(value).local().format("DD-MMM-YYYY HH:mm:ss");
          },
        },
        { key: "actions", label: this.$t("label.action"), sortable: false },
      ],

      isBusy: false,
      latestSyncronizedTimeStamp: null
    };
  },
  computed: {
    // ...todoComputed,
    ...layoutComputed,
    /**
     * Total no. of records
     */
    rows() {
      return this.totalRows;
    },
  },
  mounted() {
    /**
     * For paging management
     */
    EventBus.$on("pagingfilterVal", (data) => {
      this.perPage = data;
    });

    /**
     * For passing bearer token into the API
     */
    axios.defaults.headers.common = {
      Authorization: `Bearer ${this.$store.state.authapi.user.token}`,
    };

    /**
     * For hiding searchbox for POS module
     */
    this.showsearchbox = false;
    EventBus.$emit("showsearchbox", this.showsearchbox);

    /**
     * For fetching records
     */
    this.fetchData();
  },
  methods: {
    ...POSMethods,
    ...layoutMethods,
    onFiltered() {
      // Trigger pagination to update the number of buttons/pages due to filtering
      // this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    async fetchData() {
      this.isBusy = !this.isBusy;
      // alert(this.sortBy + " " + this.sortDirection);

      await axios
        .get(
          `${apiUrl}/Pos/GetByMerchant?id=${this.$store.state.authapi.user.merchant_Id}&limit=${this.perPage}&page=${this.currentPage}&sortBy=${this.sortBy}&sortDirection=${this.sortDirection}`
        )
        .then((response) => {
          var res = JSON.parse(JSON.stringify(response.data));

          this.latestSyncronizedTimeStamp = res.maxDate;
          this.posGridData = res.items;
          this.totalRows = res.count;
          this.isBusy = !this.isBusy;
        })
        .catch((error) => {
          this.isBusy = !this.isBusy;

          // // console.log("error", error);
          // console.log(error.response);

          if (error.response != undefined && error.response.status === 401) {
            // this.$router.push("/logout");
            this.$store.dispatch("authapi/logoutauthapi");
            this.$router.push("/login");
          } else if (
            error.response != undefined &&
            error.response.status === 400
          ) {
            toastMixin.methods.displayToastAlert(error.response.data, "error");
          } else {
            toastMixin.methods.displayToastAlert(
              this.$t("alerts.something_went_wrong"),
              "error"
            );
          }
        });
    },

    async setselectedposvieweditdelete(productid, action) {
      var filterObj = this.posGridData.find(function (e) {
        return e.pos_Id == productid;
      });
      // // console.log("filterObj", filterObj);
      // alert(filterObj.merchant_Id);

      if (action === "edit") {
        this.$router.push({
          name: "pos-edit",
          params: { id: filterObj.pos_Id },
        });

        this.addPOS(filterObj);
      } else if (action === "delete") {
        let result = await toastMixin.methods.displayConfirmationAlert(
          this.$t("alerts.delete_confirmation_title"),
          this.$t("alerts.delete_confirmation_text"),
          "warning",
          this.$t("alerts.delete_confirmation_accept_button_text"),
          this.$t("alerts.delete_confirmation_cancel_button_text")
        );
        // // console.log("result", result);
        if (result.value) {
          // // console.log("www", filterObj.pos_Id);
          await this.deletePOSData(filterObj.pos_Id);
          await this.fetchData();
        }
      } else if (action === "view") {
        this.$router.push({
          name: "pos-product-list",
          params: { posGroup_Id: filterObj.posGroup_Id },
        });

        this.addPOS(filterObj);
      }
    },
    isSynchronized(timestamp) {
      if(!this.latestSyncronizedTimeStamp || !timestamp || timestamp == "0001-01-01T00:00:00" || timestamp == "-") {
        return false;
      }

      return moment.utc(timestamp).format("DD-MMM-YYYY") == moment.utc(this.latestSyncronizedTimeStamp).format("DD-MMM-YYYY");
    }
  },
  watch: {
    currentPage: {
      handler: function () {
        // this.isBusy = !this.isBusy;
        this.fetchData();
      },
    },
    // eslint-disable-next-line no-unused-vars
    perPage: function (val, oldval) {
      // // console.log("oldval", oldval);
      this.totalRows = val;
      this.fetchData();
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />

    <div class="row mb-0" v-if="1 == 1">
      <div class="col-lg-12">
        <div class="button-items">
          <router-link :to="{ name: 'pos-add' }" class="icon-row-item">
            <b-button class="float-end w-sm" variant="primary">{{
              $t("label.create_new_pos")
            }}</b-button>
          </router-link>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <!-- <h4 class="card-title">Data Table</h4> -->

            <PagingFilter />

            <!-- Table -->
            <div class="table-responsive mb-0">
              <b-table
                class="datatables"
                :items="posGridData"
                :fields="fields"
                responsive="sm"
                :per-page="0"
                :current-page="currentPage"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :busy="isBusy"
                :no-local-sorting="true"
                @head-clicked="headClicked"
              >
                <template #table-busy>
                  <div class="text-center text-danger my-2">
                    <b-spinner class="align-middle"></b-spinner>
                    <strong class="pl-2">{{ $t("label.loading") }}</strong>
                  </div>
                </template>
                <template #top-row v-if="posGridData.length === 0">
                  <td
                    :colspan="fields.length"
                    class="text-center text-danger my-2 col-12"
                  >
                    <div class="col-12 align-self-center">
                      <lottie-animation
                        ref="anim"
                        style="height: 400px"
                        :loop="true"
                        :animationData="require('@/assets/no-data.json')"
                      />
                    </div>

                    <!-- <img
                      width="400"
                      src="@/assets/images/No data-rafiki.png"
                      alt
                      class="img-thumbnail"
                    /> -->
                  </td>
                </template>
                <template #cell(is_Master)="row">
                  <span
                    class="badge rounded-pill font-size-11"
                    :class="{
                      'badge-soft-danger': row.item.is_Master === false,
                      'badge-soft-success': row.item.is_Master === true
                    }"
                    >{{
                      row.item.is_Master === true
                        ? $t("label.yes")
                        : $t("label.no")
                    }}</span
                  >
                </template>
                <template #cell(lastProductListUpdated)="row">
                  <span
                    class="badge rounded-pill font-size-11 badge-soft-danger"
                    v-if="row.value === '-'"
                  >
                    {{ $t("label.neveractive") }}
                  </span>
                  <span
                    class="badge rounded-pill font-size-11 badge-soft-danger"
                    v-else-if="!isSynchronized(row.value)"
                    v-tooltip.top="
                      formatDateTooltip(row.item.lastProductListUpdated)
                    "
                  >
                    {{ formatDateDisplay(row.item.lastProductListUpdated) }}
                  </span>
                  <span
                    class="badge rounded-pill badge-soft-success font-size-11"
                    v-else
                    v-tooltip.top="
                      formatDateTooltip(row.item.lastProductListUpdated)
                    "
                    >{{ formatDateDisplay(row.item.lastProductListUpdated) }}
                  </span>
                </template>
                <template #cell(is_Active)="row">
                  <span
                    class="badge rounded-pill badge-soft-success font-size-11"
                    :class="{
                      'badge-soft-danger': row.item.is_Active === false,
                    }"
                    >{{
                      row.item.is_Active === true
                        ? $t("label.active")
                        : $t("label.inactive")
                    }}</span
                  >
                </template>
                <template #cell(created_Date)="row">
                  <span v-tooltip.top="formatDateTooltip(row.item.created_Date)"
                    >{{ formatDateDisplay(row.item.created_Date) }}
                  </span>
                </template>
                <template #cell(updated_Date)="row">
                  <span v-tooltip.top="formatDateTooltip(row.item.updated_Date)"
                    >{{ formatDateDisplay(row.item.updated_Date) }}
                  </span>
                </template>
                <template #cell(actions)="row">
                  <!-- {{ row }} -->
                  <ul class="list-inline font-size-20 contact-links mb-0">
                    <li class="list-inline-item px-2">
                      <a
                        v-tooltip.top="$t('label.view')"
                        role="button"
                        @click="
                          setselectedposvieweditdelete(row.item.pos_Id, 'view')
                        "
                      >
                        <i class="far fa-eye fa-xs"></i>
                      </a>
                    </li>
                    <li class="list-inline-item px-2">
                      <a
                        v-tooltip.top="$t('label.edit')"
                        role="button"
                        @click="
                          setselectedposvieweditdelete(row.item.pos_Id, 'edit')
                        "
                      >
                        <i class="far fa-edit fa-xs"></i>
                      </a>
                    </li>
                    <li class="list-inline-item px-2">
                      <a
                        v-tooltip.top="$t('label.delete')"
                        role="button"
                        @click="
                          setselectedposvieweditdelete(
                            row.item.pos_Id,
                            'delete'
                          )
                        "
                      >
                        <i class="fas fa-trash fa-xs"></i>
                      </a>
                    </li>
                  </ul> </template
              ></b-table>
            </div>
            <div class="row" v-if="posGridData.length !== 0">
              <div class="col">
                <div class="dataTables_paginate paging_simple_numbers">
                  <ul
                    class="pagination pagination-rounded justify-content-center mt-4"
                  >
                    <!-- pagination -->
                    <b-pagination
                      v-model="currentPage"
                      :total-rows="rows"
                      :per-page="perPage"
                    ></b-pagination>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
