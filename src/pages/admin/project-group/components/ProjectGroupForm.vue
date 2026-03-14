<template>
  <BaseForm ref="baseFormRef">
    <el-form-item label="受审小组名">
      <el-input>

      </el-input>
    </el-form-item>
  </BaseForm>
</template>
<script setup>
import { ref } from 'vue';
import BaseForm from '@/components/common/form/BaseForm.vue';
const props = defineProps({
  data: {
    type: Object,
    default: () => { }
  },
  editMode: {
    type: Boolean,
    default: false
  }
})
const baseFormRef = ref(null)
</script>
