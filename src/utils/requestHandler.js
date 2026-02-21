import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";

const router = useRouter();

/**
 * 通用接口请求处理函数（封装 try/catch + 统一错误处理）
 * @param {Function} apiFunc - API 文件夹下的接口方法（例 getUserList）
 * @param {Object|Array} params - 接口参数（对象/数组，适配不同传参方式）
 * @param {Object} options - 自定义配置
 * @param {Boolean} options.showSuccessMsg - 是否显示成功提示（默认 false）
 * @param {String} options.successText - 成功提示文案（默认 '操作成功'）
 * @param {Boolean} options.showErrorMsg - 是否显示错误提示（默认 true）
 * @param {Boolean} options.throwError - 是否抛出错误（让业务层自定义处理，默认 false）
 * @returns {Object} { success: 布尔值, data: 接口返回数据/错误信息 }
 */
export const requestHandler = async (
  apiFunc,
  params = [],
  options = {
    showSuccessMsg: false,
    successText: '操作成功',
    showErrorMsg: true,
    throwError: false
  }
) => {
  //如果 params 是对象，用对象传参；是数组，用解构传参
  const requestParams = Array.isArray(params) ? params : [params];
  try {
    const response = await apiFunc(requestParams);
    if (response.code == 200) {
      if (options.showSuccessMsg) {
        ElMessage.success(options.successText);
      }
      return {
        success: true,
        data: response.data || response
      }
    }
    else {
      const errorMsg = response.message || 'Operation Failed';
      if (options.showErrorMsg) {
        ElMessage.error(errorMsg);
      }
      if (options.throwError) {
        throw new Error(errorMsg);
      }
      return {
        success: false,
        data: errorMsg
      };
    }
  } catch (error) {
    console.log(error);
    const errorMsg = error.message || 'NetWork Error';
    if (options.showErrorMsg) {
      ElMessage.error(errorMsg);
    }
    // 401 未登录
    if (error.response?.status === 401) {
      ElMessageBox.confirm('登录状态已过期，请重新登录', '提示', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 跳转到登录页
        router.push('/login')
      });
    }
    if (options.throwError) {
      throw error;
    }
    return {
      success: false,
      data: errorMsg
    };
  }
};
