<script>
import Layout from '@/router/layouts/main'
import PageHeader from '@/components/page-header'
import appConfig from '@/app.config'
import axios from '@/axios'
import { apiUrl, reportURL } from '@/state/helpers'
/**
 * Report-View component
 */
export default {
  page: {
    title: 'Contact Users Grid',
    meta: [{ name: 'description', content: appConfig.description }],
  },
  components: { Layout, PageHeader },
  data() {
    return {
      //   userGridData: userGridData,
      title: `${this.$t('menuitems.report.text')}`,
      items: [
        {
          text: `${this.$t('menuitems.report.text')}`,
          href: '/report/list',
        },
        {
          text: 'Users Grid',
          active: true,
        },
      ],
      iframe: {
        src: '',
        style: {
          height: '100%',
          width: '100%',
        },
        wrapperStyle: null,
      },
    }
  },

  mounted() {
    console.log(this.$route.params.type)
    axios.defaults.headers.common = {
      Authorization: `Bearer ${this.$store.state.authapi.user.token}`,
    }
    this.fetchMerchantDetail()
    // alert(this.$store.state.authapi.user.merchant_Id);
    // alert(this.$store.state.merchant.merchants.pib);

    if (this.$route.params.report_type === `account_types`) {
      this.iframe.src = `${reportURL}/jasperserver/flow.html?_flowId=viewReportFlow&_flowId=viewReportFlow&ParentFolderUri=/reports/Zeta&reportUnit=/reports/Zeta/Tip_Racuna&decorate=no&j_username=jasperadmin&j_password=ZetaJasper1509&pib=${this.$store.state.merchant.merchants.pib}`
    }
    if (this.$route.params.report_type === `payment_methods`) {
      this.iframe.src = `${reportURL}/jasperserver/flow.html?_flowId=viewReportFlow&_flowId=viewReportFlow&ParentFolderUri=/reports/Zeta&reportUnit=/reports/Zeta/Nacin_Placanja&decorate=no&j_username=jasperadmin&j_password=ZetaJasper1509&pib=${this.$store.state.merchant.merchants.pib}`
    }
    if (this.$route.params.report_type === `operators`) {
      this.iframe.src = `${reportURL}/jasperserver/flow.html?_flowId=viewReportFlow&_flowId=viewReportFlow&ParentFolderUri=/reports/Zeta&reportUnit=/reports/Zeta/Operateri&decorate=no&j_username=jasperadmin&j_password=ZetaJasper1509&pib=${this.$store.state.merchant.merchants.pib}`
    }
    if (this.$route.params.report_type === `items`) {
      this.iframe.src = `${reportURL}/jasperserver/flow.html?_flowId=viewReportFlow&_flowId=viewReportFlow&ParentFolderUri=/reports/Zeta&reportUnit=/reports/Zeta/zeta_report_articles&decorate=no&j_username=jasperadmin&j_password=ZetaJasper1509&pib=${this.$store.state.merchant.merchants.pib}`
    }
    if (this.$route.params.report_type === `tax_items`) {
      this.iframe.src = `${reportURL}/jasperserver/flow.html?_flowId=viewReportFlow&_flowId=viewReportFlow&ParentFolderUri=/reports/Zeta&reportUnit=/reports/Zeta/Porezi&decorate=no&j_username=jasperadmin&j_password=ZetaJasper1509&pib=${this.$store.state.merchant.merchants.pib}`
    }
    if (this.$route.params.report_type === `bills`) {
      this.iframe.src = `${reportURL}/jasperserver/flow.html?_flowId=viewReportFlow&_flowId=viewReportFlow&ParentFolderUri=/reports/Zeta&reportUnit=/reports/Zeta/Zurnal&decorate=no&j_username=jasperadmin&j_password=ZetaJasper1509&pib=${this.$store.state.merchant.merchants.pib}`
    }
    if (this.$route.params.report_type === `transaction_details`) {
      const urlParams = new URLSearchParams(window.location.search)
      const transactionNumber = urlParams.get('param_broj_racuna')

      this.iframe.src = `${reportURL}/jasperserver/flow.html?_flowId=viewReportFlow&reportUnit=%2Freports%2FZeta%2FDetalji_Transakcije&param_broj_racuna=${transactionNumber}&decorate=no&j_username=jasperadmin&j_password=jasperadmin`
    }
    this.iframe.style = {
      position: 'absolute',
      width: '100%',
      height: window.innerHeight,
    }
    this.iframe.wrapperStyle = {
      overflow: 'hidden',
    }
  },
  methods: {
    // eslint-disable-next-line no-unused-vars
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
  },
}
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <!-- start row -->
    <div class="row">
      <div id="iframe-wrapper" :style="iframe.wrapperStyle">
        <iframe
          :src="iframe.src"
          :height="iframe.style.height"
          :width="iframe.style.width"
        ></iframe>
      </div>
    </div>
    <!-- end row -->
  </Layout>
</template>
