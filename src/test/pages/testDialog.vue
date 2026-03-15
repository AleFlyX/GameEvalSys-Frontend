<template>
  <!-- <dialog open>
    <p>Greetings, one and all!</p>
    <form method="dialog">
      <button>OK</button>
    </form>
  </dialog> -->
  <!-- <div class="dialog-test">
    我是弹窗
  </div> -->
  <BaseModal v-model:visible="visibleAA" @update:visible="handldeClose">

  </BaseModal>
  <MyBtn type="primary">asds</MyBtn>
  <MyBtn type="danger">asdfsadadasdd</MyBtn>
  <button @click="visibleAA = !visibleAA">show</button>
  <MyBtn @click="ShowTestMxgBox('JSnB', 'CCB')">ShowTestMxgBox1（普通变量控制visible，手动触发渲染）</MyBtn>
  <MyBtn @click="ShowTestMxgBox2('JSnB', 'CCB')">ShowTestMxgBox2(使用ref变量控制显隐)</MyBtn>
</template>
<script setup>
import MyBtn from '@/components/common/form/MyBtn.vue';
import BaseModal from '@/components/common/modal/BaseModal.vue';
import { showMsgBox } from '@/utils/ConfirmBox';
import { showMsgBox2 } from '@/test/utils/msgBox';
import { ref } from 'vue'

const visibleAA = ref(false)
// const ShowTestMxgBox = (tit, cont) => {
//   showMsgBox({ title: tit, content: cont })
// }
const ShowTestMxgBox = async (tit, cont) => {
  try {
    await showMsgBox({
      title: 'Teleport 版本' + tit,
      content: '我现在是被 Teleport 传送过来的！' + cont,
      // showCancelButton: false,
      // title: 'new'
    })
    console.log('确定')
  } catch {
    console.log('取消')
  }
}
const ShowTestMxgBox2 = async (tit, cont) => {
  try {
    await showMsgBox2({
      title: 'Teleport 版本' + tit,
      content: '我现在是被 Teleport 传送过来的！' + cont
    })
    console.log('确定')
  } catch {
    console.log('取消')
  }
}
const handldeClose = (val) => {
  visibleAA.value = val;
}
</script>
<style scoped>
.dialog-test {}
</style>
