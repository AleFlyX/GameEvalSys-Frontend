<template>
  <el-table-column v-for="rule in props.colRules" :key="rule.colDataName || rule.label || rule"
    :label="(rule.label || '空标题')" :width="(rule.width || '100')">
    <template #default="scope">
      <div style="display: flex; align-items: center;">
        <el-icon v-if="rule.icon !== 'none' || rule.icon">
          <component v-if="rule.icon !== 'none' || rule.icon" :is="rule.icon"></component>
        </el-icon>
        <!-- <el-tag v-if="rule.tagType" :type="rule.tagType">{{ getColVal(scope.row, rule.colDataName) }}</el-tag> -->
        <!-- <span v-if="!rule.tagType">{{ getColVal(scope.row, rule.colDataName) }}</span> -->
        <span>{{ getColVal(scope.row, rule.colDataName) }}</span>
      </div>
    </template>
  </el-table-column>
</template>
<script setup>

const props = defineProps({
  colRules: {
    type: Array,
    default: [
      {
        // label: 'test1',
        width: '150',
        colDataName: 'id',
        icon: 'none',
        // tagType: 'none'
      }
    ]
  }

})

const getColVal = (row, colDataName) => {
  if (!colDataName) return 'Empty Data';
  return colDataName.split('.').reduce((obj, key) => { //逐层解析字段，例如user.info.name
    return obj?.[key] ?? '字段不存在';
  }, row);
}


console.log(props.colRules)
</script>
