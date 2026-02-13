<template>
  <div class="demo-pagination-block">
    <div class="demonstration">Change page size</div>
    <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 30]"
      :size="size" :disabled="disabled" :background="background" layout="sizes, prev, pager, next" :total="1000"
      @size-change="handleSizeChange" @current-change="handleCurrentChange" />
  </div>
</template>
<script setup>
import { ref } from 'vue'
const emitData = defineEmits({

})
const currentPage = ref(1);
const pageSize = ref(10);
const disabled = ref(true);
</script>
