<script>
import Layout from '@/router/layouts/main'
import PageHeader from '@/components/page-header'
import appConfig from '@/app.config'

import { required } from 'vuelidate/lib/validators' // decimal
import Multiselect from 'vue-multiselect'
import toastMixin from '@/mixins/sweetAlertMixin'
import priceMixin from '@//mixins/priceMixin'
import { mapActions } from 'vuex'
import Swal from 'sweetalert2'

import {
  layoutMethods,
  layoutComputed,
  ProductMethods,
  POSMethods,
  apiUrl,
} from '@/state/helpers'

import axios from '@/axios'
/**
 * Product-Add/Edit component
 */
export default {
  page: {
    title: 'Create/Edit Product',
    meta: [{ name: 'description', content: appConfig.description }],
  },
  mixins: [priceMixin],
  components: { Layout, PageHeader, Multiselect },

  beforeMount() {
    this.edit = false
    this.changeLoaderValue({
      loader: false,
    })
  },
  async mounted() {
    /**
     * For passing bearer token into the API
     */
    axios.defaults.headers.common = {
      Authorization: `Bearer ${this.$store.state.authapi.user.token}`,
    }

    this.options = [
      {
        poslist: 'POS LIST',
        libs: this.posOptions,
      },
    ]

    var product_id = this.$route.params.id ? this.$route.params.id : ''
    this.form.pos_Id = this.posOptions

    if (product_id != '') {
      this.edit = true

      // // check if product data exist in drafts
      // let draftProduct = null;
      // let draftProducts = this.$store.state.product.draftProducts;

      // if(draftProducts && draftProducts.length > 0) {
      //   draftProduct = draftProducts.find((dp) => {
      //     return dp.product_Id == product_id;
      //   })

      //   if(draftProduct) {
      //     this.draftProduct = {...draftProduct};

      //     delete draftProduct.posGroupPriceForProduct;
      //     draftProduct.measure = draftProduct.Measure;
      //   }
      // }

      // this.form = draftProduct ? draftProduct : { ...this.$store.state.product.product };
      this.form = { ...this.$store.state.product.product }

      if (this.form.image) {
        // generating the preview of existing product image
        this.product_image_preview = `${this.server_product_image_path}/${this.form.image}`
      }

      this.disabled = this.form.ean == null ? true : false
      try {
        this.variant_fields =
          this.$store.state.product.product.variants != ''
            ? JSON.parse(this.$store.state.product.product.variants)
            : []
      } catch (error) {
        console.log('variant parsing error', error)
      }

      // delete this.form.password;
      this.form.Measure = this.form.measure
      delete this.form.pos_Id
      delete this.form.updated_Date
      delete this.form.created_Date
      delete this.form.measure
      delete this.form._rowVariant

      let productItemsUUID = this.$store.state.product.product.product_Id

      if (product_id != productItemsUUID) {
        this.$router.push('/error')
      }

      this.original_product_code =
        this.$store.state.product.product.product_Code
    } else {
      // setting default path to path from which user comes
      this.form.path = this.$route.query?.currentFolder || '/'
    }

    this.getPosGroupByMerchantId()
  },

  data() {
    return {
      title: !this.$route.params.id
        ? `${this.$t('label.product_add')}`
        : `${this.$t('label.product_edit')}`,
      items: [
        {
          text: `${this.$t('label.products')}`,
          href: '/products/list?currentFolder=%2F',
        },
        {
          text: `${this.$t('label.product_list')}`,
          active: false,
          href: '/products/list?currentFolder=%2F',
        },
        {
          text: !this.$route.params.id
            ? `${this.$t('label.product_add')}`
            : `${this.$t('label.product_edit')}`,
          active: true,
        },
      ],

      form: {
        product_Id: '',
        // pos_Id: "",
        product_Code: '',
        product_Name: '',
        unit_Of_Measure: '',
        Measure: false,
        // unit_Price: "",
        ean: '',
        tax_Code: '',
        variants: [],
        upgrades: '',
        path: '',
        revision_Id: '1',
        created_By: '',
        posGroup_Id: '',
        message: '',
        image: '',
      },

      submitted: false,
      edit: false,
      disabledposdropdown: true,

      uomOptions: [
        {
          value: '',
          text: this.$t('label.please_select_uom'),
          disabled: true,
        },
        'Komad',
        'Gram (g)',
        'Metar (m)',
        'Metar Kvadratni (m^2)',
        'Litar (l)',
        'Kilogram (Kg)',
        'Metar Kubni (m^3)',
        'Sat (h)',
      ],
      posOptions: ['Yes', 'No'],
      taxCodeOptions: [
        {
          value: '',
          text: this.$t('label.please_select_tax_code'),
          disabled: true,
        },
        {
          value: 'A',
          text: 'А - Nije u PDV - 0%',
        },
        {
          value: 'Г',
          text: 'Г - 0%',
        },
        {
          value: 'Ђ',
          text: 'Ђ - 20%',
        },
        {
          value: 'Е',
          text: 'Е - 10%',
        },
      ],
      options: [],
      value1: null,
      variant_fields: [],

      selectedoption: 'product',
      eandisabled: false,
      posGroups: [],
      loadingPosGroups: false,
      product_image: null,
      product_image_preview: null,
      product_image_error: null,
      posGroupValidation: {},
      selectAllPosGroups: false,
      server_product_image_path: process.env.VUE_APP_PRODUCT_IMAGE_PATH,
      original_product_code: null,
      originalPogGroupsPrices: [],
      draftProduct: null,
    }
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    selectedoption: function (val, oldval) {
      // console.log(val, oldval);
      if (val == 'product') {
        this.eandisabled = false
        this.form.ean = this.edit ? this.$store.state.product.product.ean : ''
        // this.form.ean = "";
      } else if (val == 'service') {
        this.eandisabled = true
        this.form.ean = null

        this.variant_fields = this.variant_fields.map((x) => {
          return {
            ...x,
            ean: val == 'service' ? null : this.form.ean,
          }
        })
      }
    },
  },

  validations: {
    form: {
      // product_Code: { required },
      product_Name: { required },
      unit_Of_Measure: { required },
      // unit_Price: { required, decimal },
      tax_Code: { required },
      Measure: { required },
    },
  },
  computed: {
    ...layoutComputed,
  },

  methods: {
    ...layoutMethods,
    ...ProductMethods,
    ...POSMethods,
    ...mapActions('product', ['saveProductToDraftsProducts']),

    /**
     * Push the row in form
     */
    AddformData() {
      this.variant_fields.push({ name: '', ean: '' })
    },
    /**
     * Delete the row
     */
    async deleteRow(index) {
      let result = await toastMixin.methods.displayConfirmationAlert(
        this.$t('alerts.delete_confirmation_title'),
        this.$t('alerts.delete_confirmation_text'),
        'warning',
        this.$t('alerts.delete_confirmation_accept_button_text'),
        this.$t('alerts.delete_confirmation_cancel_button_text')
      )

      if (result.value) {
        this.variant_fields.splice(index, 1)
      }
    },

    // eslint-disable-next-line no-unused-vars
    async formSubmit($event, isDraft = false) {
      delete this.form.pos_Id
      this.form.variants = this.variant_fields

      if (this.form.variants) {
        this.form.variants = this.variant_fields.map((x) => {
          return {
            ...x,
            ean: x.ean != '' && x.ean != null ? x.ean : this.form.ean,
          }
        })
      }

      // eslint-disable-next-line no-unreachable
      this.submitted = true
      // stop here if form is invalid
      this.$v.$touch()
      if (this.$v.$invalid) {
        // console.log("error");
      } else {
        this.posGroupValidation = {}

        // check if price exist for select pos groups or not
        for (let i = 0; i < this.posGroups.length; i++) {
          let posGroup = this.posGroups[i]
          if (posGroup.isSelected && !posGroup.price) {
            this.posGroupValidation[posGroup.posGroup_Id] = this.$t(
              'label.pos_group_product_price_required'
            )
          }
        }

        try {
          // focusing the pos group which is required
          if (Object.keys(this.posGroupValidation).length > 0) {
            document
              .getElementById(`pg_${Object.keys(this.posGroupValidation)[0]}`)
              .focus()
            return
          }
        } catch (error) {
          console.log(error)
        }

        this.form = {
          ...this.form,
          created_By: this.$store.state.authapi.user.user_Id,
          merchant_Id: this.$store.state.authapi.user.merchant_Id,
          // unit_Price: parseFloat(this.form.unit_Price),
          variants: JSON.stringify(this.form.variants),
        }

        // console.log("this.form", this.form);
        let payload = {
          requestParam: { ...this.form, draft: isDraft },
          message: !this.edit
            ? this.$t('alerts.record_create_success')
            : isDraft
            ? this.$t('alerts.product_draft_saved')
            : this.$t('alerts.product_updated'),
        }

        // adding / at start of the path if not added by user
        if (
          !payload.requestParam.path ||
          !payload.requestParam.path.startsWith('/')
        ) {
          payload.requestParam.path = '/' + payload.requestParam.path
        }

        // adding / at end of the path if not added by user
        if (
          payload.requestParam.path.length > 1 &&
          !payload.requestParam.path.endsWith('/')
        ) {
          payload.requestParam.path = payload.requestParam.path + '/'
        }

        this.upsertProduct(payload)
      }
    },
    /**
     * @description Insert or Update the product details
     * @param {Object} payload - Product details
     */
    async upsertProduct(payload) {
      this.changeLoaderAPIValue({ loader: true })

      if (this.product_image) {
        // uploading image to the server
        let formData = new FormData()
        formData.append('image', this.product_image)

        await axios
          .post(
            `${apiUrl}/Product/upload?MerchantId=${this.$store.state.authapi.user.merchant_Id}`,
            formData
          )
          .then((res) => {
            let data = res.data

            // retreiving the image path in the server
            if (data && data.dbPath) {
              let filePaths = data.dbPath.split('\\')
              if (filePaths.length > 0) {
                payload.requestParam.image = filePaths[filePaths.length - 1]
              }
            }
          })
          .catch(() => {
            console.log('Something went wrong while uploading product image')
          })
      }

      // deleting existing image of procuct if new image is selected
      if (this.form.image && this.product_image) {
        // deleting old product image
        await axios
          .delete(`${apiUrl}/Product/delete`, {
            params: {
              FileName: this.form.image,
            },
          })
          .then(() => {})
          .catch(() => {
            console.log(
              'Something went wrong while deleting existing product image'
            )
          })
      }

      // removing merchant id from image path if exist
      if (payload.requestParam.image) {
        let paths = payload.requestParam.image.split('/')
        if (paths.length > 1) {
          payload.requestParam.image = paths[paths.length - 1]
        }
      }

      await axios
        .post(`${apiUrl}/Product/upsertProduct`, payload.requestParam)
        .then((res) => {
          if (payload.posgroup == true) {
            this.$router.push({
              name: 'pos-product-list',
              params: { posGroup_Id: payload.requestParam.posGroup_Id },
            })
          } else {
            this.$router.push({
              name: 'product-list',
            })
          }

          if (res.data && res.data.productId) {
            let productId = res.data.productId

            // upsert the product price in the pos groups
            let newProductsPrice = []

            for (let i = 0; i < this.posGroups.length; i++) {
              const posGroup = this.posGroups[i]

              if (posGroup.isSelected) {
                newProductsPrice.push({
                  POSGroup_Id: posGroup.posGroup_Id,
                  Product_Id: productId,
                  Price: isNaN(Number(posGroup.price))
                    ? 0
                    : Number(posGroup.price),
                  IsDeleted: false,
                  draft: payload.requestParam.draft,
                })
              } else {
                // deleting unselected pos groups

                let oringalPrice = this.originalPogGroupsPrices.find((op) => {
                  return op.posGroup_Id == posGroup.posGroup_Id
                })

                if (oringalPrice) {
                  newProductsPrice.push({
                    POSGroup_Id: posGroup.posGroup_Id,
                    Product_Id: productId,
                    Price: oringalPrice.price,
                    IsDeleted: true,
                  })
                }
              }
            }

            if (newProductsPrice.length > 0) {
              // upserting price for pos group if available
              this.updateProductsPriceForPosGroups(newProductsPrice)
                .then(() => {
                  toastMixin.methods.displayToastAlert(
                    payload.message,
                    'success'
                  )
                })
                .catch((error) => {
                  if (error.response.status === 401) {
                    this.$store.dispatch('authapi/logoutauthapi')
                    this.$router.push('/login')
                  } else if (error.response.status === 400) {
                    toastMixin.methods.displayToastAlert(
                      error.response.data,
                      'error'
                    )
                  } else {
                    toastMixin.methods.displayToastAlert(
                      this.$i18n.t('alerts.something_went_wrong'),
                      'error'
                    )
                  }
                })
            } else {
              toastMixin.methods.displayToastAlert(payload.message, 'success')
            }
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            this.$store.dispatch('authapi/logoutauthapi')
            this.$router.push('/login')
          } else if (error.response && error.response.status === 400) {
            toastMixin.methods.displayToastAlert(error.response.data, 'error')
          } else {
            toastMixin.methods.displayToastAlert(
              this.$i18n.t('alerts.something_went_wrong'),
              'error'
            )
          }
        })
        .finally(() => {
          this.changeLoaderAPIValue({ loader: false })
        })
    },
    /**
     * @description Save the product as draft in local products drafts
     */
    async saveAsDraft() {
      if (!this.edit) {
        return
      }

      // not allowing changed serial number product to be saved in the draft
      if (this.original_product_code != this.form.product_Code) {
        await Swal.fire({
          text: this.$t('alerts.product_code_changed'),
          icon: 'error',
          showCancelButton: false,
          confirmButtonColor: '#556ee6',
          confirmButtonText: this.$t('label.ok'),
        })
        return
      }

      let formData = {}
      formData.variants = this.variant_fields

      if (formData.variants) {
        formData.variants = this.variant_fields.map((x) => {
          return {
            ...x,
            ean: x.ean != '' && x.ean != null ? x.ean : this.form.ean,
          }
        })
      }

      this.submitted = true

      formData = {
        ...this.form,
        created_By: this.$store.state.authapi.user.user_Id,
        merchant_Id: this.$store.state.authapi.user.merchant_Id,
        variants: JSON.stringify(formData.variants),
      }

      this.$v.$touch()

      // return if data is invalid
      if (this.$v.$invalid) {
        return
      }

      // showing loader
      this.changeLoaderAPIValue({ loader: true })

      this.validateAndHighlightPosGroup()

      // retreiving the changed product price in the pos groups
      let newProductsPrice = []
      let productId = formData.product_Id

      for (let i = 0; i < this.posGroups.length; i++) {
        const posGroup = this.posGroups[i]

        if (posGroup.isSelected) {
          newProductsPrice.push({
            POSGroup_Id: posGroup.posGroup_Id,
            Product_Id: productId,
            Price: isNaN(Number(posGroup.price)) ? 0 : Number(posGroup.price),
          })
        } else {
          // deleting unselected pos groups

          let oringalPrice = this.originalPogGroupsPrices.find((op) => {
            return op.posGroup_Id == posGroup.posGroup_Id
          })

          if (oringalPrice) {
            newProductsPrice.push({
              POSGroup_Id: posGroup.posGroup_Id,
              Product_Id: productId,
              Price: oringalPrice.price,
              IsDeleted: true,
            })
          }
        }
      }

      // adding / at start of the path if not added by user
      if (!formData.path || !formData.path.startsWith('/')) {
        formData.path = '/' + formData.path
      }

      // adding / at end of the path if not added by user
      if (formData.path.length > 1 && !formData.path.endsWith('/')) {
        formData.path = formData.path + '/'
      }

      formData.posGroupPriceForProduct = newProductsPrice

      this.saveProductToDraftsProducts(formData)
        .then(() => {
          toastMixin.methods.displayToastAlert(
            this.$t('alerts.product_draft_saved'),
            'success'
          )

          this.$router.push({
            name: 'product-list',
          })
        })
        .catch(() => {
          toastMixin.methods.displayToastAlert(
            this.$i18n.t('alerts.something_went_wrong'),
            'error'
          )
        })
        .finally(() => {
          this.changeLoaderAPIValue({ loader: false })
        })
    },
    /**
     * @description Checks if the price for selected pos group exists or not and
     *              highlight the first input for which price not exist
     */
    validateAndHighlightPosGroup() {
      this.posGroupValidation = {}

      // check if price exist for select pos groups or not
      for (let i = 0; i < this.posGroups.length; i++) {
        let posGroup = this.posGroups[i]
        if (posGroup.isSelected && !posGroup.price) {
          this.posGroupValidation[posGroup.posGroup_Id] = this.$t(
            'label.pos_group_product_price_required'
          )
        }
      }

      try {
        // focusing the pos group which is required
        if (Object.keys(this.posGroupValidation).length > 0) {
          document
            .getElementById(`pg_${Object.keys(this.posGroupValidation)[0]}`)
            .focus()
          return
        }
      } catch (error) {
        console.log(error)
      }
    },
    /**
     * @description Update the price for product in pos groups
     * @param {Array} newProductsPrice - Array of Objects of new prices for pos groups
     *
     * For e.g.
     * [
     *   {
     *      POSGroup_Id: Pos Group Id,
     *       Product_Id: Product id,
     *       Price: price,
     *       IsDeleted: true
     *   }
     * ]
     */
    async updateProductsPriceForPosGroups(newProductsPrice) {
      return axios.post(
        `${apiUrl}/PosGroup/UpsertPriceOfPosGroup`,
        newProductsPrice
      )
    },
    /**
     * @description Get list of pos groups
     */
    async getPosGroupByMerchantId() {
      this.loadingPosGroups = true
      await axios
        .get(
          `${apiUrl}/PosGroup/GetPosGroupByMerchant?merchantId=${this.$store.state.authapi.user.merchant_Id}`
        )
        .then(async (response) => {
          let data = response.data
          data = data.map((d) => {
            return {
              ...d,
              isSelected: false,
              price: null,
            }
          })
          this.posGroups = data

          if (this.edit) {
            if (this.draftProduct) {
              // restting pos group price
              this.posGroups = this.posGroups.map((pg) => {
                pg.price = ''
                pg.isSelected = false
                return pg
              })

              // assigning drafted price to the pos group price
              let posGroupPriceForProduct =
                this.draftProduct.posGroupPriceForProduct || []

              for (let k = 0; k < posGroupPriceForProduct.length; k++) {
                let pg = this.posGroups.find((p) => {
                  return p.posGroup_Id == posGroupPriceForProduct[k].POSGroup_Id
                })

                if (pg && posGroupPriceForProduct[k].IsDeleted != true) {
                  pg.price = this.addDecimalPoints(
                    posGroupPriceForProduct[k].Price
                  )
                  pg.isSelected = true
                }
              }
            } else {
              await this.getPosGroupPricesForProduct()
            }
          }
        })
        .catch((error) => {
          if (error.response.status === 401) {
            this.$store.dispatch('authapi/logoutauthapi')
            this.$router.push('/login')
          } else if (error.response.status === 400) {
            toastMixin.methods.displayToastAlert(error.response.data, 'error')
          } else {
            toastMixin.methods.displayToastAlert(
              this.$i18n.t('alerts.something_went_wrong'),
              'error'
            )
          }
        })
        .finally(() => {
          this.loadingPosGroups = false
        })
    },
    /**
     * @description Remove the price from pos group price input box
     */
    removePrice(checked, index) {
      try {
        if (!checked) {
          this.posGroups[index].price = null
          this.selectAllPosGroups = false
        } else {
          let totalSelectedGroups = this.posGroups.reduce((total, posGroup) => {
            return total + (posGroup.isSelected ? 1 : 0)
          }, 0)

          if (totalSelectedGroups == this.posGroups.length) {
            this.selectAllPosGroups = true
          }
        }
      } catch (error) {
        console.log(
          'something went wrong while setting select all pos group flag'
        )
      }
    },
    /**
     * @description Select all the pos group checkboxes
     */
    selectAllPosGroup(checked) {
      let posGroups = [...this.posGroups]
      let newStatus = checked ? true : false

      for (let i = 0; i < posGroups.length; i++) {
        posGroups[i] = {
          ...posGroups[i],
          isSelected: newStatus,
          //price: null
        }
      }

      this.posGroups = posGroups
    },
    /**
     * @description Set the Product image and generate the preview of the file
     */
    setProductImage($event) {
      this.product_image_error = null

      if ($event.target.files.length > 0 && $event.target.files[0]) {
        // validating the file size
        if ($event.target.files[0].size > 1000000) {
          this.product_image_error = 'Image must be of less than 1 MB.'
          return
        }

        this.product_image = $event.target.files[0]
        this.product_image_preview = URL.createObjectURL(this.product_image)
      }
    },
    /**
     * @description Get the pos group prices for the product
     */
    async getPosGroupPricesForProduct() {
      await axios
        .get(`${apiUrl}/PosGroup/GetProducts`, {
          params: {
            ProductId: this.$route.params.id,
          },
        })
        .then((response) => {
          let posGroupsPrices = response.data

          // storing original prices to calculate the removed pos group on update
          this.originalPogGroupsPrices = posGroupsPrices

          for (let i = 0; i < posGroupsPrices.length; i++) {
            // check and set the price and the group as selected
            let posGroupIndex = this.posGroups.findIndex((pg) => {
              return pg.posGroup_Id == posGroupsPrices[i].posGroup_Id
            })

            if (posGroupIndex != -1) {
              this.posGroups[posGroupIndex].price = this.addDecimalPoints(
                posGroupsPrices[i].price
              )
              this.posGroups[posGroupIndex].isSelected = true
            }
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            this.$store.dispatch('authapi/logoutauthapi')
            this.$router.push('/login')
          } else if (error.response && error.response.status === 400) {
            toastMixin.methods.displayToastAlert(error.response.data, 'error')
          } else {
            toastMixin.methods.displayToastAlert(
              this.$t('alerts.something_went_wrong'),
              'error'
            )
          }
        })
    },
    /**
     * @description Validate the price of the pos group and truncate the extra digits
     */
    validatePrice(posGroup) {
      if (posGroup.price) {
        // validating the price
        let price = String(posGroup.price)
        if (
          !price.match(/^[0-9]*\.?[0-9]*$/) ||
          isNaN(Number(posGroup.price))
        ) {
          posGroup.price = price.slice(0, -1)
          return
        }

        price =
          price.indexOf('.') >= 0
            ? price.substr(0, price.indexOf('.')) +
              price.substr(price.indexOf('.'), 3)
            : price

        posGroup.price = price
      }
    },
  },
}
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
              <!-- Hiding the pos group selection when edit page is open  -->
              <div class="mb-3">
                <div class="row">
                  <div class="col-12 col-xs-12 col-sm-12 col-md-7 col-lg-8">
                    <div v-if="loadingPosGroups">
                      <div class="text-center text-danger my-5">
                        <b-spinner
                          class="align-middle"
                          style="margin-right: 5px"
                        ></b-spinner>
                        <strong class="pl-5">{{ $t('label.loading') }}</strong>
                      </div>
                    </div>
                    <div v-if="!loadingPosGroups">
                      <div class="d-flex">
                        <span class="group_header h6">Cene</span>
                        <b-form-checkbox
                          class="mb-3 select_all"
                          checked
                          plain
                          v-model="selectAllPosGroups"
                          @change="selectAllPosGroup($event)"
                        >
                          {{ $t('label.select_all_cash_groups') }}
                        </b-form-checkbox>
                      </div>
                      <div class="row">
                        <div
                          class="col-4 mb-3"
                          v-for="(posGroup, index) in posGroups"
                          :key="posGroup.posGroup_Id"
                        >
                          <div>
                            <div class="form-label d-flex">
                              <b-form-checkbox
                                class="form-check-right"
                                v-model="posGroup.isSelected"
                                plain
                                @change="removePrice($event, index)"
                              >
                                {{ posGroup.posGroup_Name }}
                              </b-form-checkbox>
                            </div>
                            <input
                              class="form-control"
                              type="text"
                              :id="`pg_${posGroup.posGroup_Id}`"
                              v-model="posGroup.price"
                              :disabled="!posGroup.isSelected"
                              :class="{
                                'is-invalid':
                                  submitted &&
                                  posGroupValidation[posGroup.posGroup_Id] !=
                                    null,
                              }"
                              @input="validatePrice(posGroup)"
                            />
                            <div
                              v-if="
                                submitted &&
                                posGroupValidation[posGroup.posGroup_Id] != null
                              "
                              class="invalid-feedback"
                            >
                              <span>{{
                                posGroupValidation[posGroup.posGroup_Id]
                              }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-12 col-xs-12 col-sm-12 col-md-5 col-lg-4">
                    <div
                      class="text-center cursor-pointer"
                      v-if="!product_image && !product_image_preview"
                      @click="$refs.product_image.click()"
                    >
                      <div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          class="image_upload mb-2"
                        >
                          <path
                            d="M19,13a1,1,0,0,0-1,1v.38L16.52,12.9a2.79,2.79,0,0,0-3.93,0l-.7.7L9.41,11.12a2.85,2.85,0,0,0-3.93,0L4,12.6V7A1,1,0,0,1,5,6h7a1,1,0,0,0,0-2H5A3,3,0,0,0,2,7V19a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V14A1,1,0,0,0,19,13ZM5,20a1,1,0,0,1-1-1V15.43l2.9-2.9a.79.79,0,0,1,1.09,0l3.17,3.17,0,0L15.46,20Zm13-1a.89.89,0,0,1-.18.53L13.31,15l.7-.7a.77.77,0,0,1,1.1,0L18,17.21ZM22.71,4.29l-3-3a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,1,1,0,0,0-.33.21l-3,3a1,1,0,0,0,1.42,1.42L18,4.41V10a1,1,0,0,0,2,0V4.41l1.29,1.3a1,1,0,0,0,1.42,0A1,1,0,0,0,22.71,4.29Z"
                            fill="#556ee6"
                            style="stroke: white; stroke-width: 0.7px"
                          />
                        </svg>
                      </div>
                      <span class="image_upload_label">{{
                        $t('label.upload_image')
                      }}</span>
                    </div>
                    <div
                      class="text-center cursor-pointer"
                      v-else
                      @click="$refs.product_image.click()"
                    >
                      <img
                        :src="this.product_image_preview"
                        alt="product image"
                        class="image_upload rounded img-thumbnail mb-2"
                      />
                      <p
                        class="image_upload_label d-flex align-items-center justify-content-center cursor-pointer mb-1"
                      >
                        <i class="mdi mdi-image-edit-outline fs-3 mr-3" />
                        {{ $t('label.edit_image') }}
                      </p>
                    </div>
                    <div
                      class="text-red text-center"
                      v-if="product_image_error != null"
                    >
                      {{ product_image_error }}
                    </div>
                  </div>
                </div>
              </div>
              <input
                type="file"
                ref="product_image"
                hidden
                @change="setProductImage"
                accept="image/*"
              />
              <div class="mb-3">
                <div>
                  <div
                    v-for="(field, index) in variant_fields"
                    :key="field.id"
                    class="row"
                  >
                    <div class="mb-3 col-lg-4">
                      <label for="name">{{ $t('label.variant_name') }}</label>
                      <input
                        id="name"
                        v-model="field.name"
                        type="text"
                        name="untyped-input"
                        class="form-control"
                      />
                    </div>

                    <div class="mb-3 col-lg-4">
                      <label for="subject">{{ $t('label.ean') }}</label>
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
                <label>{{ $t('label.pos_id') }}</label>
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
                  <span v-if="!$v.form.pos_Id.required"
                    >This value is required.</span
                  >
                </div>
              </div>

              <!--              <div class="mb-3">-->
              <!--                <label>{{ $t("label.product_code") }}</label>-->
              <!--                <input-->
              <!--                  v-model="form.product_Code"-->
              <!--                  type="text"-->
              <!--                  class="form-control"-->
              <!--                  :placeholder="$t('label.type_something')"-->
              <!--                  name="product_Code"-->
              <!--                  :class="{-->
              <!--                    'is-invalid': submitted && $v.form.product_Code.$error,-->
              <!--                  }"-->
              <!--                />-->
              <!--                <div-->
              <!--                  v-if="submitted && $v.form.product_Code.$error"-->
              <!--                  class="invalid-feedback"-->
              <!--                >-->
              <!--                  <span v-if="!$v.form.product_Code.required">{{-->
              <!--                    $t("validationerror.value_required")-->
              <!--                  }}</span>-->
              <!--                </div>-->
              <!--              </div>-->

              <div class="mb-3">
                <label>{{ $t('label.product_code') }}</label>
                <input
                  v-model="form.product_Code"
                  type="text"
                  class="form-control"
                  :placeholder="$t('label.type_something')"
                  name="product_Code"
                />
              </div>

              <div class="mb-3">
                <label>{{ $t('label.product_name') }}</label>
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
                    $t('validationerror.value_required')
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
                      $t('validationerror.value_required')
                    }}</span>
                  </div>
                </b-form-group>
              </div>

              <div class="mb-1">
                <b-form-checkbox
                  class="form-check-custom"
                  id="Measure"
                  name="Measure"
                  v-model="form.Measure"
                >
                  {{ $t('label.measure') }}
                </b-form-checkbox>

                <div
                  v-if="submitted && $v.form.Measure.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.form.Measure.required">{{
                    $t('validationerror.value_required')
                  }}</span>
                </div>
              </div>

              <!-- <div class="mb-3">
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
              </div> -->

              <div class="mb-3">
                <label>{{ $t('label.ean') }}</label>
                <input
                  v-model="form.ean"
                  :disabled="eandisabled"
                  type="text"
                  class="form-control"
                  :placeholder="$t('label.type_something')"
                  name="ean"
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
                      $t('validationerror.value_required')
                    }}</span>
                  </div>
                </b-form-group>
              </div>
              <div class="mb-3">
                <label>{{ $t('label.upgrades') }}</label>
                <input
                  v-model="form.upgrades"
                  type="text"
                  class="form-control"
                  :placeholder="$t('label.type_something')"
                  name="upgrades"
                />
              </div>

              <div class="mb-3">
                <label>{{ $t('label.path') }}</label>
                <input
                  v-model="form.path"
                  type="text"
                  class="form-control"
                  :placeholder="$t('label.type_something')"
                  name="path"
                />
              </div>

              <div class="mb-3">
                <label>{{ $t('label.message') }}</label>
                <input
                  v-model="form.message"
                  type="text"
                  class="form-control"
                  :placeholder="$t('label.type_something')"
                  name="message"
                />
              </div>

              <!-- <div class="mb-3" v-if="edit">
                {{ this.$t("alerts.product_image_not_allowed_in_draft") }}
              </div> -->

              <div class="mb-3 mb-0">
                <div>
                  <b-button
                    type="submit"
                    variant="primary"
                    v-tooltip.right="$t('label.show_submit_detail')"
                    >{{ $t('action.submit') }}</b-button
                  >

                  <!-- sending event as null and draft as true to save the product as draft -->
                  <b-button
                    variant="success"
                    class="ms-1"
                    @click="formSubmit(null, true)"
                    v-tooltip.top="$t('label.show_prepare_detail')"
                  >
                    {{ $t('label.prepare') }}
                  </b-button>

                  <router-link
                    :to="{ name: 'product-list' }"
                    class="icon-row-item"
                  >
                    <b-button right variant="secondary" class="ms-1">{{
                      $t('action.cancel')
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
