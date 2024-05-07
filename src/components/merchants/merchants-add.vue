<script>
import Layout from "@/router/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";

import {
  required,
  email,
  minLength,
  maxLength,
  numeric,
} from "vuelidate/lib/validators";

import {
  layoutMethods,
  layoutComputed,
  merchantMethods,
} from "@/state/helpers";

/**
 * Merchant add/edit component
 */
export default {
  page: {
    title: "Create/Edit Merchant",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: { Layout, PageHeader },

  beforeMount() {
    this.edit = false;
    this.changeLoaderValue({
      loader: false,
    });
  },
  mounted() {
    var merchant_id = this.$route.params.id ? this.$route.params.id : "";
    // // console.log("merchant_id", merchant_id);
    if (merchant_id != "") {
      this.edit = true;
      // // console.log(
      //   "this.$store.state.merchant.merchants",
      //   this.$store.state.merchant.merchants
      // );
      this.form = {
        ...this.$store.state.merchant.merchants,
      };
      // this.disabled = true;
      // // console.log("this.form", this.form);
      // delete this.form.password;
      delete this.form.updated_Date;
      delete this.form.created_Date;
    }

    // if (product_id != productItemsUUID) {
    //   this.$router.push("/error");
    // }

    // EventBus.$on("clicked", clickHandler);
  },

  data() {
    return {
      title: !this.$route.params.id
        ? `${this.$t("label.merchant_add")}`
        : `${this.$t("label.merchant_edit")}`,
      items: [
        {
          text: `${this.$t("label.merchants")}`,
          href: "/",
        },
        {
          text: `${this.$t("label.merchant_list")}`,
          active: false,
          href: "/merchants/list",
        },
        {
          text: !this.$route.params.id
            ? `${this.$t("label.merchant_add")}`
            : `${this.$t("label.merchant_edit")}`,
          active: true,
        },
      ],

      form: {
        merchant_Id: "",
        contactName: "",
        merchant_Name: "",
        merchant_Address: "",
        city: "",
        pib: "",
        merchant_phone: "",
        userMail: "",
        password: "",
        created_By: "",
      },

      submitted: false,
      edit: false,
      disabled: false,
      passwordHidden: {
        default: false,
        type: Boolean,
      },
    };
  },
  validations() {
    if (!this.$route.params.id) {
      return {
        form: {
          contactName: {required},
          merchant_Name: {required},
          merchant_Address: {required},
          city: {required},
          merchant_phone: {required},
          pib: {
            required,
            numeric,
            minLength: minLength(9),
            maxLength: maxLength(9),
          },
          userMail: {required, email},
          password: {
            required, minLength: minLength(6)
          }
        }
      };
    }
    else {
      return {
        form: {
          contactName: {required},
          merchant_Name: {required},
          merchant_Address: {required},
          city: {required},
          merchant_phone: {required},
          pib: {
           required,
           numeric,
           minLength: minLength(9),
           maxLength: maxLength(9),
          },
          userMail: {required, email},
        }
      }
    }
  },
  computed: {
    ...layoutComputed,
  },

  methods: {
    ...layoutMethods,
    ...merchantMethods,
    // eslint-disable-next-line no-unused-vars
    initDetail(param) {
      // // console.log("In initDetail()");
      // // console.log(param);
    },
    hidePassword() {
      this.passwordHidden = true;
    },
    showPassword() {
      this.passwordHidden = false;
    },
    // eslint-disable-next-line no-unused-vars
    async formSubmit(e) {
      this.submitted = true;
      // stop here if form is invalid
      this.$v.$touch();
      if (this.$v.$invalid) {
        // console.log("error");
      } else {
        this.form = {
          ...this.form,
          created_By: this.$store.state.authapi.user.user_Id,
        };
        let payload = {
          requestParam: this.form,
          redirect: true,
          message: !this.edit
            ? this.$t("alerts.merchant_created")
            : this.$t("alerts.merchant_updated"),
        };
        /**
         * For adding/updating records
         */
        this.addMerchantData(payload);
      }
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
      <!-- start col-->
      <div class="col-lg-12">
        <!-- start card -->
        <div class="card">
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

              <div class="mb-3">
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
                <label>{{ $t("label.city") }}</label>
                <input
                  v-model="form.city"
                  type="text"
                  class="form-control"
                  :placeholder="$t('label.type_something')"
                  name="pib"
                  :class="{
                    'is-invalid': submitted && $v.form.city.$error,
                  }"
                />
                <div
                  v-if="submitted && $v.form.city.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.form.city.required">{{
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

              <div class="mb-3" v-if="!disabled">
                <label>{{ $t("label.email") }}</label>
                <div>
                  <input
                    v-model="form.userMail"
                    :disabled="disabled"
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

              <div class="mb-3" v-if="!disabled">
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

                  <router-link
                    custom
                    :to="{ name: 'merchant-list' }"
                    class="icon-row-item"
                  >
                    <b-button right variant="secondary" class="ms-1">{{
                      $t("action.cancel")
                    }}</b-button>
                  </router-link>
                </div>
              </div>
            </form>
          </div>
        </div>
        <!-- end card -->
      </div>
      <!-- end col-->
    </div>
    <!-- end row -->
  </Layout>
</template>
