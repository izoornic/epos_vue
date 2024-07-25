<script>
import Layout from '@/router/layouts/main'
import PageHeader from '@/components/page-header'
import appConfig from '@/app.config'

import axios from '@/axios'
import toastMixin from "@/mixins/sweetAlertMixin";
import { layoutMethods, layoutComputed, apiUrl } from "@/state/helpers";

import PagingFilter from "@/components/filter/paging-filter";
import pagingFilterMixin from "@/mixins/pagingFilterMixin";
import { EventBus } from "@/event-bus";
/**
 * Reports-List component
 */
export default {
  page: {
    title: 'Contact Users Grid',
    meta: [{ name: 'description', content: appConfig.description }],
  },
  components: { Layout, PageHeader, PagingFilter },
  mixins: [toastMixin, pagingFilterMixin],
  data() {
    return {
      posGridData: [],
      title: `${this.$t('menuitems.report.text')}`,

      s_date: '',
      e_date: '',
      
      context: null,

      filter: null,
      filterOn: [],

      sortBy: "pos_Id",
      sortDesc: true,
      sortDirection: "desc",
      
      fields: [
        {
          key: "pos_Id",
          label: this.$t("label.pos_id"),
          sortable: true,
        },
        {
          key: "pos_Address",
          label: this.$t("label.address"),
          sortable: true,
        },
        {
          key: "posGroupName",
          label: this.$t("label.group"),
          sortable: true,
        },
        { key: "account_types", label: this.$t("label.report_account_types_heading"), sortable: false },
        { key: "payment_methods", label: this.$t("label.report_payment_methods_heading"), sortable: false },
        { key: "operators", label: this.$t("label.report_operators_heading"), sortable: false },
        { key: "items", label: this.$t("label.report_items_heading"), sortable: false },
        { key: "tax_items", label: this.$t("label.report_tax_items_heading"), sortable: false },
        { key: "bills", label: this.$t("label.report_bills_heading"), sortable: false },
      ],
      
      //reportGridData: [
      //  {
      //    id: 1,
      //    name: `${this.$t('label.account_types')}`,
      //    src: '/report/view/account_types',
      //  },
      //  {
      //    id: 2,
      //    name: `${this.$t('label.payment_methods')}`,
      //    src: '/report/view/payment_methods',
      //  },
      //  {
      //    id: 3,
      //    name: `${this.$t('label.operators')}`,
      //    src: '/report/view/operators',
      //  },
      //  {
      //    id: 4,
      //    name: `${this.$t('label.items')}`,
      //    src: '/report/view/items',
      //  },
      //  {
      //    id: 5,
      //    name: `${this.$t('label.tax_items')}`,
      //    src: '/report/view/tax_items',
      //  },
      //  {
      //    id: 6,
      //    name: `${this.$t('label.bills')}`,
      //    src: '/report/view/bills',
      //  },
      //],
    }
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

    this.e_date = new Date(); 
    this.e_date.setHours(23, 59, 59, 59);
    this.s_date = new Date(); 
    this.s_date.setDate(this.e_date.getDate() - 1);
    this.s_date.setHours(0, 0, 0, 0);
    
    this.storageReportDays();

    /**
     * For paging management
     */
     EventBus.$on("pagingfilterVal", (data) => {
      this.perPage = data;
    });
    //console.log(this.perPage, "THIS PER PAGE")

    /**
     * For hiding searchbox for POS module
     */
     this.showsearchbox = false;
    EventBus.$emit("showsearchbox", this.showsearchbox);

    const css = `
      .calendar-info-selected {
        background: #d6f3e9;
      }`
    this.styleTag = document.createElement('style');
    this.styleTag.appendChild(document.createTextNode(css));
    document.head.appendChild(this.styleTag);

    axios.defaults.headers.common = {
      Authorization: `Bearer ${this.$store.state.authapi.user.token}`,
    }
    this.fetchMerchantDetail()
    this.fetchData()
  },

  destroyed() {
    this.styleTag.remove();
  },

  methods: {
    ...layoutMethods,
    dateClass(ymd) {
      if(!this.e_date.getMonth) return;
      this.e_date.setHours(23, 59, 59, 59);
      const day = new Date(ymd);
      if(this.s_date > this.e_date){
          this.e_date = this.s_date;
        }
      return (day >= this.s_date && day <= this.e_date) ? 'calendar-info-selected' : ''
    },

    startDateSet(sday){
      this.s_date = sday.activeDate;
      this.storageReportDays();
    },

    endDateSet(eday){
      this.e_date = eday.activeDate;
      this.storageReportDays();
    },

    storageReportDays(){
      this.$store.dispatch("reports/addReportDays", { 
        startDay  : this.s_date,
        endDay    : this.e_date
      });
    },

    viewReport(pos_Id, r_type){
        this.$router.push({
          name: "report-view",
          params: { report_type: r_type, pos_id: pos_Id },
        });
    },

    async fetchMerchantDetail() {
      // this.isBusy = !this.isBusy;
      let callingurl = ''
      if (
        this.$store.state.authapi.user != null &&
        this.$store.state.authapi.user.merchant_Id == ''
      ) {
        callingurl = `${apiUrl}/users/getAll?id=${this.$store.state.authapi.user.user_Id}`
      } else {
        callingurl = `${apiUrl}/merchant/getAll?id=${this.$store.state.authapi.user.merchant_Id}`
      }
      await axios
        .get(`${callingurl}`)
        .then((response) => {
          var res = JSON.parse(JSON.stringify(response.data))
          // console.log("res.items", res);
          this.form = res         
        })
        .catch((error) => {
          // this.isBusy = !this.isBusy;

          // console.log("error", error);
          // console.log(error.response);

          if (error.response != undefined && error.response.status === 401) {
            this.$store.dispatch('authapi/logoutauthapi')
            this.$router.push('/login')
          } else if (
            error.response != undefined &&
            error.response.status === 400
          ) {
            // toastMixin.methods.displayToastAlert(error.response.data, "error");
          } else {
            // toastMixin.methods.displayToastAlert(
            //   this.$t("alerts.something_went_wrong"),
            //   "error"
            // );
          }
        })
    },
    
    async fetchData() {
      this.isBusy = !this.isBusy;
      // alert(this.sortBy + " " + this.sortDirection);

      await axios
        .get(
          `${apiUrl}/Pos/GetByMerchant?limit=${this.perPage}&page=${this.currentPage}&sortBy=${this.sortBy}&sortDirection=${this.sortDirection}`
        )
        .then((response) => {
          var res = JSON.parse(JSON.stringify(response.data));

          this.posGridData = res.items;
          console.log(this.posGridData);
          //this.totalRows = res.count;
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
}
</script>

<template>
  <Layout>
    <PageHeader :title="title" />
    <!-- start row -->
    <div class="row">
      <div class="mb-5 p-2">
        <h4 class="card-title">{{ $t('label.report_time_heding') }}</h4> 
        <b-row>
          <b-col md="auto">
            <b-calendar 
              block
              style="width: 350px"
              locale="sh-SH"
              readonly="readonly"  
              start-weekday="1"
              hide-header=true
              :date-info-fn="dateClass"
            ></b-calendar>
          </b-col>
          <b-col md="auto">
            <div style="width: 350px">
              <div>
                <label for="start-date-datepicker">{{ $t('label.report_time_start_label') }}</label>
                  <b-form-datepicker
                    id="start-date-datepicker"
                    value-as-date
                    start-weekday="1" 
                    locale="sh-SH"
                    v-model="s_date" 
                    @context="startDateSet"
                    class="mb-2"
                  ></b-form-datepicker>
                  <p>&nbsp;</p>
            </div>
            <div>
                <label for="end-date-datepicker">{{ $t('label.report_time_end_label') }}</label>
                  <b-form-datepicker
                    id="end-date-datepicker" 
                    value-as-date
                    start-weekday="1"
                    locale="sh-SH"
                    v-model="e_date" 
                    @context="endDateSet"
                    class="mb-2"
                  ></b-form-datepicker>
            </div>
            </div>
          </b-col>
        </b-row>
      </div>


      <!-- pos col -->
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title">{{ $t('label.report_pos_table_heding') }}</h4> 

            <PagingFilter />

            <!-- Table -->
            <div class="table-responsive mb-0">
              <b-table
                class="datatables"
                :items="posGridData"
                :fields="fields"
                :per-page="0"
                :current-page="currentPage"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                responsive="sm"
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
                  </td>
                </template>
                <template #cell(account_types)="row">
                  <span class="font-size-20 contact-links mx-auto my-0 p-0 w-100">
                    <a
                        v-tooltip.top="$t('label.account_types')"
                        role="button"
                        @click="viewReport(row.item.pos_Id, 'account_types')"
                        >
                      <i class="fas fa-file-alt"></i>
                    </a>
                    </span>
                </template>

                <template #cell(payment_methods)="row">
                  <span class="font-size-20 contact-links mx-auto my-0 p-0 w-100">
                    <a
                        v-tooltip.top="$t('label.payment_methods')"
                        role="button"
                        @click="viewReport(row.item.pos_Id, 'payment_methods')"
                        >
                        <i class="far fa-file-alt"></i>
                    </a>
                    </span>
                </template>
                
                <template #cell(operators)="row">
                  <span class="font-size-20 contact-links mx-auto my-0 p-0 w-100">
                    <a
                        v-tooltip.top="$t('label.operators')"
                        role="button"
                        @click="viewReport(row.item.pos_Id, 'operators')"
                        >
                        <i class="fas fa-id-card-alt"></i>
                    </a>
                    </span>
                </template>
                
                <template #cell(items)="row">
                  <span class="font-size-20 contact-links mx-auto my-0 p-0 w-100">
                    <a
                        v-tooltip.top="$t('label.items')"
                        role="button"
                        @click="viewReport(row.item.pos_Id, 'items')"
                        >
                        <i class="far fa-file-code"></i>
                    </a>
                    </span>
                </template>
                
                <template #cell(tax_items)="row">
                  <span class="font-size-20 contact-links mx-auto my-0 p-0 w-100">
                    <a
                        v-tooltip.top="$t('label.tax_items')"
                        role="button"
                        @click="viewReport(row.item.pos_Id, 'tax_items')"
                        >
                        <i class="fas fa-file-powerpoint"></i>
                    </a>
                    </span>
                </template>
                
                <template #cell(bills)="row">
                  <span class="font-size-20 contact-links mx-auto my-0 p-0 w-100">
                    <a
                        v-tooltip.top="$t('label.bills')"
                        role="button"
                        @click="viewReport(row.item.pos_Id, 'bills')"
                        >
                        <i class="far fa-file"></i>
                    </a>
                    </span>
                </template>
                </b-table>
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

      <!-- start col -->
      <!-- <div
        v-for="report in reportGridData"
        :key="report.id"
        class="col-xl-3 col-sm-6"
        style="margin-bottom: 24px"
      >
        <div class="card text-center h-100">
          <div class="card-body pb-0">
           
            
            <h5 class="font-size-15 mb-1">
              <a href="javascript: void(0);" class="text-dark">{{
                report.name
              }}</a>
            </h5>
           
          </div>
          <div class="card-footer bg-transparent border-top">
            <div class="contact-links d-flex font-size-20">
              
              <div class="flex-fill">
                <router-link v-tooltip.top="$t('label.view')" :to="report.src">
                  <i class="bx bx-pie-chart-alt"></i>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div> -->
      <!-- end col -->

    </div>
    <!-- end row -->
  </Layout>
</template>
