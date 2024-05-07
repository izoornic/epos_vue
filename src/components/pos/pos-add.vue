<script>
import Layout from "@/router/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import toastMixin from "@/mixins/sweetAlertMixin";

import { required } from "vuelidate/lib/validators";

import {
  layoutMethods,
  layoutComputed,
  POSMethods,
  POSGroupMethods,
  apiUrl
} from "@/state/helpers";
import axios from "@/axios";
/**
 * POS-Add/Edit component
 */
export default {
  page: {
    title: "Create/Edit POS",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: { Layout, PageHeader },

  beforeMount() {
    this.form.is_Master = this.masterOptions[1].value;
    this.form.is_Active = this.activeOptions[0].value;
    this.edit = false;
    this.changeLoaderValue({
      loader: false,
    });
  },
  async mounted() {
    try {
      this.originalPosGroupId = this.$store.state.pos.pos.posGroup_Id;
    } catch (error) {
      console.log("something went wrong while setting the pos group id");
    }

    /**
     * For passing bearer token into the API
     */
    axios.defaults.headers.common = {
      Authorization: `Bearer ${this.$store.state.authapi.user.token}`,
    };
    /**
     * For fetching records
     */
    await this.getPosGroupByMerchant();

    let optiondropdowninitial = {
      value: "",
      text: this.$t("label.please_select_column"),
      disabled: false,
    };

    this.posGroupOptions.push(optiondropdowninitial);
    
    this.$store.state.posgroup.posgroup.map((x) => {
      let optiondropdown = {
        text: x.posGroup_Name, //+ " " + "(" + x.posGroup_Name + ")",
        value: x.posGroup_Id,
      };
      this.posGroupOptions.push(optiondropdown);
    });

    var pos_id = this.$route.params.id ? this.$route.params.id : "";
    
    if (pos_id != "") {
      this.edit = true;
      this.form = {
        ...this.$store.state.pos.pos,
      };

      this.masterOptions.forEach((element, index) => {
        let is_Master =
          this.$store.state.pos.pos.is_Master === false ? "No" : "Yes";

        if (element.value == is_Master) {
          this.form.is_Master = this.masterOptions[index].value;
        }
      });

      this.activeOptions.forEach((element, index) => {
        let is_Active =
          this.$store.state.pos.pos.is_Active == false ? "No" : "Yes";

        if (element.value == is_Active) {
          this.form.is_Active = this.activeOptions[index].value;
        }
      });

      delete this.form.updated_Date;
      delete this.form.created_Date;
    }
  },

  data() {
    return {
      title: !this.$route.params.id
        ? `${this.$t("label.pos_add")}`
        : `${this.$t("label.pos_edit")}`,
      items: [
        {
          text: "Kase",
          href: "/pos/list",
        },
        {
          text: `${this.$t("label.pos_list")}`,
          active: false,
          href: "/pos/list",
        },
        {
          text: !this.$route.params.id
            ? `${this.$t("label.pos_add")}`
            : `${this.$t("label.pos_edit")}`,
          active: true,
        },
      ],

      form: {
        pos_Id: "",
        storeName: "",
        pos_Address: "",
        is_Master: "No",
        is_Active: "",
        created_By: "",
        posGroup_Id: "",
      },

      submitted: false,
      edit: false,
      disabled: false,
      masterOptions: [
        {
          value: "Yes",
          text: this.$t("label.yes"),
        },
        {
          value: "No",
          text: this.$t("label.no"),
        },
      ],
      activeOptions: [
        {
          value: "Yes",
          text: this.$t("label.yes"),
        },
        {
          value: "No",
          text: this.$t("label.no"),
        },
      ],
      posGroupOptions: [],
      originalPosGroupId: null,
      checkingPosId: false,
      isMasterOptions: [
        { value: "Yes", text: this.$t("label.yes") },
        { value: "No", text: this.$t("label.no") },
      ]
    };
  },
  validations: {
    form: {
      pos_Id: { required },
      // storeName: { required },
      pos_Address: { required },
      posGroup_Id: { required },
    },
  },
  computed: {
    ...layoutComputed,
  },

  methods: {
    ...layoutMethods,
    ...POSMethods,
    ...POSGroupMethods,
    // eslint-disable-next-line no-unused-vars
    initDetail(param) {
    },

    async posIdExist() {
      this.checkingPosId = true;
      return await axios.get(`${apiUrl}/PosGroup/ValidatePosId`, {
        params: {
          PosId: this.form.pos_Id.trim()
        }
      }).then((res) => {
        this.checkingPosId = false;
        let isExist = res.data;

        return isExist
      })
      .catch(() => {
        this.checkingPosId = false;
        return false;
      })
    },
    // eslint-disable-next-line no-unused-vars
    async formSubmit(e) {
      this.submitted = true;
      // stop here if form is invalid
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      } else {
        let formData = {
          ...this.form,
          created_By: this.$store.state.authapi.user.merchant_Id,
          merchant_Id: this.$store.state.authapi.user.merchant_Id,
          is_Active: this.form.is_Active === "Yes" ? true : false,
          is_Master: this.form.is_Master === "Yes" ? true : false,
          IsDeleted: false
        };
        
        let payload = {
          requestParam: formData,
          message: !this.edit
            ? this.$t("alerts.pos_created")
            : this.$t("alerts.pos_updated"),
        };

        // remove master flag when pos device's pos group is changed
        if(this.edit && payload.requestParam.posGroup_Id != this.originalPosGroupId) {
          payload.requestParam.is_Master = false;
        }

        // check if pos id exist while inserting the new pos device 
        if(!this.edit) {
          let isExist = await this.posIdExist();

          if(isExist) {
            // don't allow to proceed
            toastMixin.methods.displayToastAlert(this.$t("label.pos_exist"), "error");
            return;
          }
        }

        /**
         * For adding/updating records
         */
        this.addPOSData(payload);
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
              <div class="mb-3">
                <label>{{ $t("label.pos_id") }}</label>
                <input
                  v-model="form.pos_Id"
                  type="text"
                  class="form-control"
                  :placeholder="$t('label.type_something')"
                  name="pos_Id"
                  :class="{
                    'is-invalid': submitted && $v.form.pos_Id.$error,
                  }"
                />
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
                <b-form-group
                  class="mb-3 form-label"
                  id="input-group-1"
                  :label="$t('label.group')"
                  label-for="formrow-inputState"
                >
                  <b-form-select
                    class="form-select"
                    v-model="form.posGroup_Id"
                    id="formrow-inputState"
                    :options="posGroupOptions"
                    :state="
                      $v.form.posGroup_Id.$dirty
                        ? !$v.form.posGroup_Id.$error
                        : null
                    "
                  ></b-form-select>
                  <div
                    v-if="submitted && $v.form.posGroup_Id.$error"
                    class="invalid-feedback"
                  >
                    <span v-if="!$v.form.pos_Id.required">{{
                      $t("validationerror.value_required")
                    }}</span>
                  </div>
                </b-form-group>
              </div>

              <div class="mb-3">
                <label>{{ $t("label.address") }}</label>
                <input
                  v-model="form.pos_Address"
                  type="text"
                  class="form-control"
                  :placeholder="$t('label.type_something')"
                  name="pos_Address"
                  :class="{
                    'is-invalid': submitted && $v.form.pos_Address.$error,
                  }"
                />
                <div
                  v-if="submitted && $v.form.pos_Address.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.form.pos_Address.required">{{
                    $t("validationerror.value_required")
                  }}</span>
                </div>
              </div>

              <div class="mb-3">
                <label>{{ $t("label.master") }}</label>
                <b-form-select v-model="form.is_Master" :options="isMasterOptions" class="form-select"></b-form-select>
              </div>
              

              <div class="mb-3 mb-0">
                <div>
                  <b-button type="submit" variant="primary" :disabled="checkingPosId">
                    <template v-if="!checkingPosId">{{$t("action.submit")}}</template>
                    <template v-if="checkingPosId"><b-spinner small style="margin-right: 5px;"></b-spinner>Loading...</template>
                  </b-button>

                  <router-link :to="{ name: 'pos-list' }" class="icon-row-item">
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
