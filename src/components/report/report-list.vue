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
    title: 'Reports',
    meta: [{ name: 'description', content: appConfig.description }],
  },
  components: { Layout, PageHeader, PagingFilter },
  mixins: [toastMixin, pagingFilterMixin],

  data() {
    return {
      posGridData: [],
      title: `${this.$t('menuitems.report.text')}`,

      selected_pos: [],

      s_date: '',
      e_date: '',

      r_type: '',
      
      context: null,

      filter: null,
      filterOn: [],

      sortBy: "pos_Id",
      sortDesc: true,
      sortDirection: "desc",
      
      fields: [
        { key: "select_tid", label: "", sortable: false },
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
      ],
      preselectedReport: "account_types",

      reportTypeOptions:[
        {
          value: "account_types",
          text: this.$t("label.account_types"),
          disabled: false,
        },
        {
          value: "payment_methods",
          text: this.$t("label.payment_methods"),
          disabled: false,
        },
        {
          value: "operators",
          text: this.$t("label.operators"),
          disabled: false,
        },
        {
          value: "items",
          text: this.$t("label.items"),
          disabled: false,
        },
        {
          value: "tax_items",
          text: this.$t("label.tax_items"),
          disabled: false,
        },
        {
          value: "bills",
          text: this.$t("label.bills"),
          disabled: false,
        }
      ],
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
    this.r_type = this.preselectedReport;

    this.storageReportDays();
    this.storeReportType();
    this.storeSelectedTids();

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

    reportTypeOptionSelected(value){
      this.r_type = value;
      this.storeReportType();
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

    storeReportType(){
      this.$store.dispatch("reports/addReportType", { 
        repType : this.r_type,
      });
    },

    storeSelectedTids(){
      this.$store.dispatch("reports/addSelectedTids", { 
        tids : this.selected_pos,
      });
    },

    addRemTerminalForReport(value){
      console.log(value);
    },

    viewReport(){
      // is there all we need for report selected 
      if(this.$store.state.reports.reportType.repType === '') {
        toastMixin.methods.displayToastAlert("Greška, niste izabrali vrstu izveštaja!", "error");
        return;
      }
      if(this.selected_pos.length < 1){
        toastMixin.methods.displayToastAlert("Morate da odaberete barem jedan terminal!", "error");
        return;
      }
      this.storeSelectedTids();

      this.$router.push({
        name: "report-view"
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
         
        <b-row>
          <b-col md="auto">
            <h4 class="card-title">{{ $t('label.report_type_heading') }}</h4>
            <b-form-select
              v-model="preselectedReport"
              class="form-select"
              @change="reportTypeOptionSelected"
              id="formrow-inputState"
              :options="reportTypeOptions"
            ></b-form-select>
          </b-col>
          <b-col md="auto">
            <h4 class="card-title">{{ $t('label.report_time_heding') }}</h4>
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
      <div class="mb-4">
        <b-button @click="viewReport()" variant="primary" class="ms-1">{{ $t('label.report_show_button_label') }} &nbsp; &nbsp;<i class="fas fa-file-alt"></i></b-button>
      </div>

      <!-- pos col -->
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title">{{ $t('label.report_pos_table_heding') }}</h4> 

            <PagingFilter />

              <b-form-checkbox-group
                id="checkbox-group-2"
                v-model="selected_pos"
              >
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

                <template #cell(select_tid)="row">
                  <b-form-checkbox 
                    :id="row.item.pos_Id"
                    :value="row.item.pos_Id"
                    ></b-form-checkbox>
                </template>
                
                </b-table>
            </div>

          </b-form-checkbox-group>

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

      <div>Selected: <strong>{{ selected_pos }}</strong></div>

    </div>
    <!-- end row -->
  </Layout>
</template>
