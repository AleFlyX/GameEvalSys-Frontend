<template>
  <!-- <p>test data:{{ formData }}</p>
  <p>groupsChanged:: {{ isDataAdjusted.groupIdsChanged }}</p>
  <p>scorerIdsChanged:: {{ isDataAdjusted.scorerIdsChanged }}</p>
  <button @click="isDataChanged(formData)">isDataChanged??</button> -->
  <PagePanel>
    <div class="project-edit-topbar">
      <BackButton :custom-handler="handleGoBack" class="project-edit-back-btn" />
      <div class="project-edit-header">
        <h2>编辑项目: {{ projectName }}</h2>
        <p class="subtitle">填写项目基本信息、小组分配和评审团配置</p>
      </div>
    </div>

    <template #main-table>
      <div class="project-edit-container">
        <el-tabs v-model="activeTab" v-loading="initLoading || isSaving">
          <!-- Tab 1: 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <ProjectForm ref="projectFormRef" edit-mode :data="formData" />
          </el-tab-pane>

          <!-- Tab 2: 项目内受评分的小组 -->
          <el-tab-pane label="项目内受评分的小组" name="groups" lazy>
            <ProjectGroups ref="groupsFormRef" :project-id="formData.id" @edited="projectGroupCache = $event"
              :edited-at-local="projectGroupCache.edited" :goroup-ids-cache="projectGroupCache.cache"
              @update:group-ids="handleNewGroupIds" @error-notice="message.error($event)"
              @success-notice="message.success($event)" />
          </el-tab-pane>

          <!-- Tab 3: 评审团配置 -->
          <el-tab-pane label="评审团配置" name="reviewer" lazy>
            <ProjectReviewGroups :project-id="formData.id" :scorer-ids="formData.scorerIds"
              @edited="projectScorerCache = $event" :scorer-cache="projectScorerCache.cache"
              :edited-at-local="projectScorerCache.edited" @update:scorer-ids="handleNewScorerIds"
              @error-notice="message.error($event)" @success-notice="message.success($event)" />
          </el-tab-pane>
          <el-tab-pane label="作业配置" name="submission">
            <div class="tab-content submission-tab-content">
              <SubmissionConfigForm ref="submissionConfigRef" :data="formData" />
              <GradingStandardManager />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </template>

    <template #footer>
      <div class="form-actions">
        <el-button type="primary" :loading="isSubmitting" @click="handleSave">
          保存更改
        </el-button>
        <el-button @click="handleGoBack">取消</el-button>
      </div>
    </template>
  </PagePanel>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useMessage } from '@/composables/useMessage';
import { useLoading } from '@/composables/useLoading';

import PagePanel from '@/layouts/PagePanel.vue';
import ProjectForm from '../components/ProjectForm.vue';
import ProjectGroups from './components/ProjectGroups.vue';
import ProjectReviewGroups from './components/ProjectReviewGroups.vue';
import SubmissionConfigForm from './components/SubmissionConfigForm.vue';
import GradingStandardManager from './components/GradingStandardManager.vue';

import { projectApi } from '@/api/project';
import { buildSubmissionConfigPayload, normalizeProjectSubmissionConfig } from '@/utils/submission';

import { showMsgBox } from '@/utils/ConfirmBox';

defineOptions({
  name: 'ProjectEditPage'
})

const message = useMessage();
const router = useRouter();
const route = useRoute();
// const projectStore = useProjectStore();

const projectName = ref('');
const activeTab = ref('basic'); // 默认激活第一个tab

const isSubmitting = ref(false);

const isDataAdjusted = reactive({ // 标记被改的数据
  basicInfoChanged: false,
  groupIdsChanged: false,
  scorerIdsChanged: false,
  submissionConfigChanged: false
});

const projectFormRef = ref(null);
const submissionConfigRef = ref(null);

/**
 * groupIds,scorerIds若为空值则说明没有产生更改,对应后端按传过去的字段来修改内容
 * 所以这俩数据只有被访问 且产生更改的时候才会让这俩值 有内容,从而被后端识别到并更改
 */

const formData = reactive({
  id: '',
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  standardId: '',
  maliciousRuleType: 'AUTO',
  maliciousScoreLower: null,
  maliciousScoreUpper: null,
  groupIds: [],
  scorerIds: [],
  // reviewerGroupIds: [],
  isEnabled: true,
  status: 'not_started',
  allowSubmission: false,
  submissionStartDate: null,
  submissionEndDate: null,
  submissionFileTypes: [],
  submissionPptTypes: [],
  submissionMaxSize: null,
  submissionPptMaxSize: null,
  submissionRequired: false,
  enableAiScoring: false,
  enableResubmit: true
});

const { isLoading: initLoading, requestWithLoading: initRequest } = useLoading('projectEdit:initForm');
// 初始化表单数据
const initFormData = async () => {
  try {
    // await fetchReviewerGroupOptions();
      const projectId = route.params.id;
      if (projectId) {
        // 这里应该调用 API 获取项目详情
        const response = await initRequest(projectApi.getProjectDetail, projectId)
        Object.assign(formData, response.data, normalizeProjectSubmissionConfig(response.data));
        projectName.value = formData.name;
    }
  } catch (err) {
    message.error(`加载项目信息失败: ${err}`);
    router.back();
  }
};

// 根据是否有对相关数据产生变更来决定产生变更
const isDataChanged = computed(() => (
  isDataAdjusted.basicInfoChanged
  || isDataAdjusted.groupIdsChanged
  || isDataAdjusted.scorerIdsChanged
  || isDataAdjusted.submissionConfigChanged
))

const buildBasicInfoSnapshot = (data) => ([
  data.name,
  data.description,
  data.startDate,
  data.endDate,
  data.standardId,
  data.maliciousRuleType,
  data.maliciousScoreLower,
  data.maliciousScoreUpper,
  data.isEnabled
]);

const buildSubmissionConfigSnapshot = (data) => {
  const normalized = normalizeProjectSubmissionConfig(data);
  return [
    normalized.allowSubmission,
    normalized.submissionStartDate,
    normalized.submissionEndDate,
    normalized.submissionFileTypes.join(','),
    normalized.submissionPptTypes.join(','),
    normalized.submissionMaxSize,
    normalized.submissionPptMaxSize,
    normalized.submissionRequired,
    normalized.enableAiScoring,
    normalized.enableResubmit,
  ];
};

/**
 * 根据变更的数据构造发送到后端的DTO
 * @param {Object} data
 */
const buildEditedData = (data) => {
  // 未做出任何改动直接退出
  if (!isDataChanged.value) {
    return;
  }

  const payload = {
    ...data,
    ...buildSubmissionConfigPayload(data),
  };

  if (!isDataAdjusted.groupIdsChanged) {
    delete payload.groupIds;
  }
  if (!isDataAdjusted.scorerIdsChanged) {
    delete payload.scorerIds;
  }
  if (!isDataAdjusted.submissionConfigChanged) {
    delete payload.allowSubmission;
    delete payload.submissionStartDate;
    delete payload.submissionEndDate;
    delete payload.submissionFileTypes;
    delete payload.submissionPptTypes;
    delete payload.submissionMaxSize;
    delete payload.submissionPptMaxSize;
    delete payload.submissionRequired;
    delete payload.enableAiScoring;
    delete payload.enableResubmit;
  }

  return payload;
}


const { isLoading: isSaving, requestWithLoading: saveFormRequest } = useLoading('projectEdit:saveForm')
const handleGoBack = () => {
  if (isDataChanged.value) {
    showMsgBox('未保存', '检测到有做出更改,是否保存', { confirmButtonText: '立即保存' })
      .then(async () => {
        await handleSave();
      })
      .catch(() => {
        message.info('取消保存')
      }).finally(() => {
        router.push('/admin/project')
      })
    return;
  }
  router.push('/admin/project')
}

// 小组数据是否被编辑过
const projectGroupCache = reactive({
  edited: false,
  cache: []
});
//更新项目表单的小组数据
const handleNewGroupIds = (newArr) => {
  isDataAdjusted.groupIdsChanged = true;
  formData.groupIds = newArr;
}

// 小组数据是否被编辑过
const projectScorerCache = reactive({
  edited: false,
  cache: []
});
// 更新项目表单的打分者数据
const handleNewScorerIds = (newArr) => {
  isDataAdjusted.scorerIdsChanged = true;
  formData.scorerIds = newArr;
}

// 保存更改
const handleSave = async () => {

  // 如果当前不在 basic tab 或还没有获取过 basicFormValidator，则先切到 basic tab
  if (activeTab.value !== 'basic' || !projectFormRef.value) {
    activeTab.value = 'basic';
    await nextTick(); // 等待 DOM 更新，确保组件被渲染
  }

  let formValidatedData = {}
  // 验证基本信息
  try {
    const { valid, data } = await projectFormRef.value.validate();
    formValidatedData = data;
    if (!valid) return;
  } catch (err) {
    message.error('表单验证失败: ' + err);
    return;
  }

  if (submissionConfigRef.value) {
    const { valid } = await submissionConfigRef.value.validate();
    if (!valid) {
      activeTab.value = 'submission';
      message.error('请先完善作业提交流程配置');
      return;
    }
  }

  formValidatedData = buildEditedData(formValidatedData);
  if (!formValidatedData) {
    message.info('未检测到需要保存的更改');
    return;
  }

  isSubmitting.value = true;

  try {
    await saveFormRequest(projectApi.editProject, formData.id, formValidatedData);
    message.success('项目已成功更新');
    router.back();
  } catch (err) {
    message.error(`保存项目失败: ${err}`);
  } finally {
    isSubmitting.value = false;
  }
};

// 浏览器刷新/关闭时的提醒逻辑
const handleBeforeUnload = (e) => {
  if (isDataChanged.value) {
    // 标准写法：阻止默认行为 + 设置返回值（不同浏览器兼容）
    e.preventDefault();
    e.returnValue = '';
    // 部分浏览器需要返回字符串（兼容处理）
    return '';
  }
};
let unWatch = null;
onMounted(async () => {
  window.addEventListener('beforeunload', handleBeforeUnload);
  try {
    await initFormData();
    const unwatchBasicInfo = watch(buildBasicInfoSnapshot.bind(null, formData), () => {
      isDataAdjusted.basicInfoChanged = true;
    });
    const unwatchSubmissionConfig = watch(buildSubmissionConfigSnapshot.bind(null, formData), () => {
      isDataAdjusted.submissionConfigChanged = true;
    });
    unWatch = () => {
      unwatchBasicInfo();
      unwatchSubmissionConfig();
    };
  } catch (err) {
    console.error('项目编辑页初始化失败', err);
  }

});
// 因为在onMounted 内创建的 watch 不会自动和组件生命周期绑定，所以需手动销毁
onUnmounted(() => {
  // 解绑事件
  window.removeEventListener('beforeunload', handleBeforeUnload);
  if (unWatch === null) {
    return;
  }
  unWatch();
})
</script>

<style scoped>
.project-edit-topbar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 16px;
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

html[data-theme="dark"] .project-edit-topbar {
  border-color: rgba(255, 255, 255, 0.08);
}

.project-edit-back-btn {
  flex: 0 0 auto;
}

.project-edit-header {
  flex: 1;
}

.project-edit-header h2 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
}

.project-edit-header .subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.project-edit-container {
  background: transparent;
  padding: 0;
}

/* Modernize el-tabs */
.project-edit-container :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: var(--border);
}

html[data-theme="dark"] .project-edit-container :deep(.el-tabs__nav-wrap::after) {
  background-color: rgba(255, 255, 255, 0.08);
}

.project-edit-container :deep(.el-tabs__item) {
  font-size: 15px;
  padding: 0 24px;
  height: 48px;
  line-height: 48px;
  color: var(--text-secondary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.project-edit-container :deep(.el-tabs__item.is-active) {
  color: var(--el-color-primary);
  font-weight: 600;
}

.tab-content {
  padding: 24px 0;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid var(--border);
  margin-top: 20px;
}

html[data-theme="dark"] .form-actions {
  border-top-color: rgba(255, 255, 255, 0.08);
}

.form-actions :deep(.el-button) {
  min-width: 100px;
  border-radius: 8px;
  height: 38px;
}

.reviewer-members h4 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: var(--text-disabled);
  font-size: 14px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px dashed var(--border);
}

html[data-theme="dark"] .empty-state {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.05);
}

.submission-tab-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
