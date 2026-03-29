import { ref } from 'vue';

export const useChangeTables = () => {
  const activeName = ref('not_scored');

  return {
    activeName

  }

}
