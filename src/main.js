import Vue from 'vue'
import App from './App.vue'
import '../theme/index.css';
import ElementUI from 'element-ui';
import VueRouter from 'vue-router';
import routes from './router';
import store from './store/index';




Vue.config.productionTip = false;

Vue.use(ElementUI);
Vue.use(VueRouter);


const router = new VueRouter({
  mode: 'hash',
  linkActiveClass: 'is-active',
  routes
})

new Vue({
  // render:function(h){ return h('div', this.text)},
  router,
  store,
  ...App,
  // data:{
  //   text: 'hello text'
  // },
  mounted(){
    // router
    console.log(this._route, 'this._route');
    // store
    console.log(this.$store, 'this.$store');

  }
}).$mount('#app');

// console.log(vm._data, 'vm.data')


