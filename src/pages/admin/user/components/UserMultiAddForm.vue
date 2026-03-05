<template>
  <BaseForm ref="baseFormRef">
    <input type="file" accept=".csv" @change="handleFileUpload" ref="fileInput" />
  </BaseForm>
</template>
<script setup>
import { ref } from 'vue';
import BaseForm from '@/components/common/form/BaseForm.vue';
const props = defineProps({})
const emits = defineEmits([

])

// 响应式数据
const resultList = ref([]); // 解析后的结果数组
const errorMsg = ref('');   // 错误提示信息
const fileInput = ref(null)
const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 重置状态
  resultList.value = [];
  errorMsg.value = '';

  // 验证文件类型
  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    errorMsg.value = '请上传正确的 CSV 文件！';
    fileInput.value.value = '';
    return;
  }

  // 读取文件内容
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      console.log(event.target.result)
      // parseCsvContent(event.target.result);
    } catch (err) {
      errorMsg.value = `解析失败：${err.message}`;
    }
  };
  reader.onerror = () => {
    errorMsg.value = '文件读取失败，请重试！';
  };
  reader.readAsText(file, 'UTF-8');

}

</script>
