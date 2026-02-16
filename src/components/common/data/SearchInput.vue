<template>
  <div class="search-bar">
    <input class="search-input" type="text" v-model="inputContent" @keyup.enter="handleInputSearch"
      :style="customSearchInputStyle" :placeholder="inputPlaceholder">
    <button class="btns search-btn" @click="handleInputSearch" :style="customBtnsStyle">查找</button>
    <button class="btns add-btn" @click="handleAdd" :style="customBtnsStyle">添加</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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
  }
})

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

// watch(() => bInputFocus.value, (newv) => {
//   console.log(" INPUT CLICKS", newv);
// })
console.log("input custom css", customSearchInputStyle.value)

const emits = defineEmits([
  'search',
  'add'
])
const inputContent = ref('');
const handleInputSearch = () => {
  console.log('handleInputSearch', inputContent.value)
  const value = inputContent.value.trim();
  if (value) {
    emits('search', value);
  }
}

const handleAdd = () => {
  emits('add')
}

</script>

<style scoped>
.search-bar {
  padding: 1px 10px;
  display: flex;
  gap: 15px;
}

.search-input {
  padding: 1px 10px;
  border: none;
  border-radius: 12px;
  box-shadow: 0px 0px 5px #80808082;
  transition: all 0.2s;
  outline: none;
  /* 清除浏览器默认的焦点外框 */
}

.search-input:focus {
  border-color: #409eff;
  box-shadow: 0px 0px 5px rgba(55, 155, 255, 0.5);
  background-color: var(--box-background);
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
