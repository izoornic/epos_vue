<script>
import Layout from "@/router/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";

import { ProductMethods } from "@/state/helpers";
import axios from "@/axios";

import { layoutMethods, layoutComputed, apiUrl } from "@/state/helpers";
import toastMixin from "@/mixins/sweetAlertMixin";

import PagingFilter from "@/components/filter/paging-filter";
import pagingFilterMixin from "@/mixins/pagingFilterMixin";
import dateFormatterMixin from "@/mixins/dateFormatterMixin";
import { EventBus } from "@/event-bus";

import moment from "moment";
import vue2Dropzone from "vue2-dropzone";
import { required } from "vuelidate/lib/validators";

// full import
// import * as XLSX from "xlsx";

/**
 * Products-list component
 */
export default {
  page: {
    // title: `${this.$t("label.product_list")}`,
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    vueDropzone: vue2Dropzone,
    Layout,
    PageHeader,
    PagingFilter,
  },
  mixins: [toastMixin, pagingFilterMixin, dateFormatterMixin],
  data() {
    return {
      productGridData: [],
      title: `${this.$t("label.product_list")}`,
      items: [
        {
          text: `${this.$t("label.products")}`,
          href: "/",
        },
        {
          text: `${this.$t("label.product_list")}`,
          active: true,
        },
      ],

      sortBy: "created_Date",
      sortDesc: true,
      sortDirection: "desc",
      fields: [
        // {
        //   key: "posName",
        //   label: this.$t("label.pos_id"),
        //   sortable: true,
        // },
        {
          key: "product_Code",
          label: this.$t("label.product_code"),
          sortable: true,
        },
        {
          key: "product_Name",
          label: this.$t("label.product_name"),
          sortable: true,
        },
        {
          key: "unit_Of_Measure",
          label: this.$t("label.unit_of_measure"),
          sortable: true,
        },
        {
          key: "price",
          label: this.$t("label.unit_price"),
          sortable: true,
          // eslint-disable-next-line no-unused-vars
          formatter: (value, key, item) => {
            return new Intl.NumberFormat("en-us", {
              style: "currency",
              currency: "USD",
            })
              .format(value)
              .replace("$", "")
              .trim();
          },
        },
        // {
        //   key: "unit_Type",
        //   label: this.$t("label.unit_type"),
        //   sortable: true,
        // },
        {
          key: "tax_Code",
          label: this.$t("label.tax_code"),
          sortable: true,
        },
        {
          key: "ean",
          label: this.$t("label.ean"),
          sortable: true,
          // eslint-disable-next-line no-unused-vars
          formatter: (value, key, item) => {
            return value != null ? value : "-";
          },
        },
        {
          key: "message",
          label: this.$t("label.message"),
          sortable: true,
        },
        {
          key: "created_Date",
          label: this.$t("label.created_date"),
          sortable: true,
          // eslint-disable-next-line no-unused-vars
          formatter: (value, key, item) => {
            return moment.utc(value).local().format("DD-MMM-YYYY HH:mm:ss");
          },
        },
        {
          key: "updated_Date",
          label: this.$t("label.updated_date"),
          sortable: true,
          // eslint-disable-next-line no-unused-vars
          formatter: (value, key, item) => {
            return value == "0001-01-01T00:00:00"
              ? "-"
              : moment.utc(value).local().format("DD-MMM-YYYY HH:mm:ss");
          },
        },
        // { key: "actions", label: this.$t("label.action"), sortable: false },
      ],

      isBusy: false,
      dropzoneOptions: {
        autoProcessQueue: false,
        // createImageThumbnails: false,
        // disablePreviews: true,
        // previewTemplate:
        //   '<div class="uploaded-image"><span data-dz-name></span> <strong class="dz-size" data-dz-size></strong><div class="dz-error-message" data-dz-errormessage></div><div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div></div>',
        // previewsContainer: ".dropzone-previews",
        url: "https://httpbin.org/post",
        // thumbnailWidth: 150,
        maxFilesize: 50,
        queueLimit: 1,
        headers: { "My-Awesome-Header": "header value" },
        addRemoveLinks: true,
        uploadMultiple: false,
        maxFiles: 1,
        // acceptedFiles:
        //   "text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        acceptedFiles:
          ".csv, text/csv, application/vnd.ms-excel, application/csv, text/x-csv, application/x-csv, text/comma-separated-values, text/x-comma-separated-values,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        init: function () {
          let _this = this;

          // eslint-disable-next-line no-unused-vars
          this.on("addedfile", function (file) {
            if (this.files.length > 1) {
              this.removeFile(this.files[0]);
            }
            _this.uploadedFile = true;
          });
        },
      },

      form: {
        product_Code: "",
        product_Name: "",
        unit_Price: "",
        unit_Of_Measure: "",
        ean: "",
        tax_Code: "",
        variants: "",
        upgrades: "",
        unit_Type: "",
        path: "",
      },

      isHeaderAvailable: "yes",
      csv: [],
      commonOptionsAll: [],
      commonOptionsFiltered: [],
      commonOptionsName: [],

      uploadedFileError: true,
      submitted: false,
      forward: false,
    };
  },
  validations: {
    form: {
      product_Code: { required },
      product_Name: { required },
      unit_Of_Measure: { required },
      unit_Price: { required },
      unit_Type: { required },
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
    // ...todoComputed,
    ...layoutComputed,
    /**
     * Total no. of records
     */
    rows() {
      return this.totalRows;
    },
  },

  async mounted() {
    /**
     * For paging & searching management
     */
    EventBus.$on("pagingfilterVal", (data) => {
      this.perPage = data;
    });

    EventBus.$on("searchfilterVal", (data) => {
      this.search = data;
    });

    /**
     * For passing bearer token into the API
     */
    axios.defaults.headers.common = {
      Authorization: `Bearer ${this.$store.state.authapi.user.token}`,
    };
    /**
     * For fetching records
     */
    await this.fetchData();

    // let newproductarray = this.productGridData.map((y) => {
    //   let dt = y.posName.split(",");

    //   return {
    //     ...y,
    //     posName: dt,
    //   };
    // });

    // this.productGridData = newproductarray;
    // // console.log(" newproductarray ", newproductarray);
  },
  methods: {
    ...ProductMethods,
    ...layoutMethods,

    cancel() {
      // alert("dd");
      this.$refs["formmodal"].hide();
      this.uploadedFileError = true;
      this.forward = false;
      this.submitted = false;
      this.csv = [];
      Object.keys(this.form).forEach((key) => (this.form[key] = ""));
    },
    forwardStep() {
      // alert("dd");
      this.forward = true;
      // // console.log("this.commonOptionsName", this.commonOptionsName);
      // e.preventDefault();
    },
    async fileAdded(file) {
      // // console.log("keys", Object.keys(this.form).length);
      this.uploadedFileError = false;
      // // console.log("file in func", file);
      // // console.log("this.uploadedFileError", this.uploadedFileError);
      var ext = file.name.substr(file.name.lastIndexOf(".") + 1);
      // var IsImage = false;
      // console.log("ext", ext);
      if (ext === "xlsx" || ext === "xls") {
        const XLSX = await import("xlsx");
        // eslint-disable-next-line no-unused-vars
        let prm = new Promise((resolve, reject) => {
          var reader = new FileReader();
          let header = [];
          let headerfinal = [];
          reader.onload = function (e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, { type: "binary" });
            let sheetName = workbook.SheetNames[0];
            let worksheet = workbook.Sheets[sheetName];

            var range = XLSX.utils.decode_range(worksheet["!ref"]);
            var C,
              R = range.s.r; /* start in the first row */
            /* walk every column in the range */
            for (R = range.s.r; R <= range.e.r; ++R) {
              header = [];
              for (C = range.s.c; C <= range.e.c; ++C) {
                var cell =
                  worksheet[
                    XLSX.utils.encode_cell({ c: C, r: R })
                  ]; /* find the cell in the first row */

                // var hdr = "UNKNOWN " + C; // <-- replace with your desired default
                var hdr = ""; // <-- replace with your desired default
                // if (cell && cell.t) hdr = XLSX.utils.format_cell(cell);
                if (cell && cell.t) hdr = cell.v;
                // // console.log("Row : " + R);
                // // console.log("Column : " + C);
                header.push(hdr);
              }
              // // console.log("hddd", header);
              headerfinal.push(header);
            }
            // // console.log("header final andar che", headerfinal);
            resolve(headerfinal);
          };

          reader.readAsBinaryString(file);

          reader.onerror = function (e) {
            reject(e);
          };
        });
        let _this = this;
        await prm
          .then(function (results) {
            // // console.log("results", results);
            _this.commonOptionsAll = results;
            _this.commonOptionsFiltered = results[0];
          })
          .catch(function (error) {
            console.log(error);
          });
      } else {
        let _this = this;
        let prm = new Promise((resolve, reject) => {
          this.$papa.parse(file, {
            // header: true,
            complete(results) {
              resolve(results.data);
            },
            error(err) {
              reject(err);
            },
          });
        });

        await prm
          .then(function (results) {
            // // console.log("results", results);
            _this.commonOptionsAll = results;
            _this.commonOptionsFiltered = results[0];
          })
          .catch(function (error) {
            console.log(error);
          });
      }
      this.commonOptionsName = [];
      this.commonOptionsFiltered = JSON.parse(
        JSON.stringify(this.commonOptionsFiltered)
      );
      // // console.log("this.commonOptionsFiltered", this.commonOptionsFiltered);
      let optiondropdowninitial = {
        value: "",
        text: this.$t("label.please_select_column"),
        disabled: false,
      };
      this.commonOptionsName.push(optiondropdowninitial);
      this.commonOptionsFiltered.map((x, index) => {
        let stralphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let optiondropdown = {
          value: index,
          text: "Column " + stralphabet[index] + " - " + x,
        };
        this.commonOptionsName.push(optiondropdown);
        // // console.log(x, index, stralphabet[index]);
      });

      // this.commonOptionsName.map((x, index) => {
      //   this.form[Object.keys(this.form)[index]] = index + 1;
      //   // console.log(x, index, Object.keys(this.form)[index]);
      // });

      Object.keys(this.form).forEach((key, index) => {
        this.form[key] =
          this.commonOptionsFiltered[index] != undefined ? index : "";
      });
    },
    // eslint-disable-next-line no-unused-vars
    filerror(error) {
      this.uploadedFileError = true;
      this.forward = false;
      this.submitted = false;
      this.csv = [];
      Object.keys(this.form).forEach((key) => (this.form[key] = ""));
      // // console.log("this.uploadedFileError error", this.uploadedFileError);
    },
    fileremoved() {
      this.uploadedFileError = true;
      this.forward = false;
      this.submitted = false;
      this.csv = [];
      Object.keys(this.form).forEach((key) => (this.form[key] = ""));
      // // console.log("this.uploadedFileError fileremoved", this.uploadedFileError);
    },
    async fetchData() {
      this.isBusy = !this.isBusy;
      var posGroup_Id = this.$route.params.posGroup_Id
        ? this.$route.params.posGroup_Id
        : "";
      // alert(posGroup_Id);
      // alert(this.sortBy + " " + this.sortDirection);
      await axios
        .get(
          `${apiUrl}/Product/GetProductByMerchant?id=${this.$store.state.authapi.user.merchant_Id}&posGroupId=${posGroup_Id}&limit=${this.perPage}&page=${this.currentPage}&search=${this.search}&sortBy=${this.sortBy}&sortDirection=${this.sortDirection}`
        )
        .then((response) => {
          var res = JSON.parse(JSON.stringify(response.data));

          let products = res.items;

          for (let i = 0; i < products.length; i++) {
            if(products[i].draft) {
              products[i]._rowVariant = "success";
            }
          }

          this.productGridData = products;
          this.totalRows = res.count;
          this.isBusy = !this.isBusy;
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

    async setselectedproductvieweditdelete(productid, action) {
      var filterObj = this.productGridData.find(function (e) {
        return e.product_Id == productid;
      });
      // // console.log("filterObj", filterObj);
      // alert(filterObj.merchant_Id);

      if (action === "edit") {
        this.$router.push({
          name: "pos-product-edit",
          params: {
            posGroup_Id: filterObj.posGroup_Id,
            id: filterObj.product_Id,
          },
        });

        this.addProduct(filterObj);
      } else if (action === "delete") {
        let result = await toastMixin.methods.displayConfirmationAlert(
          this.$t("alerts.delete_confirmation_title"),
          this.$t("alerts.delete_confirmation_text"),
          "warning",
          this.$t("alerts.delete_confirmation_accept_button_text"),
          this.$t("alerts.delete_confirmation_cancel_button_text")
        );
        // // console.log("result", result);
        if (result.value) {
          // // console.log("www", filterObj.product_Id);
          await this.deleteProductData(filterObj.product_Id);
          await this.fetchData();
        }
      } else if (action === "view") {
        this.$router.push({
          name: "pos-product-view",
          params: {
            posGroup_Id: filterObj.posGroup_Id,
            id: filterObj.product_Id,
          },
        });

        this.addProduct(filterObj);
      }
    },

    async formSubmit(e) {
      // // console.log("this.csv", this.csv);
      // // console.log("this.isHeaderAvailable", this.isHeaderAvailable);
      this.submitted = true;
      // stop here if form is invalid
      this.$v.$touch();
      e.preventDefault(); //
      if (this.$v.$invalid) {
        // console.log("error");
      } else {
        this.form = JSON.parse(JSON.stringify(this.form));
        // eslint-disable-next-line no-unused-vars
        let _this = this;
        // // console.log("_this.commonOptionsAll", _this.commonOptionsAll);
        // eslint-disable-next-line no-unused-vars
        let tempobj = {};
        let temparr = [];
        // Object.keys(_this.form).forEach(function (key) {
        //   let tempRes = [];

        //   if (_this.form[key] !== "") {
        //     var i = _this.isHeaderAvailable == "yes" ? 1 : 0;
        //     for (i; i < _this.commonOptionsAll.length; i++) {
        //       _this.commonOptionsAll[i][_this.form[key]] =
        //         _this.commonOptionsAll[i][_this.form[key]] == undefined
        //           ? ""
        //           : _this.commonOptionsAll[i][_this.form[key]];
        //       tempRes.push(_this.commonOptionsAll[i][_this.form[key]]);
        //     }
        //     // // console.log("tempRes", tempRes);
        //   }

        //   tempobj[key] = tempRes;
        //   _this.csv[_this.form[key]] = tempRes;
        // });

        // this.csv = JSON.parse(JSON.stringify(this.csv));

        // // console.log("tempobj", tempobj);
        // // console.log("this.csv", this.csv);

        // // console.log("this.csv lengths", this.csv.length);
        var i = this.isHeaderAvailable == "yes" ? 1 : 0;
        for (i; i < this.commonOptionsAll.length; i++) {
          // // console.log("this.csv[i].length", this.commonOptionsAll[i].length);
          // Object.keys(_this.form).forEach(function (key) {
          //   tempobj = {
          //     ...tempobj,
          //     key:
          //       this.commonOptionsAll[i][this.form[key]] == undefined
          //         ? ""
          //         : this.commonOptionsAll[i][this.form[key]],
          //   };
          // });
          tempobj = {
            product_Code:
              this.commonOptionsAll[i][this.form.product_Code] == undefined
                ? ""
                : this.commonOptionsAll[i][this.form.product_Code].toString(),
            product_Name:
              this.commonOptionsAll[i][this.form.product_Name] == undefined
                ? ""
                : this.commonOptionsAll[i][this.form.product_Name].toString(),
            unit_Price:
              this.commonOptionsAll[i][this.form.unit_Price] == undefined
                ? ""
                : this.commonOptionsAll[i][this.form.unit_Price].toString(),
            unit_Of_Measure:
              this.commonOptionsAll[i][this.form.unit_Of_Measure] == undefined
                ? ""
                : this.commonOptionsAll[i][this.form.unit_Of_Measure].toString(),
            ean:
              this.commonOptionsAll[i][this.form.ean] == undefined
                ? ""
                : this.commonOptionsAll[i][this.form.ean].toString(),
            tax_Code:
              this.commonOptionsAll[i][this.form.tax_Code] == undefined
                ? ""
                : this.commonOptionsAll[i][this.form.tax_Code].toString(),
            variants:
              this.commonOptionsAll[i][this.form.variants] == undefined
                ? ""
                : this.commonOptionsAll[i][this.form.variants].toString(),
            upgrades:
              this.commonOptionsAll[i][this.form.upgrades] == undefined
                ? ""
                : this.commonOptionsAll[i][this.form.upgrades].toString(),
            unit_Type:
              this.commonOptionsAll[i][this.form.unit_Type] == undefined
                ? ""
                : this.commonOptionsAll[i][this.form.unit_Type].toString(),
            path:
              this.commonOptionsAll[i][this.form.path] == undefined
                ? ""
                : this.commonOptionsAll[i][this.form.path].toString(),
          };
          temparr.push(tempobj);
        }
        // // console.log("temparr", temparr);
        this.csv = temparr;
        // let tempobj = {};
        // this.csv.map((val, index) => {
        //   // console.log(val, index);
        //   // console.log(Object.keys(this.form)[index]);
        //   tempobj[Object.keys(this.form)[index]] = val;
        // });

        // this.csv = JSON.parse(JSON.stringify(tempobj));

        this.$refs["formmodal"].hide();
        let payloadparam = {
          merchant_Id: this.$store.state.authapi.user.merchant_Id,
          csv_data: this.csv,
        };
        // // console.log("payloadparam", payloadparam);

        // eslint-disable-next-line no-unused-vars
        let payload = {
          requestParam: payloadparam,
          message: !this.edit
            ? this.$t("alerts.record_create_success")
            : this.$t("alerts.record_update_success"),
        };
        await this.importProductData(payload);
        this.csv = [];
        await this.fetchData();
      }
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

    // eslint-disable-next-line no-unused-vars
    search: function (val, oldval) {
      // // console.log("oldval", oldval);
      // this.totalRows = val;
      this.fetchData();
    },
    commonOptionsFiltered: {
      // // console.log("oldval commonOptionsFiltered", oldval);
      // // console.log("newval commonOptionsFiltered", val);
      // eslint-disable-next-line no-unused-vars
      handler: function (val, oldVal) {
        // // console.log(val + " - " + oldVal);
      },
      deep: true,
      // this.totalRows = val;
      // this.fetchData();
    },
  },
};
</script>
<style>
.form-check {
  padding-left: 0px !important;
}
</style>
<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <!-- <div class="row mb-0" v-if="1 == 1">
      <div class="col-lg-12">
        <div class="button-items">
          <router-link
            :to="{
              name: 'pos-product-add',
              params: {
                posGroup_Id: this.$route.params.posGroup_Id,
              },
            }"
            class="icon-row-item"
          >
            <b-button size="lg" class="float-end w-sm" variant="primary">{{
              $t("action.create")
            }}</b-button>
          </router-link>
        </div>
      </div>
    </div> -->

    <b-modal
      id="formmodal"
      :title="$t('label.import_wizard')"
      hide-footer
      size="lg"
      centered
      ref="formmodal"
      @keydown.esc="cancel"
    >
      <div class="card-body">
        <form action="#" @submit.prevent="formSubmit">
          <div class="mb-3" v-show="!forward">
            <div>
              <b-form-group
                :label="$t('label.does_import_csv_file_contain_header')"
                v-slot="{ ariaDescribedby }"
              >
                <b-form-radio
                  v-model="isHeaderAvailable"
                  :aria-describedby="ariaDescribedby"
                  name="some-radios"
                  value="yes"
                  >&nbsp;&nbsp;{{ $t("label.yes") }}</b-form-radio
                >
                <b-form-radio
                  v-model="isHeaderAvailable"
                  :aria-describedby="ariaDescribedby"
                  name="some-radios"
                  value="no"
                  >&nbsp;&nbsp;{{ $t("label.no") }}</b-form-radio
                >
              </b-form-group>
            </div>
          </div>
          <div class="mb-3" v-show="!forward">
            <vue-dropzone
              id="dropzone"
              ref="myVueDropzone"
              @vdropzone-file-added="fileAdded"
              @vdropzone-error="filerror"
              @vdropzone-removed-file="fileremoved"
              :use-custom-slot="true"
              :options="dropzoneOptions"
            >
              <div class="dropzone-custom-content">
                <i class="display-4 text-muted bx bxs-cloud-upload"></i>
                <h4>{{ $t("label.drop_files_or_click_upload") }}</h4>
              </div>
            </vue-dropzone>
          </div>

          <div class="mb-3 mb-0" v-if="!uploadedFileError && forward">
            <table class="table">
              <tr v-for="(item, name, index) in form" :key="name">
                <td class="mb-3 form-label">
                  <!-- {{ form }} -->
                  {{ $t("label." + `${name}`.toLowerCase()) }}
                </td>

                <td>
                  <b-form-group
                    class="mb-3 form-label"
                    id="input-group-1"
                    label-for="formrow-inputState"
                  >
                    <b-form-select
                      v-if="index === 0"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.product_Code"
                      name="product_Code"
                      :options="commonOptionsName"
                      :state="
                        $v.form.product_Code.$dirty
                          ? !$v.form.product_Code.$error
                          : null
                      "
                    ></b-form-select>
                    <b-form-select
                      v-if="index === 1"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.product_Name"
                      name="product_Name"
                      :options="commonOptionsName"
                      :state="
                        $v.form.product_Name.$dirty
                          ? !$v.form.product_Name.$error
                          : null
                      "
                    ></b-form-select>
                    <b-form-select
                      v-if="index === 2"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.unit_Price"
                      name="unit_Price"
                      :options="commonOptionsName"
                      :state="
                        $v.form.unit_Price.$dirty
                          ? !$v.form.unit_Price.$error
                          : null
                      "
                    ></b-form-select>
                    <b-form-select
                      v-if="index === 3"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.unit_Of_Measure"
                      name="unit_Of_Measure"
                      :options="commonOptionsName"
                      :state="
                        $v.form.unit_Of_Measure.$dirty
                          ? !$v.form.unit_Of_Measure.$error
                          : null
                      "
                    ></b-form-select>
                    <b-form-select
                      v-if="index === 4"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.ean"
                      name="ean"
                      :options="commonOptionsName"
                    ></b-form-select>
                    <b-form-select
                      v-if="index === 5"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.tax_Code"
                      name="tax_Code"
                      :options="commonOptionsName"
                      :state="
                        $v.form.tax_Code.$dirty
                          ? !$v.form.tax_Code.$error
                          : null
                      "
                    ></b-form-select>
                    <b-form-select
                      v-if="index === 6"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.variants"
                      name="variants"
                      :options="commonOptionsName"
                    ></b-form-select>
                    <b-form-select
                      v-if="index === 7"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.upgrades"
                      name="upgrades"
                      :options="commonOptionsName"
                    ></b-form-select>
                    <b-form-select
                      v-if="index === 8"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.unit_Type"
                      name="unit_Type"
                      :options="commonOptionsName"
                      :state="
                        $v.form.unit_Type.$dirty
                          ? !$v.form.unit_Type.$error
                          : null
                      "
                    ></b-form-select>
                    <div
                      v-if="submitted && $v.form.unit_Type.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.unit_Type.required">{{
                        $t("validationerror.value_required")
                      }}</span>
                    </div>
                    <b-form-select
                      v-if="index === 9"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.path"
                      name="path"
                      :options="commonOptionsName"
                    ></b-form-select>
                  </b-form-group>
                </td>
              </tr>
            </table>
          </div>

          <!-- <div class="mb-3 mb-0" v-if="csv != null"> -->
          <div class="mb-3 mb-0">
            <div>
              <b-button
                v-show="!forward"
                :disabled="uploadedFileError"
                @click="forwardStep"
                right
                variant="primary"
                >{{ $t("action.forward") }}</b-button
              >
              <b-button type="submit" variant="primary" v-show="forward">{{
                $t("action.submit")
              }}</b-button>

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

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <!-- <h4 class="card-title">Data Table</h4> -->

            <PagingFilter />

            <!-- Table -->
            <div class="table-responsive mb-0">
              <!-- <template slot="empty">
                <div v-if="isBusy" class="text-center">
                  <b-spinner class="align-middle"></b-spinner>
                  <strong>Loading...</strong>
                </div>
                <div v-else class="text-center">No rows to display!</div>
              </template> -->
              <b-table
                class="datatables"
                :items="productGridData"
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
                    <strong class="pl-2">{{ $t("label.loading") }}</strong>
                  </div>
                </template>
                <template #top-row v-if="productGridData.length === 0">
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
                <template #cell(posName)="row">
                  <span
                    v-for="(url, index) in row.item.posName"
                    :key="index"
                    class="badge rounded-pill badge-soft-success font-size-11 m-1"
                    >{{ url }}</span
                  >
                </template>
                <template #cell(created_Date)="row">
                  <span v-tooltip.top="formatDateTooltip(row.item.created_Date)"
                    >{{ formatDateDisplay(row.item.created_Date) }}
                  </span>
                </template>
                <template #cell(updated_Date)="row">
                  <span v-tooltip.top="formatDateTooltip(row.item.updated_Date)"
                    >{{ formatDateDisplay(row.item.updated_Date) }}
                  </span>
                </template>
                <!-- <template #cell(actions)="row"> -->
                  <!-- {{ row }} -->

                  <!-- <ul class="list-inline font-size-20 contact-links mb-0"> -->
                    <!-- <li class="list-inline-item px-2">
                      <a
                        v-b-tooltip.hover
                        title="View"
                        role="button"
                        @click="
                          setselectedproductvieweditdelete(
                            row.item.merchant_Id,
                            'view'
                          )
                        "
                      >
                        <i class="far fa-eye fa-xs"></i>
                      </a>
                    </li> -->

                    <!-- <li class="list-inline-item px-2">
                      <a
                        v-tooltip.top="$t('label.edit')"
                        role="button"
                        @click="
                          setselectedproductvieweditdelete(
                            row.item.product_Id,
                            'edit'
                          )
                        "
                      >
                        <i class="far fa-edit fa-xs"></i>
                      </a>
                    </li>
                    <li class="list-inline-item px-2">
                      <a
                        v-tooltip.top="$t('label.delete')"
                        role="button"
                        @click="
                          setselectedproductvieweditdelete(
                            row.item.product_Id,
                            'delete'
                          )
                        "
                      >
                        <i class="fas fa-trash fa-xs"></i>
                      </a>
                    </li>
                  </ul>  -->
                <!-- </template> -->
              </b-table>
            </div>
            <div class="row" v-if="productGridData.length !== 0">
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
  </Layout>
</template>
