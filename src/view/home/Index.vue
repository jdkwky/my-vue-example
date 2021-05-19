<template>
    <div class="home">
        <el-button @click="handlePush">push</el-button>
        <!-- <p :key="item" v-for="item in list">
          {{ item }}
        </p> -->


        <br/>
        <!-- <p :key="`${item}-dataList`" v-for="item in dataList">
          {{ item }}
        </p> -->

        <!-- props -->
        <div>
          显示子组件props
          {{ childProps.name }}
        </div>
        <Test :people="{name: 'test', deepInfo:{ name: 'deepInfo' }}"></Test>

        <!-- functional 组件 -->
        <p>函数式组件</p>
        <Functional :data="functionalData"></Functional>
        <!-- 显示 store -->

        <p>显示store</p>
        <el-button @click="onChangeModuleA">更改moduleAName</el-button>
        <div>
          moduleAName : {{ moduleAName }}
        </div>
    </div>
</template>

<script>
// import {num} from './export';
// import age from './export'

import Test from './comp/Test';
import Functional from './comp/Functional'
import { mapState } from 'vuex';

export default {
  components:{
    Test,
    Functional
  },
  data() {
    return {
      list : ['哈哈哈'],
      people: {
        name: 'test'
      },
      childProps:{
        name: 'child Props'
      },
      functionalData: '函数式组件'
    };
  },
  computed:{
    dataList(){
      return {
        list: this.list
      };
    },
    ...mapState({
      moduleAName: state => state.moduleA.name,
      moduleA :state => state.moduleA
    })
  },
  watch:{
    list(){
      console.log('in this ');
    }
  },
  methods:{
    handlePush(){
      this.list.push(+new Date);
      console.log(this.list);
    },
    onChangeModuleA(){
      // this.$store.commit('moduleA/setName', `${+new Date}-moduleA`);
      this.$store.state.moduleA.name = `${+new Date}-moduleA`
      console.log(this.$store.state, 'this._data.$$state');
      // this.moduleAName = `${+new Date}-moduleA`;
    }
  },
  created() {},
  mounted() {
    //   console.log(this.dataPeople, 'this.dataPeople');
    console.log('父组件 Index mounted ');
  },
  beforeCreate() {},
  beforeMount() {},
  beforeUpdate() {
      console.log('父组件 before update');
  },
  updated() {
    console.log('父组件 updated');
  },
  beforeDestroy() {},
  destroyed() {},
  activated() {},
};
</script>