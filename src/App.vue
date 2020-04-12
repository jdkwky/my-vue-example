<template>
  <div id="app" class="app-main">
    <div class="app-nav-menu">
      <Menu></Menu>
    </div>
    <div class="app-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import Menu from "./components/Menu";
export default {
  name: "app",
  components: {
    Menu
  },
  mounted() {
    console.log(this, "App.vue");
  },
  methods: {
    handleClick() {}
  }
};
</script>

<style>
body,
html {
  border: 0;
  margin: 0;
  padding: 0;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
#app {
}
.app-nav-menu {
  width: 210px;
  flex-shrink: 0;
  height: 100%;
  background-color: #545c64;
}
.app-main {
  display: flex;
  justify-content: flex-start;
  width: 100vw;
  height: 100vh;
  overflow: auto;
}
.app-content {
  padding: 10px;
}
</style>
