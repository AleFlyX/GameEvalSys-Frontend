<template>
  <div class="login-page">
    <div class="login-card">
      <h2 class="login-title">课题项目打分系统</h2>
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="80px" class="login-form">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="User" auto-complete="off" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item class="login-btn-item">
          <el-button type="primary" size="large" class="login-btn" @click="handleLogin" :loading="loading">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/modules/userStore.js';

// 路由实例
const router = useRouter();
// 用户Store
const userStore = useUserStore();
// 表单Ref
const loginFormRef = ref(null);
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
    const redirect = router.currentRoute.query.redirect || '/home';
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
/* 登录页样式（居中布局，适配不同屏幕） */
.login-page {
  width: 100vw;
  height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 400px;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.login-form {
  margin-top: 10px;
}

.login-btn-item {
  margin-bottom: 0;
}

.login-btn {
  width: 100%;
}
</style>
