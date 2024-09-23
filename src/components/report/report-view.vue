<script>
import Layout from '@/router/layouts/main'
import PageHeader from '@/components/page-header'
import appConfig from '@/app.config'
import axios from '@/axios'
import { apiUrl } from '@/state/helpers'

import ReportTypeDatePicker from "@/components/report/report-type-date-picker"

import { EventBus } from "@/event-bus";
import moment from "moment";
import priceMixin from '@/mixins/priceMixin'

/**
 * Report-View component
 */
export default {
  page: {
    title: 'Zeta ePos',
    meta: [{ name: 'description', content: appConfig.description }],
  },
  mixins: [priceMixin],
  components: { Layout, PageHeader, ReportTypeDatePicker },
  data() {
    return {
      s_date_report: -1,
      e_date_report: -1,
      selected_tids: [],
      report_type: '',

      reportData: [],
      posPaymentdData: [],
      calling_url: '',
      calling_params: '',
      //   userGridData: userGridData,
      title: `${this.$t('menuitems.report.text')}`,

      items: [
        {
          text: `${this.$t('label.report_acc_type_sale_normal')}`,
          key: 0,
        },
        {
          text: `${this.$t('label.report_acc_type_refund_normal')}`,
          key: 3,
        },
        {
          text: `${this.$t('label.report_acc_type_sale_proforma')}`,
          key: 1,
        },
        {
          text: `${this.$t('label.report_acc_type_refund_proforma')}`,
          key: 4,
        },
        {
          text: `${this.$t('label.report_acc_type_sale_advance')}`,
          key: 2,
        },
        {
          text: `${this.$t('label.report_acc_type_refund_advance')}`,
          key: 5,
        }
      ],
      
      fields: [
        { 
          key: "date", 
          label: this.$t("label.report_p_m_table_h_date"), 
          sortable: false,
          formatter: (value) => {
            return moment.utc(value).local().format("DD-MMM-YYYY");
          },
        },
        {
          key: "prodaja",
          label: this.$t("label.report_p_m_table_h_sales"),
          sortable: true,
        },
        {
          key: "refundacija",
          label: this.$t("label.report_p_m_table_h_refunds"),
          sortable: true,
        },
        {
          key: "ukupno",
          label: this.$t("label.report_p_m_table_h_total"),
          sortable: true,
        },
      ],
    }
  },

  mounted() {
    /**
     * For paging management
     */
     EventBus.$on("pagingfilterVal", (data) => {
      this.perPage = data;
    });

    this.selected_tids = this.$store.state.reports.selectedTids.tids;
    this.report_type = this.$store.state.reports.reportType.repType;
    this.setReportTime();
     
    console.log(this.$store.state.reports.reportDays, "FILTER DAYS");
    console.log(this.$store.state.reports.reportType.repType, "REP TYPE");
    console.log(this.$store.state.reports.selectedTids, "TIDS");

    axios.defaults.headers.common = {
      Authorization: `Bearer ${this.$store.state.authapi.user.token}`,
    }

    this.fetchMerchantReport();
  },

  methods: { 
    viewReport(){
      this.report_type = this.$store.state.reports.reportType.repType;
      this.setReportTime();
      this.setCallingUrl();
      this.fetchMerchantReport();
    },

    setReportTime(){
      if(this.$store.state.reports.reportDays.startDay == -1){
        this.s_date_report = -1;
      }else{
        this.s_date_report = Math.floor(new Date(this.$store.state.reports.reportDays.startDay).getTime() / 1000);
      }

      if(this.$store.state.reports.reportDays.endDay == -1){
        this.e_date_report = -1;
      }else{
        this.e_date_report = Math.floor(new Date(this.$store.state.reports.reportDays.endDay).getTime() / 1000);
      }
      this.setCallingUrl();
    },
    setCallingUrl(){
      this.title = `${this.$t('menuitems.report.text')}`;
      if(this.report_type === `account_types`) {
        this.title += " - " + this.$t('label.account_types');
        this.calling_url = `${apiUrl}/reports/report1`;
        this.calling_params = {
            "from": this.s_date_report,
            "to": this.e_date_report,
            "tids": this.selected_tids,
            "invTypes":{
                "list": [
                    { //Sale normal
                    "tt": 0,
                    "it": 0
                    },
                    { //Sale ProForma
                      "tt": 0,
                      "it": 1  
                    },
                    { //Sale Advance
                      "tt": 0,
                      "it": 4  
                    },
                    { //Refund normal
                    "tt": 1,
                    "it": 0
                    },
                    { //Refund ProForma
                      "tt": 1,
                      "it": 1  
                    },
                    { //Refund Advance
                      "tt": 1,
                      "it": 4  
                    }
              ]
            }
        };
        console.log("PARAMS",this.calling_params);
      }
      if (this.report_type === `payment_methods`) {
        this.title += " - " + this.$t('label.payment_methods');
        this.calling_url = `${apiUrl}/reports/report2`;
        this.calling_params = {
            "from": this.s_date_report,
            "to": this.e_date_report,
            "tids": this.selected_tids,
        };
        console.log("PARAMS",this.calling_params);
      }
      if (this.report_type === `operators`) {
        this.title += " - " + this.$t('label.operators');
        this.calling_url = '';
        this.calling_params = '';
      }
      if (this.report_type === `items`) {
        this.title += " - " + this.$t('label.items');
        this.calling_url = '';
        this.calling_params = '';
      }
      if (this.report_type === `tax_items`) {
        this.title += " - " + this.$t('label.tax_items');
        this.calling_url = '';
        this.calling_params = '';
      }
      if (this.report_type === `bills`) {
        this.title += " - " + this.$t('label.bills');
        this.calling_url = '';
        this.calling_params = '';
      }
      if (this.report_type === `transaction_details`) {
        this.title += " - " + this.$t('label.transaction_details');
        this.calling_url = '';
        this.calling_params = '';
        //?!? WTF ?!? 
      }
    },
    async fetchMerchantReport(){
       await axios
        .post(this.calling_url, this.calling_params)
        .then((response) => {
          var res = JSON.parse(JSON.stringify(response.data))
          
          if(this.report_type === `account_types`) {
            this.reportData = res;
          }
          if(this.report_type === `payment_methods`) {
            this.posPaymentdData = [];
            let ob_date = '';
            let old_ob_date = '';

            let row = {};

            console.log(`payment_methods`, res);
            Object.entries(res).forEach(([key, value]) => {
              ob_date = key.split(" ")[0];
              if(ob_date != old_ob_date){
                if(old_ob_date != ''){
                  row.ukupno = row.prodaja - row.refundacija;
                  row.ukupno = this.formatNumberDispaly(row.ukupno);
                  row.prodaja = this.formatNumberDispaly(row.prodaja);
                  row.refundacija = this.formatNumberDispaly(row.refundacija);
                  this.posPaymentdData.push(row);
                }
                //novi red reset
                row = {};
                row.date = ob_date;
                row.prodaja = 0;
                row.refundacija = 0;
                row.ukupno = 0;
              } 
              row.prodaja += value.sales;
              row.refundacija += value.refunds;
              old_ob_date = ob_date;
              //console.log(`${key} ${value}`);
            });
            row.ukupno = row.prodaja - row.refundacija;
            row.ukupno = this.formatNumberDispaly(row.ukupno);
            row.prodaja = this.formatNumberDispaly(row.prodaja);
            row.refundacija = this.formatNumberDispaly(row.refundacija);
            this.posPaymentdData.push(row);
           
          }
          //console.log(this.posPaymentdData);
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
        window.scrollTo({ top: 0, behavior: "smooth" });
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
    <PageHeader :title="title"  />
    <!-- start row -->
    <div class="row mb-5">
      <div class="mb-4">{{ $t('label.report_selected_tids_title') }}&nbsp;
         <span v-for="item in selected_tids"
         :key="item.key" ><strong>{{ item }}</strong>&nbsp; | &nbsp;</span>
      </div>
      
      
      <div v-if="report_type === `account_types`">
        <!-- start col -->
        <div style="max-width: 370px;">
        <ul class="list-group">
        <li 
            v-for="report in items"
            :key="report.key"
            class="list-group-item d-flex justify-content-between align-items-center">
            {{ report.text }}
            <span class="badge text-dark"><h5>{{ reportData[report.key] }}</h5></span>
          </li>
        </ul>
        </div>
      </div>

      <div v-if="report_type === `payment_methods`">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="table-responsive mb-0">
                <b-table
                    class="datatables"
                    :items="posPaymentdData"
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
                    
                  <template #top-row v-if="posPaymentdData.length === 0">
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
                 
                    
                </b-table>
              </div>

              <div class="row" v-if="posPaymentdData.length !== 0">
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

      <div v-if="report_type === `operators`">
      
      </div>
       
      <div v-if="report_type === `items`">
      
      </div>

      <div v-if="report_type === `tax_items`">
      
      </div>

      <div v-if="report_type === `bills`">
      
      </div>

      <div v-if="report_type === `transaction_details`">
      
      </div>

      <ReportTypeDatePicker />

      <div class="mb-4">
          <b-button @click="viewReport()" variant="primary" class="ms-1">{{ $t('label.report_show_button_label') }} &nbsp; &nbsp;<i class="fas fa-file-alt"></i></b-button>
      </div>
    </div>
    <!-- end row -->
  </Layout>
</template>
