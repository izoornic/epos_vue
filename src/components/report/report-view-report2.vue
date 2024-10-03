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
                    key: 0,
                    text: this.$t("label.report_p_m_table_h_sales"),
                },
                {
                    key: 1,
                    text: this.$t("label.report_p_m_table_h_refunds"),
                },
                {
                    key: 2,
                    text: this.$t("label.report_p_m_table_h_total"),
                },
            ],
        }
    },

    mounted() {

        this.selected_tids = this.$store.state.reports.selectedTids.tids;
        this.report_type = this.$store.state.reports.reportType.repType;
        this.setReportTime();

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
            this.calling_url = `${apiUrl}/reports/report2`;
            this.calling_params = {
                "from": this.s_date_report,
                "to": this.e_date_report,
                "tids": this.selected_tids,
                "limit": 10,
            };
        },

        async fetchMerchantReport(){
        await axios
            .post(this.calling_url, this.calling_params)
            .then((response) => {
                var res = JSON.parse(JSON.stringify(response.data))
                this.reportData = [];
                let ob_date = '';
                //let old_ob_date = '';

                let row = {};
                row.prodaja = 0;
                row.refundacija = 0;
                row.ukupno = 0;

                console.log(`payment_methods`, res);
                Object.entries(res).forEach(([key, value]) => {
                    ob_date = key.split("/")[0];
                    row.date = ob_date;
                    row.prodaja += Number(value.sales);
                    row.refundacija += value.refunds;
                    //console.log(row.prodaja);
                });
                
                row.ukupno = row.prodaja - row.refundacija;
                row.ukupno = this.formatNumberDispaly(row.ukupno);
                row.prodaja = this.formatNumberDispaly(row.prodaja);
                row.refundacija = this.formatNumberDispaly(row.refundacija);
                this.reportData = [row.prodaja, row.refundacija, row.ukupno];
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