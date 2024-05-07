<template>
  <Layout>
    <div v-if="loadingPosGroupDetails">
      <b-spinner class="align-middle mb-4" small variant="primary" ></b-spinner>
    </div>
    <PageHeader v-if="!loadingPosGroupDetails" :title="posGroupDetails.posGroup_Name" :items="items" />
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-body">
            <b-tabs nav-class="nav-tabs-custom" content-class="p-3 text-muted">
              <b-tab active>
                <template v-slot:title>
                  <span class="d-inline-block d-sm-none">
                    <i class="fas fa-home"></i>
                  </span>
                  <span class="d-none d-sm-inline-block">{{
                    $t("label.pos")
                  }}</span>
                </template>
                <div>
                  <div class="row mt-4">
                    <div class="col-sm-12 col-md-12">
                      <div id="tickets-table_length" class="dataTables_length d-flex justify-content-between">
                        <label class="d-inline-flex align-items-center">
                          {{ $t("label.show") }}&nbsp;
                          <b-form-select
                            class="form-select form-select-sm"
                            v-model="posPerPage"
                            size="sm"
                            :options="pageOptions"
                          ></b-form-select
                          >&nbsp;{{ $t("label.entries") }}
                        </label>

                        <div v-if="!openSelect">
                          <button
                            class="btn btn-primary mr-3"
                            @click="openSelectionsForMaster"
                          >
                            {{ $t('label.pos_group_view_edit') }}
                          </button>
                        </div>
                        
                        <div v-if="openSelect">
                          <button
                            class="btn btn-primary mr-3"
                            @click="setNewMaster" 
                          >
                            {{ $t('label.pos_group_view_save') }}
                          </button>
                          <button
                            class="btn btn-secondary"
                            @click="setOriginalMaster"
                          >
                            {{ $t('label.pos_group_view_cancel') }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Table -->
                  <div class="table-responsive mb-0">
                    <b-table
                      class="datatables"
                      :items="posDevices"
                      :fields="posFields"
                      responsive="sm"
                      :per-page="posPerPage"
                      :current-page="posCurrentPage"
                      :sort-by.sync="posSortBy"
                      :sort-desc.sync="posSortDesc"
                      :busy="loadingPosDevices"
                      @head-clicked="headClicked"
                      @filtered="onFilteredPosDevices"
                    >
                      <template #table-busy>
                        <div class="text-center text-danger my-2">
                          <b-spinner class="align-middle"></b-spinner>
                          <strong class="pl-2">{{
                            $t("label.loading")
                          }}</strong>
                        </div>
                      </template>
                      <template #top-row v-if="posDevices.length === 0">
                        <td
                          :colspan="posFields.length"
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
                      <template #cell(is_Master)="row">
                        <span
                          class="badge rounded-pill font-size-11"
                          v-if="!openSelect"
                          :class="{
                            'badge-soft-danger': row.item.is_Master === false,
                            'badge-soft-success': row.item.is_Master === true,
                          }"
                          >{{
                            row.item.is_Master === true
                              ? $t("label.yes")
                              : $t("label.no")
                          }}</span
                        >
                        <span v-else>
                           <b-form-select :options="masterOptions" v-model="row.item.tempIsMaster" class="form-control" @change="setMaster(row.item.pos_Id)"></b-form-select>
                        </span>
                      </template>
                      <template #cell(lastProductListUpdated)="row">
                        <!-- {{ row.value }} -->
                        <span
                          class="badge rounded-pill font-size-11 badge-soft-danger"
                          v-if="row.value === '-'"
                        >
                          {{ $t("label.neveractive") }}
                        </span>
                        <span
                          class="badge rounded-pill font-size-11 badge-soft-danger"
                          v-else-if="!isSynchronized(row.value)"
                          v-tooltip.top="
                            formatDateTooltip(row.item.lastProductListUpdated)
                          "
                        >
                          {{ formatDateDisplay(row.item.lastProductListUpdated) }}
                        </span>
                        <span
                          class="badge rounded-pill badge-soft-success font-size-11"
                          v-else
                          v-tooltip.top="
                            formatDateTooltip(row.item.lastProductListUpdated)
                          "
                          >{{ formatDateDisplay(row.item.lastProductListUpdated) }}
                        </span>
                      </template>
                      <template #cell(is_Active)="row">
                        <span
                          class="
                            badge
                            rounded-pill
                            badge-soft-success
                            font-size-11
                          "
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
                      <template #cell(created_Date)="row">
                        <span
                          v-tooltip.top="
                            formatDateTooltip(row.item.created_Date)
                          "
                          >{{ formatDateDisplay(row.item.created_Date) }}
                        </span>
                      </template>
                      <template #cell(updated_Date)="row">
                        <span
                          v-tooltip.top="
                            formatDateTooltip(row.item.updated_Date)
                          "
                          >{{ formatDateDisplay(row.item.updated_Date) }}
                        </span>
                      </template>
                      <template #cell(actions)="row">
                        <!-- {{ row }} -->
                        <ul class="list-inline font-size-20 contact-links mb-0">
                          <!-- <li class="list-inline-item px-2">
                            <a
                              v-tooltip.top="$t('label.view')"
                              role="button"
                              @click="
                                setSelectedPosViewEditDelete(
                                  row.item.pos_Id,
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
                              :style="{
                                cursor: openSelect ? 'not-allowed' : 'pointer',
                              }"
                              @click="openSelectionsForMaster"
                            >
                              <i class="far fa-edit fa-xs"></i>
                            </a>
                          </li> -->
                          <li class="list-inline-item px-2">
                            <a
                              v-tooltip.top="$t('label.delete')"
                              role="button"
                              @click="
                                setSelectedPosViewEditDelete(
                                  row.item.pos_Id,
                                  'delete'
                                )
                              "
                            >
                              <i class="fas fa-trash fa-xs"></i>
                            </a>
                          </li>
                        </ul> </template
                    ></b-table>
                  </div>
                  <div class="row" v-if="posDevices.length !== 0">
                    <div class="col">
                      <div class="dataTables_paginate paging_simple_numbers">
                        <ul
                          class="
                            pagination pagination-rounded
                            justify-content-center
                            mt-4
                          "
                        >
                          <!-- pagination -->
                          <b-pagination
                            v-model="posCurrentPage"
                            :total-rows="posDevices.length"
                            :per-page="posPerPage"
                          ></b-pagination>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </b-tab>
              <b-tab>
                <template v-slot:title>
                  <span class="d-inline-block d-sm-none">
                    <i class="far fa-user"></i>
                  </span>
                  <span class="d-none d-sm-inline-block">{{
                    $t("label.products")
                  }}</span>
                </template>
                <div>
                  <div class="row mt-4">
                    <div class="col-md-12">
                      <div
                        id="tickets-table_length"
                        class="dataTables_length d-flex justify-content-between"
                      >
                        <label class="d-inline-flex align-items-center">
                          {{ $t("label.show") }}&nbsp;
                          <b-form-select
                            class="form-select form-select-sm"
                            v-model="productPerPage"
                            size="sm"
                            :options="pageOptions"
                          ></b-form-select
                          >&nbsp;{{ $t("label.entries") }}
                        </label>

                        <div v-if="!openEdit">
                          <button
                            class="btn btn-primary mr-3"
                            @click="openEditInputsForCash"
                          >
                            {{ $t('label.pos_group_view_edit') }}
                          </button>
                        </div>

                        <div v-if="openEdit">
                          <button
                            class="btn btn-primary mr-3"
                            @click="setNewPrice"
                          >
                            {{ $t('label.pos_group_view_save') }}
                          </button>
                          <button
                            class="btn btn-secondary"
                            @click="setOriginalPrice"
                          >
                            {{ $t('label.pos_group_view_cancel') }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Table -->
                  <div class="table-responsive mb-0">
                    <b-table
                      class="datatables"
                      :items="products"
                      :fields="productFields"
                      responsive="sm"
                      :per-page="productPerPage"
                      :current-page="productCurrentPage"
                      :sort-by="productSortBy"
                      :sort-desc="productSortDesc"
                      :busy="loadingProducts"
                      @head-clicked="headClicked"
                      @filtered="onFilteredProducts"
                    >
                      <template #table-busy>
                        <div class="text-center text-danger my-2">
                          <b-spinner class="align-middle"></b-spinner>
                          <strong class="pl-2">{{
                            $t("label.loading")
                          }}</strong>
                        </div>
                      </template>
                      <template #top-row v-if="products.length === 0">
                        <td
                          :colspan="productFields.length"
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
                      <template #cell(measure)="row">
                        <span
                          >{{
                            row.item.measure === true
                              ? $t("label.yes")
                              : $t("label.no")
                          }}</span
                        >
                      </template>
                      <template #cell(price)="row">
                        <span v-if="!openEdit">
                          {{ row.item.price }}
                        </span>
                        <input
                          type="number"
                          v-if="openEdit"
                          v-model="row.item.tempPrice"
                          class="form-control"
                          style="min-width: 100px;"
                          @input="validatePrice(row.item)"
                        />
                      </template>
                      <template #cell(lastProductListUpdated)="row">
                        <!-- {{ row.value }} -->
                        <span
                          class="
                            badge
                            rounded-pill
                            badge-soft-success
                            font-size-11
                          "
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
                          class="
                            badge
                            rounded-pill
                            badge-soft-success
                            font-size-11
                          "
                          v-else
                          v-tooltip.top="
                            formatDateTooltip(row.item.lastProductListUpdated)
                          "
                          >{{
                            formatDateDisplay(row.item.lastProductListUpdated)
                          }}
                        </span>
                      </template>
                      <template #cell(is_Active)="row">
                        <span
                          class="
                            badge
                            rounded-pill
                            badge-soft-success
                            font-size-11
                          "
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
                      <template #cell(created_Date)="row">
                        <span
                          v-tooltip.top="
                            formatDateTooltip(row.item.created_Date)
                          "
                          >{{ formatDateDisplay(row.item.created_Date) }}
                        </span>
                      </template>
                      <template #cell(updated_Date)="row">
                        <span
                          v-tooltip.top="
                            formatDateTooltip(row.item.updated_Date)
                          "
                          >{{ formatDateDisplay(row.item.updated_Date) }}
                        </span>
                      </template>
                      <template #cell(actions)="row">
                        <!-- {{ row }} -->
                        <ul class="list-inline font-size-20 contact-links mb-0">
                          <!-- <li class="list-inline-item px-2">
                            <a
                              v-tooltip.top="$t('label.edit')"
                              role="button"
                              @click="openEditInputsForCash"
                              :style="{
                                cursor: openEdit ? 'not-allowed' : 'pointer',
                              }"
                            >
                              <i class="far fa-edit fa-xs"></i>
                            </a>
                          </li> -->
                          <li class="list-inline-item px-2">
                            <a
                              v-tooltip.top="$t('label.delete')"
                              role="button"
                              @click="showDeleteConfirmationPopup(row.item.id)"
                            >
                              <i class="fas fa-trash fa-xs"></i>
                            </a>
                          </li>
                        </ul> </template
                    ></b-table>
                  </div>
                  <div class="row" v-if="products.length !== 0">
                    <div class="col">
                      <div class="dataTables_paginate paging_simple_numbers">
                        <ul
                          class="
                            pagination pagination-rounded
                            justify-content-center
                            mt-4
                          "
                        >
                          <!-- pagination -->
                          <b-pagination
                            v-model="productCurrentPage"
                            :total-rows="products.length"
                            :per-page="productPerPage"
                          ></b-pagination>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </b-tab>
            </b-tabs>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
import Layout from "@/router/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";

import { POSMethods } from "@/state/helpers";
import axios from "@/axios";
import { layoutMethods, layoutComputed, apiUrl } from "@/state/helpers";
import toastMixin from "@/mixins/sweetAlertMixin";

import pagingFilterMixin from "@/mixins/pagingFilterMixin";
import dateFormatterMixin from "@/mixins/dateFormatterMixin";
import { EventBus } from "@/event-bus";
import moment from "moment";

export default {
  page: {
    title: "",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: { Layout, PageHeader },
  mixins: [toastMixin, pagingFilterMixin, dateFormatterMixin],
  data() {
    return {
      posDevices: [],
      products: [],
      totalProducts: 0,
      title: "POS Group Details",
      items: [
        {
          text: `${this.$t("label.pos_group_list")}`,
          href: "/pos-group/list",
          active: false,
        },
      ],
      filter: null,
      posSortBy: "",
      posSortDesc: true,
      posSortDirection: "desc",
      posPerPage: 10,
      posCurrentPage: 1,
      productSortBy: "",
      productSortDesc: true,
      productSortDirection: "desc",
      productPerPage: 10,
      productCurrentPage: 1,
      posFields: [
        {
          key: "pos_Id",
          label: this.$t("label.pos_id"),
          sortable: true,
        },
        {
          key: "is_Master",
          label: this.$t("label.master"),
          sortable: true,
        },
        // {
        //   key: "posGroupName",
        //   label: this.$t("label.group"),
        //   sortable: false,
        // },
        {
          key: "pos_Address",
          label: this.$t("label.address"),
          sortable: true,
        },
        {
          key: "lastProductListUpdated",
          label: this.$t("label.last_active"),
          sortable: true,
          // eslint-disable-next-line no-unused-vars
          formatter: (value, key, item) => {
            return value == "0001-01-01T00:00:00"
              ? "-"
              : moment.utc(value).local().format("DD-MMM-YYYY HH:mm:ss");
          },
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
        {
          key: "actions",
          label: this.$t("label.action"),
          sortable: false,
        },
      ],
      productFields: [
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
          key: "measure",
          label: this.$t("label.na_meru"),
          sortable: true,
        },
        {
          key: "price",
          label: this.$t("label.unit_price"),
          sortable: true,
        },
        {
          key: "tax_Code",
          label: this.$t("label.tax_code"),
          sortable: true,
        },
        {
          key: "ean",
          label: this.$t("label.ean"),
          sortable: true,
        },
        {
          key: "message",
          label: this.$t("label.message"),
          sortable: true,
        },
        {
          key: "created_Date",
          label: this.$t("label.created_on"),
          sortable: true,
          // eslint-disable-next-line no-unused-vars
          formatter: (value, key, item) => {
            return moment.utc(value).local().format("DD-MMM-YYYY HH:mm:ss");
          },
        },
        {
          key: "updated_Date",
          label: this.$t("label.updated_on"),
          sortable: true,
          // eslint-disable-next-line no-unused-vars
          formatter: (value, key, item) => {
            return value == "0001-01-01T00:00:00"
              ? "-"
              : moment.utc(value).local().format("DD-MMM-YYYY HH:mm:ss");
          },
        },
        {
          key: "actions",
          label: this.$t("label.action"),
          sortable: false,
        },
      ],
      loadingPosDevices: false,
      loadingProducts: false,
      pageOptions: [10, 25, 50, 100, 250, 500],
      openEdit: false,
      deleteRecordId: null,
      posGroupDetails: {
        posGroup_Name: ""
      },
      loadingPosGroupDetails: false,
      openSelect: false,
      masterOptions: [
        {
          value: true,
          text: this.$t("label.yes"),
        },
        {
          value: false,
          text: this.$t("label.no"),
        },
      ],
      latestSyncronizedTimeStamp: null
    };
  },
  computed: {
    ...layoutComputed,
  },
  methods: {
    ...POSMethods,
    ...layoutMethods,
    /**
     * @description Get Products that are associated with current pos group
     */
    async getProducts() {
      this.loadingProducts = true;

      await axios
        .get(`${apiUrl}/PosGroup/GetProductByPosGroupId`, {
          params: {
            PosGroupId: this.$route.params.id,
          },
        })
        .then((response) => {
          var data = JSON.parse(JSON.stringify(response.data));
          data = data.map((d) => {
            let decimalPrice = this.addDecimalPoints(d.price);
            d.price = isNaN(Number(decimalPrice)) ? d.price : decimalPrice;
            d.tempPrice = "";

            // highlighting product in draft
            if(d.draft) {
              d._rowVariant = "success";
            }

            return d;
          });

          this.products = data;
          this.totalProducts = data.length;
        })
        .catch((error) => {
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
        })
        .finally(() => {
          this.loadingProducts = false;
        });
    },
    /**
     * @description Get Pos Devices list for current pos group
     */
    async getPosDevices() {
      this.loadingPosDevices = true;

      await axios
        .get(`${apiUrl}/PosGroup/GetPosByPosGroupId`, {
          params: {
            PosGroupId: this.$route.params.id,
          },
        })
        .then((response) => {
          var data = JSON.parse(JSON.stringify(response.data.data));

          this.latestSyncronizedTimeStamp = response.data.maxDate;
          this.posDevices = data;
          this.totalRows = data.length;
        })
        .catch((error) => {
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
        })
        .finally(() => {
          this.loadingPosDevices = false;
        });
    },

    /**
     * @description Handle View, Edit And Delete POS Action
     */
    async setSelectedPosViewEditDelete(productid, action) {
      var posDevice = this.posDevices.find((e) => {
        return e.pos_Id == productid;
      });

      if (action === "edit") {
        this.$router.push({
          name: "pos-edit",
          params: { id: posDevice.pos_Id },
        });

        this.addPOS(posDevice);
      } else if (action === "delete") {
        let result = await toastMixin.methods.displayConfirmationAlert(
          this.$t("alerts.delete_confirmation_title"),
          this.$t("alerts.delete_confirmation_text"),
          "warning",
          this.$t("alerts.delete_confirmation_accept_button_text"),
          this.$t("alerts.delete_confirmation_cancel_button_text")
        );

        if (result.value) {
          await this.deletePOSData(posDevice.pos_Id);
          await this.getPosDevices();
        }
      } else if (action === "view") {
        this.$router.push({
          name: "pos-product-list",
          params: { posGroup_Id: posDevice.posGroup_Id },
        });

        this.addPOS(posDevice);
      }
    },
    onFilteredProducts() {
      this.productCurrentPage = 1;
    },
    onFilteredPosDevices() {
      this.posCurrentPage = 1;
    },
    /**
     * @description Delete the Product
     */
    deleteProduct() {
      if (!this.deleteRecordId) {
        return;
      }

      this.changeLoaderAPIValue({ loader: true });

      axios
        .delete(`${apiUrl}/PosGroup/DeltePosGroupProduct`, {
          params: {
            id: this.deleteRecordId,
          },
        })
        .then(() => {
          let deleteRecordIndex = this.products.findIndex((p) => {
            return p.id == this.deleteRecordId;
          });

          if (deleteRecordIndex != -1) {
            this.products.splice(deleteRecordIndex, 1);
          }
          this.deleteRecordId = null;
          toastMixin.methods.displayToastAlert(
            this.$t("alerts.pos_group_product_deleted"),
            "success"
          );
        })
        .catch((error) => {
          if (error.response.status === 401) {
            this.$store.dispatch("authapi/logoutauthapi");
            this.$router.push("/login");
          } else if (error.response.status === 400) {
            toastMixin.methods.displayToastAlert(error.response.data, "error");
          } else {
            toastMixin.methods.displayToastAlert(
              this.$i18n.t("alerts.something_went_wrong"),
              "error"
            );
          }
        })
        .finally(() => {
          this.changeLoaderAPIValue({ loader: false });
        });
    },
    /**
     * @description Open selection box for updating master column in pos devices list
     */
    openSelectionsForMaster() {
      // return if select already open
      if (this.openSelect) {
        return;
      }

      this.posDevices = this.posDevices.map((p) => {
        p.tempIsMaster = p.is_Master;
        return p;
      });

      this.openSelect = true;
    },
    /**
     * @description Open selection box for updating price of products
     */
    openEditInputsForCash() {
      // return if input already open
      if (this.openEdit) {
        return;
      }

      this.products = this.products.map((p) => {
        p.tempPrice = p.price;
        return p;
      });
      this.openEdit = true;
    },
    /**
     * @description Update price of the edited products 
     */
    async setNewPrice() {
      let newProductsPrice = [];
      let posGroupId = this.$route.params.id;

      for (let i = 0; i < this.products.length; i++) {
        let product = this.products[i];
        if (product.price != product.tempPrice) {
          let decimalPrice = this.addDecimalPoints(product.tempPrice, 2)

          newProductsPrice.push({
            POSGroup_Id: posGroupId,
            Product_Id: product.product_Id,
            Price: isNaN(Number(decimalPrice)) ? Number(product.tempPrice) : Number(decimalPrice),
          });
        }
      }

      // updates the price only if it has been modified
      if(newProductsPrice.length > 0) {
        await this.updateProductsPriceForPosGroups(newProductsPrice);
      } else {
        toastMixin.methods.displayToastAlert(
          this.$t("alerts.pos_group_products_price_updated"),
          "success"
        );
      }
    },
    /**
     * @description Update master status of the edited pos devices
     */
    async setNewMaster() {
      let newPosMaster = [];

      // storing list of updated pos device in the newPosMaster array
      for (let i = 0; i < this.posDevices.length; i++) {
        let posDevice = this.posDevices[i];
        if (posDevice.is_Master != posDevice.tempIsMaster) {
          newPosMaster.push({...posDevice});
        }
      }

      // updating data for is master when is changed
      if(newPosMaster.length > 0) {
        let merchant_Id = this.$store.state.authapi.user.merchant_Id;

        // mapping data for upsertPos request
        for(let i=0; i<newPosMaster.length; i++) {
          newPosMaster[i].is_Master = newPosMaster[i].tempIsMaster;
          newPosMaster[i].merchant_Id = merchant_Id;
          newPosMaster[i].posGroupName = this.posGroupDetails.posGroup_Name;
          delete newPosMaster[i].created_Date;
          delete newPosMaster[i].pos_token;
          delete newPosMaster[i].updated_Date;
          delete newPosMaster[i].tempIsMaster;
        }

        this.changeLoaderAPIValue({ loader: true });

        // updating pos details
        axios.all(newPosMaster.map((pm) => axios.post(`${apiUrl}/Pos/upsertPos`, pm)))
        .then((res) => {
          let totalSuccessRequest = res.reduce((total, res) => {
            if(res.status == 200) {
              return total + 1;
            } else {
              return total;
            }
          },0);

          if(totalSuccessRequest == newPosMaster.length) {
            for (let i = 0; i < this.posDevices.length; i++) {
              let posDevice = this.posDevices[i];
              if (posDevice.is_Master != posDevice.tempIsMaster) {
                posDevice.is_Master = posDevice.tempIsMaster;
              }
            }
            this.openSelect = false;
            toastMixin.methods.displayToastAlert(this.$t("alerts.pos_details_updated"),"success");
          } else {
            toastMixin.methods.displayToastAlert(this.$t("alerts.something_went_wrong"),"error");
          }
        })
        .catch(() => {
          toastMixin.methods.displayToastAlert(this.$t("alerts.something_went_wrong"),"error");
        })
        .finally(() => {
          this.changeLoaderAPIValue({ loader: false });
        })
      } else {
        this.setOriginalMaster();
        toastMixin.methods.displayToastAlert(this.$t("alerts.pos_details_updated"),"success");
      }
    },
    /**
     * @description Set the prices of the products to default And Close the input box
     */
    setOriginalPrice() {
      this.products = this.products.map((p) => {
        p.tempPrice = "";
        return p;
      });

      this.openEdit = false;
    },
    /**
     * @description Set the master to default And Close the selection box
     */
    setOriginalMaster() {
      this.posDevices = this.posDevices.map((p) => {
        p.tempIsMaster = false;
        return p;
      })

      this.openSelect = false;
    },
    /**
     * @description Update prices of product for pos groups
     */
    async updateProductsPriceForPosGroups(newProductsPrice) {
      this.changeLoaderAPIValue({ loader: true });

      await axios
        .post(`${apiUrl}/PosGroup/UpsertPriceOfPosGroup`, newProductsPrice)
        .then(async () => {
          let productIds = [];

          // extracting product ids from pos group prices for product
          for(let m=0; m<newProductsPrice.length; m++) {
            productIds.push(newProductsPrice[m].Product_Id);
          }

          await this.removeProductsDraftStatus(productIds);

          // setting new price as original price
          let products = [...this.products];

          for (let i = 0; i < products.length; i++) {
            let product = products[i];
            if (product.price != product.tempPrice) {
              let decimalPrice = this.addDecimalPoints(product.tempPrice, 2);
              product.price = isNaN(Number(decimalPrice)) ? product.tempPrice : decimalPrice;
              product.draft = false;
              product._rowVariant = "";
            }
          }
          
          this.products = products;
          
          // closing edit inputs
          this.openEdit = false;

          toastMixin.methods.displayToastAlert(
            this.$t("alerts.pos_group_products_price_updated"),
            "success"
          );
        })
        .catch((error) => {
          if (error.response.status === 401) {
            this.$store.dispatch("authapi/logoutauthapi");
            this.$router.push("/login");
          } else if (error.response.status === 400) {
            toastMixin.methods.displayToastAlert(error.response.data, "error");
          } else {
            toastMixin.methods.displayToastAlert(
              this.$i18n.t("alerts.something_went_wrong"),
              "error"
            );
          }
        })
        .finally(() => {
          this.changeLoaderAPIValue({ loader: false });
        });
    },
    /**
     * @param {Array} productIds
     * @description Remove Products Draft Status
     */
    async removeProductsDraftStatus(productIds) {
      await axios.post(`${apiUrl}/Product/UpdateDraftSatus`, {}, {
        params: {
          Product_Id: productIds.toString()
        }
      })
      .catch(() => {
        console.log("something went wrong while removing product draft status");
      })
    },
    async showDeleteConfirmationPopup(deleteRecordId) {
      this.deleteRecordId = deleteRecordId;

      let result = await toastMixin.methods.displayConfirmationAlert(
        this.$t("alerts.pos_group_product_delete_confirmation"),
        "",
        "warning",
        this.$t("alerts.yes"),
        this.$t("alerts.no")
      );

      if (result.value) {
        await this.deleteProduct();
      } else {
        this.deleteRecordId = null;
      }
    },
    validatePrice(product) {
      if(product.tempPrice) {
        // validating the price
        let price = String(product.tempPrice);
        if(!price.match(/^[0-9]*\.?[0-9]*$/) || isNaN(Number(product.tempPrice))) {
          product.tempPrice = "";
          return;
        }

        price = (price.indexOf(".") >= 0) ? (price.substr(0, price.indexOf(".")) + price.substr(price.indexOf("."), 3)) : price;

        product.tempPrice = price;
      }
    },
    /**
     * @description converts number to given decimal points
     * @params price : Number || String
     * @params decimalPoints : Number || default to 2
     */
    addDecimalPoints(price, decimalPoints = 2) {
      price = String(price);

      // for . adding 1 to decimalpoints
      decimalPoints = decimalPoints + 1;

      if(!price) {
        return;
      }

      let indexOfDot = price.indexOf(".");
      if(indexOfDot == -1) {
        price = price+'.00';
      } else {
        price = (indexOfDot >= 0) ? (price.substr(0, indexOfDot) + price.substr(indexOfDot, decimalPoints)) : price;
        
        if(price.substr(indexOfDot).length != decimalPoints) {
          price = price.padEnd(price.length+(decimalPoints - price.substr(indexOfDot).length), "0");
        }
      }

      return price;
    },
    getPosGroupDetails() {
      this.loadingPosGroupDetails = true;

      axios
        .get(`${apiUrl}/PosGroup/PosGroupName`, {
          params: {
            PosGroupId: this.$route.params.id
          }
        })
        .then((res) => {
          this.posGroupDetails = res.data;

          this.items.push({
            text: this.posGroupDetails.posGroup_Name,
            active: true,
          });
        })
        .catch((error) => {
          if (error.response.status === 401) {
            this.$store.dispatch("authapi/logoutauthapi");
            this.$router.push("/login");
          } else if (error.response.status === 400) {
            toastMixin.methods.displayToastAlert(error.response.data, "error");
          } else {
            toastMixin.methods.displayToastAlert(
              this.$i18n.t("alerts.something_went_wrong"),
              "error"
            );
          }
        })
        .finally(() => {
          this.loadingPosGroupDetails = false;
        })
    },
    setMaster(pos_Id) {
      this.posDevices = this.posDevices.map((posDevice) => {
        if(posDevice.pos_Id != pos_Id) {
          posDevice.tempIsMaster = false;
        }

        return posDevice;
      })
    },
    /**
     * @description Check if pos device is synchronized or not
     * @return {Boolean} true - device is synchronized, false - device is not synchronized
     */
    isSynchronized(timestamp) {
      if(!this.latestSyncronizedTimeStamp || !timestamp || timestamp == "0001-01-01T00:00:00" || timestamp == "-") {
        return false;
      }

      return moment.utc(timestamp).format("DD-MMM-YYYY") == moment.utc(this.latestSyncronizedTimeStamp).format("DD-MMM-YYYY");
    }
  },
  mounted() {
    // For paging management
    EventBus.$on("pagingfilterVal", (data) => {
      this.perPage = data;
    });

    // For passing bearer token into the API
    axios.defaults.headers.common = {
      Authorization: `Bearer ${this.$store.state.authapi.user.token}`,
    };

    // For hiding searchbox for POS module
    this.showsearchbox = false;
    EventBus.$emit("showsearchbox", this.showsearchbox);

    // Getting POS Group Details
    this.getPosGroupDetails();

    // For fetching records
    this.getPosDevices();
    this.getProducts();
  },
};
</script>

<style scoped>
.mr-3 {
  margin-right: 8px;
}
</style>
