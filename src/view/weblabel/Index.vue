<template>
  <div class="canvas-draw"> 
    <div>
      <span 
        v-for="item in tools"
        :key="item.name"
        :class="{'tool':true ,'checked': item.name == currentTool}"
        @click="handleToolClick(item)"
      >{{ item.name }}</span>
    </div>
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
      currentTool:'',
      tools: [{
        name: 'rectLayer',
        type: 'layer'
      },{
        name: 'drag',
      }]
    };
  },
  mounted() {
    const weblabel = new WebLabel({
      wrapId: "canvasWrap",
      imgLayer: new ImgLayer({
        url: require("../../assets/timg.jpeg"),
      }),
      paintLayers: ["rectLayer"],
      paintTools:{
        zoom: true,
        drag: true
      }
    });

    this.weblabel = weblabel;
  },
  methods: {
    handleChangeRect() {
      this.weblabel.currentLayerName = "rectLayer";
    },
    handleToolClick(item){
      const { type,name } = item || {};
      if(type){
        this.weblabel.currentLayerName = name;
      }else{
        this.weblabel[name] = true;
      }
      this.currentTool = name;
    }
  },
};
</script>

<style >
#canvasWrap {
  width: 1000px;
  height: 500px;
  background: aquamarine;
  overflow: hidden;
}

.canvas-draw .tool {
  border: 1px solid transparent;
}
.canvas-draw .checked{
  border-color: red;
}
</style>

