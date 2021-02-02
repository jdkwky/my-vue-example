<!--  -->
<template>
    <div>
        <el-button @click="handleChangeProps">更改props信息</el-button>
        <div>Test {{ people.name }}</div>
        <div>data 可以用Object形式返回：{{ dataIsObject }}</div>
        <!-- 修改dataPeople -->
        <el-button @click="onChangeDataPeople">修改dataPeople</el-button>
        <!-- dataList -->
        <div :key="item" v-for="item in dataList">
            {{ item }}
        </div>
        <!-- 修改dataList值-->
        <el-button @click="onDataListChange">AddDataList</el-button>
        <!-- age -->
        <div>age{{ realAge }}</div>
        <el-button @click="onChangeAge">changeAge</el-button>

        <p>props 存在被监听的数据信息</p>

        <div>
            {{ hasParentData.props.name }}
        </div>
        <el-button @click="onChangePropsName">更改props name信息</el-button>
    </div>
</template>

<script>
export default {
  components: {},
  props:{
      people:{
          type: Object,
          default: ()=>({})
      },
      hasParentData:{
          type: Object,
          default: ()=>({})
      }
  },
  data({ people, hasParentData }){
      console.log(hasParentData, 'hasParentData');
     return {
          dataIsObject: true,
          dataPeople: {
              list: [1,2,3],
              people: people
          },
          realAge: 16
     }
  },
  computed: {
      dataList:{
        get(){
            console.log('in this get');
            return this.dataPeople.list || [];
        },
        set(){
            // console.log('in this set');
            this.dataPeople.list.push(+new Date);
        }
      },
      age(){
          console.log('in this computed');
          return this.realAge
      }
  },
  watch: {
      
  },
  methods: {
      handleChangeProps() {
        //   this.people = 'haha';
          this.$set(this.people,'name','haha')
        // //   this.people.name ='haha';
        //   console.log(this.people,'people');
      },
      onChangeDataPeople(){
          this.dataPeople.name="hehe";
      },
      onDataListChange(){
          this.dataList = 1;
        //  console.log(this.dataList);
      },
      onChangePropsName(){
          this.hasParentData.props.name = '测试一下 哈哈哈';
      },
      onChangeAge(){
          this.realAge= 20
      }
  },
  created() {},
  
  mounted() {
    //   console.log(this.dataPeople, 'this.dataPeople');
    // console.log('子组件 Test mounted ');
    // this.$nextTick(null,this).then(res =>{
    //     console.log('$nextTick', res);
    // });
    // console.log(this.router, 'this.router');

    console.log(this.hasParentData, 'hasParentData');
    this.$watch(function () {
          console.log('in this watch');
          return this.realAge;
      },function () {
          console.log('in this watch cb');
      })
    
  },
  beforeCreate() {},
  beforeMount() {},
  beforeUpdate() {
      console.log('子组件 before update');
  },
  updated() {
      console.log('this is updated');
  },
  beforeDestroy() {},
  destroyed() {},
  activated() {},
};
</script>
<style lang='less' scoped>
</style>