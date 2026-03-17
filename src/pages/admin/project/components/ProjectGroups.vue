<template>
  <div class="tab-content">
    <div class="groups-tips">
      <el-alert title="提示" type="info" description="本表格显示该项目关联的所有小组。可以编辑小组信息或删除不再需要的小组。" :closable="false" />
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

import { projectGroupApi } from '@/api/project-group';

import { PROJECT_GROUP_LIST_RULES } from '../config/dataTableRules/projectGroupList';

const props = defineProps({
  projectId: {
    type: [String, Number],
    default: ''
  }
})
const emits = defineEmits([
  'successNotice',//通知父组件显示成功响应
  'errorNotice', //通知父组件显示报错
  // 'initGroupIds', //初始化表单数据
  'update:groupIds'//更新小组id的表单数据
])
// 获取项目关联的小组列表
const groupsList = ref([])
const fetchProjectGroups = async () => {
  try {
    if (props.projectId) {
      const response = await projectGroupApi.getProjectGroups(props.projectId);
      console.log('获取项目关联的小组列表id :', props.projectId, response.data)
      groupsList.value = response.data || [];
      // emits('initGroupIds', response.data.map(item => item.id))
    }
  } catch (err) {
    emits('errorNotice', err);//通知父组件统一报错
    groupsList.value = [];
  }
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
      const filteredGroupIds = groupsList.value.filter(item => item.id !== goroupId);
      groupsList.value = filteredGroupIds;
      // console.log('DELETING GROUP', filteredGroupIds)
      emits('update:groupIds', filteredGroupIds.map(item => item.id))
      emits('successNotice', '删除 ' + row.name + ' 成功')
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

<style scoped></style>
