<template>
  <div>
    {{ info.age }}
  </div>
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