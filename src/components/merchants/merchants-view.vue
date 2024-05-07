<script>
import Layout from "@/router/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";

import axios from "@/axios";
import {
  layoutMethods,
  apiUrl,
  merchantMethods,
  superadminRole,
  merchantRole,
} from "@/state/helpers";
import toastMixin from "@/mixins/sweetAlertMixin";
import dateFormatterMixin from "@/mixins/dateFormatterMixin";
import {
  required,
  email,
  minLength,
  // maxLength,
  // numeric,
} from "vuelidate/lib/validators";

import moment from "moment";

/**
 * Merchant-View component
 */
export default {
  page: {
    title: "Merchant View",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: { Layout, PageHeader },
  mixins: [dateFormatterMixin],
  data() {
    return {
      // revenueChart: revenueChart,
      title: `${this.$t("label.merchant_view")}`,
      items: [
        {
          text: `${this.$t("label.merchants")}`,
          href: "/",
        },
        {
          text: `${this.$t("label.merchant_view")}`,
          active: true,
        },
      ],
      statData: [
        {
          icon: "bx bx-check-circle",
          title: "Completed Projects",
          value: "125",
        },
        {
          icon: "bx bx-hourglass",
          title: "Pending Projects",
          value: "12",
        },
        {
          icon: "bx bx-package",
          title: "Total Revenue",
          value: "$36,524",
        },
      ],

      form: {
        merchant_Id: "",
        contactName: "",
        merchant_Name: "",
        merchant_Address: "",
        pib: "",
        merchant_phone: "",
        userMail: "",
        password: "",
        created_By: "",
      },

      posGridData: [],
      merchantGridData: [],

      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      isBusy: false,
      sortBy: "created_Date",
      sortDesc: true,
      sortDirection: "desc",
      fields: [
        {
          key: "pos_Id",
          label: this.$t("label.pos_id"),
          sortable: false,
          sortBy: "pos_Id",
        },
        {
          key: "posGroupName",
          label: this.$t("label.group"),
          sortable: false,
        },
        {
          key: "pos_Address",
          label: this.$t("label.address"),
          sortable: false,
        },
        {
          key: "lastProductListUpdated",
          label: this.$t("label.last_active"),
          sortable: true,
          // eslint-disable-next-line no-unused-vars
          formatter: (value, key, item) => {
            // alert(value);
            // return moment(value).format("L");
            return value == "0001-01-01T00:00:00"
              ? "-"
              : moment.utc(value).local().format("DD-MMM-YYYY HH:mm:ss");
          },
        },
        // {
        //   key: "storeName",
        //   label: this.$t("label.store"),
        //   sortable: false,
        // },
        // {
        //   key: "is_Active",
        //   label: this.$t("label.active"),
        //   sortable: true,
        // },
        // {
        //   key: "is_Master",
        //   label: this.$t("label.master"),
        //   sortable: false,
        // },
      ],
      submitted: false,
      disabled: true,
      passwordHidden: {
        default: false,
        type: Boolean,
      },
      edit: true,
      superadminRole,
      merchantRole,
      merchant_Name: this.$store.state.merchant.merchants.merchant_Name,
      merchant_Address: this.$store.state.merchant.merchants.merchant_Address,
      contactName: this.$store.state.merchant.merchants.contactName,
      merchant_phone: this.$store.state.merchant.merchants.merchant_phone,
    };
  },
  validations: {
    form: {
      contactName: { required },
      merchant_Name: { required },
      merchant_Address: { required },
      merchant_phone: { required },
      // pib: {
      //   required,
      //   numeric,
      //   minLength: minLength(9),
      //   maxLength: maxLength(9),
      // },
      userMail: { required, email },
      password: { required, minLength: minLength(6)},
    },
  },
  mounted() {
    /**
     * For passing bearer token into the API
     */
    axios.defaults.headers.common = {
      Authorization: `Bearer ${this.$store.state.authapi.user.token}`,
    };
    /**
     * For fetching records
     */
    this.fetchMerchantDetail();
    this.fetchDataPOSList();
  },
  computed: {
    /**
     * Total no. of records
     */
    rows() {
      return this.totalRows;
    },
  },
  watch: {
    currentPage: {
      handler: function () {
        // this.isBusy = !this.isBusy;
        /**
         * For fetching records
         */
        this.fetchDataPOSList();
      },
    },
    // eslint-disable-next-line no-unused-vars
    perPage: function (val, oldval) {
      // // console.log("oldval", oldval);
      /**
       * For fetching records
       */
      this.fetchDataPOSList();
    },
  },
  methods: {
    // ...POSMethods,
    ...layoutMethods,
    ...merchantMethods,
    onFiltered() {
      // Trigger pagination to update the number of buttons/pages due to filtering
      // this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    cancel() {
      this.$refs["formmodal"].hide();
      Object.assign(this.form, this.formBeforeEdit);
    },
    hidePassword() {
      this.passwordHidden = true;
    },
    showPassword() {
      this.passwordHidden = false;
    },
    async formSubmit() {
      this.submitted = true;
      // stop here if form is invalid
      this.$v.$touch();
      if (this.$v.$invalid) {
        // console.log("error");
      } else {
        // this.$refs.anim.play();
        // // console.log("this.form", this.form);

        this.form = {
          ...this.form,
          created_By: this.$store.state.authapi.user.user_Id,
        };
        let payload = {
          requestParam: this.form,
          redirect: false,
          message: !this.edit
            ? this.$t("alerts.record_create_success")
            : this.$t("alerts.record_update_success"),
        };

        this.addMerchantData(payload);
        this.merchant_Name = this.form.merchant_Name;
        this.merchant_Address = this.form.merchant_Address;
        this.contactName = this.form.contactName;
        this.merchant_phone = this.form.merchant_phone;
        this.$refs["formmodal"].hide();
      }
    },
    async fetchMerchantDetail() {
      // this.isBusy = !this.isBusy;
      let callingurl = "";

      callingurl = `${apiUrl}/merchant/getAllAdminMerchants?id=${this.$store.state.merchant.merchants.merchant_Id}&sortBy=${this.sortBy}&sortDirection=${this.sortDirection}`;

      await axios
        .get(`${callingurl}`)
        .then((response) => {
          var res = JSON.parse(JSON.stringify(response.data));
          // // console.log("res.items", res);

          this.form = res;
          // this.merchant_Name = this.form.merchant_Name;
          // this.merchant_Address = this.form.merchant_Address;
          // this.contactName = this.form.contactName;
          // this.merchant_phone = this.form.merchant_phone;
          this.formBeforeEdit = Object.assign({}, this.form);
          // // console.log("this.form", this.form);
        })
        .catch((error) => {
          // this.isBusy = !this.isBusy;

          // // console.log("error", error);
          // // console.log(error.response);

          if (error.response != undefined && error.response.status === 401) {
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

    async fetchDataPOSList() {
      this.isBusy = !this.isBusy;
      await axios
        .get(
          `${apiUrl}/Pos/GetByMerchant?id=${this.$store.state.merchant.merchants.merchant_Id}&limit=${this.perPage}&page=${this.currentPage}&sortBy=${this.sortBy}&sortDirection=${this.sortDirection}`
        )
        .then((response) => {
          var res = JSON.parse(JSON.stringify(response.data));
          // // console.log("res.items", res.items);
          this.posGridData = res.items;
          this.totalRows = res.count;
          this.isBusy = !this.isBusy;
          // alert(this.totalRows);
          // return res.json();
        })
        .catch((error) => {
          this.isBusy = !this.isBusy;

          // // console.log("error", error);
          // // console.log(error.response);

          if (error.response != undefined && error.response.status === 401) {
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
};
</script>
<style scoped>
input {
  margin-right: -30px;
  padding-right: 35px;
}

.display-eye {
  cursor: pointer;
}
</style>
<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <!-- start row -->
    <div class="row">
      <div class="col-xl-4">
        <div class="card overflow-hidden">
          <div class="bg-soft bg-primary">
            <div class="row">
              <div class="col-7">
                <div class="text-primary p-3">
                  <h5 class="text-primary">
                    {{ this.$t("label.welcome_back") }}
                  </h5>
                  <!-- <p>It will seem like simplified</p> -->
                </div>
              </div>
              <div class="col-5 align-self-end">
                <img
                  src="@/assets/images/profile-img.png"
                  alt
                  class="img-fluid"
                />
              </div>
            </div>
          </div>
          <div class="card-body pt-0">
            <div class="row">
              <div class="col-sm-4">
                <div class="avatar-md profile-user-wid mb-4">
                  <img
                    src="@/assets/images/avatar.png"
                    alt
                    class="img-thumbnail rounded-circle"
                  />
                </div>
                <h5 class="font-size-15">
                  <!-- {{
                    this.form.merchant_Name
                      ? this.form.merchant_Name
                      : "Demo User"
                  }} -->
                  {{ this.merchant_Name }}
                </h5>
                <p class="text-muted mb-0">
                  <!-- {{ this.$store.state.authapi.user.roleName }} -->
                  {{ this.$t("label.merchant") }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <!-- end card -->

        <b-modal
          id="formmodal"
          :title="$t('label.edit_profile')"
          hide-footer
          size="lg"
          centered
          ref="formmodal"
        >
          <div class="card-body">
            <form action="#" @submit.prevent="formSubmit">
              <div class="mb-3">
                <label>{{ $t("label.merchant_name") }}</label>
                <input
                  v-model="form.merchant_Name"
                  type="text"
                  class="form-control"
                  :placeholder="$t('label.type_something')"
                  name="merchant_Name"
                  :class="{
                    'is-invalid': submitted && $v.form.merchant_Name.$error,
                  }"
                />
                <div
                  v-if="submitted && $v.form.merchant_Name.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.form.merchant_Name.required">{{
                    $t("validationerror.value_required")
                  }}</span>
                </div>
              </div>

              <div class="mb-3" v-if="!disabled">
                <label>{{ $t("label.pib") }}</label>
                <input
                  v-model="form.pib"
                  type="text"
                  class="form-control"
                  :placeholder="$t('label.type_something')"
                  name="pib"
                  :class="{
                    'is-invalid': submitted && $v.form.pib.$error,
                  }"
                />
                <div
                  v-if="submitted && $v.form.pib.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.form.pib.required">{{
                    $t("validationerror.value_required")
                  }}</span>
                  <span v-if="!$v.form.pib.numeric">{{
                    $t("validationerror.value_should_be_number")
                  }}</span>
                  <span v-if="$v.form.pib.numeric && !$v.form.pib.minLength">{{
                    $t("validationerror.value_PIB_should_be_9_characters")
                  }}</span>
                  <span v-if="$v.form.pib.numeric && !$v.form.pib.maxLength">{{
                    $t("validationerror.value_PIB_should_be_9_characters")
                  }}</span>
                </div>
              </div>

              <div class="mb-3">
                <label>{{ $t("label.contact_name") }}</label>
                <input
                  v-model="form.contactName"
                  type="text"
                  class="form-control"
                  :placeholder="$t('label.type_something')"
                  name="pib"
                  :class="{
                    'is-invalid': submitted && $v.form.contactName.$error,
                  }"
                />
                <div
                  v-if="submitted && $v.form.contactName.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.form.contactName.required">{{
                    $t("validationerror.value_required")
                  }}</span>
                </div>
              </div>

              <div class="mb-3">
                <label>{{ $t("label.address") }}</label>
                <input
                  v-model="form.merchant_Address"
                  type="text"
                  class="form-control"
                  :placeholder="$t('label.type_something')"
                  name="pib"
                  :class="{
                    'is-invalid': submitted && $v.form.merchant_Address.$error,
                  }"
                />
                <div
                  v-if="submitted && $v.form.merchant_Address.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.form.merchant_Address.required">{{
                    $t("validationerror.value_required")
                  }}</span>
                </div>
              </div>

              <div class="mb-3">
                <label>{{ $t("label.phone_number") }}</label>
                <input
                  v-model="form.merchant_phone"
                  type="text"
                  class="form-control"
                  :placeholder="$t('label.type_something')"
                  name="phone_number"
                  :class="{
                    'is-invalid': submitted && $v.form.merchant_phone.$error,
                  }"
                />
                <div
                  v-if="submitted && $v.form.merchant_phone.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.form.merchant_phone.required">{{
                    $t("validationerror.value_required")
                  }}</span>
                </div>
              </div>

              <div class="mb-3">
                <label>{{ $t("label.email") }}</label>
                <div>
                  <input
                    v-model="form.userMail"
                    :disabled="
                      disabled &&
                      this.$store.state.authapi.user != null &&
                      (this.$store.state.authapi.user.roleName.toLowerCase() ==
                        merchantRole ||
                        this.$store.state.authapi.user.roleName.toLowerCase() ==
                          superadminRole)
                    "
                    type="email"
                    name="email"
                    class="form-control"
                    :class="{
                      'is-invalid': submitted && $v.form.userMail.$error,
                    }"
                    :placeholder="$t('label.enter_valid_email')"
                  />
                  <div
                    v-if="submitted && $v.form.userMail.$error"
                    class="invalid-feedback"
                  >
                    <span v-if="!$v.form.userMail.required">{{
                      $t("validationerror.value_required")
                    }}</span>
                    <span v-if="!$v.form.userMail.email">{{
                      $t("validationerror.valid_email")
                    }}</span>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label>{{ $t("label.password") }}</label>
                <div v-if="!passwordHidden">
                  <input
                    v-model="form.password"
                    type="text"
                    name="password"
                    id="password"
                    class="form-control d-inline"
                    :class="{
                      'is-invalid': submitted && $v.form.password.$error,
                    }"
                    :placeholder="$t('label.enter_password')"
                  />
                  <span
                    class="display-eye fa fa-eye-slash"
                    @click="hidePassword"
                  ></span>
                  <div
                    v-if="submitted && $v.form.password.$error"
                    class="invalid-feedback"
                  >
                    <span v-if="!$v.form.password.required">{{
                      $t("validationerror.value_required")
                    }}</span>
                    <span v-if="!$v.form.password.minLength">{{
                      $t("validationerror.password_at_least_6_characters")
                    }}</span>
                  </div>
                </div>

                <div v-if="passwordHidden">
                  <input
                    v-model="form.password"
                    type="password"
                    name="password"
                    id="password"
                    class="form-control d-inline"
                    :class="{
                      'is-invalid': submitted && $v.form.password.$error,
                    }"
                    :placeholder="$t('label.enter_password')"
                  />
                  <span
                    class="display-eye fa fa-eye"
                    @click="showPassword"
                  ></span>
                  <div
                    v-if="submitted && $v.form.password.$error"
                    class="invalid-feedback"
                  >
                    <span v-if="!$v.form.password.required">{{
                      $t("validationerror.value_required")
                    }}</span>
                    <span v-if="!$v.form.password.minLength">{{
                      $t("validationerror.password_at_least_6_characters")
                    }}</span>
                  </div>
                </div>
              </div>

              <div class="mb-3 mb-0">
                <div>
                  <b-button type="submit" variant="primary">{{
                    $t("action.submit")
                  }}</b-button>

                  <!-- <button type="submit" class="btn btn-primary">Submit</button>
                  <button type="reset" class="btn btn-secondary ms-1">
                    Cancel
                  </button> -->

                  <b-button
                    right
                    variant="secondary"
                    @click="cancel"
                    class="ms-1"
                    >{{ $t("action.cancel") }}</b-button
                  >
                </div>
              </div>
            </form>
          </div>
        </b-modal>

        <div class="card">
          <div class="card-body">
            <h4 class="card-title mb-4">
              {{ this.$t("label.personal_info") }}
              <span class="text-right float-end">
                <a
                  v-tooltip.top="$t('label.edit')"
                  role="button"
                  v-b-modal.formmodal
                >
                  <i class="far fa-edit fa-xs"></i>
                </a>
              </span>
            </h4>

            <!-- <p class="text-muted mb-4">
              Hi I'm Cynthia Price,has been the industry's standard dummy text
              To an English person, it will seem like simplified English, as a
              skeptical Cambridge.
            </p> -->
            <div class="table-responsive">
              <table class="table table-nowrap mb-0">
                <tbody>
                  <tr>
                    <th scope="row">{{ $t("label.merchant_name") }} :</th>
                    <td>
                      <!-- {{
                        this.form.merchant_Name ? this.form.merchant_Name : ""
                      }} -->
                      {{ this.merchant_Name }}
                    </td>
                  </tr>

                  <tr>
                    <th scope="row">{{ $t("label.address") }} :</th>
                    <!-- <td>{{ this.form.merchant_Address }}</td> -->
                    <td>{{ this.merchant_Address }}</td>
                  </tr>
                  <tr>
                    <th scope="row">{{ $t("label.email") }} :</th>
                    <td>{{ this.$store.state.merchant.merchants.userMail }}</td>
                  </tr>
                  <tr>
                    <th scope="row">{{ $t("label.contact_name") }} :</th>
                    <td>
                      <!-- {{ this.form.contactName ? this.form.contactName : "" }} -->
                      {{ this.contactName ? this.contactName : "" }}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">{{ $t("label.phone_number") }} :</th>
                    <td>
                      {{ this.merchant_phone ? this.merchant_phone : "" }}
                      <!-- {{
                        this.form.merchant_phone ? this.form.merchant_phone : ""
                      }} -->
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- end card -->
      </div>

      <div class="col-xl-8">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title mb-4">
              {{
                this.$store.state.authapi.user != null &&
                this.$store.state.authapi.user.roleName.toLowerCase() ===
                  "merchant"
                  ? this.$t("label.pos_list")
                  : this.$t("label.pos_list")
              }}
            </h4>

            <div class="table-reponsive">
              <b-table
                :items="posGridData"
                :fields="fields"
                responsive="sm"
                :per-page="0"
                :current-page="currentPage"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :busy="isBusy"
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

                    <!-- <img
                      width="400"
                      src="@/assets/images/No data-rafiki.png"
                      alt
                      class="img-thumbnail"
                    /> -->
                  </td>
                </template>
                <template #cell(lastProductListUpdated)="row">
                  <!-- {{ row.value }} -->
                  <span
                    class="badge rounded-pill badge-soft-success font-size-11"
                    :class="{
                      'badge-soft-danger': row.value === '-',
                    }"
                    v-if="row.value === '-'"
                    >{{
                      row.value !== "-"
                        ? $t("label.active")
                        : $t("label.neveractive")
                    }}</span
                  >
                  <span
                    class="badge rounded-pill badge-soft-success font-size-11"
                    v-else
                    v-tooltip.top="
                      formatDateTooltip(row.item.lastProductListUpdated)
                    "
                    >{{ formatDateDisplay(row.item.lastProductListUpdated) }}
                  </span>
                </template>
                <template
                  #cell(is_Active)="row"
                  v-if="
                    this.$store.state.authapi.user != null &&
                    this.$store.state.authapi.user.roleName.toLowerCase() ===
                      superadminRole
                  "
                >
                  <span
                    class="badge rounded-pill badge-soft-success font-size-11"
                    :class="{
                      'badge-soft-danger': row.item.is_Active === false,
                    }"
                    >{{
                      row.item.is_Active === true
                        ? $t("label.active")
                        : $t("label.inactive")
                    }}</span
                  >
                </template>
                <template
                  #cell(is_Master)="row"
                  v-if="
                    this.$store.state.authapi.user != null &&
                    this.$store.state.authapi.user.roleName.toLowerCase() ===
                      superadminRole
                  "
                >
                  <span
                    class="badge rounded-pill badge-soft-success font-size-11"
                    :class="{
                      'badge-soft-danger': row.item.is_Master === false,
                    }"
                    >{{
                      row.item.is_Master === true
                        ? $t("label.yes")
                        : $t("label.no")
                    }}</span
                  >
                </template>
              </b-table>
            </div>
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
    </div>
    <!-- end row -->
  </Layout>
</template>
