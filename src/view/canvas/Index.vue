<template>
  <div>
    <div>
      <el-select v-model="value" placeholder="请选择" @change="handleChange">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
    <div class="logo" ref="canvasWrap"></div>
  </div>
</template>

<script>
import Brush from "./index";
// import imgData from '../../assets/logo.png'
export default {
  data() {
    return {
      value: "rect",
      posList: [],
      options: [
        {
          value: "polygon",
          name: "多边形"
        },
        {
          value: "rect",
          name: "矩形"
        },
        {
          value: "line",
          name: "线"
        },
        {
          value: "arrow",
          name: "箭头"
        }
      ],
      brush: ""
    };
  },
  mounted() {
    this.brush = new Brush({
      imageOptions: {
        imageUrl: require("../../assets/timg.jpeg")
      },
      el: this.$refs.canvasWrap
    });
  },
  methods: {
    handleChange() {
      this.brush.changeDrawType(this.value);
    }
  }
};
</script>


<style>
.logo {
  background: rgba(0, 0, 0, 0.5);
}
</style>

