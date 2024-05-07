<script>
import Layout from '@/router/layouts/main'
import PageHeader from '@/components/page-header'
import appConfig from '@/app.config'

import { ProductMethods } from '@/state/helpers'
import axios from '@/axios'

import { layoutMethods, layoutComputed, apiUrl } from '@/state/helpers'
import toastMixin from '@/mixins/sweetAlertMixin'
import priceMixin from '@/mixins/priceMixin'

import PagingFilter from '@/components/filter/paging-filter'
import pagingFilterMixin from '@/mixins/pagingFilterMixin'
import dateFormatterMixin from '@/mixins/dateFormatterMixin'
import { EventBus } from '@/event-bus'

import moment from 'moment'
import vue2Dropzone from 'vue2-dropzone'
import { required } from 'vuelidate/lib/validators'
import { mapActions } from 'vuex'

/**
 * Products-list component
 */
export default {
  page: {
    // title: `${this.$t("label.product_list")}`,
    meta: [{ name: 'description', content: appConfig.description }],
  },
  components: {
    vueDropzone: vue2Dropzone,
    Layout,
    PageHeader,
    PagingFilter,
  },
  mixins: [toastMixin, pagingFilterMixin, dateFormatterMixin, priceMixin],
  data() {
    return {
      productGridData: [],
      draftItems: [],
      // title: , //`${this.$t("label.product_list")}`
      items: [
        {
          text: `${this.$t('label.products')}`,
          href: '/products/list?currentFolder=%2F',
        },
        {
          text: `${this.$t('label.product_list')}`,
          active: true,
        },
      ],

      isGroupDeleting: false,
      selectAll: true,

      sortBy: 'created_Date',
      sortDesc: true,
      sortDirection: 'desc',
      fields: [
        // {
        //   key: "posName",
        //   label: this.$t("label.pos_id"),
        //   sortable: true,
        // },
        {
          key: 'product_Code',
          label: this.$t('label.product_code'),
          sortable: true,
        },
        {
          key: 'product_Name',
          label: this.$t('label.product_name'),
          sortable: true,
        },
        {
          key: 'measure',
          label: this.$t('label.na_meru'),
          sortable: true,
        },
        {
          key: 'unit_Of_Measure',
          label: this.$t('label.unit_of_measure'),
          sortable: true,
        },

        // {
        //   key: "unit_Price",
        //   label: this.$t("label.unit_price"),
        //   sortable: true,
        //   // eslint-disable-next-line no-unused-vars
        //   formatter: (value, key, item) => {
        //     return new Intl.NumberFormat("en-us", {
        //       style: "currency",
        //       currency: "USD",
        //     })
        //       .format(value)
        //       .replace("$", "")
        //       .trim();
        //   },
        // },
        // {
        //   key: "unit_Type",
        //   label: this.$t("label.unit_type"),
        //   sortable: true,
        // },
        {
          key: 'tax_Code',
          label: this.$t('label.tax_code'),
          sortable: true,
        },
        {
          key: 'ean',
          label: this.$t('label.ean'),
          sortable: true,
          // eslint-disable-next-line no-unused-vars
          formatter: (value, key, item) => {
            return value != null ? value : '-'
          },
        },
        {
          key: 'message',
          label: this.$t('label.message'),
          sortable: true,
        },
        {
          key: 'created_Date',
          label: this.$t('label.created_date'),
          sortable: true,
          // eslint-disable-next-line no-unused-vars
          formatter: (value, key, item) => {
            return moment.utc(value).local().format('DD-MMM-YYYY HH:mm:ss')
          },
        },
        {
          key: 'updated_Date',
          label: this.$t('label.updated_date'),
          sortable: true,
          // eslint-disable-next-line no-unused-vars
          formatter: (value, key, item) => {
            return value == '0001-01-01T00:00:00'
              ? '-'
              : moment.utc(value).local().format('DD-MMM-YYYY HH:mm:ss')
          },
        },
        { key: 'actions', label: this.$t('label.action'), sortable: false },
      ],

      isBusy: false,
      dropzoneOptions: {
        autoProcessQueue: false,
        createImageThumbnails: false,
        disablePreviews: true,
        dictRemoveFile: this.$t('label.remove_file'),
        dictInvalidFileType: this.$t('label.cannot_upload_this_type_of_file'),
        dictFileTooBig:
          this.$t('label.file_size_too_big') +
          ' ({{filesize}}MiB).' +
          this.$t('label.max_filesize') +
          ': {{maxFilesize}}MiB.',

        previewTemplate:
          '<div class="uploaded-image"><span data-dz-name></span><strong class="dz-size" data-dz-size></strong><div class="dz-error-message" data-dz-errormessage></div><div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div></div>',
        // previewsContainer: ".dropzone-previews",
        url: '#',
        // thumbnailWidth: 150,
        maxFilesize: 50,
        queueLimit: 1,
        headers: { 'My-Awesome-Header': 'header value' },
        addRemoveLinks: true,
        uploadMultiple: false,
        maxFiles: 1,
        // acceptedFiles:
        //   "text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        acceptedFiles:
          '.csv, text/csv, application/vnd.ms-excel, application/csv, text/x-csv, application/x-csv, text/comma-separated-values, text/x-comma-separated-values,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        init: function () {
          let _this = this

          // eslint-disable-next-line no-unused-vars
          this.on('addedfile', function (file) {
            if (this.files.length > 1) {
              this.removeFile(this.files[0])
            }
            _this.uploadedFile = true
          })
        },
      },

      form: {
        product_Code: '',
        product_Name: '',
        Measure: false,
        unit_Price: '',
        unit_Of_Measure: '',
        ean: '',
        tax_Code: '',
        variants: '',
        upgrades: '',
        // unit_Type: "",
        path: '',
        message: '',
      },

      isHeaderAvailable: 'yes',
      csv: [],
      commonOptionsAll: [],
      commonOptionsFiltered: [],
      commonOptionsName: [],

      uploadedFileError: true,
      submitted: false,
      forward: false,
      publicPath: process.env.VUE_APP_URL,
      posGroups: [],
      loadingPosGroups: false,
      selectAllPosGroups: false,
      folders: [],
      loadingFolders: false,
      currentFolder: '/',
      loadingPosGroupsPriceForProduct: {},
      posGroupsPricesForProduct: {},
      invalidColumns: {},
    }
  },
  validations: {
    form: {
      //product_Code: {required},
      product_Name: { required },
      unit_Of_Measure: { required },
      Measure: { required },
      unit_Price: { required },
      // unit_Type: { required },
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
    numberOfProductsInDraft: function () {
      if (this.$store.state.product.draftProducts) {
        return this.$store.state.product.draftProducts.length
      } else {
        return 0
      }
    },
    /**
     * Total no. of records
     */
    rows() {
      return this.totalRows
    },
    canGoFolderBack() {
      let url = this.$route.query.currentFolder

      if (url) {
        let numberOfSlash = url.split('/').length - 1

        return numberOfSlash > 1 ? true : false
      } else {
        return false
      }
    },
    title() {
      let currentFolder = this.$route.query.currentFolder

      if (!currentFolder || currentFolder.length <= 1) {
        return this.$t('label.folder_structure')
      } else {
        return `${this.$t('label.folder_structure')} - ${currentFolder.substr(
          1,
          currentFolder.length - 2
        )}`
      }
    },
    showApplyChangesButton() {
      let showButtons = false

      if (this.draftItems && this.draftItems.length > 0) {
        showButtons = true
      }

      return showButtons
    },
  },

  async mounted() {
    /**
     * For paging & searching management
     */
    EventBus.$on('pagingfilterVal', (data) => {
      this.perPage = data
    })

    EventBus.$on('searchfilterVal', (data) => {
      this.search = data
    })

    /**
     * For passing bearer token into the API
     */
    axios.defaults.headers.common = {
      Authorization: `Bearer ${this.$store.state.authapi.user.token}`,
    }
    /**
     * For fetching records
     */
    await this.fetchData()

    this.getPosGroupByMerchantId()

    // setting previous path stored in local
    let currentFolder = localStorage.getItem('currentFolder')

    if (currentFolder) {
      this.currentFolder = currentFolder
    }

    // checking query to avoid additional routing error
    if (!this.$route.query?.currentFolder) {
      this.$router.replace({
        query: {
          currentFolder: currentFolder || '/',
        },
      })
    }

    this.getDraftItems()
  },
  methods: {
    ...ProductMethods,
    ...layoutMethods,
    ...mapActions('product', ['clearDraftProducts']),
    /**
     * @description Publish draft changes and remove the products from draft
     */

    async getDraftItems() {
      try {
        const r = await axios.get(
          `${apiUrl}/Product/getDraftProductsByMerchant?merchantId=${this.$store.state.authapi.user.merchant_Id}`
        )

        this.draftItems = r.data
      } catch (error) {
        console.log(error)
      }
    },

    publishDraftChanges() {
      this.changeLoaderAPIValue({ loader: true })

      axios
        .post(
          `${apiUrl}/Product/PublishUpdate?Merchant_Id=${this.$store.state.authapi.user.merchant_Id}`
        )
        .then(() => {
          toastMixin.methods.displayToastAlert(
            this.$t('alerts.products_in_drafts_updated'),
            'success'
          )
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
        .finally(() => {
          this.draftItems = []
          this.fetchData()
          this.changeLoaderAPIValue({ loader: false })
        })
    },
    cancel() {
      // alert("dd");
      this.$refs['formmodal'].hide()
      this.uploadedFileError = true
      this.forward = false
      this.submitted = false
      this.csv = []
      Object.keys(this.form).forEach((key) => (this.form[key] = ''))
    },
    forwardStep() {
      this.forward = true
      this.validateCsvData()
    },
    async fileAdded(file) {
      this.uploadedFileError = false
      var ext = file.name.substr(file.name.lastIndexOf('.') + 1)
      // var IsImage = false;
      // console.log("ext", ext);
      if (ext === 'xlsx' || ext === 'xls') {
        const XLSX = await import('xlsx')
        // eslint-disable-next-line no-unused-vars
        let prm = new Promise((resolve, reject) => {
          var reader = new FileReader()
          let header = []
          let headerfinal = []
          reader.onload = function (e) {
            var data = e.target.result
            var workbook = XLSX.read(data, { type: 'binary' })
            let sheetName = workbook.SheetNames[0]
            let worksheet = workbook.Sheets[sheetName]

            var range = XLSX.utils.decode_range(worksheet['!ref'])
            var C,
              R = range.s.r /* start in the first row */
            /* walk every column in the range */
            for (R = range.s.r; R <= range.e.r; ++R) {
              header = []
              for (C = range.s.c; C <= range.e.c; ++C) {
                var cell =
                  worksheet[
                    XLSX.utils.encode_cell({ c: C, r: R })
                  ] /* find the cell in the first row */

                // var hdr = "UNKNOWN " + C; // <-- replace with your desired default
                var hdr = '' // <-- replace with your desired default
                // if (cell && cell.t) hdr = XLSX.utils.format_cell(cell);
                if (cell && cell.t) hdr = cell.v
                // // console.log("Row : " + R);
                // // console.log("Column : " + C);
                header.push(hdr)
              }
              // // console.log("hddd", header);
              headerfinal.push(header)
            }
            // // console.log("header final andar che", headerfinal);
            resolve(headerfinal)
          }

          reader.readAsBinaryString(file)

          reader.onerror = function (e) {
            reject(e)
          }
        })
        let _this = this
        await prm
          .then(function (results) {
            // console.log("results", results);
            _this.commonOptionsAll = results
            _this.commonOptionsFiltered = results[0]
          })
          .catch(function (error) {
            console.log(error)
          })
      } else {
        let _this = this
        let prm = new Promise((resolve, reject) => {
          this.$papa.parse(file, {
            // header: true,
            complete(results) {
              resolve(results.data)
            },
            error(err) {
              reject(err)
            },
          })
        })

        await prm
          .then(function (results) {
            // console.log("results", results);
            _this.commonOptionsAll = results
            _this.commonOptionsFiltered = results[0]
          })
          .catch(function (error) {
            console.log(error)
          })
      }
      this.commonOptionsName = []
      this.commonOptionsFiltered = JSON.parse(
        JSON.stringify(this.commonOptionsFiltered)
      )
      // console.log("this.commonOptionsFiltered", this.commonOptionsFiltered);
      let optiondropdowninitial = {
        value: '',
        text: this.$t('label.please_select_column'),
        disabled: false,
      }
      this.commonOptionsName.push(optiondropdowninitial)
      this.commonOptionsFiltered.map((x, index) => {
        let stralphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        let optiondropdown = {
          value: index,
          text: 'Column ' + stralphabet[index] + ' - ' + x,
        }
        this.commonOptionsName.push(optiondropdown)
        // // console.log(x, index, stralphabet[index]);
      })

      // this.commonOptionsName.map((x, index) => {
      //   this.form[Object.keys(this.form)[index]] = index + 1;
      //   // console.log(x, index, Object.keys(this.form)[index]);
      // });

      Object.keys(this.form).forEach((key, index) => {
        this.form[key] =
          this.commonOptionsFiltered[index] != undefined ? index : ''
      })
    },
    // eslint-disable-next-line no-unused-vars
    filerror(error) {
      this.uploadedFileError = true
      this.forward = false
      this.submitted = false
      this.csv = []
      Object.keys(this.form).forEach((key) => (this.form[key] = ''))
    },
    fileremoved() {
      this.uploadedFileError = true
      this.forward = false
      this.submitted = false
      this.csv = []
      Object.keys(this.form).forEach((key) => (this.form[key] = ''))
    },

    /**
     * @description Fetch the products that are having current path as their path
     */
    async fetchData() {
      this.isBusy = !this.isBusy
      let currentFolder = this.$route.query?.currentFolder

      await axios
        .get(
          `${apiUrl}/Product/GetProductByPath?id=${this.$store.state.authapi.user.merchant_Id}&limit=${this.perPage}&page=${this.currentPage}&search=${this.search}&sortBy=${this.sortBy}&sortDirection=${this.sortDirection}&Path=${currentFolder}&Id=${this.$store.state.authapi.user.merchant_Id}`
        )
        .then((response) => {
          var res = JSON.parse(JSON.stringify(response.data))

          // changing the color of row if the details is in the draft.
          try {
            // let draftProducts = this.$store.state.product.draftProducts;
            let products = res.items
            console.log('PRODUCTS: ', products)

            for (let i = 0; i < products.length; i++) {
              // let draftProduct = draftProducts.find((df) => {
              //   return df.product_Id == products[i].product_Id;
              // });

              // if (draftProduct) {
              //   products[i] = {
              //     ...products[i],
              //     variants: draftProduct.variants,
              //     product_Name: draftProduct.product_Name,
              //     unit_Of_Measure: draftProduct.unit_Of_Measure,
              //     measure: draftProduct.Measure,
              //     ean: draftProduct.ean,
              //     tax_Code: draftProduct.tax_Code,
              //     message: draftProduct.message,
              //     path: draftProduct.path,
              //     upgrades: draftProduct.upgrades,
              //     _rowVariant: "success",
              //   };
              // }
              if (products[i].draft) {
                products[i]._rowVariant = 'success'
              }
            }

            this.productGridData = res.items
          } catch (error) {
            console.error(
              'something went wrong while marking the draft product'
            )
          }

          this.totalRows = res.count
          this.isBusy = !this.isBusy
        })
        .catch((error) => {
          this.isBusy = !this.isBusy

          if (error.response != undefined && error.response.status === 401) {
            this.$store.dispatch('authapi/logoutauthapi')
            this.$router.push('/login')
          } else if (
            error.response != undefined &&
            error.response.status === 400
          ) {
            toastMixin.methods.displayToastAlert(error.response.data, 'error')
          } else {
            toastMixin.methods.displayToastAlert(
              this.$t('alerts.something_went_wrong'),
              'error'
            )
          }
        })
    },

    async setselectedproductvieweditdelete(productid, action) {
      var filterObj = this.productGridData.find(function (e) {
        return e.product_Id == productid
      })

      if (action === 'edit') {
        this.$router.push({
          name: 'product-edit',
          params: { id: filterObj.product_Id },
        })

        this.addProduct(filterObj)
      } else if (action === 'delete') {
        let result = await toastMixin.methods.displayConfirmationAlert(
          this.$t('alerts.delete_confirmation_title'),
          this.$t('alerts.delete_confirmation_text'),
          'warning',
          this.$t('alerts.delete_confirmation_accept_button_text'),
          this.$t('alerts.delete_confirmation_cancel_button_text')
        )

        if (result.value) {
          await this.deleteProductData(filterObj.product_Id)
          await this.fetchData()
        }
      } else if (action === 'view') {
        this.$router.push({
          path: `/products/view/${filterObj.product_Id}`,
        })

        this.addProduct(filterObj)
      }
    },

    async deleteAllProducts() {
      let currentFolder = this.$route.query?.currentFolder
      console.log('Current folder:', currentFolder)
      console.log('??', this.$route.query)

      let result = await toastMixin.methods.diplsayThreeOptions(
        this.$t('alerts.delete_confirmation_title'),
        `Obrisaćete sve proizvode iz foldera ${currentFolder}`
      )

      if (result.isConfirmed) {
        await axios
          .delete(
            `${apiUrl}/Product/DeleteByPath?merchantId=${this.$store.state.authapi.user.merchant_Id}&Path=${currentFolder}`
          )
          .then(() => {
            // display a toast with a success message
            toastMixin.methods.displayToastAlert(
              this.$t('Proizvodi su obrisani'),
              'success'
            )
            // refresh the state
            this.fetchData()
          })
          .then(() => {
            this.fetchData()
          })
          .catch((error) => {
            if (error.response != undefined && error.response.status === 401) {
              this.$store.dispatch('authapi/logoutauthapi')
              this.$router.push('/login')
            } else if (
              error.response != undefined &&
              error.response.status === 400
            ) {
              toastMixin.methods.displayToastAlert(error.response.data, 'error')
            } else if (currentFolder === '/') {
              toastMixin.methods.displayToastAlert(
                this.$t('Proizvodi su obrisani'),
                'success'
              )

              this.fetchData()
            } else {
              toastMixin.methods.displayToastAlert(
                this.$t('alerts.something_went_wrong'),
                'error'
              )
            }
          })
      } else if (result.isDenied) {
        await axios
          .delete(
            `${apiUrl}/Product/DeleteByPathAll?merchantId=${this.$store.state.authapi.user.merchant_Id}&Path=${currentFolder}`
          )
          .then(() => {
            // display a toast with a success message
            toastMixin.methods.displayToastAlert(
              this.$t('Proizvodi i folderi su obrisani'),
              'success'
            )
            // change current folder to root folder
            currentFolder = '/'

            // push
            this.$router.push({
              path: '/products/list',
              query: { currentFolder: currentFolder },
            })

            // refresh the state
            this.fetchData()
          })
          .catch((error) => {
            if (error.response != undefined && error.response.status === 401) {
              this.$store.dispatch('authapi/logoutauthapi')
              this.$router.push('/login')
            } else if (
              error.response != undefined &&
              error.response.status === 400
            ) {
              toastMixin.methods.displayToastAlert(error.response.data, 'error')
            } else if (currentFolder === '/') {
              toastMixin.methods.displayToastAlert(
                this.$t('Proizvodi su obrisani'),
                'success'
              )

              this.fetchData()
            } else {
              toastMixin.methods.displayToastAlert(
                this.$t('alerts.something_went_wrong'),
                'error'
              )
            }
          })
      } else {
        return
      }
    },

    async formSubmit(e) {
      this.submitted = true
      // stop here if form is invalid
      this.$v.$touch()

      e.preventDefault()

      // form is invalid so not allow to submit
      if (this.$v.$invalid) {
        return
      } else {
        this.form = JSON.parse(JSON.stringify(this.form))
        // eslint-disable-next-line no-unused-vars
        let _this = this
        // eslint-disable-next-line no-unused-vars
        let tempobj = {}
        let temparr = []

        var i = this.isHeaderAvailable == 'yes' ? 1 : 0
        // let len = 0;
        // for (i; i < this.commonOptionsAll.length; i++) {
        // for (i, len = this.commonOptionsAll.length; i < len; i++) {
        let ii = this.commonOptionsAll.length
        // let i = 0;

        let selectedPosGroups = []

        for (let i = 0; i < this.posGroups.length; i++) {
          let posGroup = this.posGroups[i]
          if (posGroup.isSelected) {
            selectedPosGroups.push(posGroup.posGroup_Id)
          }
        }

        // converting pos group ids array to comma separated pos group ids string
        selectedPosGroups = selectedPosGroups.toString()

        while (i < ii) {
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
          tempobj = {}

          // mapping tax codes
          if (this.commonOptionsAll[i][this.form.tax_Code].toString().trim()) {
            switch (
              this.commonOptionsAll[i][this.form.tax_Code].toString().trim()
            ) {
              case 'A': {
                this.commonOptionsAll[i][this.form.tax_Code] = 'A'
                break
              }
              case 'E': {
                this.commonOptionsAll[i][this.form.tax_Code] = 'Е'
                break
              }
              case 'Đ': {
                this.commonOptionsAll[i][this.form.tax_Code] = 'Ђ'
                break
              }
              case 'G': {
                this.commonOptionsAll[i][this.form.tax_Code] = 'Г'
                break
              }
            }
          }

          tempobj = {
            product_Code:
              this.commonOptionsAll[i][this.form.product_Code] == undefined
                ? ''
                : this.commonOptionsAll[i][this.form.product_Code]
                    .toString()
                    .trim(),
            product_Name:
              this.commonOptionsAll[i][this.form.product_Name] == undefined
                ? ''
                : this.commonOptionsAll[i][this.form.product_Name]
                    .toString()
                    .trim(),
            Price:
              this.commonOptionsAll[i][this.form.unit_Price] == undefined
                ? 0
                : this.commonOptionsAll[i][this.form.unit_Price] || 0,
            unit_Of_Measure:
              this.commonOptionsAll[i][this.form.unit_Of_Measure] == undefined
                ? ''
                : this.commonOptionsAll[i][this.form.unit_Of_Measure]
                    .toString()
                    .trim(),
            Measure:
              this.commonOptionsAll[i][this.form.Measure] == 1 ? true : false,
            ean:
              this.commonOptionsAll[i][this.form.ean] == undefined
                ? ''
                : this.commonOptionsAll[i][this.form.ean].toString().trim(),
            tax_Code:
              this.commonOptionsAll[i][this.form.tax_Code] == undefined
                ? ''
                : this.commonOptionsAll[i][this.form.tax_Code]
                    .toString()
                    .trim(),
            variants:
              this.commonOptionsAll[i][this.form.variants] == undefined
                ? ''
                : this.commonOptionsAll[i][this.form.variants]
                    .toString()
                    .trim(),
            upgrades:
              this.commonOptionsAll[i][this.form.upgrades] == undefined
                ? ''
                : this.commonOptionsAll[i][this.form.upgrades]
                    .toString()
                    .trim(),
            // unit_Type:
            //   this.commonOptionsAll[i][this.form.unit_Type] == undefined
            //     ? ""
            //     : this.commonOptionsAll[i][this.form.unit_Type].toString().trim(),
            path:
              this.commonOptionsAll[i][this.form.path] == undefined
                ? '/'
                : this.addSlashInPath(
                    this.commonOptionsAll[i][this.form.path].toString().trim()
                  ),
            message:
              this.commonOptionsAll[i][this.form.message] == undefined
                ? ''
                : this.commonOptionsAll[i][this.form.message].toString().trim(),
          }

          let keyCount = Object.keys(tempobj).length
          let emptyKeyCount = 0

          for (const key in tempobj) {
            if (key != 'path' && !tempobj[key]) {
              emptyKeyCount++
            }
          }

          if (emptyKeyCount != keyCount - 1) {
            tempobj['PosGroupId'] = selectedPosGroups
            temparr.push(tempobj)
          }

          ++i
        }
        // console.log("temparr", temparr);
        this.csv = temparr

        // required values are not present so not allow user to submit the products
        /*let isCsvDataValid = this.validateCsvData()

        //izbacena provera, da bi neispravne artikle izignorisao
        if (!isCsvDataValid) {
          return
        }*/

        // let tempobj = {};
        // this.csv.map((val, index) => {
        //   // console.log(val, index);
        //   // console.log(Object.keys(this.form)[index]);
        //   tempobj[Object.keys(this.form)[index]] = val;
        // });

        // this.csv = JSON.parse(JSON.stringify(tempobj));

        this.$refs['formmodal'].hide()
        let payloadparam = {
          merchant_Id: this.$store.state.authapi.user.merchant_Id,
          csv_data: this.csv,
        }
        // console.log("payloadparam", payloadparam);

        // eslint-disable-next-line no-unused-vars
        let payload = {
          requestParam: payloadparam,
          message: !this.edit
            ? this.$t('alerts.record_create_success')
            : this.$t('alerts.record_update_success'),
        }
        await this.importProductData(payload)
        this.csv = []
        await this.fetchData()
        this.getFoldersForCurrentPath()
      }
    },
    async getPosGroupByMerchantId() {
      this.loadingPosGroups = true
      await axios
        .get(
          `${apiUrl}/PosGroup/GetPosGroupByMerchant?merchantId=${this.$store.state.authapi.user.merchant_Id}`
        )
        .then((response) => {
          let data = response.data
          data = data.map((d) => {
            return {
              ...d,
              isSelected: false,
            }
          })
          this.posGroups = data
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
    selectAllPosGroup(checked) {
      let posGroups = [...this.posGroups]
      let newStatus = checked ? true : false

      for (let i = 0; i < posGroups.length; i++) {
        posGroups[i] = {
          ...posGroups[i],
          isSelected: newStatus,
        }
      }

      this.posGroups = posGroups
    },
    changeSelectAllPosGroupsFlag(checked) {
      try {
        if (!checked) {
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
    showFolderProducts(path) {
      this.$router.replace({
        query: {
          currentFolder: `${
            this.$route.query.currentFolder
              ? this.$route.query.currentFolder
              : ''
          }${path}/`,
        },
      })
    },
    getBackToFolder() {
      let url = this.$route.query.currentFolder
      if (url) {
        let numberOfSlash = url.split('/').length - 1

        if (numberOfSlash > 1) {
          let secondLastIndexOfSlash = url.lastIndexOf(
            '/',
            url.lastIndexOf('/') - 1
          )
          this.$router.replace({
            query: {
              currentFolder: url.substr(0, secondLastIndexOfSlash + 1),
            },
          })
        }
      }
    },
    clearProductsFromDraft() {
      // clearing products
      this.clearDraftProducts()
      this.fetchData()
      toastMixin.methods.displayToastAlert(
        this.$t('alerts.product_draft_cleared'),
        'success'
      )
    },
    saveDraftProducts() {
      let products = [...this.$store.state.product.draftProducts]
      let posGroupsPricesForProducts = []
      this.changeLoaderAPIValue({ loader: true })

      try {
        products = products.map((p) => {
          posGroupsPricesForProducts = posGroupsPricesForProducts.concat(
            p.posGroupPriceForProduct
          )

          return {
            product_id: p.product_Id,
            product_Code: p.product_Code,
            product_Name: p.product_Name,
            unit_Of_Measure: p.unit_Of_Measure,
            ean: p.ean,
            tax_Code: p.tax_Code,
            variants: p.variants,
            upgrades: p.upgrades || '',
            path: p.path,
            message: p.message,
            measure: p.Measure,
            PosGroupId: p.posGroup_Id,
            image: p.image,
            Price: 0, //  not necesssary
          }
        })
      } catch (error) {
        this.changeLoaderAPIValue({ loader: false })
      }

      axios
        .post(`${apiUrl}/Product/PublishProductUpdate`, {
          merchant_Id: this.$store.state.authapi.user.merchant_Id,
          Products: products,
        })
        .then(async (res) => {
          let updateCount = res.data.updateCount

          // updating the pos group product prices
          await axios
            .post(
              `${apiUrl}/PosGroup/UpsertPriceOfPosGroup`,
              posGroupsPricesForProducts
            )
            .then(() => {
              toastMixin.methods.displayImportAlert(
                this.$t('alerts.products_in_drafts_updated', {
                  number_of_products: updateCount,
                }),
                '',
                'success',
                this.$t('label.ok')
              )
              this.fetchData()
              this.clearDraftProducts()
            })
            .catch(() => {
              toastMixin.methods.displayToastAlert(
                this.$t('alerts.something_went_wrong'),
                'error'
              )
            })
        })
        .catch(() => {
          toastMixin.methods.displayToastAlert(
            this.$t('alerts.something_went_wrong'),
            'error'
          )
        })
        .finally(() => {
          this.changeLoaderAPIValue({ loader: false })
        })
    },
    getFoldersForCurrentPath() {
      this.loadingFolders = true

      let currentFolder = this.$route.query?.currentFolder
      axios
        .get(`${apiUrl}/Product/GetFolderByPath`, {
          params: {
            Path: this.$route.query?.currentFolder || '/',
            Id: this.$store.state.authapi.user.merchant_Id,
          },
        })
        .then((res) => {
          let paths = res.data

          try {
            let folders = []
            this.folders = []

            // removing current path from
            for (let i = 0; i < paths.length; i++) {
              let path = paths[i]
              let folder = path.replace(currentFolder, '').split('/')

              if (folder[0] && !folders.includes(folder[0])) {
                folders.push(folder[0])
              }
            }

            this.folders = folders
          } catch (error) {
            console.log('something went wrong while listing folders')
          }
        })
        .catch(() => {
          console.log('something went wrong while getting folders')
        })
        .finally(() => {
          this.loadingFolders = false
        })
    },
    async getPosGroupPricesForProduct(product_Id, isOpen) {
      if (!isOpen && !this.posGroupsPricesForProduct[product_Id]) {
        this.loadingPosGroupsPriceForProduct = {
          ...this.loadingPosGroupsPriceForProduct,
          [product_Id]: true,
        }

        await axios
          .get(`${apiUrl}/PosGroup/GetProducts`, {
            params: {
              ProductId: product_Id,
            },
          })
          .then((response) => {
            let data = response.data

            data = data.map((pg) => {
              pg.price = this.addDecimalPoints(pg.price)
              return pg
            })

            this.posGroupsPricesForProduct[product_Id] = data
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
          .finally(() => {
            this.loadingPosGroupsPriceForProduct = {
              ...this.loadingPosGroupsPriceForProduct,
              [product_Id]: false,
            }
          })
      }
    },
    addSlashInPath(path) {
      // adding / at start of the path if not added by user
      if (!path || !path.startsWith('/')) {
        path = '/' + path
      }

      // adding / at end of the path if not added by user
      if (path.length > 1 && !path.endsWith('/')) {
        path = path + '/'
      }

      return path
    },
    /**
     * @returns {Boolean} - csv data is valid or not
     */
    validateCsvData() {
      this.invalidColumns = {}
      let totalProducts = this.commonOptionsAll.length
      let products = this.commonOptionsAll
      let temparr = []

      // removing empty rows
      for (let i = 0; i < totalProducts; i++) {
        let tempobj = {
          product_Code:
            products[i][this.form.product_Code] == undefined
              ? ''
              : products[i][this.form.product_Code].toString().trim(),
          product_Name:
            products[i][this.form.product_Name] == undefined
              ? ''
              : products[i][this.form.product_Name].toString().trim(),
          Price:
            products[i][this.form.unit_Price] == undefined
              ? 0
              : products[i][this.form.unit_Price] || 0,
          unit_Of_Measure:
            products[i][this.form.unit_Of_Measure] == undefined
              ? ''
              : products[i][this.form.unit_Of_Measure].toString().trim(),
          Measure: products[i][this.form.Measure] == 1 ? true : false,
          ean:
            products[i][this.form.ean] == undefined
              ? ''
              : products[i][this.form.ean].toString().trim(),
          tax_Code:
            products[i][this.form.tax_Code] == undefined
              ? ''
              : products[i][this.form.tax_Code].toString().trim(),
          variants:
            products[i][this.form.variants] == undefined
              ? ''
              : products[i][this.form.variants].toString().trim(),
          upgrades:
            products[i][this.form.upgrades] == undefined
              ? ''
              : products[i][this.form.upgrades].toString().trim(),
          path:
            products[i][this.form.path] == undefined
              ? '/'
              : this.addSlashInPath(
                  products[i][this.form.path].toString().trim()
                ),
          message:
            products[i][this.form.message] == undefined
              ? ''
              : products[i][this.form.message].toString().trim(),
        }

        let keyCount = Object.keys(tempobj).length
        let emptyKeyCount = 0

        for (const key in tempobj) {
          if (key != 'path' && !tempobj[key]) {
            emptyKeyCount++
          }
        }

        if (emptyKeyCount != keyCount - 1) {
          temparr.push(tempobj)
        }
      }

      // check if required values are there or not
      for (
        let k = this.isHeaderAvailable == 'yes' ? 1 : 0;
        k < temparr.length;
        k++
      ) {
        let product = temparr[k]

        // if (!product["product_Code"]) {
        //   this.invalidColumns["product_Code"] = this.$t(
        //       "validationerror.product_code_missing"
        //   );
        // }

        if (!product['product_Name']) {
          this.invalidColumns['product_Name'] = this.$t(
            'validationerror.product_name_missing'
          )
        }

        if (!product['unit_Of_Measure']) {
          this.invalidColumns['unit_Of_Measure'] = this.$t(
            'validationerror.product_unit_of_measure_missing'
          )
        }

        if (!product['Price']) {
          this.invalidColumns['Price'] = this.$t(
            'validationerror.product_price_missing'
          )
        }

        if (product['Price'] && isNaN(Number(product['Price']))) {
          this.invalidColumns['Price'] = this.$t(
            'validationerror.product_price_invalid'
          )
        }

        if (!product['tax_Code']) {
          this.invalidColumns['tax_Code'] = this.$t(
            'validationerror.product_tax_rate_missing'
          )
        }

        // mapping tax codes
        if (product['tax_Code']) {
          switch (product['tax_Code']) {
            case 'A': {
              product['tax_Code'] = 'A'
              break
            }
            case 'E': {
              product['tax_Code'] = 'Е'
              break
            }
            case 'Đ': {
              product['tax_Code'] = 'Ђ'
              break
            }
            case 'G': {
              product['tax_Code'] = 'Г'
              break
            }
          }
        }

        if (
          product['tax_Code'] &&
          !['A', 'Г', 'Ђ', 'Е'].includes(product['tax_Code'].trim())
        ) {
          this.invalidColumns['tax_Code'] = this.$t(
            'validationerror.product_tax_rate_invalid'
          )
        }
      }

      if (Object.keys(this.invalidColumns).length > 0) {
        return false
      } else {
        return true
      }
    },
  },
  watch: {
    currentPage: {
      handler: function () {
        this.fetchData()
      },
    },
    // eslint-disable-next-line no-unused-vars
    perPage: function (val, oldval) {
      this.totalRows = val
      this.fetchData()
    },

    // eslint-disable-next-line no-unused-vars
    search: function (val, oldval) {
      this.fetchData()
    },
    commonOptionsFiltered: {
      // eslint-disable-next-line no-unused-vars
      handler: function (val, oldVal) {
        // console.log(val + " - " + oldVal);
      },
      deep: true,
    },
    '$route.query.currentFolder': {
      handler: function () {
        if (this.$route.query.currentFolder) {
          if (!axios.defaults.headers.common.Authorization) {
            axios.defaults.headers.common = {
              Authorization: `Bearer ${this.$store.state.authapi.user.token}`,
            }
          }
          this.currentFolder = this.$route.query.currentFolder
          this.getFoldersForCurrentPath()
          this.currentPage = 1
          this.fetchData()
        }
      },
      deep: true,
      immediate: true,
    },
  },
  beforeDestroy() {
    localStorage.setItem('currentFolder', this.currentFolder || '/')
  },
}
</script>

<style>
.form-check {
  padding-left: 0px !important;
}
</style>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="row mb-0">
      <div class="col-xl-8 col-md-7 col-xs-12" style="min-height: 180px">
        <div
          class="text-center text-danger my-2"
          style="position: absolute; left: 0; transform: translate(100%, 50%)"
          v-if="loadingFolders"
        >
          <b-spinner class="align-middle" small></b-spinner>
          <strong class="ml-xs">{{ $t('label.loading') }}</strong>
        </div>
        <div class="d-flex flex-wrap">
          <div
            :class="`back_folder d-inline ${
              canGoFolderBack && !loadingFolders
                ? 'cursor-pointer'
                : 'cursor-not-allowed'
            }`"
            @click="getBackToFolder"
          >
            <b-img-lazy
              :src="require('@/assets/images/back_folder.png')"
              height="55"
            />
          </div>
          <div
            class="folder cursor-pointer"
            v-for="folder in folders"
            :key="folder"
            @click="showFolderProducts(folder)"
          >
            <div v-if="!loadingFolders">
              <b-img-lazy
                :src="require('@/assets/images/folder.png')"
                height="60"
              />
              <div class="folder-label text-truncate">
                <span v-tooltip.bottom="folder"> {{ folder }} </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xl-4 col-md-5 col-xs-12">
        <div class="row mb-2">
          <div class="button-items">
            <router-link
              :to="{
                name: 'product-add',
                query: { currentFolder: this.$route.query.currentFolder },
              }"
              class="icon-row-item"
            >
              <b-button class="float-end w-sm" variant="primary"
                >{{ $t('label.create_new_product') }}
              </b-button>
            </router-link>
            <b-button
              class="float-end w-sm"
              variant="primary"
              v-b-modal.formmodal
              @click="invalidColumns = {}"
              >{{ $t('action.import') }}
            </b-button>
          </div>
        </div>
        <div class="row mb-4" v-if="showApplyChangesButton">
          <div class="button-items">
            <!-- <b-button
              class="float-end w-sm"
              variant="secondary"
              @click="clearProductsFromDraft"
            >
              {{ $t("label.remove_products_from_draft") }}
            </b-button> -->
            <b-button
              class="float-end w-sm save_draft_change_btn"
              variant="success"
              @click="publishDraftChanges"
            >
              {{ $t('label.save_products_of_draft') }}
            </b-button>
          </div>
        </div>
      </div>
    </div>

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
          <div
            style="font-size: 15px !important"
            class="mb-2"
            v-show="!forward"
          >
            {{ $t('label.chooose_pos_group_for_price') }}
          </div>
          <div v-show="!forward">
            <b-form-checkbox
              class="mb-3"
              style="margin-left: 20px"
              checked
              plain
              inline
              v-model="selectAllPosGroups"
              @change="selectAllPosGroup($event)"
            >
              {{ $t('label.select_all_cash_groups') }}
            </b-form-checkbox>
          </div>
          <div v-show="!forward">
            <div class="text-center text-danger my-3" v-if="loadingPosGroups">
              <b-spinner
                class="align-middle"
                style="margin-right: 5px"
              ></b-spinner>
              <strong class="ml-xs">{{ $t('label.loading') }}</strong>
            </div>

            <div
              class="row"
              style="margin: 0px 8px !important"
              v-if="!loadingPosGroups"
            >
              <div
                class="col-4 mb-3"
                v-for="posGroup in posGroups"
                :key="posGroup.posGroup_Id"
              >
                <div>
                  <div class="form-label">
                    <b-form-checkbox
                      v-model="posGroup.isSelected"
                      plain
                      inline
                      @change="changeSelectAllPosGroupsFlag"
                    >
                      {{ posGroup.posGroup_Name }}
                    </b-form-checkbox>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                  >&nbsp;&nbsp;{{ $t('label.yes') }}
                </b-form-radio>
                <b-form-radio
                  v-model="isHeaderAvailable"
                  :aria-describedby="ariaDescribedby"
                  name="some-radios"
                  value="no"
                  >&nbsp;&nbsp;{{ $t('label.no') }}
                </b-form-radio>
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
                <h4>{{ $t('label.drop_files_or_click_upload') }}</h4>
              </div>
            </vue-dropzone>
          </div>

          <div class="mb-3 mb-0" v-if="!uploadedFileError && forward">
            <table class="table">
              <tr v-for="(item, name, index) in form" :key="name">
                <td class="mb-3 form-label">
                  <!-- {{ form }} -->
                  {{ $t('label.' + `${name}`.toLowerCase()) }}
                </td>

                <td>
                  <b-form-group
                    class="mb-3 form-label"
                    id="input-group-1"
                    label-for="formrow-inputState"
                  >
                    <!--                    <b-form-select-->
                    <!--                        v-if="index === 0"-->
                    <!--                        class="form-select"-->
                    <!--                        :placeholder="$t('label.type_something')"-->
                    <!--                        v-model.trim="form.product_Code"-->
                    <!--                        name="product_Code"-->
                    <!--                        :options="commonOptionsName"-->
                    <!--                        @change="validateCsvData"-->
                    <!--                        :class="-->
                    <!--                        $v.form.product_Code.$invalid ||-->
                    <!--                        invalidColumns.product_Code-->
                    <!--                          ? 'is-invalid'-->
                    <!--                          : 'is-valid'-->
                    <!--                      "-->
                    <!--                        :state="-->
                    <!--                        $v.form.product_Code.$dirty ||-->
                    <!--                        invalidColumns.product_Code-->
                    <!--                          ? !$v.form.product_Code.$error-->
                    <!--                          : null-->
                    <!--                      "-->
                    <!--                    ></b-form-select>-->

                    <b-form-select
                      v-if="index === 0"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.product_Code"
                      name="product_Code"
                      :options="commonOptionsName"
                    ></b-form-select>

                    <!-- For now, commenting out this part of code solved the issue  -->

                    <!-- <b-form-select
                      v-if="index === 8"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.upgrades"
                      name="upgrades"
                      :options="commonOptionsName"
                    ></b-form-select> -->

                    <div
                      v-if="index === 0 && invalidColumns.product_Code"
                      class="invalid-feedback"
                    >
                      <span>
                        {{ invalidColumns.product_Code }}
                      </span>
                    </div>
                    <b-form-select
                      v-if="index === 1"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.product_Name"
                      name="product_Name"
                      :options="commonOptionsName"
                      @change="validateCsvData"
                      :class="
                        $v.form.product_Name.$invalid ||
                        invalidColumns.product_Name
                          ? 'is-invalid'
                          : 'is-valid'
                      "
                      :state="
                        $v.form.product_Name.$dirty ||
                        invalidColumns.product_Name
                          ? !$v.form.product_Name.$error
                          : null
                      "
                    ></b-form-select>
                    <div
                      v-if="index === 1 && invalidColumns.product_Name"
                      class="invalid-feedback"
                    >
                      <span>
                        {{ invalidColumns.product_Name }}
                      </span>
                    </div>
                    <b-form-select
                      v-if="index === 2"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.Measure"
                      name="Unit_Of_Measure"
                      :options="commonOptionsName"
                      :class="
                        $v.form.Measure.$invalid ? 'is-invalid' : 'is-valid'
                      "
                      :state="
                        $v.form.Measure.$dirty ? !$v.form.Measure.$error : null
                      "
                    ></b-form-select>
                    <b-form-select
                      v-if="index === 3"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.unit_Price"
                      name="Measure"
                      :options="commonOptionsName"
                      @change="validateCsvData"
                      :class="
                        $v.form.unit_Price.$invalid || invalidColumns.Price
                          ? 'is-invalid'
                          : 'is-valid'
                      "
                      :state="
                        $v.form.unit_Price.$dirty || invalidColumns.Price
                          ? !$v.form.unit_Price.$error
                          : null
                      "
                    ></b-form-select>
                    <div
                      v-if="index === 3 && invalidColumns.Price"
                      class="invalid-feedback"
                    >
                      <span>
                        {{ invalidColumns.Price }}
                      </span>
                    </div>
                    <b-form-select
                      v-if="index === 4"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.unit_Of_Measure"
                      name="unit_Of_Measure"
                      :options="commonOptionsName"
                      @change="validateCsvData"
                      :class="
                        $v.form.unit_Of_Measure.$invalid ||
                        invalidColumns.unit_Of_Measure
                          ? 'is-invalid'
                          : 'is-valid'
                      "
                      :state="
                        $v.form.unit_Of_Measure.$dirty ||
                        invalidColumns.unit_Of_Measure
                          ? !$v.form.unit_Of_Measure.$error
                          : null
                      "
                    ></b-form-select>
                    <div
                      v-if="index === 4 && invalidColumns.unit_Of_Measure"
                      class="invalid-feedback"
                    >
                      <span>
                        {{ invalidColumns.unit_Of_Measure }}
                      </span>
                    </div>

                    <b-form-select
                      v-if="index === 5"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.ean"
                      name="ean"
                      :options="commonOptionsName"
                    ></b-form-select>
                    <b-form-select
                      v-if="index === 6"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.tax_Code"
                      name="tax_Code"
                      :options="commonOptionsName"
                      @change="validateCsvData"
                      :class="
                        $v.form.tax_Code.$invalid || invalidColumns.tax_Code
                          ? 'is-invalid'
                          : 'is-valid'
                      "
                      :state="
                        $v.form.tax_Code.$dirty || invalidColumns.tax_Code
                          ? !$v.form.tax_Code.$error
                          : null
                      "
                    ></b-form-select>
                    <div
                      v-if="index === 6 && invalidColumns.tax_Code"
                      class="invalid-feedback"
                    >
                      <span>
                        {{ invalidColumns.tax_Code }}
                      </span>
                    </div>
                    <b-form-select
                      v-if="index === 7"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.variants"
                      name="variants"
                      :options="commonOptionsName"
                    ></b-form-select>
                    <b-form-select
                      v-if="index === 8"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.upgrades"
                      name="upgrades"
                      :options="commonOptionsName"
                    ></b-form-select>

                    <b-form-select
                      v-if="index === 9"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.path"
                      name="path"
                      :options="commonOptionsName"
                    ></b-form-select>
                    <b-form-select
                      v-if="index === 10"
                      class="form-select"
                      :placeholder="$t('label.type_something')"
                      v-model.trim="form.message"
                      name="message"
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
                >{{ $t('action.forward') }}
              </b-button>
              <b-button type="submit" variant="primary" v-show="forward"
                >{{ $t('action.submit') }}
              </b-button>

              <b-button right variant="secondary" @click="cancel" class="ms-1"
                >{{ $t('action.cancel') }}
              </b-button>
              <a
                :href="`${publicPath}files/Demo.xlsx`"
                class="btn btn-primary ms-1"
              >
                <i
                  class="glyphicon glyphicon-floppy-disk"
                  aria-hidden="true"
                ></i>
                {{ $t('action.download_sample_xls') }}
              </a>
            </div>
          </div>
        </form>
      </div>
    </b-modal>

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div style="margin-top: 15px; margin-right: 10px">
            <b-button
              class="float-end w-sm"
              @click="deleteAllProducts"
              style="background-color: #f46a6a"
              >Obriši Proizvode
            </b-button>
          </div>

          <div class="card-body">
            <PagingFilter />
            <!-- Table -->
            <div class="table-responsive mb-0">
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
                    <strong class="ml-xs">{{ $t('label.loading') }}</strong>
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
                <template #cell(measure)="row">
                  <span>
                    {{
                      row.item.measure === true
                        ? $t('label.yes')
                        : $t('label.no')
                    }}
                  </span>
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
                <template #cell(actions)="row">
                  <!-- {{ row }} -->

                  <ul
                    class="list-inline font-size-20 contact-links mb-0 d-flex align-items-center"
                    style="min-width: 110px"
                  >
                    <li class="list-inline-item">
                      <i
                        :class="`${
                          row.detailsShowing
                            ? 'mdi mdi-chevron-up expand_icon'
                            : 'mdi mdi-chevron-down expand_icon'
                        }`"
                        @click="
                          row.toggleDetails()
                          getPosGroupPricesForProduct(
                            row.item.product_Id,
                            row.detailsShowing
                          )
                        "
                        style="font-size: 25px"
                      ></i>
                    </li>
                    <!-- <li class="list-inline-item px-1">
                      <a
                        v-tooltip.top="$t('label.view')"
                        role="button"
                        @click="
                          setselectedproductvieweditdelete(
                            row.item.product_Id,
                            'view'
                          )
                        "
                      >
                        <i class="far fa-eye fa-xs"></i>
                      </a>
                    </li> -->

                    <li class="list-inline-item px-1">
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
                    <li class="list-inline-item px-1">
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
                  </ul>
                </template>

                <template #row-details="row">
                  <div
                    class="my-4 d-flex align-items-center justify-content-center"
                    v-if="loadingPosGroupsPriceForProduct[row.item.product_Id]"
                  >
                    <div
                      class="spinner-border text-primary"
                      style="width: 25px; height: 25px"
                    ></div>
                    <span class="mx-2 text" style="font-size: 13px">{{
                      $t('label.loading_prices')
                    }}</span>
                  </div>
                  <b-card
                    class="shadow-none expansion_item"
                    :style="{
                      backgroundColor: row.item.draft ? '#d6f3e9' : '',
                    }"
                    v-if="!loadingPosGroupsPriceForProduct[row.item.product_Id]"
                  >
                    <b-row class="mb-2">
                      <b-col class="text-sm-right price_title"> Cene</b-col>
                    </b-row>

                    <b-row
                      v-if="
                        posGroupsPricesForProduct[row.item.product_Id] &&
                        posGroupsPricesForProduct[row.item.product_Id].length ==
                          0
                      "
                    >
                      <b-col sm="12" class="mb-3">
                        {{ $t('label.product_pos_groups_not_found') }}
                      </b-col>
                    </b-row>

                    <b-row class="m-0">
                      <b-col
                        xl="3"
                        lg="3"
                        md="3"
                        sm="4"
                        xs="6"
                        v-for="posGroup in posGroupsPricesForProduct[
                          row.item.product_Id
                        ]"
                        :key="posGroup.id"
                        style="margin: 0px; padding: 0px"
                      >
                        <div
                          :style="{
                            border: row.item.draft
                              ? '1px solid #3CB371'
                              : '1px solid lightgray',
                          }"
                          style="
                            margin-bottom: 15px;
                            padding: 8px 5px;
                            margin-right: 20px;
                          "
                        >
                          <div class="row">
                            <div class="col-6">
                              <p
                                class="text-truncate mb-0"
                                v-tooltip.bottom="posGroup.posGroup_Name"
                              >
                                {{ posGroup.posGroup_Name }}
                              </p>
                            </div>
                            <div class="col-6">
                              <p style="text-align: right" class="mb-0">
                                {{ posGroup.price }}
                              </p>
                            </div>
                          </div>
                        </div>
                      </b-col>
                    </b-row>

                    <!-- <b-button size="md" variant="secondary"  @click="row.toggleDetails">{{ $t("label.hide_prices") }}</b-button> -->
                  </b-card>
                </template>
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

<style>
.dz-error-message {
  color: red;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-not-allowed {
  cursor: not-allowed;
  opacity: 0.5;
}

.back_folder {
  height: 70px;
  width: 80px;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  display: inline;
}

.mr-sm {
  margin-right: 15px;
}

.ml-xs {
  margin-left: 5px;
}

.folder {
  text-align: center;
  width: 80px;
  margin-right: 15px;
}

.folder-label {
  margin-top: -8px;
  padding-bottom: 10px;
}

.save_draft_change_btn {
  background-color: #d6f3e9 !important;
  color: black !important;
}

.expand_icon {
  transition: 0.3s;
}

.full-width {
  width: 100%;
}

.expansion_item {
  margin-bottom: 5px !important;
}

.expansion_item .card-body {
  padding: 0px !important;
}

.price_title {
  font-size: 14px !important;
  font-weight: 600 !important;
}

.b-table-details.table-success td {
  background-color: #d6f3e9 !important;
}
</style>
