<template>
  <div class="test-render">
    <!-- <HRender :level="1">
      我是标题1
    </HRender> -->
    <HRender
      ref="hrender"
      @click="() => {}"
      :parentListeners="$listeners"
      :parentAttrs="$attrs"
      :level="2"
    >
      我是标题2
    </HRender>
    <!-- <HRender :level="3">我是标题3</HRender>
    <HRender :level="4">我是标题4</HRender>
    <HRender :level="5">我是标题5</HRender>
    <HRender :level="6">我是标题6</HRender> -->
  </div>
</template>

<script>
import HRender from "./hRender";
export default {
  data() {
    return {
      test: ""
    };
  },
  components: { HRender },
  watch: {
    test: {
      handler: "watchTest"
    }
  },
  beforeCreate() {
    console.log(this.watchTest, "watchTest", this.$slots, this.$createElement);
  },
  mounted() {
    setTimeout(() => {
      this.test = +new Date();
    }, 10000);
    this.$nextTick(() => {
      this.test = "hhaha";
    });
  },
  methods: {
    watchTest(val, oval) {
      console.log(val, oval, "test");
    }
  }
};
</script>