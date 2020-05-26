<template>
  <div>
    <Card>
      <p v-for="(item, index) in list" :key="index" :info="item">
        <Age :info="item.name" />
      </p>
    </Card>
  </div>
</template>

<script>
import Card from "./comp/Card";
import Age from "./comp/Age";
export default {
  components: { Card, Age },
  data() {
    return {
      list: [{ name: { age: 1 } }, { name: { age: 2 } }]
    };
  },
  mounted() {
    setTimeout(() => {
      this.list = [{ name: { age: 3 } }, { name: { age: 4 } }];
    }, 5000);
  }
};
</script>