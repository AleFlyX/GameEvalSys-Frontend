<template>
  <!-- 此表是动态item，所以表中的数据都可以不用BaseForm安全克隆，拿到直接改就行 -->
  <el-form ref="baseFormRef" :model="formData" :rules="scoringFormRules" label-width="120px" :disabled="disabled">
    <!-- 项目信息显示 -->
    <el-form-item label="小组名称">
      <el-text type="info" passive>{{ groupName }}</el-text>
    </el-form-item>

    <!-- 动态生成的打分指标 -->
    <el-form-item v-for="(indicator, index) in indicators" :key="indicator.id" :label="indicator.name"
      :prop="`scores.${index}`" :rules="getIndicatorRules(indicator)">
      <div class="indicator-container">
        <div class="score-input-group">
          <el-input-number v-model="formData.scores[index]" :min="indicator.minScore" :max="indicator.maxScore"
            :step="0.5" :precision="1" controls-position="right" style="width: 100px">
          </el-input-number>
          <span class="score-range">/ {{ indicator.maxScore }}</span>
        </div>
        <span v-if="indicator.description" class="indicator-desc">{{ indicator.description }}</span>
      </div>
    </el-form-item>

    <!-- 总分显示 -->
    <el-form-item label="总分">
      <span class="total-score">{{ totalScore }}</span>
    </el-form-item>

    <!-- 备注 -->
    <el-form-item label="备注" prop="remark">
      <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="可选：添加打分备注..."></el-input>
    </el-form-item>
  </el-form>
  <!-- <div class="form-footer">
    <el-button @click="handleCancel">取消</el-button>
    <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交打分</el-button>
  </div> -->

</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { ScoringApi } from '@/api/scoring';
import { projectApi } from '@/api/project';
import { ElMessage } from 'element-plus';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    default: ''
  },
  projectId: {
    type: [String, Number],
    default: 0
  },
  groupId: {
    type: [String, Number],
    default: 0
  }
});

const emit = defineEmits(['update:visible', 'refresh', 'submit']);


const baseFormRef = ref(null);
const submitLoading = ref(false);
const indicators = ref([]);
const formData = ref({
  scores: [],
  remark: ''
});

// 验证规则
const scoringFormRules = {
  remark: [
    { max: 500, message: '备注不超过500个字符', trigger: 'blur' }
  ]
};

// 计算总分
const totalScore = computed(() => {
  if (!formData.value.scores || formData.value.scores.length === 0) {
    return 0;
  }
  return formData.value.scores.reduce((sum, score) => sum + (score || 0), 0).toFixed(1);
});

// 获取指标的验证规则
const getIndicatorRules = (indicator) => {
  return [
    {
      required: true,
      type: 'number',
      message: `请为${indicator.name}评分`,
      trigger: 'change'
    },
    {
      type: 'number',
      min: indicator.minScore,
      max: indicator.maxScore,
      message: `分值应在 ${indicator.minScore} - ${indicator.maxScore} 之间`,
      trigger: 'change'
    }
  ];
};

// 获取打分标准详情
const fetchScoringStandard = async () => {
  if (!props.projectId) {
    setDefaultIndicators();
    return;
  }

  try {
    // 获取项目详情
    const projectDetail = await projectApi.getProjectDetail(props.projectId);
    if (projectDetail?.code === 200 && projectDetail.data?.standardId) {
      const response = await ScoringApi.getScoringStandardsDetails(projectDetail.data.standardId);
      if (response.code === 200 && response.data?.indicators) {
        indicators.value = response.data.indicators;
        formData.value.scores = new Array(indicators.value.length).fill(null);
      } else {
        setDefaultIndicators();
      }
    } else {
      setDefaultIndicators();
    }
  } catch (error) {
    console.error('Error fetching scoring standard:', error);
    setDefaultIndicators();
  }
};

// 设置默认指标（当获取失败时）
const setDefaultIndicators = () => {
  indicators.value = [
    {
      id: 1,
      name: '复杂程度',
      description: '课题的技术复杂程度',
      minScore: 1,
      maxScore: 5
    },
    {
      id: 2,
      name: '创新性',
      description: '课题的创新程度',
      minScore: 1,
      maxScore: 5
    },
    {
      id: 3,
      name: '完成度',
      description: '课题的完成程度',
      minScore: 1,
      maxScore: 5
    }
  ];
  // 初始化为 0 而不是 null，便于检测
  formData.value.scores = new Array(indicators.value.length).fill(0);
};

// 处理提交
const handleSubmit = async () => {
  // 验证所有指标都已填写
  console.log('handleSubmit - formData.scores:', formData.value.scores);

  if (!formData.value.scores || formData.value.scores.length === 0) {
    ElMessage.error('未初始化打分指标');
    return;
  }

  const allScoresFilled = formData.value.scores.every(score => score !== null && score !== undefined && score !== '');
  if (!allScoresFilled) {
    ElMessage.error('请为所有指标评分');
    return;
  }

  // 验证表单其他字段
  const valid = await baseFormRef.value?.validate().catch(() => false);
  if (!valid) {
    ElMessage.error('请填写所有必填项');
    return;
  }

  submitLoading.value = true;
  try {
    const scores = indicators.value.map((indicator, index) => ({
      indicatorId: indicator.id,
      score: formData.value.scores[index]
    }));

    const response = await ScoringApi.submitScoring({
      projectId: props.projectId,
      groupId: props.groupId,
      scores: scores,
      remark: formData.value.remark
    });

    if (response.code === 200) {
      ElMessage.success('打分成功');
      emit('submit', {
        projectId: props.projectId,
        groupId: props.groupId,
        scores: scores,
        totalScore: totalScore.value
      });
      // handleCancel();
    } else {
      ElMessage.error(response.message || '打分失败');
    }
  } catch (error) {
    ElMessage.error('打分失败: ' + (error?.message || error));
    console.error('Error submitting scoring:', error);
  } finally {
    submitLoading.value = false;
  }
};
defineExpose({
  submit: handleSubmit
})

watch(formData.value, (newVal) => {

  console.log('ScoreChange', newVal.scores)
});

// watch(visible, (newVal) => {
//   emit('update:visible', newVal);
// });

onMounted(() => {
  fetchScoringStandard();
  // if (props.visible) {
  //   fetchScoringStandard();
  // }
});
</script>

<style scoped>
.indicator-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.score-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-range {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.indicator-desc {
  font-size: 12px;
  color: #606266;
  font-style: italic;
}

.total-score {
  font-size: 18px;
  font-weight: bold;
  color: var(--danger);
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}
</style>
