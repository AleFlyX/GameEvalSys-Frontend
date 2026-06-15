<template>
  <el-form class="filter-form" :model="localValue" inline>
    <el-form-item label="项目">
      <el-select v-model="localValue.projectId" clearable filterable placeholder="全部项目" style="width: 220px"
        @change="emitSearch">
        <el-option v-for="project in projects" :key="project.id" :label="project.name" :value="project.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="状态">
      <el-select v-model="localValue.status" clearable placeholder="全部状态" style="width: 150px" @change="emitSearch">
        <el-option label="待评分" value="pending" />
        <el-option label="评分中" value="scoring" />
        <el-option label="已评分" value="scored" />
        <el-option label="已打回" value="returned" />
      </el-select>
    </el-form-item>
    <el-form-item label="关键词">
      <el-input v-model="localValue.keyword" clearable placeholder="提交人 / 项目名" style="width: 220px"
        @keyup.enter="emitSearch" @clear="emitSearch" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="emitSearch">查询</el-button>
      <el-button @click="emitReset">重置</el-button>
      <el-button :disabled="exporting" @click="$emit('export')">导出</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  projects: { type: Array, default: () => [] },
  exporting: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'search', 'reset', 'export']);

const localValue = reactive({ projectId: '', status: '', keyword: '' });

watch(
  () => props.modelValue,
  (value) => {
    Object.assign(localValue, { projectId: '', status: '', keyword: '' }, value || {});
  },
  { immediate: true, deep: true }
);

const syncValue = () => emit('update:modelValue', { ...localValue });

const emitSearch = () => {
  syncValue();
  emit('search', { ...localValue });
};

const emitReset = () => {
  Object.assign(localValue, { projectId: '', status: '', keyword: '' });
  syncValue();
  emit('reset');
};
</script>

<style scoped>
.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
}
</style>
