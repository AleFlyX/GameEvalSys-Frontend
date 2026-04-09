import { computed, ref } from 'vue';

/**
 * 页面筛选逻辑：tab 切换、关键字搜索和过滤结果。
 * @param {import('vue').Ref<Array>} groupList
 */
export const useGroupScoringFilters = (groupList) => {
  const activeName = ref('not_scored');
  const searchKeyword = ref('');
  const searchBarRef = ref(null);

  // let acitveScored = false;
  // const handleTabClick = () => {
  //   acitveScored = !acitveScored
  //   console.log(acitveScored)
  //   activeName.value = acitveScored ? 'not_scored' : 'scored';
  //   // tab 切换由 activeName 控制，过滤逻辑在 filteredGroups 中处理
  // };
  const handleSearch = (keywords) => {
    searchKeyword.value = keywords;
  };

  const handleResetSearch = () => {
    searchBarRef.value?.reset?.();
    searchKeyword.value = '';
  };

  const filteredGroups = computed(() => {
    const groupsByTab = groupList.value.filter((group) => {
      if (activeName.value === 'scored') return group.scoreStatus === 'scored';
      return group.scoreStatus !== 'scored';
    });

    if (!searchKeyword.value) return groupsByTab;
    return groupsByTab.filter((group) => group.name.includes(searchKeyword.value));
  });

  return {
    activeName,
    searchBarRef,
    filteredGroups,
    // handleTabClick,
    handleSearch,
    handleResetSearch,
  };
};
