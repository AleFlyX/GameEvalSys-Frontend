<template>
  <div class="login-page">
    <!-- 主题切换按钮 -->
    <div class="theme-toggle" @click="handleThemeToggle" title="切换主题">
      <el-icon v-if="isDarkMode">
        <Sunny />
      </el-icon>
      <el-icon v-else>
        <Moon />
      </el-icon>
      <span>{{ isDarkMode ? '浅色' : '暗黑' }}</span>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <h2 class="login-title">课题项目打分系统</h2>
      <p class="login-subtitle">欢迎回来，请登录后继续使用</p>

      <!-- 登录表单 -->
      <LoginForm ref="formRef" v-model="loginForm" :rules="loginRules" :loading="isLoading"
        :default-data="lastLoginAccount" @submit="handleFormSubmit" @forgot-password="handleForgotPassword">
        <!-- 记住我复选框插槽 -->
        <template #remember>
          <RememberMeCheckbox :dark-mode="isDarkMode" v-model="rememberMe" :history-list="accountHistory"
            :max-history="5" @select-account="handleSelectAccount" @remove-account="handleRemoveAccount"
            @clear-history="handleClearHistory" />
        </template>
      </LoginForm>
    </div>

    <!-- 滑块验证组件 -->
    <SlideBlock :dark-mode="isDarkMode" ref="validateBlock" v-model:visible="showSlideBlock"
      @success="handlePassValidate" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/modules/userStore.js';
import { useLoading } from '@/composables/useLoading';
import { elementIconMap } from '@/utils/elementIcons';

// 导入子组件
import LoginForm from './components/loginForm.vue';
import RememberMeCheckbox from './components/rememberMeCheckbox.vue';
import SlideBlock from './components/slideBlock.vue';

// 导入 Composables
import { useLoginForm } from './composables/useLoginForm.js';
import { useLoginTheme } from './composables/useLoginTheme.js';
import { useLoginHistory } from './composables/useLoginHistory.js';

// 获取图标
const { Sunny, Moon } = elementIconMap;

// ============ 路由和状态管理 ============
const router = useRouter();
const userStore = useUserStore();

// ============ Composables ============
const { loginFormRef: formRef, loginForm, loginRules, validateForm } = useLoginForm();
const {
  effectiveTheme,
  isDarkMode,
  toggleTheme,
  initTheme,
  initStorageListener
} = useLoginTheme();
const {
  accountHistory,
  rememberMe,
  initHistory,
  addToHistory,
  removeFromHistory,
  clearHistory,
  getLastLoginAccount
} = useLoginHistory();

// ============ 局部状态 ============
const { isLoading, start: startLoading, end: endLoading } = useLoading('login:submit');
const showSlideBlock = ref(false);
const validateBlock = ref(null);

// 最后登录的账号引用
const lastLoginAccount = getLastLoginAccount();

// ============ 生命周期 ============
let unsubscribeTheme = null;
let unsubscribeStorage = null;

onMounted(() => {
  // 初始化主题
  unsubscribeTheme = initTheme();
  // 初始化存储监听（支持跨标签页同步）
  unsubscribeStorage = initStorageListener();
  // 初始化账号历史
  initHistory();

  // 如果设置了记住我，自动填充最后登录账号
  if (rememberMe.value && lastLoginAccount) {
    loginForm.value.username = lastLoginAccount.username;
  }
});

// 组件卸载时清理
onUnmounted(() => {
  unsubscribeTheme?.();
  unsubscribeStorage?.();
});

// ============ 事件处理 ============

/**
 * 处理表单提交
 */
const handleFormSubmit = async () => {
  const valid = await validateForm();
  if (!valid) {
    return;
  }
  // 显示滑块验证
  showSlideBlock.value = true;
};

/**
 * 处理滑块验证通过
 */
const handlePassValidate = (isPass) => {
  if (!isPass) return;

  showSlideBlock.value = false;
  startLoading();
  handleLogin();
};

/**
 * 登录提交
 */
const handleLogin = async () => {
  try {
    // 调用登录 API
    await userStore.login(loginForm.value);

    // 如果勾选了记住我，保存账号到历史
    if (rememberMe.value) {
      addToHistory(loginForm.value.username);
    }

    ElMessage.success('登录成功');

    // 获取登录前的重定向地址，无则跳转到首页
    const redirect = router.currentRoute.value.query.redirect || '/home';
    router.push(redirect);
  } catch (err) {
    ElMessage.error(err.message || '登录失败，请检查用户名或密码');
    console.error('登录失败：', err);
  } finally {
    endLoading();
  }
};

/**
 * 处理忘记密码
 */
const handleForgotPassword = () => {
  ElMessage.info('请联系系统管理员重置密码');
  // 可以跳转到密码重置页面
  // router.push('/forgot-password');
};

/**
 * 处理账号选择
 */
const handleSelectAccount = (account) => {
  loginForm.value.username = account.username;
  loginForm.value.password = '';
};

/**
 * 处理删除账号
 */
const handleRemoveAccount = (username) => {
  removeFromHistory(username);
};

/**
 * 处理清空历史
 */
const handleClearHistory = () => {
  clearHistory();
};

/**
 * 处理主题切换
 */
const handleThemeToggle = () => {
  if (isDarkMode.value) {
    toggleTheme('light');
  } else {
    toggleTheme('dark');
  }
};
</script>

<style scoped>
@import './styles/LoginPage.css';

/* ============ Element Plus 组件样式覆盖 ============ */
:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  color: var(--text);
}

:deep(.el-form-item__error) {
  color: var(--error);
  font-size: 12px;
}

:deep(.el-input__wrapper) {
  padding: 2px 12px;
  border-radius: 12px;
  background: var(--input-bg);
  box-shadow: inset 0 0 0 1px var(--input-border);
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: inset 0 0 0 1px var(--input-border-hover);
}

:deep(.el-input__wrapper.is-focus) {
  background: var(--input-bg-focus);
  box-shadow: 0 0 0 2px var(--input-border-focus);
}

:deep(.el-input__inner) {
  color: var(--text);
}

:deep(.el-input__inner::placeholder) {
  color: var(--text-disabled);
}

:deep(.el-input__prefix .el-icon) {
  color: var(--text-secondary);
}

:deep(.el-button--primary) {
  background: var(--btn-primary);
  border: none;
}

:deep(.el-button--primary:hover) {
  background: var(--btn-primary);
  opacity: 0.9;
}

@media (max-width: 480px) {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  :deep(.el-button) {
    width: 100%;
  }
}

:deep(.el-input__inner:focus) {
  outline: none;
}

:deep(.el-button:focus-visible) {
  outline: 2px solid var(--link-primary);
  outline-offset: 2px;
}
</style>
