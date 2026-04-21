<template>
  <PagePanel>
    <template #main-table>
      <h3 style="margin: 15px;">{{ isEdit ? '编辑评审组' : '创建评审组' }}</h3>
      <div class="form-wrapper" v-loading="detailLoading">
        <ReviewerGroupForm ref="formRef" :init-data="formData" label-width="100px"
          style="width:800px;max-width:90vw; height: 100%;">
        </ReviewerGroupForm>
      </div>
    </template>

    <template #footer>
      <div class="operations">
        <MyBtn type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ isEdit ? '更新' : '创建' }}
        </MyBtn>
        <MyBtn @click="handleCancel">取消</MyBtn>
      </div>
    </template>
  </PagePanel>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { reviewerGroupApi } from '@/api/reviewer-group';

import PagePanel from '@/layouts/PagePanel.vue';
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
  memberIds: []
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
      formData.value = {
        ...defaultFormData(),
        ...response.data
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
      if (isEdit.value) {
        await reviewerGroupApi.editReviewerGroup(route.params.id, data);
      } else {
        await reviewerGroupApi.createReviewerGroup(data);
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
      router.push('/admin/reviewer-groups');
    }).catch(() => {
      // 取消操作，继续编辑
    });
  } else {
    router.push('/admin/reviewer-groups');
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
.form-wrapper {
  display: flex;
  justify-content: center;
}

.operations {
  width: 30%;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.operations>* {
  flex: 1;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}
</style>
