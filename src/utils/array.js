/**
 * 将数组按指定大小分块
 * @param {Array} arr - 原始数组
 * @param {number} size - 每块大小
 * @returns {Array<Array>} 分块后的二维数组
 */
export const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};