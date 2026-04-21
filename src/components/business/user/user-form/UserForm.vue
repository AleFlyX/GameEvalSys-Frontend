<template>
  <BaseForm ref="baseFormRef" :form-rules="formRules" :data="props.initData" style="max-width: 800px" status-icon
    label-width="auto" @update:data="handleChangedData">
    <el-form-item v-if="!editMode" label="登陆账号" prop="username">
      <el-input v-model="formData.username" type="text" autocomplete="off" :disabled="isReadOnly" />
    </el-form-item>

    <div v-if="!editMode && !userSelfEditMode">
      <el-alert type="info" show-icon :closable="false" style="margin: 5px;">
        <p>若不设定密码,则默认为123456</p>
      </el-alert>
      <el-form-item label="密码" prop="password">
        <el-input v-model="formData.password" type="text" autocomplete="off" placeholder="请输入登录密码" />
      </el-form-item>
    </div>

    <el-form-item label="用户昵称" prop="name">
      <el-input v-model="formData.name" type="text" autocomplete="off" :disabled="isReadOnly" />
    </el-form-item>

    <el-alert v-if="!userSelfEditMode" type="info" show-icon :closable="false" style="margin: 5px;">
      只有 <Strong>非普通用户</Strong> 才可以被添加至<strong>评审团</strong>
    </el-alert>

    <el-form-item label="角色" prop="role">
      <el-select v-model="formData.role" placeholder="选择角色" :disabled="isReadOnly">
        <el-option label="超级管理员" value="super_admin" />
        <el-option label="管理员" value="admin" />
        <el-option label="打分用户" value="scorer" />
        <el-option v-if="!editMode" label="普通用户" value="normal" />
      </el-select>
    </el-form-item>

    <el-form-item label="评审团" prop="reviewerGroup" @click="showInfo">
      <el-select :disabled="isReadOnly || isNormal" v-model="formData.reviewerGroupIds"
        @change="console.log(formData.reviewerGroupIds)" filterable multiple placeholder="查找该用户要加入的评审团"
        :loading="loading" remote :remote-method="getReviewerGroupList" debounce="300">
        <el-option v-for="item in reviewerGroups" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </el-form-item>
    <div v-if="editMode || userSelfEditMode" class="pwd-zoon">
      <el-form-item v-if="userSelfEditMode" label="旧密码" prop="oldPassword">
        <el-input v-model="formData.oldPassword" type="text" autocomplete="off" placeholder="请输入旧密码" />
      </el-form-item>
      <el-form-item v-if="editMode || userSelfEditMode" label="新密码" prop="newPassword">
        <el-input v-model="formData.newPassword" type="text" autocomplete="off" placeholder="请输入新密码" />
      </el-form-item>
    </div>

    <el-form-item label="账户状态" v-if="editMode">
      <el-switch v-model="formData.isEnabled" size="large" :disabled="isReadOnly"
        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" inline-prompt active-text="启用"
        inactive-text="停用" />
    </el-form-item>
  </BaseForm>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

import BaseForm from '@/components/common/form/BaseForm.vue';

import { reviewerGroupApi } from '@/api/reviewer-group';

import { userFormRules } from '@/components/business/user/user-form/userFormRules';
import { useMessage } from '@/composables/useMessage';
import { useLoading } from '@/composables/useLoading';
import { removeSpacesFromObject } from '@/utils/removeSpacesFromData';
const props = defineProps({
  initData: {
    type: Object,
    default: () => ({
      id: '',
      username: '',
      password: '',
      oldPassword: '',
      newPassword: '',
      name: '',
      reviewerGroupIds: [],
      isEnabled: true,
      role: 'normal'
    })
  },
  editMode: {
    type: Boolean,
    default: false
  },
  userSelfEditMode: {
    type: Boolean,
    default: false
  },
  readOnly: {
    type: Boolean,
    default: false
  }

})

const emits = defineEmits(['update:data', 'update:keywords'])

const baseFormRef = ref(null)

const message = useMessage();

// 通过 computed 获取 BaseForm 的 formData，避免创建重复的数据对象
const formData = computed(() => {
  return baseFormRef.value?.formData || {};
})

const isReadOnly = computed(() => props.readOnly);

const formRules = computed(() => {
  if (!isReadOnly.value) {
    return userFormRules;
  }

  return {
    ...userFormRules,
    name: [],
    username: [],
    role: []
  };
});

const isNormal = computed(() => {
  return formData.value.role === 'normal';
});

const showInfo = () => {
  if (isReadOnly.value) {
    return;
  }
  if (isNormal.value) {
    message.info('普通用户 无法修改评审团')
  }

}

const { isLoading: loading, start: startLoading, end: endLoading } = useLoading('userForm:reviewerGroups')
const reviewerGroups = ref([])
// 初始化加载用户已加入的评审团信息（编辑模式）
const initializeUserReviewerGroups = async () => {
  if ((!props.editMode && !props.readOnly) || !props.initData.reviewerGroupIds || props.initData.reviewerGroupIds.length === 0) {
    return;
  }

  try {
    const groupIds = props.initData.reviewerGroupIds;
    const groups = [];

    // 并行获取所有评审团详情
    const promises = groupIds.map(id => reviewerGroupApi.getReviewerGroupDetail(id));
    const responses = await Promise.all(promises);

    //将获取到的详细详细逐个推入groups
    responses.forEach(response => {
      if (response.data) {
        groups.push(response.data);
      }
    });

    // 合并已加入的评审团和搜索结果（避免重复）
    const existingIds = new Set(reviewerGroups.value.map(g => g.id));
    groups.forEach(group => {
      if (!existingIds.has(group.id)) {
        reviewerGroups.value.unshift(group);
      }
    });

    console.log('已加入的评审团', groups);
  } catch (err) {
    console.log('加载用户评审团信息失败:', err);
  }
}

const getReviewerGroupList = async (keywords) => {
  startLoading();
  console.log('searching reviewer group list', keywords)
  try {
    const response = await reviewerGroupApi.getReviewerGroupList({ keyWords: keywords })
    reviewerGroups.value = response.data.list;
  } catch (err) {
    console.log(err)
  } finally {
    endLoading();
  }
}

const removeEmptyFields = (input) => {
  if (Array.isArray(input)) {
    return input
      .map((item) => removeEmptyFields(item))
      .filter((item) => item !== undefined);
  }

  if (input !== null && typeof input === 'object') {
    const result = {};
    Object.keys(input).forEach((key) => {
      const cleanedValue = removeEmptyFields(input[key]);
      if (cleanedValue === undefined) {
        return;
      }
      result[key] = cleanedValue;
    });
    return result;
  }

  if (input === null || input === undefined) {
    return undefined;
  }

  if (typeof input === 'string' && input === '') {
    return undefined;
  }

  return input;
}

defineExpose({
  validate: async () => {
    const validationResult = await baseFormRef.value.validate();
    if (!validationResult.valid || !validationResult.data) {
      return validationResult;
    }

    const payload = { ...validationResult.data };
    if (isNormal.value) {
      payload.reviewerGroupIds = [];
    }

    const noSpacesData = removeSpacesFromObject(payload, true);
    const cleanedData = removeEmptyFields(noSpacesData) || {};
    return { valid: true, data: cleanedData };
  }
})
// watch(props.initData?.reviewerGroupIds, (newval) => {
//   console.log(newval)
// })
// 监听editMode和initData变化，在编辑模式下初始化加载用户评审团
watch(
  () => [props.editMode, props.readOnly, props.initData?.reviewerGroupIds],
  async () => {
    if (props.editMode || props.readOnly) {
      await initializeUserReviewerGroups();
    }
  },
  { deep: true }
)

/**
 * 用户角色为普通用户时，重置评审团列表
 */
watch(isNormal, (newVal) => {
  if (newVal) {//只有在用户角色为普通用户的情况下才会重置评审团列表
    formData.value.reviewerGroupIds = [];
  }
})

onMounted(() => {
  if (props.editMode || props.readOnly) {
    initializeUserReviewerGroups();
  }
})

// 当 BaseForm 发出数据更新时转发给父组件
const handleChangedData = (newVal) => {
  emits('update:data', newVal);
}
</script>

<style scoped>
.pwd-zoon {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 15px 5px;
  /* border: 1px solid; */
  border-radius: 15px;
  box-shadow: 0 0 5px var(--gray-box-shadow);
  transition: ease-in-out 0.2s;
}

.pwd-zoon:hover {
  box-shadow: 0 0 15px var(--primary-box-shadow);
}
</style>
