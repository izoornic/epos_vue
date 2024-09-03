<script>
import Layout from '@/router/layouts/main'
import PageHeader from '@/components/page-header'
import appConfig from '@/app.config'
import ReportTypeDatePicker from "@/components/report/report-type-date-picker"

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
  components: { Layout, PageHeader, PagingFilter, ReportTypeDatePicker },
  mixins: [toastMixin, pagingFilterMixin],

  data() {
    return {
      posGridData: [],
      title: `${this.$t('menuitems.report.text')}`,

      selected_pos: [],

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

    axios.defaults.headers.common = {
      Authorization: `Bearer ${this.$store.state.authapi.user.token}`,
    }
    this.fetchMerchantDetail()
    this.fetchData()
  },

  methods: {
    ...layoutMethods,

    storeSelectedTids(){
      this.$store.dispatch("reports/addSelectedTids", { 
        tids : this.selected_pos,
      });
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
          //console.log(this.posGridData);
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
      <ReportTypeDatePicker />

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

      <div class="mb-4">
        <b-button @click="viewReport()" variant="primary" class="ms-1">{{ $t('label.report_show_button_label') }} &nbsp; &nbsp;<i class="fas fa-file-alt"></i></b-button>
      </div>
      
      <div>Selected: <strong>{{ selected_pos }}</strong></div>

    </div>
    <!-- end row -->
  </Layout>
</template>
