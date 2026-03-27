<template>
  <div class="login-page">
    <div class="login-card">
      <h2 class="login-title">课题项目打分系统</h2>
      <p class="login-subtitle">欢迎回来，请登录后继续使用</p>
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" size="large" placeholder="请输入用户名" autocomplete="username" clearable>
            <template #prefix>
              <el-icon>
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" size="large" type="password" placeholder="请输入密码"
            autocomplete="current-password" show-password>
            <template #prefix>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item class="login-btn-item">
          <el-button type="primary" size="large" class="login-btn" @click="showSlideBlock = true" :loading="loading">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <SlideBlock ref="validateBlock" v-model:visible="showSlideBlock" @success="handlePassValidate">
    </SlideBlock>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { elementIconMap } from '@/utils/elementIcons'
import { useUserStore } from '@/stores/modules/userStore.js';
import SlideBlock from './components/slideBlock.vue';
//icon
const { User, Lock } = elementIconMap

// 路由实例
const router = useRouter();
// 用户Store
const userStore = useUserStore();
// 表单Ref
const loginFormRef = ref(null);
// 滑块Ref
const validateBlock = ref(null);
// 加载状态
const loading = ref(false);
// 登录表单
const loginForm = reactive({
  username: '',
  password: ''
});
// 表单验证规则
const loginRules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
});

const showSlideBlock = ref(false);
const handlePassValidate = (isPass) => {
  console.log(isPass)
  if (!isPass) return;
  showSlideBlock.value = false;
  handleLogin();
}

// 登录提交方法
const handleLogin = async () => {
  // 表单验证

  const valid = await loginFormRef.value.validate();
  if (!valid) return;

  try {
    loading.value = true;
    // 调用登录方法
    await userStore.login(loginForm);
    ElMessage.success('登录成功');
    // 获取登录前的重定向地址，无则跳转到首页
    const redirect = router.currentRoute.value.query.redirect || '/home';
    // console.log('登录界面读取的redirect路径', redirect)
    router.push(redirect);
  } catch (err) {
    ElMessage.error(err.message || '登录失败，请检查用户名或密码');
    console.error('登录失败：', err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 24px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  background-color: #f5f7fa;
  background-image:
    radial-gradient(circle at 14% 18%, rgba(14, 165, 233, 0.22) 0%, rgba(14, 165, 233, 0) 45%),
    radial-gradient(circle at 84% 82%, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0) 48%),
    linear-gradient(145deg, #f8fbff 0%, #eef4ff 46%, #f9fbff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: min(100%, 420px);
  padding: 36px 32px 30px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 18px;
  box-shadow: 0 18px 45px rgba(30, 64, 175, 0.16);
  backdrop-filter: blur(10px);
  animation: fade-up 0.5s ease;
}

.login-title {
  text-align: center;
  margin: 0;
  color: #0f172a;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.login-subtitle {
  margin: 10px 0 22px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
}

.login-form {
  margin-top: 6px;
}

.login-btn-item {
  margin-bottom: 0;
  margin-top: 8px;
}

.login-btn {
  width: 100%;
  height: 42px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.2px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.3);
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 26px rgba(37, 99, 235, 0.36);
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input__wrapper) {
  padding: 2px 12px;
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.95);
  box-shadow: 0 0 0 1px #dce4f0 inset;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #cdd8e7 inset;
}

:deep(.el-input__wrapper.is-focus) {
  background: #ffffff;
  box-shadow: 0 0 0 2px #60a5fa inset;
}

:deep(.el-input__inner) {
  color: #0f172a;
}

:deep(.el-input__prefix .el-icon) {
  color: #64748b;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 16px;
  }

  .login-card {
    padding: 28px 20px 24px;
    border-radius: 14px;
  }

  .login-title {
    font-size: 20px;
  }
}
</style>
