<script>
import Layout from '@/router/layouts/main'
import PageHeader from '@/components/page-header'
import appConfig from '@/app.config'
import axios from '@/axios'
import { apiUrl } from '@/state/helpers'

/**
 * Report-View component
 */
export default {
  page: {
    title: 'Zeta ePos',
    meta: [{ name: 'description', content: appConfig.description }],
  },
  components: { Layout, PageHeader },
  data() {
    return {
      s_date: -1,
      e_date: -1,
      selected_tids: [],
      report_type: '',

      reportData: [],
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
    }
  },

  mounted() {
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
    setReportTime(){
      //this.s_date = new Date(this.$store.state.reports.reportDays.startDay).getTime();
      this.e_date = new Date(this.$store.state.reports.reportDays.endDay).getTime();
      this.setCallingUrl();
    },
    setCallingUrl(){
      if(this.report_type === `account_types`) {
        this.title += " - " + this.$t('label.account_types');
        this.calling_url = `${apiUrl}/reports/report1`;
        this.calling_params = {
            "from": this.s_date,
            "to": this.e_date,
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
        console.log(this.calling_params);
      }
      if (this.report_type === `payment_methods`) {
        this.calling_url = '';
      }
      if (this.report_type === `operators`) {
        this.calling_url = '';
      }
      if (this.report_type === `items`) {
        this.calling_url = '';
      }
      if (this.report_type === `tax_items`) {
        this.calling_url = '';
      }
      if (this.report_type === `bills`) {
        this.calling_url = '';
      }
      if (this.report_type === `transaction_details`) {
        //?!? WTF ?!?
        this.calling_url = '';
      }
    },
    async fetchMerchantReport(){
       await axios
        .post(this.calling_url, this.calling_params)
        .then((response) => {
          var res = JSON.parse(JSON.stringify(response.data))
          this.reportData = res;
          console.log(this.reportData);
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
  }
}
</script>

<template>
  <Layout>
    <PageHeader :title="title"  />
    <!-- start row -->
    <div class="row">
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
    <!-- end row -->
  </Layout>
</template>
