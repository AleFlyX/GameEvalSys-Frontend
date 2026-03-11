<template>
  <MyBtn type="primary" @click="$router.push('/project')">返回</MyBtn>
  <PagePanel>
    <template #header>
      <div class="project-edit-header">
        <h2>编辑项目: {{ formData.name }}</h2>
        <p class="subtitle">填写项目基本信息、小组分配和评审团配置</p>
      </div>
    </template>

    <template #main-table>
      <div class="project-edit-container">
        <el-tabs v-model="activeTab">
          <!-- Tab 1: 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <ProjectForm ref="projectFormRef" edit-mode :data="formData">
            </ProjectForm>
          </el-tab-pane>

          <!-- Tab 2: 项目内受评分的小组 -->
          <el-tab-pane label="项目内受评分的小组" name="groups">
            <ProjectGroups ref="groupsFormRef" :groups-list="groupsList">
            </ProjectGroups>
          </el-tab-pane>

          <!-- Tab 3: 评审团配置 -->
          <el-tab-pane label="评审团配置" name="reviewer">
            <ProjectReviewGroups :reviewer-group-members="reviewerGroupMembers"></ProjectReviewGroups>
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
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

// import { useProjectStore } from '@/stores/modules/projectStore';

import PagePanel from '@/layouts/PagePanel.vue';
import MyBtn from '@/components/common/form/MyBtn.vue';

import { projectApi } from '@/api/project';
import { groupApi } from '@/api/reviewer-group';
import { getProjectGroups } from '@/api/project-group';
import { userApi } from '@/api/user'
import ProjectForm from './components/ProjectForm.vue';
import ProjectGroups from './components/ProjectGroups.vue';
import ProjectReviewGroups from './components/ProjectReviewGroups.vue';


const router = useRouter();
const route = useRoute();
// const projectStore = useProjectStore();

const activeTab = ref('basic');
const isSubmitting = ref(false);

const projectFormRef = ref(null);
const groupsFormRef = ref(null);
const reviewerFormRef = ref(null);

const groupsList = ref([]);
const reviewerGroupMembers = ref([]);
const reviewerGroupOptions = ref([]);

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

// 获取评审团列表
const fetchReviewerGroupOptions = async () => {
  try {
    const response = await groupApi.getReviewerGroupList({ size: 100, isEnabled: true });
    reviewerGroupOptions.value = response.data?.records || response.data || [];
    console.log('获取评审团列表', reviewerGroupOptions.value)
  } catch (err) {
    ElMessage.error(`加载评审团列表失败: ${err}`);
    reviewerGroupOptions.value = [];
  }
};

// 获取项目关联的小组列表
const fetchProjectGroups = async () => {
  try {
    const projectId = route.params.id;
    if (projectId) {

      const response = await getProjectGroups(projectId);
      console.log('获取项目关联的小组列表', response.data)
      groupsList.value = response.data || [];
    }
  } catch (err) {
    ElMessage.error(`加载项目小组列表失败: ${err}`);
    groupsList.value = [];
  }
};

// 获取评审团成员列表
const fetchReviewerGroupMembers = async () => {
  try {
    const params = { ids: formData.scorerIds, includeDisabled: true }
    const response = await userApi.getUsersByIds(params);//batch get users

    // reviewerGroupMembers.value = response.data?.list || [];
    reviewerGroupMembers.value = response.data || [];
    console.log('获取评审团成员列表', response.data)
  } catch (err) {
    ElMessage.error(`加载评审团成员列表失败: ${err}`);
    reviewerGroupMembers.value = [];
  }
};

// 编辑小组
const handleEditGroup = (row) => {
  ElMessage.info(`编辑小组功能开发中: ${row.name}`);
  // TODO: 实现小组编辑逻辑
};

// 删除小组
const handleDeleteGroup = (row) => {
  ElMessage.confirm(`确定要删除小组 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        // TODO: 调用删除 API
        // await projectApi.removeGroupFromProject(formData.id, row.id);
        ElMessage.success(`小组 "${row.name}" 已删除`);
        await fetchProjectGroups();
      } catch (err) {
        ElMessage.error(`删除小组失败: ${err}`);
      }
    })
    .catch(() => {
      // 用户取消
    });
};

// 编辑成员
const handleEditMember = (row) => {
  ElMessage.info(`编辑成员功能开发中: ${row.name}`);
  // TODO: 实现成员编辑逻辑
};

// 删除成员
const handleDeleteMember = (row) => {
  ElMessage.confirm(`确定要从评审团中删除成员 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        // TODO: 调用删除成员 API
        // await groupApi.removeMemberFromGroup(formData.reviewerGroupId, row.id);
        ElMessage.success(`成员 "${row.name}" 已删除`);
        await fetchReviewerGroupMembers();
      } catch (err) {
        ElMessage.error(`删除成员失败: ${err}`);
      }
    })
    .catch(() => {
      // 用户取消
    });
};

// 初始化表单数据
const initFormData = async () => {
  try {
    // 先加载评审团列表
    await fetchReviewerGroupOptions();

    const projectId = route.params.id;
    if (projectId) {
      // 这里应该调用 API 获取项目详情
      const response = await projectApi.getProjectDetail(projectId);

      //将一个或者多个源对象中所有可枚举的自有属性复制到目标对象，并返回修改后的目标对象。
      Object.assign(formData, response.data);
      console.log('初始化表单数据', response.data)
      // 加载小组列表和评审团成员
      await fetchProjectGroups();
      await fetchReviewerGroupMembers();
    }
  } catch (err) {
    ElMessage.error(`加载项目信息失败: ${err}`);
    router.back();
  }
};

// 验证所有 tab 的表单
const validateAllForms = async () => {
  try {
    // 验证基本信息
    await projectFormRef.value?.validate();
    // 验证评审团
    await reviewerFormRef.value?.validate();
    return true;
  } catch (err) {
    ElMessage.error('请完善表单中的所有数据', err);
    return false;
  }
};

// 保存更改
const handleSave = async () => {
  const isValid = await validateAllForms();
  if (!isValid) return;

  isSubmitting.value = true;

  try {
    // const response = await projectApi.editProject(formData.id, formData);
    // ElMessage.success(`${response.message}`);
    // ElMessage.success('项目已成功更新');
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
