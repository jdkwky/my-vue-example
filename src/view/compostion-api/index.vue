<template>
  <div class="hello">
    <h1>{{ state.count }}</h1>
    <button @click="addCount">加</button>
    <div :key="item.name" v-for="item in list">{{ item.name }}</div>
    <div v-for="(item, index) in obj" :key="index">
      {{ item }}
    </div>
  </div>
</template>

<script>
import { reactive, ref, watch } from '@vue/composition-api';
import { getList } from './use-hook';
export default {
  setup() {
    const state = reactive({
      count: 0,
    });
    const addCount = () => {
      state.count++;
    };

    const list = ref([]);
    const { obj } = getList(list);

    watch(
      [() => list.value, () => obj.value],
      () => {
        console.log('in watch');
      },
      {
        immediate: true,
      }
    );
    return { state, addCount, list, obj };
  },
};
</script>
