<template>
  <form class="search-bar" @submit.prevent="handleInputSearch">
    <div class="search-field" :style="searchFieldStyle">
      <input v-model="inputContent" class="search-input" type="text" :placeholder="inputPlaceholder">
    </div>

    <button v-if="showSearchBtn" type="submit" class="btns search-btn" :style="customBtnsStyle">
      {{ searchBtnText || '查找' }}
    </button>

    <button v-if="showAddBtn" type="button" class="btns add-btn" :style="customBtnsStyle" @click="handleAdd">
      {{ addBtnText || '添加' }}
    </button>

    <slot name="operations"></slot>
  </form>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
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
      return true;
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
  immediate: {
    type: Boolean,
    default: false
  },
  delay: {
    type: [String, Number],
    default: 0
  },
  removeAllSpaces: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['search', 'add']);

const inputPlaceholder = ref(props.placeholder);
const inputContent = ref('');

const validSizeVal = computed(() => {
  const validValues = ['small', 'middle', 'large'];
  return validValues.includes(props.size) ? props.size : 'small';
});

const sizeMap = {
  small: {
    height: '36px',
    font: '13px',
    buttonHeight: '36px'
  },
  middle: {
    height: '42px',
    font: '14px',
    buttonHeight: '42px'
  },
  large: {
    height: '48px',
    font: '16px',
    buttonHeight: '48px'
  }
};

const searchFieldStyle = computed(() => ({
  width: props.width,
  minWidth: props.width,
  height: sizeMap[validSizeVal.value].height,
}));

const customBtnsStyle = computed(() => ({
  fontSize: sizeMap[validSizeVal.value].font,
  minHeight: sizeMap[validSizeVal.value].buttonHeight,
}));

const handleEmitSearch = (content = '') => {
  emits('search', content.trim());
};

const delay = computed(() => (
  Number.isFinite(Number(props.delay)) ? Number(props.delay) : 1000
));

const debouncedEmitSearch = debounce(handleEmitSearch, delay.value, { dev: true });

const handleInputSearch = () => {
  const value = removeSpacesFromObject(inputContent.value.trim(), props.removeAllSpaces);
  emits('search', value);
};

const handleAdd = () => {
  emits('add');
};

watch(() => inputContent.value, (newCt) => {
  if (props.immediate) {
    debouncedEmitSearch(newCt);
  } else if (newCt.trim() === '') {
    if (delay.value) debouncedEmitSearch(newCt.trim());
    else emits('search', newCt);
  }
});

defineExpose({
  reset: () => { inputContent.value = ''; }
});
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.search-field {
  display: flex;
  align-items: center;
  padding: 0 14px;
  border-radius: 16px;
  border: 1px solid rgba(219, 228, 240, 0.95);
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
  box-shadow: 0 10px 24px rgba(31, 42, 68, 0.06);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.search-field:focus-within {
  border-color: rgba(47, 107, 255, 0.4);
  box-shadow: 0 14px 30px rgba(47, 107, 255, 0.12);
}

.search-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #30415f;
}

.search-input::placeholder {
  color: #97a6bb;
}

.btns {
  min-width: 88px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: #fff;
  color: #54657f;
  box-shadow: 0 10px 22px rgba(31, 42, 68, 0.06);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.btns:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(31, 42, 68, 0.1);
}

.search-btn {
  background: linear-gradient(135deg, #2f6bff 0%, #20b7c7 100%);
  color: #fff;
}

.add-btn {
  border-color: #d8e3f0;
  background: #f8fbff;
}

@media (max-width: 640px) {
  .search-bar {
    align-items: stretch;
  }

  .search-field {
    width: 100% !important;
    min-width: 100% !important;
  }

  .btns {
    flex: 1 1 120px;
  }
}
</style>
