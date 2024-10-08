<script>
import Layout from '@/router/layouts/main'
import PageHeader from '@/components/page-header'
import appConfig from '@/app.config'


import ReportTypeDatePicker from "@/components/report/report-type-date-picker"
import ReportViewReport1 from "@/components/report/report-view-report1"
import ReportViewReport2 from "@/components/report/report-view-report2"
import ReportViewReport3 from "@/components/report/report-view-report3"
import ReportViewReport4 from "@/components/report/report-view-report4"

/**
 * Report-View component
 */
export default {
  page: {
    title: 'Zeta ePos',
    meta: [{ name: 'description', content: appConfig.description }],
  },

  components: { Layout, PageHeader, ReportTypeDatePicker, ReportViewReport1, ReportViewReport2, ReportViewReport4, ReportViewReport3},
  data() {
    return {
      report_type: '',
      componentKey: 0,
      selected_tids: [],
      title: `${this.$t('menuitems.report.text')}`,
    }
  },

  mounted() {
    
    this.report_type = this.$store.state.reports.reportType.repType;
    this.selected_tids = this.$store.state.reports.selectedTids.tids;
    this.viewReport();
  },

  methods: { 
    viewReport(){      
      this.title = `${this.$t('menuitems.report.text')}`;
      this.report_type = this.$store.state.reports.reportType.repType;

      if(this.report_type === `account_types`) {
        this.title += " - " + this.$t('label.account_types');
      }

      if (this.report_type === `payment_methods`) {
        this.title += " - " + this.$t('label.payment_methods');
      }

      if (this.report_type === `operators`) {
        this.title += " - " + this.$t('label.operators');
      }

      if (this.report_type === `items`) {
        this.title += " - " + this.$t('label.items');
      }

      if (this.report_type === `tax_items`) {
        this.title += " - " + this.$t('label.tax_items');
      }

      if (this.report_type === `bills`) {
        this.title += " - " + this.$t('label.bills');
      }

      if (this.report_type === `transaction_details`) {
        this.title += " - " + this.$t('label.transaction_details');
      }

      this.componentKey += 1;
    },
  }
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
        <ReportViewReport1 :key="componentKey" />
      </div>

      <div v-if="report_type === `payment_methods`">
        <ReportViewReport2 :key="componentKey" />
      </div>

      <div v-if="report_type === `operators`">
        <ReportViewReport3 :key="componentKey" />
      </div>
       
      <div v-if="report_type === `items`">
        <ReportViewReport4 :key="componentKey" />   
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