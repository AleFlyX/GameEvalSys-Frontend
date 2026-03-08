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
            <ProjectForm edit-mode :data="formData">

            </ProjectForm>
            <div class="tab-content">
              <el-form ref="basicFormRef" :model="formData" :rules="basicFormRules" label-width="120px" status-icon>
                <el-form-item label="项目名称" prop="name">
                  <el-input v-model="formData.name" placeholder="请输入项目名称" />
                </el-form-item>

                <el-form-item label="项目描述" prop="description">
                  <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入项目描述" />
                </el-form-item>

                <el-form-item label="开始日期" prop="startDate">
                  <el-date-picker v-model="formData.startDate" type="date" placeholder="选择项目开始日期"
                    value-format="YYYY-MM-DD" />
                </el-form-item>

                <el-form-item label="结束日期" prop="endDate">
                  <el-date-picker v-model="formData.endDate" type="date" placeholder="选择项目结束日期"
                    value-format="YYYY-MM-DD" />
                </el-form-item>

                <el-form-item label="打分标准" prop="standardId">
                  <el-select v-model="formData.standardId" placeholder="选择打分标准" clearable>
                    <el-option label="标准一" :value="1" />
                    <el-option label="标准二" :value="2" />
                  </el-select>
                </el-form-item>

                <el-form-item label="启用状态" prop="isEnabled">
                  <el-switch v-model="formData.isEnabled" size="large"
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" inline-prompt active-text="启用"
                    inactive-text="停用" />
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>

          <!-- Tab 2: 项目内受评分的小组 -->
          <el-tab-pane label="项目内受评分的小组" name="groups">
            <div class="tab-content">
              <div class="groups-tips">
                <el-alert title="提示" type="info" description="本表格显示该项目关联的所有小组。可以编辑小组信息或删除不再需要的小组。" :closable="false" />
              </div>

              <el-table :data="groupsList" stripe style="margin-top: 20px; width: 100%">
                <el-table-column prop="id" label="小组ID" width="80" />
                <el-table-column prop="name" label="小组名称" width="150" />
                <el-table-column prop="description" label="小组描述" show-overflow-tooltip />
                <el-table-column prop="memberCount" label="成员数" width="100" />
                <el-table-column prop="createTime" label="创建时间" width="150" />
                <el-table-column label="操作" width="200" fixed="right">
                  <template #default="scope">
                    <el-button size="small" type="primary" @click="handleEditGroup(scope.row)">
                      编辑
                    </el-button>
                    <el-button size="small" type="danger" @click="handleDeleteGroup(scope.row)">
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <div v-if="groupsList.length === 0" class="empty-state">
                <p>暂无关联小组</p>
              </div>
            </div>
          </el-tab-pane>

          <!-- Tab 3: 评审团配置 -->
          <el-tab-pane label="评审团配置" name="reviewer">
            <div class="tab-content">
              <el-form ref="reviewerFormRef" :model="formData" :rules="reviewerFormRules" label-width="120px"
                status-icon>
                <el-form-item label="选择评审团" prop="reviewerGroupId">
                  <el-select v-model="formData.reviewerGroupId" placeholder="更改负责此项目评分的评审团" clearable
                    @change="handleReviewerGroupChange">
                    <el-option v-for="item in reviewerGroupOptions" :key="item.id" :label="item.name"
                      :value="item.id" />
                  </el-select>
                </el-form-item>
              </el-form>

              <div class="reviewer-tips">
                <el-alert title="提示" type="info" description="评审团是负责对项目内的小组进行评分的专业小组。下表显示该评审团的所有成员。"
                  :closable="false" />
              </div>
              <div class="reviewer-members">
                <!-- <div v-if="formData.reviewerGroupId" class="reviewer-members"> -->
                <h4>评审团成员</h4>
                <el-table :data="reviewerGroupMembers" stripe style="width: 100%">
                  <el-table-column prop="id" label="成员ID" width="80" />
                  <el-table-column prop="username" label="成员名称" width="150" />
                  <el-table-column prop="name" label="成员名称" width="150" />

                  <el-table-column prop="createTime" label="加入时间" width="150" />
                  <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                      <el-button size="small" type="primary" @click="handleEditMember(scope.row)">
                        编辑
                      </el-button>
                      <el-button size="small" type="danger" @click="handleDeleteMember(scope.row)">
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>

                <div v-if="reviewerGroupMembers.length === 0" class="empty-state">
                  <p>暂无评审团成员</p>
                </div>
              </div>
              <!-- <div v-else class="empty-state">
                <p>请先选择评审团</p>
              </div> -->
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
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </template>
  </PagePanel>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';

// import { useProjectStore } from '@/stores/modules/projectStore';

import PagePanel from '@/layouts/PagePanel.vue';
import MyBtn from '@/components/common/form/MyBtn.vue';

import { projectApi } from '@/api/project';
import { groupApi } from '@/api/group';
import { userApi } from '@/api/user'
import ProjectForm from './components/ProjectForm.vue';


const router = useRouter();
const route = useRoute();
// const projectStore = useProjectStore();

const activeTab = ref('basic');
const isSubmitting = ref(false);

const basicFormRef = ref(null);
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

// 基本信息表单规则
const basicFormRules = {
  name: [
    { required: true, message: '项目名称不能为空', trigger: 'blur' },
    { min: 3, max: 100, message: '项目名称长度应在3-100个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '项目描述长度不能超过500个字符', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '开始日期不能为空', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '结束日期不能为空', trigger: 'change' }
  ],
  standardId: [
    { required: true, message: '打分标准不能为空', trigger: 'change' }
  ]
};

// 评审团表单规则
const reviewerFormRules = {
  reviewerGroupId: [
    { required: true, message: '评审团不能为空', trigger: 'change' }
  ]
};


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
      const response = await projectApi.getProjectGroups(projectId);
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
    const response = await userApi.getUsersByIds(params);

    // reviewerGroupMembers.value = response.data?.list || [];
    reviewerGroupMembers.value = response.data || [];
    console.log('获取评审团成员列表', response.data)
  } catch (err) {
    ElMessage.error(`加载评审团成员列表失败: ${err}`);
    reviewerGroupMembers.value = [];
  }
};

// 处理评审团选择变化
const handleReviewerGroupChange = () => {
  fetchReviewerGroupMembers();
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
      // console.log('初始化表单数据', response.data)
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
    await basicFormRef.value?.validate();
    // 验证评审团
    await reviewerFormRef.value?.validate();
    return true;
  } catch (err) {
    ElMessage.error('请完善表单中的所有数据');
    return false;
  }
};

// 保存更改
const handleSave = async () => {
  const isValid = await validateAllForms();
  if (!isValid) return;

  isSubmitting.value = true;

  try {
    const response = await projectApi.editProject(formData.id, formData);
    ElMessage.success(`${response.message}`);
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
  ElMessage.confirm('确实要放弃编辑吗？', '提示', {
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
