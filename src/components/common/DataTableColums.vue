<template>
  <el-table-column v-for="rule in props.colRules" :key="rule.colDataName || rule.label || rule"
    :label="(rule.label || '空标题')" :width="(rule.width || '100')">
    <template #default="scope">
      <div style="display: flex; align-items: center;">
        <el-icon v-if="hasIcon(rule)">
          <component v-if="hasIcon(rule)" :is="rule.icon"></component>
        </el-icon>
        <el-tag v-if="hasTagCols(rule)" :type="rule.tagTypeMap[getColVal(scope.row, rule.colDataName)]">
          {{ rule.tagNameMap[getColVal(scope.row, rule.colDataName)] }}
        </el-tag>
        <span v-if="!hasTagCols(rule)">{{ getColVal(scope.row, rule.colDataName) }}</span>
      </div>
    </template>
  </el-table-column>
</template>
<script setup>
const props = defineProps({
  colRules: {
    type: Array,//Array类型的defaul必须是个匿名函数
    //避免引用类型数据的共享污染问题
    default: () => [
      {
        // label: 'test1',
        width: '150',
        colDataName: 'id',
        icon: 'none',
        // tagType: 'none'
        // tagTypeMap: {
        //   super_admin: 'primary',
        //   admin: 'primary',
        //   scorer: 'success',
        //   normal: 'info'
        // },
        // tagNameMap: {
        //   super_admin: '超级管理员',
        //   admin: '管理员',
        //   scorer: '打分用户',
        //   normal: '普通用户'
        // },
      }
    ]
  }

})
const hasIcon = (rule) => {
  if (rule.icon !== 'none' || rule.icon) {
    return true;
  }
  return false;
}

const hasTagCols = (rule) => {
  if (rule.tagTypeMap && rule.tagNameMap) {
    // console.log('hAS Tags', rule.tagTypeMap)
    return true;
  }
  return false;
}

const getColVal = (row, colDataName) => {
  if (!colDataName) return 'Empty Data';
  return colDataName.split('.').reduce((obj, key) => { //逐层解析字段，例如user.info.name
    return obj?.[key] ?? '字段不存在';
  }, row);
}


console.log('COLUMNS RUle:', props.colRules)
</script>
