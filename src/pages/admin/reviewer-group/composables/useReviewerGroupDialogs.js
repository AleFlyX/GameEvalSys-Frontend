import { ref } from 'vue';
import { reviewerGroupApi } from '@/api/reviewer-group';
import { useMessage } from '@/composables/useMessage';
import { useLoading } from '@/composables/useLoading';
import { showMsgBox } from '@/utils/ConfirmBox';
import { useRouter } from 'vue-router';
/**
 * 评审组对话框和操作管理
 * @param {Function} onRefresh - 刷新列表的回调函数
 * @returns {Object} 对话框状态和操作方法
 */
export const useReviewerGroupDialogs = (onRefresh) => {
  const router = useRouter();
  const message = useMessage();
  const { requestWithLoading } = useLoading('reviewerGroupOperation');

  // 对话框状态
  // const showAddDialog = ref(false);
  const showDetailDialog = ref(false);
  const editingData = ref(null);
  const selectedGroup = ref(null);

  // 添加评审组
  const handleAdd = () => {
    editingData.value = null;
    router.push({ path: `/admin/reviewer-groups/add` });
    // showAddDialog.value = true;
  };

  // 编辑评审组
  const handleEdit = (row) => {
    editingData.value = row;
    router.push({ path: `/admin/reviewer-groups/edit/${row.id}` });
    // showAddDialog.value = true;
  };

  // 查看详情
  const handleViewDetail = (row) => {
    selectedGroup.value = row;
    showDetailDialog.value = true;
  };

  // 修改状态（启用/禁用）
  const handleChangeStatus = async (newStatus, row) => {
    try {
      const action = newStatus ? '启用' : '禁用';
      await showMsgBox('提示', `确认${action}评审团"${row.name}"?`, { type: 'warning' });

      await requestWithLoading(
        () => reviewerGroupApi.editReviewerGroup(row.id, { isEnabled: newStatus })
      );

      message.success(`${action}成功`);
      onRefresh();
    } catch (error) {
      if (error === 'cancel') return;
      message.error(`操作失败: ${error}`);
    }
  };

  return {
    // 对话框状态
    // showAddDialog,
    showDetailDialog,
    editingData,
    selectedGroup,

    // 操作方法
    handleAdd,
    handleEdit,
    handleViewDetail,
    handleChangeStatus
  };
};
