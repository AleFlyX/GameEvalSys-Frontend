<template>
  <MyBtn type="primary" @click="handleGoBack">返回</MyBtn>
  <!-- <p>test data:{{ formData }}</p>
  <p>groupsChanged:: {{ isDataAdjusted.groupIdsChanged }}</p>
  <p>scorerIdsChanged:: {{ isDataAdjusted.scorerIdsChanged }}</p>
  <button @click="isDataChanged(formData)">isDataChanged??</button> -->
  <PagePanel>
    <template #header>
      <div class="project-edit-header">
        <h2>编辑项目: {{ projectName }}</h2>
        <p class="subtitle">填写项目基本信息、小组分配和评审团配置</p>
      </div>
    </template>

    <template #main-table>
      <div class="project-edit-container">
        <el-tabs v-model="activeTab" @tab-click="onTabChange" v-loading="initLoading || isSaving">
          <!-- Tab 1: 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <ProjectForm v-if="activeTab === 'basic'" ref="projectFormRef" edit-mode :data="formData" />
          </el-tab-pane>

          <!-- Tab 2: 项目内受评分的小组 -->
          <el-tab-pane label="项目内受评分的小组" name="groups">
            <ProjectGroups v-if="activeTab === 'groups'" ref="groupsFormRef" :project-id="formData.id"
              @edited="projectGroupCache = $event" :edited-at-local="projectGroupCache.edited"
              :goroup-ids-cache="projectGroupCache.cache" @update:group-ids="handleNewGroupIds"
              @error-notice="message.error($event)" @success-notice="message.success($event)" />
          </el-tab-pane>

          <!-- Tab 3: 评审团配置 -->
          <el-tab-pane label="评审团配置" name="reviewer">
            <ProjectReviewGroups v-if="activeTab === 'reviewer'" :project-id="formData.id"
              :scorer-ids="formData.scorerIds" @edited="projectScorerCache = $event"
              :scorer-cache="projectScorerCache.cache" :edited-at-local="projectScorerCache.edited"
              @update:scorer-ids="handleNewScorerIds" />
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
import { useLoading } from '@/composables/useLodaing';

import PagePanel from '@/layouts/PagePanel.vue';
import MyBtn from '@/components/common/form/MyBtn.vue';
import ProjectForm from '../components/ProjectForm.vue';
import ProjectGroups from '../components/ProjectGroups.vue';
import ProjectReviewGroups from '../components/ProjectReviewGroups.vue';

import { projectApi } from '@/api/project';

import { showMsgBox } from '@/utils/ConfirmBox';

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
  scorerIdsChanged: false
});

const projectFormRef = ref(null);

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
  groupIds: [],
  scorerIds: [],
  // reviewerGroupIds: [],
  isEnabled: true,
  status: 'not_started'
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
      Object.assign(formData, response.data);
      console.log('初始化表单数据', response.data)
      console.log('**********BASIC************', formData)
      // originalFormData = response.data;
      projectName.value = formData.name;
      // basicFormValidator.value = projectFormRef.value;
    }
  } catch (err) {
    message.error(`加载项目信息失败: ${err}`);
    router.back();
  }
};

// 根据是否有对相关数据产生变更来决定产生变更
const isDataChanged = computed(() => isDataAdjusted.basicInfoChanged || isDataAdjusted.groupIdsChanged || isDataAdjusted.scorerIdsChanged)

/**
 * 根据变更的数据构造发送到后端的DTO
 * @param {Object} data
 */
const buildEditedData = (data) => {

  // 未做出任何改动直接退出
  if (!isDataChanged.value) {
    return;
  }
  if (!isDataAdjusted.groupIdsChanged) {
    delete data.groupIds;
  }
  if (!isDataAdjusted.scorerIdsChanged) {
    delete data.scorerIds;
  }
  console.log("DELETED DATA", data)
  return data;
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
        router.push('/project')
      })
    return;
  }
  router.push('/project')
}

// 小组数据是否被编辑过
const projectGroupCache = reactive({
  edited: false,
  cache: []
});
// watch(projectGroupCache, (new1) => {
//   console.log(new1)
// })
//更新项目表单的小组数据
const handleNewGroupIds = (newArr) => {
  console.log('RECV NEW GROUPS ARRAY------------', newArr);
  isDataAdjusted.groupIdsChanged = true;
  formData.groupIds = newArr;
}

// 小组数据是否被编辑过
const projectScorerCache = reactive({
  edited: false,
  cache: []
});
// watch(() => projectScorerCache.cache, (newVals) => {
//   console.log('SCORER IDS CHANGED', newVals)
// })
// 更新项目表单的打分者数据
const handleNewScorerIds = (newArr) => {
  console.log('RECV NEW scorer ARRAY------------', newArr);
  console.log('SCORER IDS CHANGED', projectScorerCache)
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

  formValidatedData = buildEditedData(formValidatedData);

  isSubmitting.value = true;

  try {
    await saveFormRequest(projectApi.editProject, formData.id, formValidatedData);
    console.log('项目编辑表单数据', formValidatedData)
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
  if (isDataAdjusted.basicInfoChanged || isDataAdjusted.groupIdsChanged || isDataAdjusted.scorerIdsChanged) {
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
    unWatch = watch(
      // 第一个参数：返回需要监听的属性集合（函数形式）
      () => [
        formData.name,
        formData.description,
        formData.startDate,
        formData.endDate,
        formData.standardId,
        formData.isEnabled
      ],
      // 第二个参数：变化后的回调
      (newVals, oldVals) => {
        // console.log('BASIC INFO CHANGED', newVals);
        isDataAdjusted.basicInfoChanged = true;
      })
  } catch (err) {
    console.log('初始化失败', err)
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
.project-edit-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.project-edit-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: var(--el-text-color-primary);
}

.project-edit-header .subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.project-edit-container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.tab-content {
  padding: 20px 0;
}

.groups-tips,
.reviewer-tips {
  margin-top: 24px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
}

.form-actions :deep(.el-button) {
  min-width: 100px;
}

.reviewer-members {
  margin-top: 24px;
}

.reviewer-members h4 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}
</style>
