/**
 * 时间格式化
 * @param {Date|string|Number} time -时间值
 * @param {string} format -格式化规则（如YYYY-MM-DD HH:mm:ss）
 * @returns {stirng} -格式化后的时间
 */
export const formatTime = (time, format = "YYYY-MM-DD HH:mm:ss") => {
  if (!time) return "";
  const date = new Date(time);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDay()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
};

/**
 * 小数格式化
 * @param {number} number -要处理的数字
 * @param {number} decimals -保留的小数位
 * @returns {string} 格式化后的数字
 */
export const formatNumber = (number, decimals = 2) => {
  if (isNaN(number)) return "0.00";
  return number.toFixed(decimals);
};

/**
 * 角色中文转换（如super_admin → 超级管理员）
 * @param {string} role -后端返回的角色标识符
 * @returns {string} 中文角色名
 */
export const formatRole = (role) => {
  const roleMap = {
    super_admin: "超级管理员",
    admin: "管理员",
    scorer: "打分用户",
    normal: "普通用户",
  };
  return roleMap[role] || "未知角色";
};
