import { ref, reactive } from 'vue';
import { removeSpacesFromObject, validateSpace } from '@/utils/removeSpacesFromData';

/**
 * 登录表单管理 Composable
 * 处理表单验证、值管理和错误状态
 */
export const useLoginForm = () => {
  // 表单引用
  const loginFormRef = ref(null);

  // 登录表单数据
  const loginForm = ref({
    username: '',
    password: ''
  });

  // 表单验证规则
  const loginRules = reactive({
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 50, validator: validateSpace }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 100, validator: validateSpace }
    ]
  });

  /**
   * 验证表单
   * @returns {Promise<boolean>} 验证结果
   */
  const validateForm = async () => {
    try {
      // 去除所有空格
      loginForm.value = removeSpacesFromObject(loginForm.value, true);
      // 表单验证
      const valid = await loginFormRef.value.validate();
      return valid;
    } catch (e) {
      console.error('表单验证错误:', e);
      return false;
    }
  };

  /**
   * 重置表单
   */
  const resetForm = () => {
    if (loginFormRef.value) {
      loginFormRef.value.resetFields();
    }
    loginForm.value = {
      username: '',
      password: ''
    };
  };

  /**
   * 填充表单（用于账号记忆或快速选择）
   * @param {Object} data 要填充的数据
   */
  const fillForm = (data) => {
    if (data && data.username) {
      loginForm.value.username = data.username;
      // 密码不自动填充，保持用户安全习惯
      loginForm.value.password = '';
    }
  };

  return {
    loginFormRef,
    loginForm,
    loginRules,
    validateForm,
    resetForm,
    fillForm
  };
};
