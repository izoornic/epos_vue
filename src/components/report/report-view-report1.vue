<script>
/**
 * Reports-View-Report1 component
 */
import axios from '@/axios'
import { apiUrl } from '@/state/helpers'

import priceMixin from '@/mixins/priceMixin'

export default {
    mixins: [priceMixin],

    data() {
        return {
            s_date_report: -1,
            e_date_report: -1,
            selected_tids: [],

            reportData:[],

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
        
        /* console.log(this.$store.state.reports.reportDays, "FILTER DAYS");
        console.log(this.$store.state.reports.reportType.repType, "REP TYPE");
        console.log(this.$store.state.reports.selectedTids, "TIDS"); */

        axios.defaults.headers.common = {
        Authorization: `Bearer ${this.$store.state.authapi.user.token}`,
        }

        this.fetchMerchantReport();
    },

    methods: { 
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
            }
        },

        async fetchMerchantReport(){
        await axios
            .post(this.calling_url, this.calling_params)
            .then((response) => {
            var res = JSON.parse(JSON.stringify(response.data))
                this.reportData = [
                    this.formatNumberDispaly(res[0]),
                    this.formatNumberDispaly(res[1]),
                    this.formatNumberDispaly(res[2]),
                    this.formatNumberDispaly(res[3]),
                    this.formatNumberDispaly(res[4]),
                    this.formatNumberDispaly(res[5]),
                    ];
            }).catch((error) => {
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
    }
}
</script>
<template>
    <div class="bg-white mb-2 p-4">
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
</template>