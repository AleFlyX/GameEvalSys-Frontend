import { ElMessage } from "element-plus";

/**
 * ElMessage调用函数
 * @returns {Object} Elmessage调用方法
 */
export function useMessage() {

  /**
   * Elmessage通用调用方法,接受一个配置对象
   * @param {Object} options
   */
  const showMessage = (options) => {
    ElMessage(options);
  }

  /**
   * ElMessage的success info等普通调用方法
   * @param {String} msg 要显示的消息
   */
  const success = (msg) => {
    ElMessage.success(msg);
  };
  const error = (msg) => {
    ElMessage.error(msg);
  };
  const warning = (msg) => {
    ElMessage.warning(msg);
  };
  const info = (msg) => {
    ElMessage.info(msg);
  };
  return {
    showMessage,
    success,
    error,
    warning,
    info
  }
}
