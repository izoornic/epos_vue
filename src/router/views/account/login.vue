<script>
// import axios from "axios";

import Layout from "../../layouts/auth";
import {
  authMethods,
  authAPIMethods,
  authFackMethods,
  notificationMethods,
} from "@/state/helpers";
import { mapState } from "vuex";

import appConfig from "@/app.config";
import { required, email } from "vuelidate/lib/validators";

/**
 * Login component
 */
export default {
  page: {
    title: "Login",
    meta: [
      {
        name: "description",
        content: appConfig.description,
      },
    ],
  },
  components: {
    Layout,
  },
  data() {
    return {
      // email: "parth.bhatt@gmail.com",
      // password: "SzU9HA^F",
      email: "",
      password: "",
      submitted: false,
      authError: null,
      tryingToLogIn: false,
      isAuthError: false,
    };
  },
  validations: {
    email: {
      required,
      email,
    },
    password: {
      required,
    },
  },
  computed: {
    ...mapState("authfack", ["status"]),
    notification() {
      return this.$store ? this.$store.state.notification : null;
    },
  },
  methods: {
    ...authMethods,
    ...authAPIMethods,
    ...authFackMethods,
    ...notificationMethods,
    // Try to log the user in with the username
    // and password they provided.
    tryToLogIn() {
      this.submitted = true;
      // stop here if form is invalid
      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      } else {
        if (process.env.VUE_APP_DEFAULT_AUTH === "firebase") {
          this.tryingToLogIn = true;
          // Reset the authError if it existed.
          this.authError = null;
          return (
            this.logIn({
              email: this.email,
              password: this.password,
            })
              // eslint-disable-next-line no-unused-vars
              .then((token) => {
                this.tryingToLogIn = false;
                this.isAuthError = false;
                // Redirect to the originally requested page, or to the home page
                this.$router.push(
                  this.$route.query.redirectFrom || {
                    name: "default",
                  }
                );
              })
              .catch((error) => {
                this.tryingToLogIn = false;
                this.authError = error ? error : "";
                this.isAuthError = true;
              })
          );
        } else if (process.env.VUE_APP_DEFAULT_AUTH === "fakebackend") {
          const { email, password } = this;
          if (email && password) {
            this.login({
              email,
              password,
            });
          }
        } else if (process.env.VUE_APP_DEFAULT_AUTH === "authapi") {
          const { email, password } = this;
          if (email && password) {
            this.loginauthapi({
              email,
              password,
            });
          }
        }
      }
    },
  },
  mounted() {},
};
</script>

<template>
  <Layout>
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6 col-xl-5">
        <div class="card overflow-hidden">
          <div class="bg-soft bg-primary">
            <div class="row">
              <div class="col-7">
                <div class="text-primary p-4">
                  <h5 class="text-primary">
                    {{ $t("label.welcome_back") }}
                  </h5>
                  <p>{{ $t("label.sign_in_to_continue") }}</p>
                </div>
              </div>
              <div class="col-5 align-self-end">
                <img
                  src="@/assets/images/profile-img.png"
                  alt
                  class="img-fluid"
                />
              </div>
            </div>
          </div>
          <div class="card-body pt-0">
            <div>
              <router-link to="/">
                <div class="avatar-md profile-user-wid mb-4">
                  <span class="avatar-title rounded-circle bg-light">
                    <img src="@/assets/images/faviconbw.png" alt height="34" />
                  </span>
                </div>
              </router-link>
            </div>
            <b-alert
              v-model="isAuthError"
              variant="danger"
              class="mt-3"
              dismissible
              >{{ authError }}</b-alert
            >
            <div
              v-if="notification.message"
              :class="'alert ' + notification.type"
            >
              {{ notification.message }}
            </div>

            <b-form class="p-2" @submit.prevent="tryToLogIn">
              <b-form-group
                class="mb-3"
                id="input-group-1"
                :label="$t('label.email')"
                label-for="input-1"
              >
                <b-form-input
                  id="input-1"
                  v-model="email"
                  type="text"
                  :placeholder="$t('label.enter_email')"
                  :class="{ 'is-invalid': submitted && $v.email.$error }"
                ></b-form-input>
                <div
                  v-if="submitted && $v.email.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.email.required">
                    {{ $t("validationerror.email_required") }}</span
                  >
                  <span v-if="!$v.email.email">{{
                    $t("validationerror.valid_email")
                  }}</span>
                </div>
              </b-form-group>

              <b-form-group
                class="mb-3"
                id="input-group-2"
                :label="$t('label.password')"
                label-for="input-2"
              >
                <b-form-input
                  id="input-2"
                  v-model="password"
                  type="password"
                  :placeholder="$t('label.enter_password')"
                  :class="{ 'is-invalid': submitted && $v.password.$error }"
                ></b-form-input>
                <div
                  v-if="submitted && !$v.password.required"
                  class="invalid-feedback"
                >
                  {{ $t("validationerror.password_required") }}
                </div>
              </b-form-group>
              <b-form-checkbox
                class="form-check-custom"
                id="customControlInline"
                name="checkbox-1"
                value="accepted"
                unchecked-value="not_accepted"
              >
                {{ $t("label.remember_me") }}
              </b-form-checkbox>
              <div class="mt-3 d-grid">
                <b-button type="submit" variant="primary" class="btn-block">{{
                  $t("action.login")
                }}</b-button>
              </div>
            </b-form>
          </div>
          <!-- end card-body -->
        </div>
        <!-- end card -->

        <div class="mt-5 text-center">
        </div>
        <!-- end row -->
      </div>
      <!-- end col -->
    </div>
    <!-- end row -->
  </Layout>
</template>
