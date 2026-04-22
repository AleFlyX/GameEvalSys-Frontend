<template>
  <div class="tab-content">
    <div class="groups-tips">
      <!-- edited: {{ editedAtLocal }}, cache: {{ goroupIdsCache }} -->
      <el-alert title="提示" type="info" description="本表格显示该项目关联的所有小组。可以编辑小组信息或删除不再需要的小组。" :closable="false" />
    </div>

    <div class="add-group-section">
      <el-select v-model="selectedGroupId" filterable remote reserve-keyword placeholder="搜索并选择小组"
        :remote-method="remoteSearchGroups" debounce="500" :loading="groupsLoading" clearable style="width: 300px;">
        <el-option v-for="group in groupsOptions" :key="group.id" :label="group.name" :value="group.id"
          :disabled="groupsList.some(g => g.id === group.id)">
          <span style="float: left">{{ group.name }}</span>
          <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
            {{ group.description || '暂无描述' }}
          </span>
        </el-option>
      </el-select>

      <el-button type="primary" style="margin-left: 10px;" :disabled="!selectedGroupId" @click="handleAddGroup">
        添加小组
      </el-button>
    </div>

    <div class="table-operations">
      <span class="selected-count">已选择 {{ selectedGroups.length }} 个小组</span>
      <el-button type="danger" plain :disabled="selectedGroups.length === 0" @click="handleBatchDeleteGroups">
        批量删除
      </el-button>
    </div>

    <el-table ref="groupsTableRef" :data="groupsList" stripe style="margin-top: 20px; width: 100%"
      @selection-change="handleGroupSelectionChange">
      <el-table-column type="selection" width="55" />
      <DataTableColums :col-rules="PROJECT_GROUP_LIST_RULES"></DataTableColums>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <!-- <el-button size="small" type="primary" @click="handleEditGroup(scope.row)">
            编辑
          </el-button> -->
          <el-button size="small" type="danger" @click="handleDeleteGroup(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';

import DataTableColums from '@/components/common/data/DataTableColums.vue';
import { showMsgBox } from '@/utils/ConfirmBox';
import { ElMessage } from 'element-plus';

import { projectGroupApi } from '@/api/project-group';
import { useLoading } from '@/composables/useLoading';

import { PROJECT_GROUP_LIST_RULES } from '../../config/data-table/projectGroupList';

const props = defineProps({
  projectId: {
    type: [String, Number],
    default: ''
  },
  goroupIdsCache: {
    type: Array,
    default: () => []
  },
  editedAtLocal: {  // 如果已经在本地编辑过一次了，说明已经初始化一次数据了，无需再向后端获取数据
    type: Boolean,
    default: false
  }
})
const emits = defineEmits([
  'successNotice',//通知父组件显示成功响应
  'errorNotice', //通知父组件显示报错
  'edited', //已经在本地被编辑过了
  'update:groupIds'//更新小组id的表单数据
])

// 获取项目关联的小组列表
const groupsList = ref([])
const groupsTableRef = ref(null)
const selectedGroups = ref([])

// 小组选择相关
const selectedGroupId = ref(null)
const groupsOptions = ref([])
const { isLoading: groupsLoading, start: startGroupsLoading, end: endGroupsLoading } = useLoading('projectGroups:search')

const fetchProjectGroups = async () => {
  if (props.editedAtLocal) { // 如果已经在本地编辑过一次了，说明已经初始化一次数据了，无需再向后端获取数据
    groupsList.value = props.goroupIdsCache;
    return;
  };
  try {
    if (props.projectId) {
      const response = await projectGroupApi.getProjectGroups(props.projectId);
      console.log('获取项目关联的小组列表id :', props.projectId, response.data)
      groupsList.value = response.data || [];
      // emits('inited', true)
    }
  } catch (err) {
    emits('errorNotice', err);//通知父组件统一报错
    groupsList.value = [];
  }
};

// 远程搜索小组
const remoteSearchGroups = async (query) => {
  if (query === '') {
    groupsOptions.value = [];
    return;
  }

  startGroupsLoading();
  try {
    const response = await projectGroupApi.getGroupList({
      page: 1,
      size: 100,
      keyWords: query
    });

    if (response.code === 200 && response.data) {
      groupsOptions.value = response.data.list || [];
    }
  } catch (error) {
    console.error('Error searching groups:', error);
    ElMessage.error('获取小组列表失败');
    groupsOptions.value = [];
  } finally {
    endGroupsLoading();
  }
};

// 添加小组
const handleAddGroup = async () => {
  if (!selectedGroupId.value) {
    ElMessage.warning('请先选择小组');
    return;
  }

  // 查找选中的小组信息
  const selectedGroup = groupsOptions.value.find(g => g.id === selectedGroupId.value);

  if (!selectedGroup) {
    ElMessage.error('小组信息获取失败');
    return;
  }

  // 检查是否已经在列表中
  if (groupsList.value.some(g => g.id === selectedGroupId.value)) {
    ElMessage.warning('该小组已在列表中');
    selectedGroupId.value = null;
    return;
  }

  // 添加到列表
  groupsList.value.push(selectedGroup);

  // 更新父组件数据
  emits('update:groupIds', groupsList.value.map(item => item.id));
  emits('successNotice', '添加 ' + selectedGroup.name + ' 成功');
  emits('edited', { edited: true, cache: groupsList.value });

  // 清空选择
  selectedGroupId.value = null;
  groupsOptions.value = [];
};

const handleGroupSelectionChange = (selection) => {
  selectedGroups.value = selection;
};

const removeGroupsByIds = (targetIds) => {
  const targetIdSet = new Set(targetIds);
  const filteredGroupInfos = groupsList.value.filter(item => !targetIdSet.has(item.id));
  groupsList.value = filteredGroupInfos;
  selectedGroups.value = [];
  groupsTableRef.value?.clearSelection();
  emits('update:groupIds', filteredGroupInfos.map(item => item.id));
  emits('edited', { edited: true, cache: filteredGroupInfos });
};

// 删除小组
const handleDeleteGroup = (row) => {
  showMsgBox('', '确认要将 ' + row.name + ' 从此项目移除吗?', {
    type: 'danger',
    confirmButtonText: '移除',
  })
    .then(() => {
      removeGroupsByIds([row.id]);
      emits('successNotice', '删除 ' + row.name + ' 成功')
    })
    .catch(() => {
      // 用户取消
      console.log('取消')
    });

};

const handleBatchDeleteGroups = () => {
  if (selectedGroups.value.length === 0) {
    ElMessage.warning('请先勾选要删除的小组');
    return;
  }

  const selectedIds = selectedGroups.value.map(item => item.id);
  showMsgBox('提示', `确定要批量移除 ${selectedIds.length} 个小组吗?`, {
    type: 'danger',
    confirmButtonText: '批量移除',
  })
    .then(() => {
      removeGroupsByIds(selectedIds);
      emits('successNotice', `批量删除 ${selectedIds.length} 个小组成功`);
    })
    .catch(() => {
      console.log('取消')
    });
};

onMounted(() => {
  fetchProjectGroups();
  console.log('GETTING GROUPLISTS ' + props.projectId)
})

</script>

<style scoped>
.add-group-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  margin-top: 15px;
}

.table-operations {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}

.selected-count {
  color: var(--el-text-color-regular);
  font-size: 14px;
}
</style>
