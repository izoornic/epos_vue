<script>
import Layout from '@/router/layouts/main'
import PageHeader from '@/components/page-header'
import appConfig from '@/app.config'
import axios from '@/axios'
import { apiUrl } from '@/state/helpers'
/**
 * Reports-List component
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
      //   items: [
      //     {
      //       text: "Contacts",
      //       href: "/",
      //     },
      //     {
      //       text: "Users Grid",
      //       active: true,
      //     },
      //   ],

      reportGridData: [
        {
          id: 1,
          name: `${this.$t('label.account_types')}`,
          src: '/report/view/account_types',
        },
        {
          id: 2,
          name: `${this.$t('label.payment_methods')}`,
          src: '/report/view/payment_methods',
        },
        {
          id: 3,
          name: `${this.$t('label.operators')}`,
          src: '/report/view/operators',
        },
        {
          id: 4,
          name: `${this.$t('label.items')}`,
          src: '/report/view/items',
        },
        {
          id: 5,
          name: `${this.$t('label.tax_items')}`,
          src: '/report/view/tax_items',
        },
        {
          id: 6,
          name: `${this.$t('label.bills')}`,
          src: '/report/view/bills',
        },
      ],
    }
  },
  mounted() {
    axios.defaults.headers.common = {
      Authorization: `Bearer ${this.$store.state.authapi.user.token}`,
    }
    this.fetchMerchantDetail()
  },
  methods: {
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
    <PageHeader :title="title" />
    <!-- <div class="row">
      <div class="d-flex">
        <button class="btn btn-success ms-auto mb-2" @click="showModal = true">
          Add Customer
        </button>
      </div>
    </div> -->
    <!-- start row -->
    <div class="row">
      <!-- start col -->
      <div
        v-for="report in reportGridData"
        :key="report.id"
        class="col-xl-3 col-sm-6"
        style="margin-bottom: 24px"
      >
        <div class="card text-center h-100">
          <div class="card-body pb-0">
            <!-- <div v-if="!user.image" class="avatar-sm mx-auto mb-4">
              <span
                class="avatar-title rounded-circle bg-soft bg-primary text-primary font-size-16"
                >{{ user.name.charAt(0) }}</span
              >
            </div> -->
            <!-- <div v-if="user.image" class="mb-4">
              <img
                class="rounded-circle avatar-sm"
                :src="`${user.image}`"
                alt
              />
            </div> -->
            <h5 class="font-size-15 mb-1">
              <a href="javascript: void(0);" class="text-dark">{{
                report.name
              }}</a>
            </h5>
            <!-- <p class="text-muted">{{ report.name }}</p> -->

            <!-- <div>
              <a
                href="javascript: void(0);"
                class="badge bg-primary font-size-11 m-1"
                >{{ user.projects[0] }}</a
              >
              <a
                href="javascript: void(0);"
                class="badge bg-primary font-size-11 m-1"
                >{{ user.projects[1] }}</a
              >
              <a
                href="javascript: void(0);"
                class="badge bg-primary font-size-11 m-1"
                >{{ user.projects[2] }}</a
              >
            </div> -->
          </div>
          <div class="card-footer bg-transparent border-top">
            <div class="contact-links d-flex font-size-20">
              <!-- <div class="flex-fill">
                <a
                  v-b-tooltip.hover.top
                  title="Message"
                  href="javascript: void(0);"
                >
                  <i class="bx bx-message-square-dots"></i>
                </a>
              </div> -->
              <div class="flex-fill">
                <router-link v-tooltip.top="$t('label.view')" :to="report.src">
                  <i class="bx bx-pie-chart-alt"></i>
                </router-link>

                <!--<a v-tooltip.top="$t('label.view')" :href="report.src">
                  <i class="bx bx-pie-chart-alt"></i>
                </a>-->
              </div>
              <!-- <div class="flex-fill">
                <a
                  v-b-tooltip.hover.top
                  title="Profile"
                  href="javascript: void(0);"
                >
                  <i class="bx bx-user-circle"></i>
                </a>
              </div> -->
            </div>
          </div>
        </div>
      </div>
      <!-- end col -->
    </div>
    <!-- end row -->
  </Layout>
</template>
