<template>
  <p>
    <slot></slot>
  </p>
</template>

<script>
export default {
  props: {
    info: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {};
  }
};
</script>