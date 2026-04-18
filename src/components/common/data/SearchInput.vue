<template>
  <form class="search-bar" @submit.prevent="handleInputSearch">
    <input class="search-input" type="text" v-model="inputContent" :style="customSearchInputStyle"
      :placeholder="inputPlaceholder">
    <button v-if="showSearchBtn" class="btns search-btn" @click="handleInputSearch" :style="customBtnsStyle">
      {{ searchBtnText || '查找' }}
    </button>

    <button v-if="showAddBtn" class="btns add-btn" @click="handleAdd" :style="customBtnsStyle">
      {{ addBtnText || '添加' }}
    </button>

    <!-- 自定义按钮区域 -->
    <slot name="operations"></slot>

  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { debounce } from '@/utils/debounce';
import { removeSpacesFromObject } from '@/utils/removeSpacesFromData';
const props = defineProps({
  placeholder: {
    type: String,
    default: 'Type to search'
  },
  size: {
    type: String,
    default: 'small',
    validator: (val) => {
      const validateVal = ['small', 'middle', 'large'];
      if (!validateVal.includes(val)) {
        console.log(`[SearchInput组件] size 属性值 "${val}" 不合法，仅支持 small/middle/large，已自动转为 small`);
      }
      return true;// 验证始终返回 true（因为后续会自动修正，避免组件报错）
    }
  },
  width: {
    type: String,
    default: '300px'
  },
  showSearchBtn: {
    type: Boolean,
    default: true
  },
  showAddBtn: {
    type: Boolean,
    default: true
  },
  searchBtnText: {
    type: String,
    default: '搜索'
  },
  addBtnText: {
    type: String,
    default: '添加'
  },
  immediate: { //若启用immediate，每次变化值都向父组件search事件emit
    type: Boolean,
    default: false
  },
  delay: { //emit search的防抖
    type: [String, Number],
    default: 0
  },
  removeAllSpaces: { //是否去除输入内容中的所有空格（不仅仅是首尾）
    type: Boolean,
    default: false
  }
})

const emits = defineEmits([
  'search',
  'add'
])

const inputPlaceholder = ref(props.placeholder);

const validSizeVal = computed(() => {
  const validValues = ['small', 'middle', 'large']
  // 如果传入的值合法则使用，否则默认 small
  return validValues.includes(props.size) ? props.size : 'small'
})

const SizeMap = {
  small:
  {
    height: '24px',
    font: '10px'
  },
  middle: {
    height: '32px',
    font: '14px'
  },
  large: {
    height: '40px',
    font: '18px'
  }
}

const customSearchInputStyle = ref({
  width: props.width,
  height: SizeMap[validSizeVal.value].height,
  'font-size': SizeMap[validSizeVal.value].font
})
const customBtnsStyle = ref({
  'font-size': SizeMap[validSizeVal.value].font
})

const handleEmitSearch = (content = '') => {
  emits('search', content.trim());
}
// 如果数字无限大则会设为1秒
const delay = computed(() => {
  return isFinite(Number(props.delay)) ? Number(props.delay) : 1000;
})
const debouncedEmitSearch = debounce(handleEmitSearch, delay.value, { dev: true });

const inputContent = ref('');
const handleInputSearch = () => {
  console.log('handleInputSearch', inputContent.value)
  const value = removeSpacesFromObject(inputContent.value.trim(), props.removeAllSpaces);
  emits('search', value);
}

const handleAdd = () => {
  emits('add')
}

watch(() => inputContent.value, (newCt) => {
  if (props.immediate) {
    // emits('search', newCt);
    debouncedEmitSearch(newCt)
  }
  else if (newCt.trim() === '') { //在输入内容为空的时候触发搜索以便更新父组件。这样在删除所有内容时默认触发刷新
    if (delay.value) debouncedEmitSearch(newCt.trim())
    else emits('search', newCt);
  }
})
defineExpose({
  reset: () => { inputContent.value = '' }
})
</script>

<style scoped>
.search-bar {
  padding: 1px 10px;
  display: flex;
  flex-direction: row;
  gap: 15px;
}

.search-input {
  /* border: none;
  padding: 1rem;
  border-radius: 1rem;
  background: #e8e8e8;
  box-shadow: 20px 20px 60px #c5c5c5,
    -20px -20px 60px #ffffff;
  transition: 0.3s; */
  padding: 1px 10px;
  border: none;
  border-radius: 12px;
  box-shadow: 0px 0px 5px #80808082;
  transition: 0.3s;
  outline-color: #ffffff;
  /* outline: none; */
  /* 清除浏览器默认的焦点外框 */
}

.search-input:focus {
  /* outline-color: #409eff;
  background: #e8e8e8;
  box-shadow: inset 20px 20px 60px #c5c5c5,
    inset -20px -20px 60px #ffffff; */
  transition: 0.3s;
  outline-color: #409eff;
  /* box-shadow: 0px 0px 5px rgba(55, 155, 255, 0.5); */
  box-shadow: inset 20px 20px 60px #c5c5c56f,
    inset -20px -20px 60px #ffffff;
  /* background-color: var(--box-background); */
}

/* .search-input.active {
  box-shadow: 0px 0px 5px red;
} */
.btns {
  outline: none;
  padding: 0px 20px;
  background-color: white;
  border: none;
  border-radius: 10px;
  box-shadow: 0px 0px 5px var(--gray-box-shadow);
  transition: all 0.2s;
}

.btns:hover {
  box-shadow: 0px 0px 10px rgba(55, 155, 255, 0.5);
}

.search-btn {
  color: white;
  background-color: var(--primary);
}
</style>
