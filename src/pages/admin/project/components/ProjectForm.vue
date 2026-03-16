<template>
  <base-form ref="baseFormRef" :form-rules="projectFormRules" :data="props.data" style="width: 600px" status-icon
    label-width="auto" @update:data="handleChangedData">

    <el-form-item label="项目名称" prop="name">
      <el-input v-model="formData.name" type="text" placeholder="请输入项目名称" />
    </el-form-item>

    <el-form-item label="项目描述" prop="description">
      <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入项目描述" />
    </el-form-item>

    <el-form-item label="开始日期" prop="startDate">
      <el-date-picker v-model="formData.startDate" type="date" placeholder="选择项目开始日期" value-format="YYYY-MM-DD" />
    </el-form-item>

    <el-form-item label="结束日期" prop="endDate">
      <el-date-picker v-model="formData.endDate" type="date" placeholder="选择项目结束日期" value-format="YYYY-MM-DD" />
    </el-form-item>

    <el-form-item label="打分标准" prop="standardId" @click="showInfo($refs)" ref="scoringStdRef">
      <el-select v-model="formData.standardId" filterable placeholder="选择打分标准" :disabled="editMode"
        :clearable="!editMode" :loading="loadingScoringStd" remote :remote-method="getScoringStdList" debounce="3000"
        remote-show-suffix>
        <el-option v-for="item in scoringStdList" :key="item.id" :value="item.id" :label="item.name"></el-option>
      </el-select>
    </el-form-item>

    <el-form-item v-if="!editMode" label="项目内受评分的小组" prop="groups">
      <el-select v-model="formData.groupIds" placeholder="选择被打分小组" :loading="loadingCommonGroups" multiple filterable
        clearable remote :remote-method="getCommonGroups" debounce="3000" remote-show-suffix>
        <el-option v-for="item in commonGroups" :key="item.id" :value="item.id" :label="item.name">
        </el-option>
      </el-select>

    </el-form-item>

    <!-- <el-form-item v-if="!editMode" label="评审团" prop="reviewerGroupId">
      <el-select v-model="formData.reviewerGroupId" placeholder="选择评审团" clearable>
        <el-option label="中期答辩评审组" :value="1" />
        <el-option label="期末答辩评审组" :value="2" />
      </el-select>
    </el-form-item> -->

    <el-form-item v-if="!editMode" ref="reviewerGroupChoiceRef" label="评审团" prop="reviewerGroupId" @click="showInfo">
      <el-select v-model="formData.reviewerGroupId" placeholder="选择参与评分该项目的评审团" :loading="loadingReviewerGps" filterable
        remote :remote-method="getReviewerGroupList" debounce="300">
        <el-option v-for="item in reviewerGroups" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </el-form-item>

    <el-form-item label="启用状态" v-if="editMode">
      <el-switch v-model="formData.isEnabled" size="large"
        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" inline-prompt active-text="启用"
        inactive-text="停用" />
    </el-form-item>

  </base-form>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';

import BaseForm from '@/components/common/form/BaseForm.vue';

import { ScoringApi } from '@/api/scoring';
import { projectGroupApi } from '@/api/project-group';
import { reviewerGroupApi } from '@/api/reviewer-group';

import { projectFormRules } from '../utils/projectFormRules';
import { ElMessage } from 'element-plus';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      id: '',
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      standardId: '',
      groupIds: [],
      scorerIds: [],
      isEnabled: true,
      status: 'not_started'
    })
  },
  editMode: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['update:data'])

const scoringStdRef = ref(null)
const reviewerGroupChoiceRef = ref(null)
const showInfo = (ref) => {//ref比对
  console.log(ref.scoringStdRef == scoringStdRef.value)
  let msgInfo = '';
  if (ref.scoringStdRef == scoringStdRef.value && props.editMode) {//点击的是scoringStdRef
    msgInfo = '打分标准不可修改';

  }
  else if (ref.scoringStdRef == reviewerGroupChoiceRef.value && !props.editMode) {
    msgInfo = '评审团不可修改';
  }
  ElMessage.info(msgInfo)
}

const baseFormRef = ref(null)
const scoringMode = ref('individual')

// 通过 computed 获取 BaseForm 的 formData，避免创建重复的数据对象
const formData = computed(() => {
  return baseFormRef.value?.formData || {};
})


const scoringStdList = ref([]);
const initProjectFormData = async () => {
  if (!props.data.standardId) {
    console.log('初始化失败', props.data)
    return;
  }
  try {
    const response = await ScoringApi.getScoringStandardsDetails(props.data.standardId)
    scoringStdList.value.push(response.data)
    console.log('获取初始化打分标准', response.data)
  } catch (err) {
    console.log('初始化项目表格数据失败', err)
  }
}

const loadingScoringStd = ref(true)
const getScoringStdList = async (keyWords) => {
  loadingScoringStd.value = true;
  try {
    const response = await ScoringApi.getScoringStandardsList(keyWords);
    scoringStdList.value = response.data;
    console.log('获取项目打分标准', response.data)
    loadingScoringStd.value = false;
  } catch (err) {
    console.log('获取打分标准失败', err)
  }
}

const commonGroups = ref([])
const loadingCommonGroups = ref(true)
const getCommonGroups = async (keywords) => {
  loadingCommonGroups.value = true;
  try {
    const response = await projectGroupApi.getGroupList({ keyWords: keywords });
    commonGroups.value = response.data.list;
    loadingCommonGroups.value = false;
    console.log(response.data)
  } catch (err) {
    console.log(err)
  }
}

const reviewerGroups = ref([])
const loadingReviewerGps = ref(false)
const getReviewerGroupList = async (keywords) => {
  loadingReviewerGps.value = true;
  console.log('searching reviewer group list', keywords)
  try {
    const response = await reviewerGroupApi.getReviewerGroupList({ keyWords: keywords })
    reviewerGroups.value = response.data;
    loadingReviewerGps.value = false;
  } catch (err) {
    console.log(err)
  }
}

defineExpose({
  validate: async () => {
    return await baseFormRef.value.validate();
  },
  getFormData: () => {
    return formData.value;
  },
  getScoringMode: () => {
    return scoringMode.value;
  }
})

// 当 BaseForm 发出数据更新时转发给父组件
const handleChangedData = (newVal) => {
  emits('update:data', newVal);
}
watch(
  () => [props.editMode, props.data?.standardId],
  async () => {
    if (props.editMode) {
      await initProjectFormData();
    }
  },
  { deep: true }
)
onMounted(() => {
  if (props.editMode) {
    initProjectFormData();
  }
})
</script>
