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
  <BaseCard shadow="hover" style="width: 100px; margin: 50px;">
    <template #header>
      <div class="panel-header">
        <h2>整体完成率</h2>
        <span>按当前可见项目计算</span>
      </div>
    </template>

  </BaseCard>
  <MyBtn type="link">link</MyBtn>
  <button @click="tof()">toFixed</button>
  <TestBtn2 size="large" loading>tBtn2</TestBtn2>
  <TestBtn2 type="pro" disabled>tBtn2</TestBtn2>
  <TestBtn2 type="primary" disabled>tBtn2</TestBtn2>
  <TestBtn2 type="danger">tBtn2</TestBtn2>

  <BaseModal v-model:visible="visibleAA" @update:visible="handldeClose">

  </BaseModal>
  <MyBtn type="primary">asds</MyBtn>
  <MyBtn type="danger">asdfsadadasdd</MyBtn>
  <button @click="visibleAA = !visibleAA">show</button>
  <MyBtn @click="ShowTestMxgBox('JSnB', 'CCB')">ShowTestMxgBox1（普通变量控制visible，手动触发渲染）</MyBtn>
  <MyBtn @click="ShowTestMxgBox2('JSnB', 'CCB')">ShowTestMxgBox2(使用ref变量控制显隐)</MyBtn>
  <Slideblock></Slideblock>
</template>
<script setup>
import MyBtn from '@/components/common/form/MyBtn.vue';
import BaseModal from '@/components/common/modal/BaseModal.vue';
import { showMsgBox } from '@/utils/ConfirmBox';
import { showMsgBox2 } from '@/test/utils/msgBox';
import { ref } from 'vue'
import Slideblock from '../components/slideblock.vue';

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

const tof = () => {
  let num = 15.3698;
  const str = String(num);
  const sliceEnd = str.indexOf('.');
  console.log(str.slice(0, sliceEnd + 3));
}
</script>
<style scoped>
.dialog-test {}
</style>
