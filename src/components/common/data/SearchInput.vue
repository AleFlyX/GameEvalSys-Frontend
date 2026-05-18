<template>
  <form class="search-bar" @submit.prevent="handleInputSearch">
    <div class="search-main">
      <div class="search-field" :style="searchFieldStyle">
        <input v-model="inputContent" class="search-input" type="text" :placeholder="placeholder">
      </div>

      <div class="search-actions">
        <MyBtn v-if="showSearchBtn" native-type="submit" type="primary" :size="buttonSize">
          {{ searchBtnText || '搜索' }}
        </MyBtn>

        <MyBtn v-if="showAddBtn" type="default" :size="buttonSize" @click="handleAdd">
          {{ addBtnText || '添加' }}
        </MyBtn>
        <div v-if="$slots.operations" class="search-operations">
          <slot name="operations" />
        </div>
      </div>
    </div>
  </form>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import MyBtn from '@/components/common/form/MyBtn.vue';
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

const buttonSize = computed(() => ({
  small: 'small',
  middle: 'medium',
  large: 'large',
}[validSizeVal.value] || 'small'));

const handleEmitSearch = (content = '') => {
  emits('search', content.trim());
};

const delay = computed(() => (
  Number.isFinite(Number(props.delay)) ? Number(props.delay) : 1000
));

const debouncedEmitSearch = debounce(handleEmitSearch, delay.value, { dev: true });

const handleInputSearch = () => {
  const value = removeSpacesFromObject(inputContent.value, props.removeAllSpaces);
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
  align-items: flex-start;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 12px;
}

.search-main {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
}

.search-field {
  display: flex;
  align-items: center;
  padding: 0 14px;
  border-radius: 16px;
  border: 1px solid var(--border, rgba(219, 228, 240, 0.95));
  background: var(--card-bg, linear-gradient(180deg, #ffffff 0%, #f9fbff 100%));
  box-shadow: 0 10px 24px rgba(31, 42, 68, 0.06);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

html[data-theme="dark"] .search-field {
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4);
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
  color: var(--text-primary, #30415f);
}

.search-input::placeholder {
  color: var(--text-disabled, #97a6bb);
}

.search-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.search-operations {
  /* width: 100%; */
}

@media (max-width: 640px) {
  .search-bar {
    align-items: stretch;
  }

  .search-field {
    width: 100% !important;
    min-width: 100% !important;
  }

  .search-main {
    align-items: stretch;
  }

  .search-actions {
    width: 100%;
  }

  .search-actions :deep(.btn) {
    flex: 1 1 120px;
  }
}
</style>
