<script>
import Layout from "@/router/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";

import { merchantMethods } from "@/state/helpers";
import axios from "@/axios";
import { layoutMethods, layoutComputed, apiUrl } from "@/state/helpers";
import toastMixin from "@/mixins/sweetAlertMixin";

import PagingFilter from "@/components/filter/paging-filter";
import pagingFilterMixin from "@/mixins/pagingFilterMixin";
import dateFormatterMixin from "@/mixins/dateFormatterMixin";
import { EventBus } from "@/event-bus";
import moment from "moment";
/**
 * Merchant-List component
 */
export default {
  page: {
    title: "Merchant List",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: { Layout, PageHeader, PagingFilter },
  mixins: [toastMixin, pagingFilterMixin, dateFormatterMixin],
  data() {
    return {
      merchantGridData: [],
      title: `${this.$t("label.merchant_list")}`,
      items: [
        {
          text: `${this.$t("label.merchants")}`,
          href: "/",
        },
        {
          text: `${this.$t("label.merchant_list")}`,
          active: true,
        },
      ],

      filter: null,
      filterOn: [],

      sortBy: "created_Date",
      sortDesc: true,
      sortDirection: "desc",
      fields: [
        // {
        //   key: "merchant_Id",
        //   label: "Id",
        //   sortable: false,
        // },
        {
          key: "merchant_Name",
          label: this.$t("label.merchant_name"),
          sortable: true,
        },
        {
          key: "pib",
          label: this.$t("label.pib"),
          sortable: true,
        },
        // {
        //   key: "contactname",
        //   sortable: true,
        // },
        {
          key: "merchant_phone",
          label: this.$t("label.phone_number"),
          sortable: true,
        },
        {
          key: "userMail",
          label: this.$t("label.email"),
          sortable: true,
        },
        {
          key: "created_Date",
          // sortByFormatted: true,
          label: this.$t("label.created_date"),
          // eslint-disable-next-line no-unused-vars
          formatter: (value, key, item) => {
            // return moment(value).format("L");
            return moment.utc(value).local().format("DD-MMM-YYYY HH:mm:ss");
          },
          sortable: true,
        },
        // {
        //   key: "updated_Date",
        //   // sortByFormatted: true,
        //   label: this.$t("label.updated_date"),
        //   // eslint-disable-next-line no-unused-vars
        //   formatter: (value, key, item) => {
        //     return moment.utc(value).local().format("DD-MMM-YYYY HH:mm:ss");
        //   },
        //   sortable: true,
        // },
        {
          key: "actions",
          label: this.$t("label.action"),
          sortable: false,
        },
      ],

      isBusy: false,
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
     * For paging & searching management
     */
    EventBus.$on("pagingfilterVal", (data) => {
      this.perPage = data;
    });

    EventBus.$on("searchfilterVal", (data) => {
      this.search = data;
    });

    /**
     * For passing bearer token into the API
     */
    axios.defaults.headers.common = {
      Authorization: `Bearer ${this.$store.state.authapi.user.token}`,
    };
    /**
     * For fetching records
     */
    this.fetchData();
  },
  methods: {
    ...merchantMethods,
    ...layoutMethods,
    customSorting(a, b, key) {
      if (key === "created_Date") {
        // Assuming the date field is a `Date` object, subtraction
        // works on the date serial number (epoch value)
        let aDate = moment(a[key]).unix();
        let bDate = moment(b[key]).unix();
        // // console.log("aDate", aDate);
        // // console.log("bDate", bDate);
        return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
        // }
      } else {
        // Let b-table handle sorting other fields (other than `date` field)
        return false;
      }
    },
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
          `${apiUrl}/merchant/getAllAdminMerchants?limit=${this.perPage}&page=${this.currentPage}&search=${this.search}&sortBy=${this.sortBy}&sortDirection=${this.sortDirection}`
        )
        .then((response) => {
          var res = JSON.parse(JSON.stringify(response.data));
          // // console.log("res.items", res.items);

          this.merchantGridData = res.items;
          this.totalRows = res.count;
          this.isBusy = !this.isBusy;
        })
        .catch((error) => {
          this.isBusy = !this.isBusy;

          // // console.log("error", error);
          // // console.log(error.response);

          if (error.response != undefined && error.response.status === 401) {
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

    async setselectedmerchantvieweditdelete(productid, action) {
      var filterObj = this.merchantGridData.find(function (e) {
        return e.merchant_Id == productid;
      });
      // // console.log("filterObj", filterObj);
      // alert(filterObj.merchant_Id);

      if (action === "edit") {
        this.$router.push({
          name: "merchant-edit",
          params: { id: filterObj.merchant_Id },
        });

        this.addMerchants(filterObj);
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
          // // console.log("www", filterObj.merchant_Id);
          await this.deleteMerchantData(filterObj.merchant_Id);
          await this.fetchData();
        }
      } else if (action === "view") {
        this.$router.push({
          name: "merchant-view",
          params: { id: filterObj.merchant_Id },
        });

        this.addMerchants(filterObj);
      }
    },
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
    // eslint-disable-next-line no-unused-vars
    search: function (val, oldval) {
      // // console.log("oldval", oldval);
      // this.totalRows = val;
      this.fetchData();
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />

    <div class="row mb-0">
      <div class="col-lg-12">
        <div class="button-items">
          <router-link :to="{ name: 'merchant-add' }" class="icon-row-item">
            <b-button size="lg" class="float-end w-sm" variant="primary">{{
              $t("action.create")
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
                :items="merchantGridData"
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
                <template #top-row v-if="merchantGridData.length === 0">
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
                          setselectedmerchantvieweditdelete(
                            row.item.merchant_Id,
                            'view'
                          )
                        "
                      >
                        <i class="far fa-eye fa-xs"></i>
                      </a>
                    </li>
                    <!-- <li
                      class="list-inline-item px-2"
                      :style="
                        row.item.isUpdated === 0 ? 'border: 2px solid red' : ''
                      "
                    > -->
                    <li class="list-inline-item px-2">
                      <a
                        v-tooltip.top="$t('label.edit')"
                        role="button"
                        @click="
                          setselectedmerchantvieweditdelete(
                            row.item.merchant_Id,
                            'edit'
                          )
                        "
                      >
                        <i
                          class="far fa-edit fa-xs"
                          :class="{
                            'fa-edit-merchant-new': row.item.isUpdated === 0,
                          }"
                        ></i>
                      </a>
                    </li>
                    <li class="list-inline-item px-2">
                      <a
                        v-tooltip.top="$t('label.delete')"
                        role="button"
                        @click="
                          setselectedmerchantvieweditdelete(
                            row.item.merchant_Id,
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
            <div class="row" v-if="merchantGridData.length !== 0">
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
