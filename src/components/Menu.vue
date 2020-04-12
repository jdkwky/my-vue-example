<template>
  <div class="menu">
    <el-menu
      class="el-menu-demo"
      mode="vertical"
      background-color="#545c64"
      text-color="#fff"
      :router="true"
      :default-active="activeIndex"
      active-text-color="#ffd04b"
    >
      <template v-for="item in menus">
        <el-menu-item
          v-if="!item.children || (item.children && item.children.length == 0)"
          :key="item.path"
          :index="item.path"
          >{{ item.name }}</el-menu-item
        >
        <el-submenu :key="item.path" v-else :index="item.path">
          <template slot="title">{{ item.name }}</template>
          <el-menu-item
            v-for="subItem in item.children"
            :key="subItem.path"
            :index="subItem.path"
          >
            {{ subItem.name }}
          </el-menu-item>
        </el-submenu>
      </template>
    </el-menu>
  </div>
</template>

<script>
import menus from "../router/router";
export default {
  data() {
    return {
      menus,
      activeIndex: ""
    };
  },
  watch: {
    "$route.path": function(nv) {
      this.activeIndex = nv;
    }
  },
  mounted() {
    this.activeIndex = this.$route.path;
  }
};
</script>