<script>
import { layoutComputed } from "@/state/helpers";
import Vertical from "./vertical";
// import Horizontal from "./horizontal";

export default {
  components: {
    Vertical,
    // Horizontal,
  },
  data() {
    return {};
  },
  computed: {
    ...layoutComputed,
  },
  methods: {},
  mounted() {
    // document.querySelector("html").setAttribute('dir', 'rtl');
  },
};
</script>

<template>
  <div>
    <Vertical v-if="layoutType === 'vertical'" :layout="layoutType">
      <slot />
    </Vertical>

    <Horizontal v-if="layoutType === 'horizontal'" :layout="layoutType">
      <slot />
    </Horizontal>
  </div>
</template>
