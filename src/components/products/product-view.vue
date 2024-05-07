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
            <div class="row">
              <div class="col-12 col-xs-12 col-sm-12 col-md-7 col-lg-8">
                <div>
                  <div class="d-flex">
                    <span class="group_header h6">Cene</span>
                  </div>
                  <div class="row">
                    <div
                      class="col-4 mb-3"
                      v-for="posGroup in posGroups"
                      :key="posGroup.posGroup_Id"
                    >
                      <div>
                        <div class="form-label d-flex">
                          {{ posGroup.posGroup_Name }}
                        </div>
                        <input
                          class="form-control"
                          type="number"
                          v-model="posGroup.price"
                          disabled
                          readonly
                        />
                      </div>
                    </div>
                  </div>
                  <div class="row" v-if="!loadingPosGroups && posGroups.length == 0">
                    <div class="col-12">
                      {{ this.$t('alerts.pos_group_for_product_not_found') }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-12 col-xs-12 col-sm-12 col-md-5 col-lg-4">
                <div class="text-center cursor-pointer" v-if="this.form.image">
                  <b-img-lazy
                    :src="this.form.image"
                    alt="product image"
                    class="image_upload rounded img-thumbnail mb-2"
                  />
                </div>
                <div class="text-center" v-else>
                  <b-img-lazy
                    :src="require('@/assets/images/img_placeholder.png')"
                    alt="product image"
                    class="image_upload rounded img-thumbnail mb-2"
                  />
                </div>
              </div>
            </div>
            <div class="mb-3">
              <div>
                <div
                  v-for="field in variant_fields"
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
                      readonly
                    />
                  </div>

                  <div class="mb-3 col-lg-4">
                    <label for="subject">{{ $t("label.ean") }}</label>
                    <input
                      id="subject"
                      v-model="field.ean"
                      type="text"
                      class="form-control"
                      readonly
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label>{{ $t("label.product_code") }}</label>
              <input
                v-model="form.product_Code"
                type="text"
                class="form-control"
                name="product_Code"
                readonly
              />
            </div>

            <div class="mb-3">
              <label>{{ $t("label.product_name") }}</label>
              <input
                v-model="form.product_Name"
                type="text"
                class="form-control"
                name="product_Name"
                readonly
              />
            </div>

            <div class="mb-3">
              <b-form-group
                class="mb-3 form-label"
                id="input-group-1"
                :label="$t('label.unit_of_measure')"
                label-for="formrow-inputState"
              >
                <input
                  v-model="form.unit_Of_Measure"
                  type="text"
                  class="form-control"
                  name="unit_Of_Measure"
                  readonly
                />
              </b-form-group>
            </div>

            <div class="mb-1">
              <b-form-checkbox
                class="form-check-custom"
                id="Measure"
                name="Measure"
                v-model="form.measure"
                :disabled="true"
              >
                {{ $t("label.measure") }}
              </b-form-checkbox>
            </div>

            <div class="mb-3">
              <label>{{ $t("label.ean") }}</label>
              <input
                v-model="form.ean"
                type="text"
                class="form-control"
                name="ean"
                readonly
              />
            </div>

            <div class="mb-3">
              <b-form-group
                class="mb-3 form-label"
                id="input-group-1"
                :label="$t('label.tax_code')"
                label-for="formrow-inputState"
              >
                <b-form-select
                  class="form-select"
                  v-model.trim="form.tax_Code"
                  name="tax_Code"
                  :options="taxCodeOptions"
                  :disabled="true"
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="mb-3">
              <label>{{ $t("label.upgrades") }}</label>
              <input
                v-model="form.upgrades"
                type="text"
                class="form-control"
                name="upgrades"
                readonly
              />
            </div>

            <div class="mb-3">
              <label>{{ $t("label.path") }}</label>
              <input
                v-model="form.path"
                type="text"
                class="form-control"
                name="path"
                readonly
              />
            </div>

            <div class="mb-3">
              <label>{{ $t("label.message") }}</label>
              <input
                v-model="form.message"
                type="text"
                class="form-control"
                name="message"
                readonly
              />
            </div>

            <div class="mb-3 mb-0">
              <div>
                <router-link
                  :to="{ name: 'product-list' }"
                  class="icon-row-item"
                >
                  <b-button right variant="primary">{{
                    $t("label.ok")
                  }}</b-button>
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <!-- end card -->
      </div>
      <!-- end col-->
    </div>
    <!-- end row -->
  </Layout>
</template>

<script>
import Layout from "@/router/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import toastMixin from "@/mixins/sweetAlertMixin";
import { layoutMethods, layoutComputed, apiUrl } from "@/state/helpers";
import axios from "@/axios";
import priceMixin from "@//mixins/priceMixin";

export default {
  page: {
    title: "",
    meta: [{ name: "description", content: appConfig.description }],
  },
  mixins: [priceMixin],
  components: { Layout, PageHeader },
  beforeMount() {
    this.changeLoaderValue({
      loader: false,
    });
  },
  data() {
    return {
      title: this.$t("label.product_view"),
      items: [
        {
          text: `${this.$t("label.products")}`,
          href: "/",
        },
        {
          text: `${this.$t("label.product_list")}`,
          active: false,
          href: "/products/list",
        },
        {
          text: this.$t("label.product_view"),
          active: true,
        },
      ],

      form: {
        product_Id: "",
        product_Code: "",
        product_Name: "",
        unit_Of_Measure: "",
        measure: false,
        ean: "",
        tax_Code: "",
        variants: [],
        upgrades: "",
        path: "",
        revision_Id: "1",
        created_By: "",
        posGroup_Id: "",
        message: "",
        image: "",
      },
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
      variant_fields: [],
      selectedoption: "product",
      loading: false,
      server_product_image_path: process.env.VUE_APP_PRODUCT_IMAGE_PATH,
      loadingPosGroups: true,
      posGroups: [],
    };
  },
  computed: {
    ...layoutComputed,
  },
  methods: {
    ...layoutMethods,
    async getProductDetails() {
      this.loading = true;
      this.changeLoaderAPIValue({ loader: true });

      await axios
        .get(`${apiUrl}/Product/GetProductForMerchant`, {
          params: {
            Id: this.$route.params.id,
          },
        })
        .then(async (response) => {
          var data = JSON.parse(JSON.stringify(response.data));

          await this.getPosGroupPricesForProduct();

          for (const key in this.form) {
            this.form[key] = data[key] || this.form[key];
          }

          // setting full path for product image;
          if (this.form.image) {
            this.form.image = `${this.server_product_image_path}/${this.form.image}`;
          }

          try {
            this.variant_fields = data.variants
              ? JSON.parse(data.variants)
              : [];
          } catch (error) {
            console.log("something went wrong while parsing variants");
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            this.$store.dispatch("authapi/logoutauthapi");
            this.$router.push("/login");
          } else if (error.response && error.response.status === 400) {
            toastMixin.methods.displayToastAlert(error.response.data, "error");
          } else {
            toastMixin.methods.displayToastAlert(
              this.$t("alerts.something_went_wrong"),
              "error"
            );
          }
        })
        .finally(() => {
          this.loading = false;
          this.changeLoaderAPIValue({ loader: false });
        });
    },
    async getPosGroupPricesForProduct() {
      this.loadingPosGroups = true;

      await axios
        .get(`${apiUrl}/PosGroup/GetProducts`, {
          params: {
            ProductId: this.$route.params.id,
          },
        })
        .then((response) => {
          let data = response.data;

          data = data.map(pg => {
            pg.price = this.addDecimalPoints(pg.price);
            return pg;
          });

          this.posGroups = data;
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            this.$store.dispatch("authapi/logoutauthapi");
            this.$router.push("/login");
          } else if (error.response && error.response.status === 400) {
            toastMixin.methods.displayToastAlert(error.response.data, "error");
          } else {
            toastMixin.methods.displayToastAlert(
              this.$t("alerts.something_went_wrong"),
              "error"
            );
          }
        })
        .finally(() => {
          this.loadingPosGroups = false;
        });
    },
  },
  async mounted() {
    // For passing bearer token into the API
    axios.defaults.headers.common = {
      Authorization: `Bearer ${this.$store.state.authapi.user.token}`,
    };

    this.getProductDetails();
  },
};
</script>

<style scoped>
.image_upload_label {
  font-size: 15px !important;
  font-weight: bold;
}

.group_header {
  font-weight: 600;
  font-size: 14px;
  margin-right: 10px;
}

.cursor-pointer {
  cursor: pointer;
}

.image_upload {
  height: 130px;
  width: 130px;
  object-fit: cover;
}

.mr-3 {
  margin-right: 5px;
}

.text-red {
  color: red !important;
}

.select_all.form-check {
  padding-left: 20px !important;
}
</style>

