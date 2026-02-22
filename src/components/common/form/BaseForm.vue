<template>
  <el-form ref="formRef" :rules="formRules" :model="formData" v-bind="$attrs">
    <slot>
    </slot>
  </el-form>
</template>

<script setup>
import { ref, watch } from 'vue';
import { safeDeepClone } from '@/utils/proxyDataClone';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      id: '114514',
      username: 'ec',
      name: 'ccb',
      group: '3',
      isEnabled: true,
      role: 'admin'
    })
  },
  // 表单校验规则
  formRules: {
    type: Object,
    default: () => ({})
  },
})

const emits = defineEmits([
  'update:data'
])

const formRef = ref(null);


// 初始化表单数据（安全克隆）
const formData = ref(safeDeepClone(props.data));//数据拷贝structuredClone API

const validate = async () => {
  try {
    await formRef.value.validate();
    return { valid: true, data: { ...formData.value } };
  } catch (err) {
    console.error('Form Validate Error:', err);
    return { valid: false, data: null };
  }
};

watch(// 监听 props 变化，同步更新（同样用安全克隆）
  () => props.data,
  (newVal) => {
    formData.value = safeDeepClone(newVal);
    console.log('BASE FORM NEW VAL CHANGED', formData.value)
    emits('update:data', { ...formData.value })//将数据发给父组件
  },
  { deep: true, immediate: true }
);

defineExpose({
  validate,
  // formData
})
</script>
