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

    <el-table :data="groupsList" stripe style="margin-top: 20px; width: 100%">
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

import { PROJECT_GROUP_LIST_RULES } from '../config/data-table/projectGroupList';

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

// 小组选择相关
const selectedGroupId = ref(null)
const groupsOptions = ref([])
const groupsLoading = ref(false)

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

  groupsLoading.value = true;
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
    groupsLoading.value = false;
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

// 删除小组
const handleDeleteGroup = (row) => {
  showMsgBox('', '确认要将 ' + row.name + ' 从此项目移除吗?', {
    type: 'danger',
    confirmButtonText: '移除',
  })
    .then(() => {
      console.log(row)
      const goroupId = row.id;
      const filteredGroupInfos = groupsList.value.filter(item => item.id !== goroupId);
      groupsList.value = filteredGroupInfos;
      // console.log('DELETING GROUP', filteredGroupInfos)
      emits('update:groupIds', filteredGroupInfos.map(item => item.id))
      emits('successNotice', '删除 ' + row.name + ' 成功')
      emits('edited', { edited: true, cache: filteredGroupInfos })
    })
    .catch(() => {
      // 用户取消
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
</style>
