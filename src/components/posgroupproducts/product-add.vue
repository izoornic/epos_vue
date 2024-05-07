<script>
import Layout from "@/router/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";

import { required, decimal } from "vuelidate/lib/validators";
import Multiselect from "vue-multiselect";
import toastMixin from "@/mixins/sweetAlertMixin";

import {
  layoutMethods,
  layoutComputed,
  ProductMethods,
  POSMethods,
} from "@/state/helpers";

import axios from "@/axios";
/**
 * Product Add/Edit component
 */
export default {
  page: {
    title: "Create/Edit Product",
    meta: [{ name: "description", content: appConfig.description }],
  },
  // mixins: [toastMixin],
  components: { Layout, PageHeader, Multiselect },

  beforeMount() {
    this.edit = false;
    this.changeLoaderValue({
      loader: false,
    });
  },
  async mounted() {
    /**
     * For passing bearer token into the API
     */
    axios.defaults.headers.common = {
      Authorization: `Bearer ${this.$store.state.authapi.user.token}`,
    };

    // await this.getPosByMerchant();

    // this.posOptions = this.$store.state.pos.pos.map((x) => {
    //   return {
    //     name: x.storeName + " " + "(" + x.pos_Address + ")",
    //     value: x.pos_Id,
    //   };
    // });

    this.options = [
      {
        poslist: "POS LIST",
        libs: this.posOptions,
      },
    ];

    // // console.log(" this.posOptions", this.posOptions);

    var product_id = this.$route.params.id ? this.$route.params.id : "";
    // // console.log("product_id", product_id);
    this.form.pos_Id = this.posOptions;

    var posGroup_Id = this.$route.params.posGroup_Id
      ? this.$route.params.posGroup_Id
      : "";
    // // console.log("posGroup_Id", posGroup_Id);
    this.form.posGroup_Id = posGroup_Id;

    if (product_id != "") {
      this.edit = true;
      // // console.log(
      //   "this.$store.state.product.product",
      //   this.$store.state.product.product
      // );

      this.form = {
        ...this.$store.state.product.product,
      };

      this.disabled = this.form.ean == null ? true : false;
      // this.selectedoption = this.form.ean == null ? "service" : "product";

      // this.variant_fields = this.variant_fields.map((x) => {
      //   return {
      //     ...x,
      //     ean: this.selectedoption == "service" ? null : this.form.ean,
      //   };
      // });

      // alert(this.form.unit_Price);
      // this.form.unit_Price = new Intl.NumberFormat("en-us", {
      //   style: "currency",
      //   currency: "USD",
      //   currencyDisplay: "code",
      // })
      //   .format(this.form.unit_Price)
      //   .replace("USD", "")
      //   .replace(",", "")
      //   .trim();

      // this.form.unit_Price = this.form.unit_Price.replace(/,/g, "");
      // this.disabled = true;
      // alert(this.form.unit_Price);

      // // console.log("this.form", this.form);

      // this.posOptions.forEach((element, index) => {
      //   if (element.value == this.$store.state.product.product.pos_Id) {
      //     // console.log("element", element);
      //     // console.log(
      //       " this.$store.state.product.product.pos_Id",
      //       this.$store.state.product.product.pos_Id
      //     );
      //     this.form.is_Active = this.posOptions[index];
      //   }
      // });
      // let temp =
      //   "03C3A2C1-59DF-4837-BB35-8397AD1B5077,C1828FEB-B77E-4E08-8D87-C1C4741DFD52";
      // alert(this.$store.state.product.product.pos_Id);
      let temp = this.$store.state.product.product.pos_Id;
      var posArr =
        this.$store.state.product.product.pos_Id != null ? temp.split(",") : [];
      // // console.log("nameArr", posArr);
      let posdropdownoptionsselected = [];

      posArr.map((y) => {
        this.$store.state.pos.pos
          .filter((x) => x.pos_Id === y)
          .map((obj) => {
            obj = {
              name: obj.storeName + " " + "(" + obj.pos_Address + ")",
              value: obj.pos_Id,
            };
            posdropdownoptionsselected.push(obj);
          });
      });

      // // console.log("posdropdownoptions", posdropdownoptionsselected);
      this.form.pos_Id = posdropdownoptionsselected;

      this.variant_fields = JSON.parse(
        this.$store.state.product.product.variants
      );

      // delete this.form.password;
      delete this.form.pos_Id;
      delete this.form.updated_Date;
      delete this.form.created_Date;

      let productItemsUUID = this.$store.state.product.product.product_Id;

      if (product_id != productItemsUUID) {
        this.$router.push("/error");
      }
    }
  },

  data() {
    return {
      title: !this.$route.params.id
        ? `${this.$t("label.product_add")}`
        : `${this.$t("label.product_edit")}`,
      items: [
        {
          text: `${this.$t("label.products")}`,
          href: "/",
        },
        {
          text: `${this.$t("label.product_list")}`,
          active: false,
          href: "/pos/products/list/" + this.$route.params.posGroup_Id,
        },
        {
          text: !this.$route.params.id
            ? `${this.$t("label.product_add")}`
            : `${this.$t("label.product_edit")}`,
          active: true,
        },
      ],

      form: {
        product_Id: "",
        // pos_Id: "",
        product_Code: "",
        product_Name: "",
        unit_Of_Measure: "",
        unit_Price: "",
        unit_Type: "",
        ean: "",
        tax_Code: "",
        variants: "",
        upgrades: "",
        path: "",
        revision_Id: "1",
        created_By: "",
        posGroup_Id: "",
        message: "",
      },

      submitted: false,
      edit: false,
      disabledposdropdown: true,

      uomOptions: [
        {
          value: "",
          text: this.$t("label.please_select_uom"),
          disabled: true,
        },
        "Komad",
        "Gram (g)",
        "Metar (m)",
        "Metar Kvadratni (m^2)",
        "Litar (l)",
        "Kilogram (Kg)",
        "Metar Kubni (m^3)",
        "Sat (h)",
      ],
      posOptions: ["Yes", "No"],
      taxCodeOptions: [
        {
          value: "",
          text: this.$t("label.please_select_tax_code"),
          disabled: true,
        },
        {
          value: "A",
          text: "А - Nije u PDV - 0%",
        },
        {
          value: "Г",
          text: "Г - 0%",
        },
        {
          value: "Ђ",
          text: "Ђ - 20%",
        },
        {
          value: "Е",
          text: "Е - 10%",
        },
      ],
      options: [],
      value1: null,
      variant_fields: [],

      selectedoption: "product",
      eandisabled: false,
    };
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    selectedoption: function (val, oldval) {
      // // console.log(val, oldval);
      if (val == "product") {
        this.eandisabled = false;
        this.form.ean = this.edit ? this.$store.state.product.product.ean : "";
        // this.form.ean = "";
      } else if (val == "service") {
        this.eandisabled = true;
        this.form.ean = null;

        this.variant_fields = this.variant_fields.map((x) => {
          return {
            ...x,
            ean: val == "service" ? null : this.form.ean,
          };
        });
      }
    },
  },

  validations: {
    form: {
      product_Code: { required },
      product_Name: { required },
      unit_Of_Measure: { required },
      unit_Price: { required, decimal },
      unit_Type: { required },
      // price: { required, decimal, minValue: minValue(1) },
      // ean: {
      //   // eslint-disable-next-line no-undef
      //   required: requiredIf(function (abc) {
      //     return abc.ean != null;
      //   }),
      // },
      tax_Code: { required },
      // upgrades: { required },
      // pos_Id: { required },
      // path: { required },
    },
  },
  computed: {
    ...layoutComputed,
  },

  methods: {
    ...layoutMethods,
    ...ProductMethods,
    ...POSMethods,

    /**
     * Push the row in form
     */
    AddformData() {
      this.variant_fields.push({ name: "", ean: "" });
    },
    /**
     * Delete the row
     */
    async deleteRow(index) {
      let result = await toastMixin.methods.displayConfirmationAlert(
        this.$t("alerts.delete_confirmation_title"),
        this.$t("alerts.delete_confirmation_text"),
        "warning",
        this.$t("alerts.delete_confirmation_accept_button_text"),
        this.$t("alerts.delete_confirmation_cancel_button_text")
      );

      if (result.value) {
        this.variant_fields.splice(index, 1);
      }
    },

    // eslint-disable-next-line no-unused-vars
    async formSubmit(e) {
      e.preventDefault();

      delete this.form.pos_Id;
      this.form.variants = this.variant_fields;

      this.form.variants = this.variant_fields.map((x) => {
        return {
          ...x,
          ean: x.ean != "" && x.ean != null ? x.ean : this.form.ean,
        };
      });

      // // console.log("this.form", this.form);
      // // console.log("this.variant_fields", this.variant_fields);
      // return false;
      // eslint-disable-next-line no-unreachable
      this.submitted = true;
      // stop here if form is invalid
      this.$v.$touch();
      if (this.$v.$invalid) {
        // console.log("error");
      } else {
        this.form = {
          ...this.form,
          created_By: this.$store.state.authapi.user.user_Id,
          merchant_Id: this.$store.state.authapi.user.merchant_Id,
          unit_Price: parseFloat(this.form.unit_Price),
          variants: JSON.stringify(this.form.variants),
        };

        // console.log("this.form", this.form);
        let payload = {
          requestParam: this.form,
          posgroup: true,
          message: !this.edit
            ? this.$t("alerts.record_create_success")
            : this.$t("alerts.record_update_success"),
        };

        this.addProductData(payload);
      }
    },
  },
};
</script>
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
              <!-- <div class="mb-3">
                <div>
                  <b-form-group label="" v-slot="{ ariaDescribedby }">
                    <b-form-radio
                      v-model="selectedoption"
                      :aria-describedby="ariaDescribedby"
                      name="some-radios"
                      value="product"
                      >&nbsp;&nbsp;{{ $t("label.product") }}</b-form-radio
                    >
                    <b-form-radio
                      v-model="selectedoption"
                      :aria-describedby="ariaDescribedby"
                      name="some-radios"
                      value="service"
                      >&nbsp;&nbsp;{{ $t("label.service") }}</b-form-radio
                    >
                  </b-form-group>
                </div>
              </div> -->

              <!-- <div class="mt-3">
                selectedoption: <strong>{{ selectedoption }}</strong>
              </div> -->
              <div class="mb-3">
                <div>
                  <div
                    v-for="(field, index) in variant_fields"
                    :key="field.id"
                    class="row"
                  >
                    <div class="mb-3 col-lg-4">
                      <label for="name">{{ $t("label.variant_name") }}</label>
                      <input
                        id="name"
                        v-model="field.name"
                        type="text"
                        name="untyped-input"
                        class="form-control"
                      />
                    </div>

                    <div class="mb-3 col-lg-4">
                      <label for="subject">{{ $t("label.ean") }}</label>
                      <input
                        id="subject"
                        v-model="field.ean"
                        type="text"
                        class="form-control"
                        :disabled="selectedoption == 'service'"
                      />
                    </div>

                    <div class="mt-2 col-lg-4 align-self-center">
                      <div class="d-grid">
                        <input
                          type="button"
                          class="btn btn-primary btn-block"
                          :value="$t('action.delete')"
                          @click="deleteRow(index)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <input
                  type="button"
                  class="btn btn-success mt-3 mt-lg-0"
                  :value="$t('action.add_variants')"
                  @click="AddformData"
                />
              </div>

              <div class="mb-3" v-if="!disabledposdropdown">
                <label>{{ $t("label.pos_id") }}</label>
                <multiselect
                  v-model="form.pos_Id"
                  :state="$v.form.pos_Id.$dirty ? !$v.form.pos_Id.$error : null"
                  :options="options"
                  :multiple="true"
                  group-values="libs"
                  group-label="poslist"
                  :group-select="true"
                  placeholder="Type to search"
                  track-by="name"
                  label="name"
                  selectGroupLabel="Press enter to select all POS"
                  deselectGroupLabel="Press enter to deselect all POS"
                  :hideSelected="true"
                  :class="{
                    'is-invalid': submitted && $v.form.pos_Id.$error,
                  }"
                  ><span slot="noResult"
                    >Oops! No elements found. Consider changing the search
                    query.</span
                  ></multiselect
                >
                <div
                  v-if="submitted && $v.form.pos_Id.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.form.pos_Id.required">{{
                    $t("validationerror.value_required")
                  }}</span>
                </div>
              </div>

              <div class="mb-3">
                <label>{{ $t("label.product_code") }}</label>
                <input
                  v-model="form.product_Code"
                  type="text"
                  class="form-control"
                  :placeholder="$t('label.type_something')"
                  name="product_Code"
                  :class="{
                    'is-invalid': submitted && $v.form.product_Code.$error,
                  }"
                />
                <div
                  v-if="submitted && $v.form.product_Code.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.form.product_Code.required">{{
                    $t("validationerror.value_required")
                  }}</span>
                </div>
              </div>

              <div class="mb-3">
                <label>{{ $t("label.product_name") }}</label>
                <input
                  v-model="form.product_Name"
                  type="text"
                  class="form-control"
                  :placeholder="$t('label.type_something')"
                  name="product_Name"
                  :class="{
                    'is-invalid': submitted && $v.form.product_Name.$error,
                  }"
                />
                <div
                  v-if="submitted && $v.form.product_Name.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.form.product_Name.required">{{
                    $t("validationerror.value_required")
                  }}</span>
                </div>
              </div>

              <div class="mb-3">
                <b-form-group
                  class="mb-3 form-label"
                  id="input-group-1"
                  :label="$t('label.unit_of_measure')"
                  label-for="formrow-inputState"
                >
                  <!-- <b-form-select
                    class="form-select"
                    v-model.trim="form.unit_Of_Measure"
                    name="unit_Of_Measure"
                    :options="uomOptions"
                    :state="
                      $v.form.unit_Of_Measure.$dirty
                        ? !$v.form.unit_Of_Measure.$error
                        : null
                    "
                  ></b-form-select> -->

                  <input
                    v-model="form.unit_Of_Measure"
                    type="text"
                    class="form-control"
                    :placeholder="$t('label.type_something')"
                    name="unit_Of_Measure"
                    :class="{
                      'is-invalid': submitted && $v.form.unit_Of_Measure.$error,
                    }"
                  />
                  <div
                    v-if="submitted && $v.form.unit_Of_Measure.$error"
                    class="invalid-feedback"
                  >
                    <span v-if="!$v.form.unit_Of_Measure.required">{{
                      $t("validationerror.value_required")
                    }}</span>
                  </div>
                </b-form-group>
              </div>

              <div class="mb-3">
                <label>{{ $t("label.unit_type") }}</label>
                <input
                  v-model="form.unit_Type"
                  type="text"
                  class="form-control"
                  :placeholder="$t('label.type_something')"
                  name="unit_Type"
                  :class="{
                    'is-invalid': submitted && $v.form.unit_Type.$error,
                  }"
                />
                <div
                  v-if="submitted && $v.form.unit_Type.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.form.unit_Type.required">{{
                    $t("validationerror.value_required")
                  }}</span>
                </div>
              </div>

              <div class="mb-3">
                <label>{{ $t("label.unit_price") }}</label>
                <input
                  v-model="form.unit_Price"
                  type="text"
                  class="form-control"
                  :placeholder="$t('label.type_something')"
                  name="unit_Price"
                  :class="{
                    'is-invalid': submitted && $v.form.unit_Price.$error,
                  }"
                />
                <!-- <pre>
                {{ $v.form.unit_Price }}
                </pre> -->
                <div
                  v-if="submitted && $v.form.unit_Price.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.form.unit_Price.required">{{
                    $t("validationerror.value_required")
                  }}</span>
                  <span v-if="!$v.form.unit_Price.decimal">{{
                    $t("validationerror.enter_valid_price")
                  }}</span>
                </div>
              </div>

              <div class="mb-3">
                <label>{{ $t("label.ean") }}</label>
                <input
                  v-model="form.ean"
                  :disabled="eandisabled"
                  type="text"
                  class="form-control"
                  :placeholder="$t('label.type_something')"
                  name="ean"
                />
                <!-- <div
                  v-if="submitted && $v.form.ean.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.form.ean.required">{{
                    $t("validationerror.value_required")
                  }}</span>
                </div> -->
              </div>

              <div class="mb-3">
                <!-- <label>{{ $t("label.tax_code") }}</label> -->
                <b-form-group
                  class="mb-3 form-label"
                  id="input-group-1"
                  :label="$t('label.tax_code')"
                  label-for="formrow-inputState"
                >
                  <b-form-select
                    class="form-select"
                    :placeholder="$t('label.type_something')"
                    v-model.trim="form.tax_Code"
                    name="tax_Code"
                    :options="taxCodeOptions"
                    :state="
                      $v.form.tax_Code.$dirty ? !$v.form.tax_Code.$error : null
                    "
                  ></b-form-select>
                  <div
                    v-if="submitted && $v.form.tax_Code.$error"
                    class="invalid-feedback"
                  >
                    <span v-if="!$v.form.tax_Code.required">{{
                      $t("validationerror.value_required")
                    }}</span>
                  </div>
                </b-form-group>
              </div>

              <!-- <div class="mb-3">
                <label>{{ $t("label.variants") }}</label>
                <input
                  v-model="form.variants"
                  type="text"
                  class="form-control"
                  placeholder="Type something"
                  name="variants"
                  :class="{
                    'is-invalid': submitted && $v.form.variants.$error,
                  }"
                />
                <div
                  v-if="submitted && $v.form.variants.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.form.variants.required"
                    >This value is required.</span
                  >
                </div>
              </div> -->

              <div class="mb-3">
                <label>{{ $t("label.upgrades") }}</label>
                <input
                  v-model="form.upgrades"
                  type="text"
                  class="form-control"
                  :placeholder="$t('label.type_something')"
                  name="upgrades"
                />
                <!-- <div
                  v-if="submitted && $v.form.upgrades.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.form.upgrades.required"
                    >This value is required.</span
                  >
                </div> -->
              </div>

              <div class="mb-3">
                <label>{{ $t("label.path") }}</label>
                <input
                  v-model="form.path"
                  type="text"
                  class="form-control"
                  :placeholder="$t('label.type_something')"
                  name="path"
                />
                <!-- <div
                  v-if="submitted && $v.form.path.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.form.path.required"
                    >This value is required.</span
                  >
                </div> -->
              </div>

              <div class="mb-3">
                <label>{{ $t("label.message") }}</label>
                <input
                  v-model="form.message"
                  type="text"
                  class="form-control"
                  :placeholder="$t('label.type_something')"
                  name="message"
                />
                <!-- <div
                  v-if="submitted && $v.form.path.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.form.path.required"
                    >This value is required.</span
                  >
                </div> -->
              </div>

              <!-- <div class="mb-3">
                <b-form-group
                  class="mb-3 form-label"
                  id="input-group-1"
                  :label="$t('label.pos_id')"
                  label-for="formrow-inputState"
                >
                  <b-form-select
                    class="form-select"
                    v-model="form.pos_Id"
                    id="formrow-inputState"
                    :options="posOptions"
                    :state="
                      $v.form.pos_Id.$dirty ? !$v.form.pos_Id.$error : null
                    "
                  ></b-form-select>
                  <div
                    v-if="submitted && $v.form.pos_Id.$error"
                    class="invalid-feedback"
                  >
                    <span v-if="!$v.form.pos_Id.required"
                      >This value is required.</span
                    >
                  </div>
                </b-form-group>
              </div> -->

              <div class="mb-3 mb-0">
                <div>
                  <b-button type="submit" variant="primary">{{
                    $t("action.submit")
                  }}</b-button>

                  <router-link
                    :to="{
                      name: 'pos-product-list',
                      params: {
                        posGroup_Id: this.$route.params.posGroup_Id,
                      },
                    }"
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
