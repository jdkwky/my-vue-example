<template>
  <div>
    <el-button @click="handleChangeRect">绘制矩形</el-button>
    <div id="canvasWrap"></div>
  </div>
</template>
<script>
import WebLabel from "./WebLabel";
import ImgLayer from "./ImgLayer";

export default {
  data() {
    return {
      weblabel: "",
    };
  },
  mounted() {
    const weblabel = new WebLabel({
      wrapId: "canvasWrap",
      imgLayer: new ImgLayer({
        url: require("../../assets/timg.jpeg"),
      }),
      paintTools: ["rectLayer"],
    });

    this.weblabel = weblabel;
  },
  methods: {
    handleChangeRect() {
      this.weblabel.currentLayerName = "rectLayer";
    },
  },
};
</script>

<style>
#canvasWrap {
  width: 1000px;
  height: 500px;
  background: aquamarine;
  overflow: hidden;
}
</style>
