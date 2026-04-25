
/**
 * 计算分数与总分占比
 * @param {Number} score
 * @param {Number} maxScore
 * @returns
 */
export const getProgressPercentage = (score, maxScore) => {
  if (!maxScore) return 0;
  return Math.min(((Number(score || 0) / maxScore) * 100).toFixed(2), 100);
};

/**
 * 根据得分获取颜色
 */
export const getScoreColor = (percentage) => {
  if (percentage >= 80) return "#67c23a";
  if (percentage >= 70) return "#409eff";
  if (percentage >= 60) return "#e6a23c";
  console.log(percentage);
  return "#f56c6c";
};

/**
 * 格式化分数，保留两位小数
 * @param {*} score
 * @returns
 */
export const formatScore = (score) => {
  return Number(score || 0).toFixed(2);
};

/**
 * 获取显示的分数，优先使用processedAverageScore，如果没有则使用averageScore
 * @param {*} item
 * @returns
 */
export const getDisplayScore = (item = {}) => {
  if (item.processedAverageScore !== undefined && item.processedAverageScore !== null) {
    return item.processedAverageScore;
  }
  return item.averageScore || 0;
};

