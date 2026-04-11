<template>
  <el-form ref="formRef" :model="form" :rules="rules" class="login-form" @submit.prevent>
    <!-- 用户名输入框 -->
    <el-form-item prop="username">
      <el-input v-model="form.username" size="large" placeholder="请输入用户名" autocomplete="username" clearable
        :prefix-icon="User" @keyup.enter="handleSubmit" />
    </el-form-item>

    <!-- 密码输入框 -->
    <el-form-item prop="password">
      <el-input v-model="form.password" size="large" type="password" placeholder="请输入密码" autocomplete="current-password"
        show-password :prefix-icon="Lock" @keyup.enter="handleSubmit" />
    </el-form-item>

    <!-- 记住我 & 忘记密码 -->
    <div class="login-form-footer">
      <slot name="remember" />
      <!-- <el-link type="primary" :underline="false" href="#" @click.prevent="$emit('forgot-password')">
        忘记密码？
      </el-link> -->
    </div>

    <!-- 登录按钮 -->
    <el-form-item class="login-btn-item">
      <el-button type="primary" size="large" class="login-btn" @click="handleSubmit" :loading="loading"
        :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { elementIconMap } from '@/utils/elementIcons';

// 获取图标
const { User, Lock } = elementIconMap;

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ username: '', password: '' })
  },
  rules: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  defaultData: {
    type: Object,
    default: null
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'submit', 'forgot-password']);

// 表单引用
const formRef = ref(null);

// 表单数据 - 直接绑定到 props.modelValue，避免循环依赖
const form = computed({
  get() {
    return props.modelValue;
  },
  set(newVal) {
    emit('update:modelValue', newVal);
  }
});

// 监听 defaultData（用于快速填充）- 只在初始化时应用
watch(() => props.defaultData, (newVal) => {
  if (newVal && newVal.username && !form.value.username) {
    emit('update:modelValue', {
      ...form.value,
      username: newVal.username
    });
  }
}, { immediate: true });

/**
 * 处理提交
 */
const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate();
    if (valid) {
      emit('submit');
    }
  } catch (e) {
    console.error('表单验证失败:', e);
  }
};

// 暴露 validate 方法给父组件
const validate = async () => {
  return await formRef.value.validate();
};

const resetFields = () => {
  formRef.value?.resetFields();
};

defineExpose({
  validate,
  resetFields,
  formRef
});
</script>

<style scoped>
.login-form {
  margin-top: 6px;
}

.login-form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 13px;
}

.login-btn-item {
  margin-bottom: 0;
  margin-top: 8px;
}

.login-btn {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.2px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.3);
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.36);
}

.login-btn:active {
  transform: scale(0.98);
}

/* 暗黑模式适配 */
:root[data-theme='dark'] .login-btn {
  background: linear-gradient(135deg, #0071e3 0%, #0a66d2 100%);
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input__wrapper) {
  padding: 2px 12px;
  border-radius: 12px;
  background: var(--input-bg);
  box-shadow: inset 0 0 0 1px var(--input-border);
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--input-border);
}

:deep(.el-input__wrapper.is-focus) {
  background: var(--input-bg-focus);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.3);
}

:deep(.el-input__inner) {
  color: var(--text);
}

:deep(.el-input__prefix .el-icon) {
  color: var(--text-secondary);
}

:deep(.el-link--primary) {
  color: #0071e3;
  font-size: 13px;
}

:root[data-theme='dark'] :deep(.el-link--primary) {
  color: #0a9eff;
}
</style>
