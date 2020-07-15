<template>
  <div>
    <!-- 打开dialog弹窗  sync-->
    <div>
      <el-button @click="handleOpenDialog">打开.sync弹窗</el-button>
      <Dialog :visible.sync="dialogVisible" />
    </div>

    <!-- v-model -->
    <div>
      <Input v-model="inputValue" />
    </div>
  </div>
</template>

<script>
import Dialog from "./comp/Dialog";
import Input from "./comp/Input";
export default {
  components: { Dialog, Input },
  data() {
    return {
      dialogVisible: false,
      inputValue: ""
    };
  },
  methods: {
    handleOpenDialog() {
      this.dialogVisible = true;
    }
  }
};
</script>

<style lang="less">
</style>