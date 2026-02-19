<template>
  <div class="overview-card" :style="customCardsStyle">
    <!-- 传入title ，date，icon -->
    <div class="card-top">
      <div class="card-icon" :style="customIconStyle">
        <el-icon :size=iconSize>
          <component :is="`${icon}`" :color=validateIconColor()></component>
        </el-icon>
      </div>
      <p class="card-title">{{ title }}</p>
    </div>
    <div class="card-data">
      <h2 class="card-content">{{ data }}</h2>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  width: {
    type: [String, Number],
    default: '100%'
  },
  height: {
    type: [String, Number],
    default: '120px'
  },
  icon: {
    type: String,
    required: false,
    default: 'User'
  },
  iconColor: {
    type: String,
    required: false,
    default: '#409EFF'
  },
  iconBackground: {
    type: String,
    required: false,
    default: '#ecf5ff'
  },
  iconSize: {
    type: [String, Number],
    default: 30
  },
  iconBackgroundSize: {
    type: [String, Number],
    default: 40
  },
  title: {
    type: String,
    required: false,
    default: 'none'
  },
  data: {
    type: String,
    required: false,
    default: 'none'
  }
})

// 处理空字符串场景
const validateIconColor = computed(() => {
  // 如果传入的是空字符串/空值，用默认值，否则用传入的值
  return props.iconColor?.trim() === '' ? '#409EFF' : props.iconColor
})

const validateIconBackground = computed(() => {
  return props.iconBackground?.trim() === '' ? '#ecf5ff' : props.iconBackground
})

const customCardsStyle = ref({
  'width': props.width,
  'height': props.height,
})
const customIconStyle = ref({
  'width': props.iconBackgroundSize + 'px',
  'height': props.iconBackgroundSize + 'px',
  'background-color': validateIconBackground()
})
// console.log(customIconStyle.value)

</script>
<style scoped>
* {
  margin: 0;
  padding: 0;
}

.overview-card {
  height: 120px;
  /* width: 300px; */
  width: 100%;
  /* max-width: 400px; */

  display: flex;
  flex-direction: column;

  padding: 10px 20px;
  margin: 10px 10px;
  border: 1px solid var(--gray-border);
  border-radius: 10px;
  box-shadow: 1px 1px 7px var(--gray-box-shadow);

  transition: all 0.2s ease-in-out;
}

.overview-card:hover {
  box-shadow: 2px 3px 7px var(--gray-box-shadow);
  transform: translateY(-5px);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 10px;
}

.card-top {
  width: 100%;
  height: 50%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-data {
  /* margin-top: ; */
  width: 100%;
  height: 50%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}
</style>
