import { ref } from '@vue/composition-api';

export function getList(list) {
  const obj = ref([]);
  const temp = [{ name: '222' }];
  setTimeout(() => {
    list.value = temp;
    obj.value = [
      {
        list: temp,
      },
    ];
  }, 0);
  return {
    obj,
  };
}
