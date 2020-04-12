<template>
  <div class="test-wrap">
    <Index test="index" @click="handleClick" :visible="true" />
  </div>
</template>

<script>
import Index from "./Index.vue";
export default {
  data() {
    return {
      wrap: "wrpa"
    };
  },
  components: { Index },
  methods: {
    handleClick() {
      console.log(this.wrap, "click");
    }
  }
};
</script>