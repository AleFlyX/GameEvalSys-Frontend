<template>
  <BaseFormModal>
    <template #title>
      {{ isEdit ? '编辑项目小组' : '新建项目小组' }}
    </template>
    <template #form>
      <ProjectGroupForm ref="projectGroupFormRef" :data="$attrs.data">

      </ProjectGroupForm>
    </template>

  </BaseFormModal>

</template>
<script setup>
import { ref } from 'vue';
import ProjectGroupForm from './ProjectGroupForm.vue';
import BaseFormModal from '@/components/common/modal/BaseFormModal.vue';

const projectGroupFormRef = ref(null);

const props = defineProps({

  isEdit: {

  },
  isAdd: {

  }
})
</script>
