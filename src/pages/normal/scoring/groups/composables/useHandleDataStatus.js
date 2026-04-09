/**
 * 格式化打分状态
 */
export const useHandleDataStatus = () => {
  const formatScoreStatus = (status) => {
    const statusMap = {
      'not_scored': '未打分',
      'scored': '已打分'
    };
    return statusMap[status] || status;
  };

  const getScoreStatusTag = (status) => {
    const typeMap = {
      'not_scored': 'info',
      'scored': 'success'
    };
    return typeMap[status] || 'info';
  };
  return {
    formatScoreStatus,
    getScoreStatusTag
  }
}
