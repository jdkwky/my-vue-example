import Vue from 'vue'
import App from './App.vue'
import '../theme/index.css';
import ElementUI from 'element-ui';
import VueRouter from 'vue-router';
import routes from './router'




Vue.config.productionTip = false;

Vue.use(ElementUI);
Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'hash',
  linkActiveClass: 'is-active',
  routes
})

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
