<script>
import appConfig from "@/app.config";

import { notificationMethods } from "@/state/helpers";

export default {
  name: "app",
  page: {
    // All subcomponent titles will be injected into this template.
    titleTemplate(title) {
      title = typeof title === "function" ? title(this.$store) : title;
      return title ? `${title} | ${appConfig.title}` : appConfig.title;
    },
  },
  mounted() {
    // document.querySelector("html").setAttribute('dir', 'rtl')
  },
  watch: {
    /**
     * Clear the alert message on route change
     */
    // eslint-disable-next-line no-unused-vars
    $route(to, from) {
      // clear alert on location change
      this.clearNotification();
    },
  },
  methods: {
    clearNotification: notificationMethods.clear,
  },
};
</script>

<template>
  <div id="app">
    <div class="cloading" v-if="this.$store.state.layout.loaderAPI">
      <lottie-animation
        ref="anim"
        :loop="true"
        :animationData="require('@/assets/animation.json')"
      />
    </div>
    <RouterView />
  </div>
</template>
