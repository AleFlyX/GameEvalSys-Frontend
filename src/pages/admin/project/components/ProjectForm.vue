<template>
  <div class="project-form-wrapper">
    <el-form ref="baseFormRef" :rules="projectFormRules" :model="formData" style="width: 600px" status-icon
      label-width="auto">

      <el-form-item label="项目名称" prop="name">
        <el-input v-model="formData.name" type="text" placeholder="请输入项目名称" />
      </el-form-item>

      <el-form-item label="项目描述" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入项目描述" />
      </el-form-item>

      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker v-model="formData.startDate" type="datetime" placeholder="选择项目开始时间"
          value-format="YYYY-MM-DD HH:mm" format="YYYY-MM-DD HH:mm" :disabled-date="disableBeforeToday"
          :editable="false" />
      </el-form-item>

      <el-form-item label="结束日期" prop="endDate">
        <el-date-picker v-model="formData.endDate" type="datetime" placeholder="选择项目结束时间"
          value-format="YYYY-MM-DD HH:mm" format="YYYY-MM-DD HH:mm" :disabled-date="disableBeforeToday"
          :editable="false" />
      </el-form-item>

      <el-form-item label="打分标准" prop="standardId" @click="showInfo($refs)" ref="scoringStdRef">
        <el-select ref="scoringStdSelectRef" v-model="formData.standardId" filterable placeholder="选择打分标准"
          :disabled="editMode" :clearable="!editMode" :loading="loadingScoringStd" remote
          :remote-method="getScoringStdList" debounce="300" remote-show-suffix :prefix-icon="Search"
          popper-class="scoring-std-select-popper" @popup-scroll="handleScoringStdPopupScroll"
          @visible-change="handleScoringStdVisibleChange">
          <el-option v-for="item in scoringStdList" :key="item.id" :value="item.id" :label="item.name"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="恶意判定规则" prop="maliciousRuleType">
        <el-radio-group v-model="formData.maliciousRuleType" @change="handleRuleTypeChange">
          <el-radio label="AUTO">默认算法（MAD）</el-radio>
          <el-radio label="THRESHOLD">阈值区间</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="formData.maliciousRuleType === 'THRESHOLD'" label="总分阈值范围" required>
        <div class="threshold-range-row">
          <el-form-item class="threshold-item" prop="maliciousScoreLower">
            <el-input-number v-model="formData.maliciousScoreLower" :min="0" :precision="2" :step="0.5"
              controls-position="right" placeholder="最低分" />
          </el-form-item>
          <span class="threshold-separator">~</span>
          <el-form-item class="threshold-item" prop="maliciousScoreUpper">
            <el-input-number v-model="formData.maliciousScoreUpper" :min="0" :precision="2" :step="0.5"
              controls-position="right" placeholder="最高分" />
          </el-form-item>
        </div>
      </el-form-item>
      <div class="rule-tip">
        <el-alert v-if="formData.maliciousRuleType === 'AUTO'" type="info" :closable="false" show-icon>
          <template #default>
            使用默认 MAD 低分单侧算法识别恶意评分。
          </template>
        </el-alert>
        <el-alert v-else type="warning" :closable="false" show-icon>
          <template #default>
            使用阈值模式时，超出设定区间（小于最低分或大于最高分）的记录会被自动标记为恶意评分。
          </template>
        </el-alert>
      </div>

      <el-form-item v-if="!editMode" label="项目内受评分的小组" prop="groupIds">
        <div class="group-selector-field">
          <div class="group-selector-actions">
            <el-button type="primary" plain @click="groupSelectionVisible = true">
              选择项目小组
            </el-button>
            <span class="group-selector-summary">
              已选择 {{ selectedGroupDetails.length }} 个小组
            </span>
          </div>

          <div v-if="selectedGroupDetails.length" class="selected-group-list">
            <el-tag v-for="group in selectedGroupDetails" :key="group.id" closable
              @close="removeSelectedGroup(group.id)">
              {{ group.name }}
            </el-tag>
          </div>

          <el-empty v-else :image-size="70" description="暂未选择项目小组" style="height:40px;" />
        </div>
      </el-form-item>

      <!-- <el-form-item v-if="!editMode" label="评审团" prop="reviewerGroupId">
      <el-select v-model="formData.reviewerGroupId" placeholder="选择评审团" clearable>
        <el-option label="中期答辩评审组" :value="1" />
        <el-option label="期末答辩评审组" :value="2" />
      </el-select>
    </el-form-item> -->

      <el-form-item v-if="!editMode" ref="reviewerGroupChoiceRef" label="评审团" prop="reviewerGroupId" @click="showInfo">
        <el-select ref="reviewerGroupsSelectRef" v-model="formData.reviewerGroupId" placeholder="选择参与评分该项目的评审团"
          :loading="loadingReviewerGps" filterable remote :remote-method="getReviewerGroupList" debounce="500"
          :prefix-icon="Search" popper-class="reviewer-groups-select-popper"
          @popup-scroll="handleReviewerGroupsPopupScroll" @visible-change="handleReviewerGroupsVisibleChange">
          <el-option v-for="item in reviewerGroups" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="启用状态" v-if="editMode">
        <el-switch v-model="formData.isEnabled" size="large"
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" inline-prompt active-text="启用"
          inactive-text="停用" />
      </el-form-item>

    </el-form>

    <ProjectGroupSelectionModal v-if="!editMode" :visible="groupSelectionVisible" :selected-ids="formData.groupIds"
      :selected-groups="selectedGroupDetails" @update:visible="groupSelectionVisible = $event"
      @confirm="handleGroupSelectionConfirm" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Search } from '@element-plus/icons-vue';

// import BaseForm from '@/components/common/form/BaseForm.vue';

import { ScoringApi } from '@/api/scoring';
import { reviewerGroupApi } from '@/api/reviewer-group';
import { projectFormRules } from '../config/form-rules/projectForm';
import { useMessage } from '@/composables/useMessage';
import { useLoading } from '@/composables/useLoading';
import ProjectGroupSelectionModal from './ProjectGroupSelectionModal.vue';

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
      maliciousRuleType: 'AUTO',
      maliciousScoreLower: null,
      maliciousScoreUpper: null,
      isEnabled: true,
      status: 'not_started'
    })
  },
  editMode: {
    type: Boolean,
    default: false
  }
})

const message = useMessage();
const PAGE_SIZE = 10

const scoringStdRef = ref(null)
const scoringStdSelectRef = ref(null)
const reviewerGroupChoiceRef = ref(null)
const reviewerGroupsSelectRef = ref(null)
const showInfo = (ref) => {//ref比对
  console.log(ref.scoringStdRef == scoringStdRef.value)
  let msgInfo = '';
  if (ref.scoringStdRef == scoringStdRef.value && props.editMode) {//点击的是scoringStdRef
    msgInfo = '打分标准不可修改';

  }
  else if (ref.scoringStdRef == reviewerGroupChoiceRef.value && !props.editMode) {
    msgInfo = '评审团不可修改';
  }
  message.info(msgInfo)
}

const baseFormRef = ref(null)

const formData = ref(props.data)
const groupSelectionVisible = ref(false)
const selectedGroupDetails = ref([])

const normalizeRuleType = (ruleType) => {
  return ruleType === 'THRESHOLD' ? 'THRESHOLD' : 'AUTO';
}

const ensureMaliciousConfigDefaults = () => {
  formData.value.maliciousRuleType = normalizeRuleType(formData.value.maliciousRuleType);
  if (formData.value.maliciousRuleType !== 'THRESHOLD') {
    formData.value.maliciousScoreLower = null;
    formData.value.maliciousScoreUpper = null;
  }
}

const handleRuleTypeChange = (ruleType) => {
  formData.value.maliciousRuleType = normalizeRuleType(ruleType);
  if (formData.value.maliciousRuleType !== 'THRESHOLD') {
    formData.value.maliciousScoreLower = null;
    formData.value.maliciousScoreUpper = null;
  }
}

/**
 * 日期时间选择器的禁用函数，禁止选择今天之前的日期
 * @param {Date} date 待判断的日期对象
 * @returns {Boolean} 如果日期在今天之前则返回 true，否则返回 false
 */
const disableBeforeToday = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date.getTime() < today.getTime()
}

/**
 * 将日期时间格式化为分钟级别，去除秒和毫秒部分
 * @param {String} value 日期时间字符串
 * @param value
 */
const normalizeDateTimeToMinute = (value) => {
  if (!value || typeof value !== 'string') {
    return value
  }

  const matched = value.match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}):(\d{2}))?/)
  if (!matched) {
    return value
  }

  const [, datePart, hours = '00', minutes = '00'] = matched
  return `${datePart} ${hours}:${minutes}`
}

/**
 * 同步日期时间字段到分钟级别，确保后端接收的格式正确
 * 主要用于日期时间选择器的值变化时，去除秒和毫秒部分，避免后端验证失败
 * 在编辑模式下，组件初始化时也会调用一次，确保初始数据格式正确
 *  @description 目前后端对日期时间的验证比较严格，要求必须是分钟级别的格式（YYYY-MM-DD HH:mm），
 */
const syncDateTimeFields = () => {
  formData.value.startDate = normalizeDateTimeToMinute(formData.value.startDate)
  formData.value.endDate = normalizeDateTimeToMinute(formData.value.endDate)
}

const scoringStdList = ref([]);
const scoringStdQuery = ref({ keyword: '', page: 1, hasMore: true })
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

const { isLoading: loadingScoringStd, start: startLoadingScoringStd, end: endLoadingScoringStd } = useLoading('projectForm:scoringStd')
const getScoringStdList = async (keywords = '') => {
  scoringStdQuery.value = {
    keyword: keywords,
    page: 1,
    hasMore: true
  }

  startLoadingScoringStd();
  try {
    const response = await ScoringApi.getScoringStandardsList({
      keyWords: keywords,
      page: 1,
      size: PAGE_SIZE
    });
    const list = response.data.list || []
    const total = Number(response.data.total || 0)

    scoringStdList.value = list;
    scoringStdQuery.value.hasMore = total > 0 ? list.length < total : list.length >= PAGE_SIZE
    console.log('获取项目打分标准', response.data)
  } catch (err) {
    console.log('获取打分标准失败', err)
  } finally {
    endLoadingScoringStd();
  }
}

const handleScoringStdVisibleChange = (visible) => {
  if (visible && !scoringStdList.value.length) {
    getScoringStdList(scoringStdQuery.value.keyword)
  }
}

const handleScoringStdPopupScroll = (event) => {
  const target = getScoringStdScrollTarget(event)
  if (!target || loadingScoringStd.value || !scoringStdQuery.value.hasMore) {
    return
  }

  const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight <= 20
  if (!isNearBottom) {
    return
  }

  loadMoreScoringStandards()
}

const getScoringStdScrollTarget = (event) => {
  if (event?.target) {
    return event.target
  }

  const wrapRef = scoringStdSelectRef.value?.popperRef?.contentRef?.querySelector('.el-select-dropdown__wrap')
  if (wrapRef) {
    return wrapRef
  }

  return document.querySelector('.scoring-std-select-popper .el-select-dropdown__wrap')
}

const loadMoreScoringStandards = async () => {
  if (loadingScoringStd.value || !scoringStdQuery.value.hasMore) {
    return
  }

  const nextPage = scoringStdQuery.value.page + 1
  startLoadingScoringStd();
  try {
    const response = await ScoringApi.getScoringStandardsList({
      keyWords: scoringStdQuery.value.keyword,
      page: nextPage,
      size: PAGE_SIZE
    });
    const list = response.data.list || []
    const total = Number(response.data.total || 0)
    const existingIds = new Set(scoringStdList.value.map(item => item.id))
    const uniqueList = list.filter(item => !existingIds.has(item.id))

    scoringStdList.value = [...scoringStdList.value, ...uniqueList]
    scoringStdQuery.value.page = nextPage
    scoringStdQuery.value.hasMore = total > 0
      ? scoringStdList.value.length < total
      : list.length >= PAGE_SIZE
  } catch (err) {
    console.log('加载更多打分标准失败', err)
  } finally {
    endLoadingScoringStd();
  }
}

const handleGroupSelectionConfirm = ({ ids, groups }) => {
  formData.value.groupIds = ids;
  selectedGroupDetails.value = groups;
};

const removeSelectedGroup = (groupId) => {
  formData.value.groupIds = formData.value.groupIds.filter(id => id !== groupId);
  selectedGroupDetails.value = selectedGroupDetails.value.filter(group => group.id !== groupId);
};

const reviewerGroups = ref([])
const reviewerGroupsQuery = ref({ keyword: '', page: 1, hasMore: true })
const { isLoading: loadingReviewerGps, start: startLoadingReviewerGps, end: endLoadingReviewerGps } = useLoading('projectForm:reviewerGroups')
const getReviewerGroupList = async (keywords = '') => {
  reviewerGroupsQuery.value = {
    keyword: keywords,
    page: 1,
    hasMore: true
  }

  startLoadingReviewerGps();
  console.log('searching reviewer group list', keywords)
  try {
    const response = await reviewerGroupApi.getReviewerGroupList({
      keyWords: keywords,
      page: 1,
      size: PAGE_SIZE
    })
    const list = response.data.list || []
    const total = Number(response.data.total || 0)

    reviewerGroups.value = list;
    reviewerGroupsQuery.value.hasMore = total > 0 ? list.length < total : list.length >= PAGE_SIZE
  } catch (err) {
    console.log(err)
  } finally {
    endLoadingReviewerGps();
  }
}

const handleReviewerGroupsVisibleChange = (visible) => {
  if (visible && !reviewerGroups.value.length) {
    getReviewerGroupList(reviewerGroupsQuery.value.keyword)
  }
}

const handleReviewerGroupsPopupScroll = (event) => {
  const target = getReviewerGroupsScrollTarget(event)
  if (!target || loadingReviewerGps.value || !reviewerGroupsQuery.value.hasMore) {
    return
  }

  const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight <= 20
  if (!isNearBottom) {
    return
  }

  loadMoreReviewerGroups()
}

const getReviewerGroupsScrollTarget = (event) => {
  if (event?.target) {
    return event.target
  }

  const wrapRef = reviewerGroupsSelectRef.value?.popperRef?.contentRef?.querySelector('.el-select-dropdown__wrap')
  if (wrapRef) {
    return wrapRef
  }

  return document.querySelector('.reviewer-groups-select-popper .el-select-dropdown__wrap')
}

const loadMoreReviewerGroups = async () => {
  if (loadingReviewerGps.value || !reviewerGroupsQuery.value.hasMore) {
    return
  }

  const nextPage = reviewerGroupsQuery.value.page + 1
  startLoadingReviewerGps();
  try {
    const response = await reviewerGroupApi.getReviewerGroupList({
      keyWords: reviewerGroupsQuery.value.keyword,
      page: nextPage,
      size: PAGE_SIZE
    })
    const list = response.data.list || []
    const total = Number(response.data.total || 0)
    const existingIds = new Set(reviewerGroups.value.map(item => item.id))
    const uniqueList = list.filter(item => !existingIds.has(item.id))

    reviewerGroups.value = [...reviewerGroups.value, ...uniqueList]
    reviewerGroupsQuery.value.page = nextPage
    reviewerGroupsQuery.value.hasMore = total > 0
      ? reviewerGroups.value.length < total
      : list.length >= PAGE_SIZE
  } catch (err) {
    console.log(err)
  } finally {
    endLoadingReviewerGps();
  }
}

// const formIsValid = ref(false)
const validateFormAsync = async () => {
  try {
    // 等待验证结果，通过则返回成功对象
    await baseFormRef.value.validate();
    return { valid: true, data: formData.value };
  } catch (error) {
    // 验证失败时返回失败对象，error 包含验证字段信息（可选）
    return { valid: false, data: formData.value, error };
  }
}
defineExpose({
  validate: validateFormAsync
})

watch(
  () => [props.editMode, props.data?.standardId],
  async () => {
    if (props.editMode) {
      await initProjectFormData();
    }
  },
  { deep: true }
)

watch(
  () => [props.data?.startDate, props.data?.endDate],
  () => {
    syncDateTimeFields()
  }
)

watch(
  () => props.data?.maliciousRuleType,
  () => {
    ensureMaliciousConfigDefaults()
  }
)

watch(
  () => props.data?.groupIds,
  (newGroupIds) => {
    if (!Array.isArray(newGroupIds)) {
      selectedGroupDetails.value = [];
      return;
    }

    selectedGroupDetails.value = selectedGroupDetails.value.filter(group => newGroupIds.includes(group.id));
  },
  { deep: true, immediate: true }
)

onMounted(() => {
  syncDateTimeFields()
  ensureMaliciousConfigDefaults()
  if (props.editMode) {
    initProjectFormData();
  }
})
</script>

<style scoped>
.project-form-wrapper {
  width: 100%;
}

.group-selector-field {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-selector-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.group-selector-summary {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.selected-group-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
}

.threshold-range-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.threshold-item {
  margin-bottom: 0;
}

.threshold-separator {
  color: var(--el-text-color-secondary);
}

.rule-tip {
  margin: 4px 0 12px;
}
</style>
