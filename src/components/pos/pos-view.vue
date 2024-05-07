<script>
import Layout from "@/router/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";

import { required, email, minLength } from "vuelidate/lib/validators";
import { layoutMethods, layoutComputed } from "@/state/helpers";

/**
 * POS-View component
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
  },

  data() {
    return {
      title: !this.$route.params.id ? "Create Merchant" : "View Merchant",
      items: [
        {
          text: "Merchants",
          href: "/",
        },
        {
          text: "Merchant List",
          active: false,
          href: "/merchants/list",
        },
        {
          text: !this.$route.params.id ? "Merchant Add" : "Merchant View",
          active: true,
        },
      ],
      form: {
        merchant_Id: "",
        merchant_Name: "",
        merchant_Address: "",
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
  validations: {
    form: {
      merchant_Name: { required },
      merchant_Address: { required },
      merchant_phone: { required },
      pib: { required },
      userMail: { required, email },
      password: { required, minLength: minLength(6) },
    },
  },
  computed: {
    ...layoutComputed,
  },
  methods: {
    ...layoutMethods,
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
    <!-- <div class="loading">
      <div class="loader"></div>
    </div> -->

    <PageHeader :title="title" :items="items" />
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-7 col-lg-4 mb-5 mb-lg-0 wow fadeIn">
          <div class="card border-0 shadow">
            <img
              src="https://www.bootdey.com/img/Content/avatar/avatar6.png"
              alt="..."
            />
            <div class="card-body p-1-9 p-xl-5">
              <div class="mb-4">
                <h3 class="h4 mb-0">{{ form.merchant_Name }}</h3>
                <span class="text-primary">CEO &amp; Founder</span>
              </div>
              <ul class="list-unstyled mb-4">
                <li class="mb-3">
                  <a href="#!"
                    ><i
                      class="far fa-envelope display-25 me-3 text-secondary"
                    ></i
                    >{{ form.userMail }}</a
                  >
                </li>
                <li class="mb-3">
                  <a href="#!"
                    ><i
                      class="fas fa-mobile-alt display-25 me-3 text-secondary"
                    ></i
                    >{{ form.merchant_phone }}</a
                  >
                </li>
                <li>
                  <a href="#!"
                    ><i
                      class="fas fa-map-marker-alt display-25 me-3 text-secondary"
                    ></i
                    >{{ form.merchant_Address }}</a
                  >
                </li>
              </ul>
              <!-- <ul class="social-icon-style2 ps-0">
                <li>
                  <a href="#!" class="rounded-3"
                    ><i class="fab fa-facebook-f"></i
                  ></a>
                </li>
                <li>
                  <a href="#!" class="rounded-3"
                    ><i class="fab fa-twitter"></i
                  ></a>
                </li>
                <li>
                  <a href="#!" class="rounded-3"
                    ><i class="fab fa-youtube"></i
                  ></a>
                </li>
                <li>
                  <a href="#!" class="rounded-3"
                    ><i class="fab fa-linkedin-in"></i
                  ></a>
                </li>
              </ul> -->
            </div>
          </div>
        </div>
        <div class="col-lg-8">
          <div class="ps-lg-1-6 ps-xl-5">
            <!-- <div class="mb-5 wow fadeIn">
              <div class="text-start mb-1-6 wow fadeIn">
                <h2 class="h1 mb-0 text-primary">#About Me</h2>
              </div>
              <p>
                It is a long established fact that a reader will be distracted
                by the readable content of a page when looking at its layout.
                The point of using Lorem Ipsum is that it has a more-or-less
                normal distribution of letters, as opposed to using 'Content
                here, content here', making it look like readable English. Many
                desktop publishing packages and web page editors now use Lorem
                Ipsum as their default model text, and a search for 'lorem
                ipsum' will uncover many web sites still in their infancy.
              </p>
              <p class="mb-0">
                There are many variations of passages of Lorem Ipsum available,
                but the majority have suffered alteration in some form, by
                injected humour, or randomised words which don't look even
                slightly believable. If you are going to use a passage of Lorem
                Ipsum, you need to be sure there isn't anything embarrassing
                hidden in the middle of text.
              </p>
            </div> -->
            <div class="mb-5 wow fadeIn">
              <div class="text-start mb-1-6 wow fadeIn">
                <h2 class="mb-0 text-primary">#Other Info</h2>
              </div>
              <div class="row mt-n4">
                <div class="col-sm-6 col-xl-4 mt-4">
                  <div class="card text-center border-0 rounded-3">
                    <div class="card-body">
                      <i
                        class="ti-bookmark-alt icon-box medium rounded-3 mb-4"
                      ></i>
                      <h3 class="h5 mb-3">PIB</h3>
                      <p class="mb-0">
                        {{ form.pib }}
                      </p>
                    </div>
                  </div>
                </div>
                <div class="col-sm-6 col-xl-4 mt-4">
                  <div class="card text-center border-0 rounded-3">
                    <div class="card-body">
                      <i
                        class="ti-pencil-alt icon-box medium rounded-3 mb-4"
                      ></i>
                      <h3 class="h5 mb-3">Password</h3>
                      <p class="mb-0">
                        {{ form.password }}
                      </p>
                    </div>
                  </div>
                </div>
                <!-- <div class="col-sm-6 col-xl-4 mt-4">
                  <div class="card text-center border-0 rounded-3">
                    <div class="card-body">
                      <i
                        class="ti-medall-alt icon-box medium rounded-3 mb-4"
                      ></i>
                      <h3 class="h5 mb-3">Experience</h3>
                      <p class="mb-0">
                        About 20 years of experience and professional in signage
                      </p>
                    </div>
                  </div>
                </div> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- end row -->
  </Layout>
</template>
