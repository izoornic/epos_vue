<script>
export default {
  components: {},
  props: {
    title: {
      type: String,
      default: '',
    },
    items: {
      type: Array,
      default: () => {
        return []
      },
    },
    action_button: {
      type: Object,
      default: () => {
        return {
          display: false,
          title: "",
        }
      }
    }
  },
}
</script>

<template>
  <!-- start page title -->
  <div class="row">
    <div class="col-12">
      <div class="page-title-box d-flex align-items-center justify-content-between">
        <h4 class="mb-0 font-size-18">{{ title }}</h4>

        <div class="page-title-right">
          <b-breadcrumb :items="items" class="m-0"></b-breadcrumb>
        </div>

        <input
          v-if="action_button.display"
          type="button"
          class="btn btn-primary btn-block"
          :value="action_button.title"
          @click="$emit('action_button_clicked')"
        />
      </div>
    </div>
  </div>
  <!-- end page title -->
</template>
