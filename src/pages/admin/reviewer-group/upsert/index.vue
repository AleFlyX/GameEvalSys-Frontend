<template>
  <PagePanel>
    <div class="upsert-topbar">
      <BackButton :custom-handler="handleCancel" class="upsert-back-btn" />
      <div class="upsert-header">
        <h2>{{ isEdit ? '编辑评审组' : '创建评审组' }}</h2>
        <p class="subtitle">{{ isEdit ? '修改评审组成员及描述信息' : '配置新的评审组及指派成员' }}</p>
      </div>
    </div>

    <template #main-table>
      <div class="form-wrapper" v-loading="detailLoading">
        <ReviewerGroupForm ref="formRef" :init-data="formData" label-width="100px"
          style="width: 100%; max-width: 800px;">
        </ReviewerGroupForm>
      </div>
    </template>

    <template #footer>
      <div class="form-actions">
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ isEdit ? '保存更改' : '确认创建' }}
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </template>
  </PagePanel>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { reviewerGroupApi } from '@/api/reviewer-group';

import PagePanel from '@/layouts/PagePanel.vue';
import BackButton from '@/components/common/BackButton.vue';
import ReviewerGroupForm from '../components/ReviewerGroupForm.vue';
import { showMsgBox } from '@/utils/ConfirmBox';
import { useRoute, useRouter } from 'vue-router';
import { useLoading } from '@/composables/useLoading';
import { useMessage } from '@/composables/useMessage';

defineOptions({
  name: 'ReviewerGroupUpsertPage'
});

const route = useRoute();
const router = useRouter();
const message = useMessage();
const formRef = ref(null);

const defaultFormData = () => ({
  name: '',
  description: '',
  isEnabled: true,
  memberIds: [],
  members: []
});

const formData = ref(defaultFormData());
const isEdit = computed(() => Boolean(route.params.id));

const { isLoading: submitLoading, requestWithLoading: requestSubmit } = useLoading('reviewerGroup:submit');
const { isLoading: detailLoading, requestWithLoading: requestDetail } = useLoading('reviewerGroup:detail');

const loadDetail = async () => {
  if (!isEdit.value) {
    formData.value = defaultFormData();
    return;
  }

  try {
    const response = await requestDetail(
      () => reviewerGroupApi.getReviewerGroupDetail(route.params.id)
    );
    if (response?.code === 200 && response.data) {
      const normalizedMemberIds = Array.isArray(response.data.memberIds)
        ? response.data.memberIds
        : (Array.isArray(response.data.members) ? response.data.members.map(item => item.id) : []);

      formData.value = {
        ...defaultFormData(),
        ...response.data,
        memberIds: normalizedMemberIds,
        members: Array.isArray(response.data.members) ? response.data.members : []
      };
    } else {
      message.error('获取评审组详情失败');
    }
  } catch (error) {
    message.error('获取评审组详情失败');
    console.error('Error fetching reviewer group detail:', error);
  }
};

const handleSubmit = async () => {
  const { valid, data } = await formRef.value.validate();
  if (!valid) {
    return;
  }

  try {
    await requestSubmit(async () => {
      const submitData = {
        name: data.name,
        description: data.description,
        isEnabled: data.isEnabled,
        memberIds: data.memberIds
      };
      if (isEdit.value) {
        await reviewerGroupApi.editReviewerGroup(route.params.id, submitData);
      } else {
        await reviewerGroupApi.createReviewerGroup(submitData);
      }
    });

    message.success(isEdit.value ? '更新成功' : '创建成功');
    router.push('/admin/reviewer-groups');
  } catch (error) {
    message.error((isEdit.value ? '更新' : '创建') + '失败: ' + error);
    console.error('Error submitting reviewer group:', error);
  }
};

const handleCancel = () => {
  if (formRef.value?.dataChanged) {
    showMsgBox('提示', '是否放弃修改？', {
      confirmButtonText: '放弃',
      cancelButtonText: '继续编辑',
      type: 'warning'
    }).then(() => {
      router.back();
    }).catch(() => {
      // 取消操作，继续编辑
    });
  } else {
    router.back();
  }
};

onMounted(() => {
  loadDetail();
});

watch(
  () => route.params.id,
  () => {
    loadDetail();
  }
);
</script>

<style scoped>
.upsert-topbar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 16px;
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

html[data-theme="dark"] .upsert-topbar {
  border-color: rgba(255, 255, 255, 0.08);
}

.upsert-back-btn {
  flex: 0 0 auto;
}

.upsert-header {
  flex: 1;
}

.upsert-header h2 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
}

.upsert-header .subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.form-wrapper {
  padding: 10px 0;
  min-height: 400px;
  display: flex;
  justify-content: center;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid var(--border);
  margin-top: 20px;
  width: 100%;
}

html[data-theme="dark"] .form-actions {
  border-top-color: rgba(255, 255, 255, 0.08);
}

.form-actions :deep(.el-button) {
  min-width: 100px;
  border-radius: 8px;
  height: 38px;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}
</style>
