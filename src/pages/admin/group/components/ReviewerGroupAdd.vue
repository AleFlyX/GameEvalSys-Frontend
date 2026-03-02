<template>
  <BaseModal v-model:visible="visible" :allow-mask-close="false" title="">
    <template #layout>
      <div class="form-modal">
        <div class="modal-header">
          <h3>{{ isEdit ? '编辑评审组' : '创建评审组' }}</h3>
        </div>

        <div class="modal-body">
          <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
            <el-form-item label="组名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入评审组名称" clearable></el-input>
            </el-form-item>

            <el-form-item label="描述" prop="description">
              <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入评审组描述（可选）"></el-input>
            </el-form-item>

            <el-form-item label="是否启用" prop="isEnabled">
              <el-switch v-model="formData.isEnabled"></el-switch>
            </el-form-item>

            <el-form-item label="成员选择" prop="memberIds">
              <div class="member-selector">
                <el-select v-model="formData.memberIds" multiple placeholder="选择评审组成员" clearable
                  @change="handleMemberChange">
                  <el-option v-for="member in availableMembers" :key="member.id" :label="member.labelText"
                    :value="member.id">
                  </el-option>
                </el-select>
                <div class="member-count">已选择: {{ formData.memberIds?.length || 0 }} 人</div>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <div class="modal-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import BaseModal from '@/components/common/modal/BaseModal.vue';
import { groupApi } from '@/api/group';
import { userApi } from '@/api/user';
import { ElMessage } from 'element-plus';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  editData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:visible', 'refresh']);

const visible = ref(props.visible);
const formRef = ref(null);
const submitLoading = ref(false);
const availableMembers = ref([]);

const isEdit = computed(() => !!props.editData);

const formData = ref({
  name: '',
  description: '',
  isEnabled: true,
  memberIds: []
});

const formRules = {
  name: [
    { required: true, message: '请输入评审组名称', trigger: 'blur' },
    { min: 2, max: 50, message: '评审组名称长度2-50个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '描述长度不超过500个字符', trigger: 'blur' }
  ],
  memberIds: [
    { required: true, message: '请至少选择一个成员', trigger: 'change' }
  ]
};

// 获取可用成员列表
const fetchAvailableMembers = async () => {
  try {
    const response = await userApi.getUserList({ page: 1, size: 1000 });
    if (response.code === 200 && response.data?.list) {
      // 过滤出打分员和管理员
      availableMembers.value = response.data.list
        .filter(u => ['scorer', 'admin', 'super_admin'].includes(u.role))
        .map(u => ({
          id: u.id,
          labelText: `${u.name} (${u.username}) - ${u.role}`
        }));
    }
  } catch (error) {
    ElMessage.error('获取成员列表失败: ' + error);
    console.error('Error fetching members:', error);
    // 使用mock数据
    availableMembers.value = [
      { id: 2, labelText: '打分员01 (scorer01) - scorer' },
      { id: 3, labelText: '打分员02 (scorer02) - scorer' },
      { id: 4, labelText: '打分员03 (scorer03) - scorer' },
      { id: 5, labelText: '打分员04 (scorer04) - scorer' }
    ];
  }
};

// 初始化表单数据
const initFormData = () => {
  if (isEdit.value && props.editData) {
    formData.value = {
      name: props.editData.name,
      description: props.editData.description || '',
      isEnabled: props.editData.isEnabled,
      memberIds: props.editData.memberIds || []
    };
  } else {
    formData.value = {
      name: '',
      description: '',
      isEnabled: true,
      memberIds: []
    };
  }
};

// 处理成员变化
const handleMemberChange = () => {
  if (!formData.value.memberIds) {
    formData.value.memberIds = [];
  }
};

// 处理提交
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  submitLoading.value = true;
  try {
    if (isEdit.value) {
      // 编辑
      await groupApi.editReviewerGroup(props.editData.id, {
        name: formData.value.name,
        description: formData.value.description,
        isEnabled: formData.value.isEnabled,
        memberIds: formData.value.memberIds
      });
      ElMessage.success('更新成功');
    } else {
      // 创建
      await groupApi.createReviewerGroup({
        name: formData.value.name,
        description: formData.value.description,
        isEnabled: formData.value.isEnabled,
        memberIds: formData.value.memberIds
      });
      ElMessage.success('创建成功');
    }

    visible.value = false;
    emit('refresh');
  } catch (error) {
    ElMessage.error((isEdit.value ? '更新' : '创建') + '失败: ' + error);
    console.error('Error:', error);
  } finally {
    submitLoading.value = false;
  }
};

// 处理取消
const handleCancel = () => {
  visible.value = false;
  formRef.value?.resetFields();
};

// 监听 visible 变化
watch(() => props.visible, (newVal) => {
  visible.value = newVal;
  if (newVal) {
    initFormData();
    fetchAvailableMembers();
  }
});

watch(visible, (newVal) => {
  emit('update:visible', newVal);
});

onMounted(() => {
  if (props.visible) {
    initFormData();
    fetchAvailableMembers();
  }
});
</script>

<style scoped>
.form-modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 500px;
}

.modal-header {
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.modal-body {
  flex: 1;
  max-height: 400px;
  overflow-y: auto;
}

.member-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.member-count {
  font-size: 12px;
  color: #909399;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}
</style>
