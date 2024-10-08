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
            kasiri:[],
            buysyLoad: true,
            
            fields: [
                {
                    key: "name",
                    label: this.$t("label.report_p_m_table_metod"),
                    sortable: false,
                },
                {
                    key: "sales",
                    label: this.$t("label.report_p_m_table_h_sales"),
                    sortable: false,
                },
                {
                    key: "refunds",
                    label: this.$t("label.report_p_m_table_h_refunds"),
                    sortable: false,
                },
                {
                    key: "total",
                    label: this.$t("label.report_p_m_table_h_total"),
                    sortable: false,
                }
            ],

            pay_metod: [
                this.$t("label.report_p_m_0"),
                this.$t("label.report_p_m_1"),
                this.$t("label.report_p_m_2"),
                this.$t("label.report_p_m_3"),
                this.$t("label.report_p_m_4"),
                this.$t("label.report_p_m_5"),
                this.$t("label.report_p_m_5"),
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

    /* computed: {
        sortedReport(kasir){
            return this.reportData.slice().sort(function(a, b) {
                return a.index - b.index;
            });
        }
    }, */

    methods: { 
        sortedReport(kasir_arr){
            return kasir_arr.slice().sort(function(a, b) {
                return a.index - b.index;
            });
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
            this.calling_url = `${apiUrl}/reports/report3`;
            this.calling_params = {
                "from": this.s_date_report,
                "to": this.e_date_report,
                "tids": this.selected_tids,
                "limit": 10,
            };
        },

        async fetchMerchantReport(){
            this.buysyLoad = true;
        await axios
            .post(this.calling_url, this.calling_params)
            .then((response) => {
                var res = JSON.parse(JSON.stringify(response.data))
                this.reportData = [];
                this.kasiri = [];
                //console.log(`operaters`, res);
                Object.entries(res).forEach(([key, value]) => {
                    let inddd = 0;
                    let key_split = key.split("/");
                    let kasir_name = key_split[1]
                    kasir_name = kasir_name.trim();
                    if(kasir_name.length < 1) kasir_name = "Nedefinisan";

                    let name_index = key_split[0].split(":")[0];
                    let total = value.sales - value.refunds;
                    
                    if(!this.kasiri.includes(kasir_name)){
                        this.kasiri.push(kasir_name);
                        inddd = this.kasiri.indexOf(kasir_name);
                        this.reportData[inddd] = [];
                    }
                    inddd = this.kasiri.indexOf(kasir_name);
                    this.reportData[inddd].push( {index:name_index, name:this.pay_metod[name_index], sales:this.formatNumberDispaly(value.sales), refunds:this.formatNumberDispaly(value.refunds), total:this.formatNumberDispaly(total)});
                });

                
                Object.entries(this.reportData).forEach(([key, value]) => {
                    this.reportData[key] = this.sortedReport(value);
                });

                //this.reportData = this.sortedReport;
                this.buysyLoad = !this.buysyLoad;
            }).catch((error) => {
                this.buysyLoad = !this.buysyLoad;

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
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <div v-if="buysyLoad">
                    <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle"></b-spinner>
                        <strong class="pl-2">&nbsp;{{ $t("label.loading") }}</strong>
                    </div>
                </div>

                <div v-for="(kasir, index) in kasiri" :key="kasir.key">
                    <h3 class="mt-2">{{ kasir }}</h3>
                    <div class="table-responsive mb-0">
                        <b-table
                        class="datatables"
                        :items="reportData[index]"
                        :fields="fields"
                        responsive="sm"
                        :busy="buysyLoad"
                        @head-clicked="headClicked"
                        >
                            <template #table-busy>
                            <div class="text-center text-danger my-2">
                                <b-spinner class="align-middle"></b-spinner>
                                <strong class="pl-2">&nbsp;{{ $t("label.loading") }}</strong>
                            </div>
                            </template>
                            <template #top-row v-if="reportData.length === 0">
                                <div class="text-center text-danger my-2">
                                <b-spinner class="align-middle"></b-spinner>
                                <strong class="pl-2">&nbsp;{{ $t("label.loading") }}</strong>
                            </div>
                            </template>
                        </b-table>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
</template>