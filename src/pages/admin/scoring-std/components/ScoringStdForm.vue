<template>
  <div class="scoring-std-form">
    <el-form ref="formRef" :model="formData" :disabled="!addMode" status-icon label-width="140px">
      <!-- 指标列表 -->
      <div class="indicators-container">
        <div v-if="addMode" class="indicators-header">
          <h4>评分指标</h4>
          <el-button type="primary" size="small" @click="addIndicator">+ 添加指标</el-button>
        </div>

        <div v-if="formData.indicators.length === 0" class="empty-state">
          <p>暂无指标</p>
        </div>

        <el-form-item v-show="addMode && formData.indicators.length !== 0" prop="name" label="打分标准名">
          <el-input v-model="formData.name" placeholder="打分标准名称"></el-input>
        </el-form-item>

        <div v-for="(indicator, index) in formData.indicators" :key="index" class="indicator-item">
          <!-- <el-divider /> -->
          <div class="indicator-title">
            <span>指标 {{ index + 1 }}</span>
            <el-button type="danger" size="small" text @click="removeIndicator(index)" v-if="addMode">删除</el-button>
          </div>

          <div class="indicator-form">
            <el-form-item label="指标名称" :prop="`indicators.${index}.name`">
              <el-input v-model="indicator.name" placeholder="如：创新性、完整性等" maxlength="50" />
            </el-form-item>

            <el-form-item label="指标说明" :prop="`indicators.${index}.description`">
              <el-input v-model="indicator.description" type="textarea" :rows="3" placeholder="对该指标的详细说明"
                maxlength="200" />
            </el-form-item>

            <div class="score-range">
              <el-form-item label="最小分值" :prop="`indicators.${index}.minScore`" style="flex: 1; margin-right: 20px;">
                <el-input-number v-model="indicator.minScore" :min="0" :max="100" />
              </el-form-item>

              <el-form-item label="最大分值" :prop="`indicators.${index}.maxScore`" style="flex: 1;">
                <el-input-number v-model="indicator.maxScore" :min="0" :max="100" />
              </el-form-item>
            </div>
          </div>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script setup>

import { ref, reactive, computed } from 'vue';
import { safeDeepClone } from '@/utils/proxyDataClone';
const props = defineProps({
  initData: {
    type: Object,
    default: () => ({
      indicators: []
    })
  },
  addMode: {
    type: Boolean,
    default: false
  }
});

const formRef = ref(null);

// const formData = reactive({
//   indicators: props.initData.indicators && props.initData.indicators.length > 0
//     // ? JSON.parse(JSON.stringify(props.initData.indicators))
//     ? safeDeepClone(props.initData.indicators)
//     : []
// });
const formData = computed(() => {
  return { name: props.initData, indicators: safeDeepClone(props.initData.indicators) }
});
// 添加指标
const addIndicator = () => {
  formData.value.indicators.push({
    name: '',
    description: '',
    minScore: 0,
    maxScore: 100
  });
};

// 删除指标
const removeIndicator = (index) => {
  formData.value.indicators.splice(index, 1);
};

// 校验方法
const validate = async () => {
  console.log('VALIDATIING FORM NAME', formData.value.name)
  if (!formData.value.name || !formData.value.name.trim()) {
    throw new Error('请输入有效内容');
  }
  else if (formData.value.name.length > 30) {
    throw new Error('评分标准名超出长度限制');
  }
  // 校验指标是否为空
  if (formData.value.indicators.length === 0) {
    throw new Error('至少需要添加一个指标');
  }
  // 校验每个指标的必填项
  for (let i = 0; i < formData.value.indicators.length; i++) {
    const indicator = formData.value.indicators[i];
    if (!indicator.name) {
      throw new Error(`指标 ${i + 1} 的名称不能为空`);
    }
    if (indicator.minScore >= indicator.maxScore) {
      throw new Error(`指标 ${i + 1} 的最小分值不能大于等于最大分值`);
    }
  }
  return true;

};

// 获取表单数据
const getFormData = () => {
  return formData;
};

defineExpose({
  validate,
  getFormData,
});
</script>

<style scoped>
.scoring-std-form {
  padding: 20px 0;
}

.indicators-container {
  margin-top: 20px;
}

.indicators-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.indicators-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.indicator-item {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
}

.indicator-item+.indicator-item {
  margin-top: 16px;
}

.indicator-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.indicator-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.score-range {
  display: flex;
  align-items: flex-start;
}

:deep(.score-range .el-form-item) {
  margin-bottom: 0;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}
</style>
