import Vue from 'vue/dist/vue.common.dev';
// import App from './App.vue';
// import '../theme/index.css';
// import ElementUI from 'element-ui';
// import VueRouter from 'vue-router';
// import routes from './router';
// import store from './store/index';
// import './single-spa-config.js';

// import VueCompositionApi from '@vue/composition-api';

Vue.config.productionTip = false;

// Vue.use(ElementUI);
// Vue.use(VueRouter);
// Vue.use(VueCompositionApi);



// const router = new VueRouter({
//   mode: 'history',
//   linkActiveClass: 'is-active',
//   routes,
// });

// router.beforeResolve(function(to, from, next) {
//   console.log('beforeResolve', this);
//   next()
// })

new Vue({
  template: `<button @click.stop="onClick()">点我</button>`,
  // render: function(h) {
  //   return h('div', {}, [
  //     h('el-button', {
  //       domProps: {
  //         innerHTML: 'TEST',
  //       },
  //       on: {
  //         click: this.onClick,
  //       },
  //     }),
  //     h('div', this.topName),
  //   ]);
  // },
  // router,
  // store,
  // ...App,
  // props: ['topName'],
  // propsData: {
  //   topName: 'topName',
  // },
  // // data:{
  // //   text: 'hello text'
  // // },
  // mounted() {
  //   console.log(this, 'this');
  //   // router
  //   // console.log(this._route, 'this._route');
  //   // store
  //   // console.log(this.$store, 'this.$store', this.topName);
  // },
  methods: {
    onClick() {
      this.topName += 'testTOPName';
      console.log('点了');
    },
  },
}).$mount('#app');

// console.log(vm._data, 'vm.data')
