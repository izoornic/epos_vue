<script>
/**
 * Reports-View-Report1 component
 */
import axios from '@/axios'
import { apiUrl } from '@/state/helpers'

import priceMixin from '@/mixins/priceMixin'

import PagingFilter from "@/components/filter/paging-filter";
import pagingFilterMixin from "@/mixins/pagingFilterMixin";
import { EventBus } from "@/event-bus";

export default {
    components: { PagingFilter },
    mixins: [priceMixin, pagingFilterMixin],

    data() {
        return {
            s_date_report: -1,
            e_date_report: -1,
            selected_tids: [],
            totalRowsChash: 0,

            reportData:[],

            fields: [
                {
                    key: "name",
                    label: this.$t("label.product_name"),
                    sortable: false,
                },
                {
                    key: "quantity",
                    label: this.$t("label.report_items_table_h_quantity"),
                    sortable: false,
                },
                {
                    key: "total",
                    label: this.$t("label.report_p_m_table_h_total"),
                    sortable: false,
                }
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

        /**
         * For hiding searchbox for POS module
         */
        this.showsearchbox = false;
        EventBus.$emit("showsearchbox", this.showsearchbox);

        this.selected_tids = this.$store.state.reports.selectedTids.tids;
        this.report_type = this.$store.state.reports.reportType.repType;
        this.setReportTime();

        axios.defaults.headers.common = {
            Authorization: `Bearer ${this.$store.state.authapi.user.token}`,
        }

        this.fetchData();
    },

    watch: {
      currentPage: {
        handler: function () {
          //this.isBusy = !this.isBusy;
          console.log(this.currentPage, "WATCHER CurrentOage");
          this.fetchData();
        },
      },
      // eslint-disable-next-line no-unused-vars
      perPage: function (val, oldval) {
        console.log(val, "< val oldval>", oldval);
        this.totalRows = val;
        this.fetchData();
      },
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
        },

        async fetchData(){
            this.isBusy = !this.isBusy;

          await axios
            .post(`${apiUrl}/reports/report4`, {
                "from": this.s_date_report,
                "to": this.e_date_report,
                "tids": this.selected_tids,
                "page": this.currentPage,
                "limit": this.perPage
                
            })
            .then((response) => {
                var res = JSON.parse(JSON.stringify(response.data))
                this.reportData = [];
                let ob_date = '';
                let count = 0;
                console.log(res);
                Object.entries(res.results).forEach(([key, value]) => {
                  //key mi za sad ne treba
                  ob_date = key.split("/")[0];
                  count ++;
                  //console.log(value.name);
                  //console.log(key, "<-key val->",value);
                  this.reportData.push( {name:value.name, total:this.formatNumberDispaly(value.total), quantity:value.quantity});
                });
            
                //console.log(this.itemsData);
                console.log(ob_date, "ob date", count);
                if(this.currentPage === 1) this.totalRowsChash = res.total;
                this.totalRows = this.totalRowsChash;
                this.isBusy = !this.isBusy;
            }).catch((error) => {
            this.isBusy = !this.isBusy;

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
                   <PagingFilter />
                  <div class="table-responsive mb-0">
                    <b-table
                      class="datatables"
                      :items="reportData"
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

            <div class="row" v-if="reportData.length !== 0">
              <div class="col">
                <div class="dataTables_paginate paging_simple_numbers">
                  <ul
                    class="pagination pagination-rounded justify-content-center mt-4"
                  >
                    <!-- pagination -->
                    <b-pagination
                      v-model="currentPage"
                      :total-rows="totalRows"
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
</template>