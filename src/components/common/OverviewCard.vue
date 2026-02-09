<template>
  <div class="overview-card">
    <!-- 传入title ，date，icon -->
    <div class="card-top">
      <div class="card-icon" :style="customIconStyle">
        <el-icon :size=iconSize>
          <component :is="`${icon}`" :color=iconColor></component>
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
import { ref, onMounted } from 'vue';

const props = defineProps({
  icon: {
    type: String,
    required: false,
    default: 'User'
  },
  iconColor: {
    type: String,
    required: false,
    default: 'none'
  },
  iconBackground: {
    type: String,
    required: false,
    default: 'none'
  },
  iconSize: {
    type: [String, Number],
    default: 35
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

const customIconStyle = ref({
  'width': props.iconBackgroundSize + 'px',
  'height': props.iconBackgroundSize + 'px',
  'background-color': props.iconBackground
})
console.log(customIconStyle.value)

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
  max-width: 300px;

  display: flex;
  flex-direction: column;

  padding: 10px 20px;
  margin: 10px 10px;
  border: 1px solid var(--gray-border);
  border-radius: 10px;
  box-shadow: 1px 1px 7px var(--gray-box-shadow);
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
