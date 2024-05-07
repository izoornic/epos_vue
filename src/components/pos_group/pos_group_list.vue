<template>
  <Layout>
    <PageHeader
      :title="title"
      :items="[]"
      :action_button="{
        display: true,
        title: $t('label.pos_group_add'),
      }"
      @action_button_clicked="addEmptyPosGroup"
    />

    <div id="pos_group_container" @click="closeAllEditInputs">
    <div class="row">
      <div
        class="col-12 col-sm-4 col-md-3"
        style="cursor: pointer; height: fit-content;"
        v-for="(posGroup, index) in posGroups"
        :key="posGroup.posGroup_Id"
        @click.stop="gotoView(posGroup.posGroup_Id)"
      >
        <div class="card"> 
          <div class="card-body pb-0">
            <h5
              class="
                card-title
                d-flex
                align-items-center
                justify-content-between
                pb-1
              "
              v-if="!posGroup.isEditOpen"
            >
              <span class="text-info text-truncate" v-tooltip.bottom="posGroup.posGroup_Name">{{ posGroup.posGroup_Name }}</span>
              <div style="min-width: 60px !important; text-align: right;">
                <i
                  class="mdi mdi-square-edit-outline fs-2"
                  v-tooltip.bottom="$t('label.edit')"
                  @click.stop="openEditInput(posGroup, index)"
                ></i>
                <i
                  class="mdi mdi-delete-forever fs-2"
                  v-if="posGroup.count == 0"
                  @click.stop="displayDeleteConfirmation(posGroup, index)"
                  v-tooltip.bottom="$t('label.delete')"
                ></i>
              </div>
            </h5>
            <div v-else class="input-group">
              <input
                type="text"
                class="form-control"
                :placeholder="$t('label.pos_group_add_placeholder')"
                v-model="posGroup.tempName"
                @click.stop=""
                @keydown.enter="upsertPosGroup(posGroup)"
              />
              <button
                type="button"
                id="inputGroupFileAddon04"
                class="btn"
                :class="{
                  'bg-secondary': !posGroup.tempName,
                  'bg-success': posGroup.tempName,
                }"
                :disabled="!posGroup.tempName"
                v-tooltip.bottom="$t('label.edit')"
                @click.stop="upsertPosGroup(posGroup)"
              >
                <i class="mdi mdi-check text-white" />
              </button>
            </div>
            <hr />
            <h5 class="d-flex align-items-center justify-content-center">
              <span class="fs-1">{{ posGroup.count }}</span>
              <img
                src="@/assets/images/pos.png"
                alt="pos device"
                class="avatar-sm"
              />
            </h5>
          </div>
        </div>
      </div>
      <div class="text-center text-danger my-3" v-if="loadingPosGroups">
        <b-spinner class="align-middle" style="margin-right: 5px"></b-spinner>
        <strong class="pl-5">{{ $t("label.loading") }}</strong>
      </div>
      <div
        class="col-12 align-self-center"
        v-if="!loadingPosGroups && posGroups.length == 0"
      >
        <lottie-animation
          ref="anim"
          style="height: 400px"
          :loop="true"
          :animationData="require('@/assets/no-data.json')"
        />
      </div>
    </div>
    </div>
  </Layout>
</template>

<script>
import Layout from "@/router/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Vue from "vue";
import axios from "@/axios";
import { layoutMethods, layoutComputed, apiUrl } from "@/state/helpers";
import toastMixin from "@/mixins/sweetAlertMixin";
import { mapActions } from "vuex";

export default {
  page: {
    // title: "POS Group List",
    meta: [{ name: "pos group", content: appConfig.description }],
  },
  components: { Layout, PageHeader },
  mixins: [toastMixin],
  data() {
    return {
      title: `${this.$t("label.pos_group_list")}`,
      posGroups: [],
      loadingPosGroups: false,
      deleteItemIndex: null,
    };
  },
  computed: {
    ...layoutComputed,
  },
  methods: {
    ...layoutMethods,
    ...mapActions("authapi", ["logoutauthapi"]),
    /**
     * @description Get the Pos Groups List
     */
    async getPosGroupByMerchantId() {
      this.loadingPosGroups = true;
      await axios
        .get(
          `${apiUrl}/PosGroup/GetPosGroupByMerchant?merchantId=${this.$store.state.authapi.user.merchant_Id}`
        )
        .then((response) => {
          let data = response.data;
          data = data.map((d) => {
            d.isEditOpen = false;
            d.tempName = "";
            return d;
          });
          this.posGroups = data;
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
          this.loadingPosGroups = false;
        });
    },
    /**
     * @description  Insert, Update And Delete POS Group
     * @param {Object} posGroup - POS Group details
     * @param {Boolean} isDelete - true => when want to delete the pos group, false => when want to insert or update the pos group details
     */
    async upsertPosGroup(posGroup, isDelete = false) {
      let formData = { ...posGroup, posGroup_Name: !isDelete && posGroup.tempName ? posGroup.tempName :  posGroup.posGroup_Name };
      const is_add = !posGroup.posGroup_Id;

      this.changeLoaderAPIValue({ loader: true });

      await axios
        .post(`${apiUrl}/PosGroup/UpsertPosGroup`, {
          POSGroup_Id: formData.posGroup_Id,
          POSGroup_Name: formData.posGroup_Name,
          Merchant_Id: this.$store.state.authapi.user.merchant_Id,
          IsDeleted: formData.IsDeleted,
        })
        .then((response) => {
          let data = response.data;

          posGroup.posGroup_Name = formData.posGroup_Name;
          if(is_add) {
            posGroup.posGroup_Id = data.posgroupId;
          }
          posGroup.isEditOpen = false;

          // removing the deleted pos group from the pos group array
          if(isDelete) {
            if(this.deleteItemIndex != null) {
              if(this.posGroups[this.deleteItemIndex]) {
                this.posGroups.splice(this.deleteItemIndex, 1);
              } 
            }
            this.deleteItemIndex = null;
            toastMixin.methods.displayToastAlert(this.$t('alerts.pos_group_deleted_successfully'), "success");  
          } else {
            toastMixin.methods.displayToastAlert(is_add ? this.$t('alerts.pos_group_created') : this.$t('alerts.pos_group_updated'), "success");
          }
          
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
     * @description Add Empty POS group Object into the POS group Array with default value
     */
    addEmptyPosGroup() {
      this.posGroups.push({
        posGroup_Id: null,
        posGroup_Name: "",
        Merchant_Id: this.$store.state.authapi.user.merchant_Id,
        IsDeleted: false,
        count: 0,
        isEditOpen: true,
        tempName: ""
      });
    },
    /**
     * @description Display the delete confirmation and delete the POS Group if confirmed
     */
    async displayDeleteConfirmation(posGroup, index) {
      if(posGroup.posGroup_Id) {
        this.deleteItemIndex = index;
        let result = await toastMixin.methods.displayConfirmationAlert(
          this.$t("alerts.pos_group_delete_confirmation_text"),
          "",
          "warning",
          this.$t("alerts.yes"),
          this.$t("alerts.no")
        );

        if (result.value) {
          posGroup.IsDeleted = true;
          this.upsertPosGroup(posGroup, true);
          // await this.deleteProductData(filterObj.product_Id);
        }
      } else {
        if(this.posGroups[index]) {
          this.posGroups.splice(index, 1);
        }
      }
    },
    /**
     * @description Display the input box for editing POS Group name
     */
    openEditInput(posGroup, index) {
      for (let i = 0; i < this.posGroups.length; i++) {
        if(i != index) {
          this.posGroups[i].isEditOpen = false;
          this.posGroups[i].tempName = "";
        }
      }
      Vue.set(this.posGroups, index, {...posGroup, tempName: posGroup.posGroup_Name, isEditOpen: true })
    },
    /**
     * @description Close the edit POS Group name input box 
     */
    closeEditInput(posGroup) {
      posGroup.tempName = "";
      posGroup.isEditOpen = false
    },
    /**
     * @description Open the POS Group View Page
     */
    gotoView(posGroup_Id) {
      if(posGroup_Id) {
        this.$router.push({ path: `/pos-group/view/${posGroup_Id}`, replace: true });
      }
    },
    /**
     * @description Close all the edit POS Group name input boxes
     */
    closeAllEditInputs() {
      for (let i = 0; i < this.posGroups.length; i++) {
        this.posGroups[i].isEditOpen = false;
        this.posGroups[i].tempName = "";
      }
    }
  },
  mounted() {
    // For passing bearer token into the API
    axios.defaults.headers.common = {
      Authorization: `Bearer ${this.$store.state.authapi.user.token}`,
    };

    // getting pos groups
    this.getPosGroupByMerchantId();
  },
};
</script>

<style>
.h-tooltip {
  z-index: 9999 !important;
}

@media only screen and (min-width: 768px) {
  #pos_group_container {
    min-height: calc(100vh - 220px);
  }
}
</style>