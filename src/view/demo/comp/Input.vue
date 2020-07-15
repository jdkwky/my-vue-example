<template>
  <input type="text" @input="handleInput" />
</template>

<script>
export default {
  model: {
    prop: "value",
    event: "change"
  },
  props: {
    value: {
      type: String,
      default: ""
    }
  },
  data() {
    return {};
  },
  methods: {
    handleInput(value) {
      const { target } = value || {};
      const realValue = target.value;

      this.$emit("change", realValue);
    }
  }
};
</script>

<style lang="less">
</style>