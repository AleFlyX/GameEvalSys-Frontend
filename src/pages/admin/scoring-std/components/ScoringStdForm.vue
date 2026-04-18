<template>
  <div class="scoring-std-form">
    <el-form ref="formRef" :model="formData" :disabled="!editable" status-icon label-width="140px">
      <el-form-item prop="name" label="打分标准名">
        <el-input v-model="formData.name" placeholder="打分标准名称"></el-input>
      </el-form-item>

      <div class="categories-container">
        <div v-if="editable" class="categories-header">
          <h4>分类与指标</h4>
          <el-button type="primary" size="small" @click="addCategory">+ 添加分类</el-button>
        </div>

        <div v-if="formData.categories.length === 0" class="empty-state">
          <p>暂无分类</p>
        </div>

        <div v-for="(category, categoryIndex) in formData.categories"
          :key="category.id || `new-category-${categoryIndex}`" class="category-item">
          <div class="category-title">
            <span>分类 {{ categoryIndex + 1 }}</span>
            <el-button v-if="editable" type="danger" size="small" text @click="removeCategory(categoryIndex)">
              删除分类
            </el-button>
          </div>

          <div class="category-form">
            <el-form-item label="分类名称" :prop="`categories.${categoryIndex}.name`">
              <el-input v-model="category.name" placeholder="如：项目质量、展示表现等" maxlength="50" />
            </el-form-item>

            <el-form-item label="分类描述" :prop="`categories.${categoryIndex}.description`">
              <el-input v-model="category.description" type="textarea" :rows="2" placeholder="对该分类的说明"
                maxlength="200" />
            </el-form-item>

            <div class="indicators-header">
              <h5>分类指标</h5>
              <el-button v-if="editable" type="primary" size="small" plain @click="addIndicator(categoryIndex)">
                + 添加指标
              </el-button>
            </div>

            <div v-if="category.indicators.length === 0" class="category-empty-state">
              <span>该分类下暂无指标</span>
            </div>

            <div v-for="(indicator, indicatorIndex) in category.indicators"
              :key="indicator.id || `new-indicator-${categoryIndex}-${indicatorIndex}`" class="indicator-item">
              <div class="indicator-title">
                <span>指标 {{ indicatorIndex + 1 }}</span>
                <el-button v-if="editable" type="danger" size="small" text
                  @click="removeIndicator(categoryIndex, indicatorIndex)">
                  删除指标
                </el-button>
              </div>

              <el-form-item label="指标名称" :prop="`categories.${categoryIndex}.indicators.${indicatorIndex}.name`">
                <el-input v-model="indicator.name" placeholder="如：创新性、完整性等" maxlength="50" />
              </el-form-item>

              <el-form-item label="指标说明" :prop="`categories.${categoryIndex}.indicators.${indicatorIndex}.description`">
                <el-input v-model="indicator.description" type="textarea" :rows="3" placeholder="对该指标的详细说明"
                  maxlength="200" />
              </el-form-item>

              <div class="score-range">
                <el-form-item label="最小分值" :prop="`categories.${categoryIndex}.indicators.${indicatorIndex}.minScore`"
                  style="flex: 1; margin-right: 20px;">
                  <el-input-number v-model="indicator.minScore" :min="0" :max="100" />
                </el-form-item>

                <el-form-item label="最大分值" :prop="`categories.${categoryIndex}.indicators.${indicatorIndex}.maxScore`"
                  style="flex: 1;">
                  <el-input-number v-model="indicator.maxScore" :min="0" :max="100" />
                </el-form-item>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script setup>

import { ref, watch } from 'vue';
import { safeDeepClone } from '@/utils/proxyDataClone';
import { getCategoriesFromStandard } from '@/utils/scoringStandard';
const props = defineProps({
  initData: {
    type: Object,
    default: () => ({
      categories: []
    })
  },
  addMode: {
    type: Boolean,
    default: false
  },
  editable: {
    type: Boolean,
    default: false
  }
});

const formRef = ref(null);
const formData = ref({
  name: props.initData?.name || '',
  categories: getCategoriesFromStandard(props.initData)
});

watch(
  () => props.initData,
  (newData) => {
    formData.value.name = newData?.name || '';
    formData.value.categories = safeDeepClone(getCategoriesFromStandard(newData));
  },
  { deep: true }
);

// 添加分类
const addCategory = () => {
  formData.value.categories.push({
    name: '',
    description: '',
    indicators: []
  });
};

// 删除分类
const removeCategory = (categoryIndex) => {
  formData.value.categories.splice(categoryIndex, 1);
};

// 添加指标
const addIndicator = (categoryIndex) => {
  const category = formData.value.categories[categoryIndex];
  if (!category) return;

  category.indicators.push({
    name: '',
    description: '',
    minScore: 0,
    maxScore: 100
  });
};

// 删除指标
const removeIndicator = (categoryIndex, indicatorIndex) => {
  const category = formData.value.categories[categoryIndex];
  if (!category) return;
  category.indicators.splice(indicatorIndex, 1);
};

// 校验方法
const validate = async () => {
  if (!formData.value.name || !formData.value.name.trim()) {
    throw new Error('请输入有效内容');
  }
  if (formData.value.name.length > 30) {
    throw new Error('评分标准名超出长度限制');
  }

  if (formData.value.categories.length === 0) {
    throw new Error('至少需要添加一个分类');
  }

  for (let categoryIndex = 0; categoryIndex < formData.value.categories.length; categoryIndex++) {
    const category = formData.value.categories[categoryIndex];
    if (!category.name || !category.name.trim()) {
      throw new Error(`分类 ${categoryIndex + 1} 的名称不能为空`);
    }

    if (!Array.isArray(category.indicators) || category.indicators.length === 0) {
      throw new Error(`分类 ${categoryIndex + 1} 至少需要一个指标`);
    }

    for (let indicatorIndex = 0; indicatorIndex < category.indicators.length; indicatorIndex++) {
      const indicator = category.indicators[indicatorIndex];
      if (!indicator.name || !indicator.name.trim()) {
        throw new Error(`分类 ${categoryIndex + 1} 的指标 ${indicatorIndex + 1} 名称不能为空`);
      }

      if (Number(indicator.minScore) >= Number(indicator.maxScore)) {
        throw new Error(`分类 ${categoryIndex + 1} 的指标 ${indicatorIndex + 1} 最小分值不能大于等于最大分值`);
      }
    }
  }

  return true;
};

// 获取表单数据
const getFormData = () => {
  return safeDeepClone(formData.value);
};

const resetFormData = () => {
  formData.value = { name: '', categories: [] };
}

defineExpose({
  validate,
  getFormData,
  resetFormData,
});
</script>

<style scoped>
.scoring-std-form {
  padding: 20px 0;
}

.categories-container {
  margin-top: 20px;
}

.categories-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.categories-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.category-item {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
}

.category-item+.category-item {
  margin-top: 16px;
}

.category-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.category-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.indicators-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.indicators-header h5 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.category-empty-state {
  display: flex;
  align-items: center;
  min-height: 46px;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  padding: 0 12px;
}

.indicator-item {
  background: #fff;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
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
