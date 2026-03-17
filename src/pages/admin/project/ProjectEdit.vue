<template>
  <MyBtn type="primary" @click="handleGoBack">返回</MyBtn>
  <PagePanel>
    <template #header>
      <div class="project-edit-header">
        <h2>编辑项目: {{ projectName }}</h2>
        <p class="subtitle">填写项目基本信息、小组分配和评审团配置</p>
      </div>
    </template>

    <template #main-table>
      <div class="project-edit-container">
        <el-tabs v-model="activeTab" @tab-click="onTabChange">
          <!-- Tab 1: 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <ProjectForm v-if="activeTab === 'basic'" ref="projectFormRef" edit-mode :data="formData" />
          </el-tab-pane>

          <!-- Tab 2: 项目内受评分的小组 -->
          <el-tab-pane label="项目内受评分的小组" name="groups">
            <ProjectGroups v-if="activeTab === 'groups'" ref="groupsFormRef" :project-id="formData.id"
              @update:group-ids="handleNewGroupIds" @error-notice="ElMessage.error($event)"
              @success-notice="ElMessage.success($event)" />
          </el-tab-pane>

          <!-- Tab 3: 评审团配置 -->
          <el-tab-pane label="评审团配置" name="reviewer">
            <ProjectReviewGroups v-if="activeTab === 'reviewer'" :project-id="formData.id"
              :scorer-ids="formData.scorerIds" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </template>

    <template #footer>
      <div class="form-actions">
        <el-button type="primary" :loading="isSubmitting" @click="handleSave">
          保存更改
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </template>
  </PagePanel>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

// import { useProjectStore } from '@/stores/modules/projectStore';

import PagePanel from '@/layouts/PagePanel.vue';
import MyBtn from '@/components/common/form/MyBtn.vue';

import { projectApi } from '@/api/project';

import ProjectForm from './components/ProjectForm.vue';
import ProjectGroups from './components/ProjectGroups.vue';
import ProjectReviewGroups from './components/ProjectReviewGroups.vue';
import { showMsgBox } from '@/utils/ConfirmBox';


const router = useRouter();
const route = useRoute();
// const projectStore = useProjectStore();

const projectName = ref('');
const activeTab = ref('basic'); // 默认激活第一个tab
const isSubmitting = ref(false);
const isDataAdjusted = ref(false);//是否对当前页面产生改动

const projectFormRef = ref(null);
// const basicFormValidator = ref(null);

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
  reviewerGroupIds: [],
  isEnabled: true,
  status: 'not_started'
});

const handleGoBack = () => {
  if (isDataAdjusted.value) {
    showMsgBox('未保存', '检测到有做出更改,是否保存', { confirmButtonText: '立即保存' })
      .then(async () => {
        await handleSave()
      })
      .catch(() => {
        ElMessage.info('取消保存')
      }).finally(() => {
        router.push('/project')
      })
    return;
  }
  router.push('/project')
}

// 初始化表单数据
const initFormData = async () => {
  try {
    // await fetchReviewerGroupOptions();

    const projectId = route.params.id;
    if (projectId) {
      // 这里应该调用 API 获取项目详情
      const response = await projectApi.getProjectDetail(projectId);
      Object.assign(formData, response.data);
      console.log('初始化表单数据', response.data)
      console.log('**********BASIC************', formData)
      projectName.value = formData.name;
      // basicFormValidator.value = projectFormRef.value;
    }
  } catch (err) {
    ElMessage.error(`加载项目信息失败: ${err}`);
    router.back();
  }
};

//更新项目表单的小组数据
const handleNewGroupIds = (newArr) => {
  console.log('RECV NEW GROUPS ARRAY------------', newArr);
  isDataAdjusted.value = true;
  formData.groupIds = newArr;
}

// 保存更改
const handleSave = async () => {
  // 如果当前不在 basic tab 或还没有获取过 basicFormValidator，则先切到 basic tab
  if (activeTab.value !== 'basic' || !projectFormRef.value) {
    activeTab.value = 'basic';
    await nextTick(); // 等待 DOM 更新，确保组件被渲染
  }

  // 验证基本信息
  try {
    const { valid } = await projectFormRef.value.validate();
    if (!valid) return;
  } catch (err) {
    ElMessage.error('表单验证失败: ' + err);
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await projectApi.editProject(formData.id, formData);
    console.log('项目编辑表单数据', formData)
    ElMessage.success(`${response.message}`);
    ElMessage.success('项目已成功更新');
    router.back();
  } catch (err) {
    ElMessage.error(`保存项目失败: ${err}`);
  } finally {
    isSubmitting.value = false;
  }
};

// 取消编辑
const handleCancel = () => {
  ElMessageBox.confirm('确实要放弃编辑吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      router.back();
    })
    .catch(() => {
      // 用户取消
    });
};

onMounted(() => {
  initFormData();
});
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
