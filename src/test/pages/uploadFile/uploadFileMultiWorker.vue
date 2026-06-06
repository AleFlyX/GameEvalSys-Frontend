<template>
  <div>
    <h2>上传文件测试页面</h2>
    <!-- <el-upload class="upload-demo" drag action="https://jsonplaceholder.typicode.com/posts/" :on-preview="handlePreview"
      :on-remove="handleRemove" :before-remove="beforeRemove" multiple :limit="3" :on-exceed="handleExceed"
      :file-list="fileList">
      <div class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
    </el-upload> -->
    <!-- <el-upload class="upload-demo" drag :on-change="inputFile" :on-preview="handlePreview" :on-remove="handleRemove"
      :before-remove="beforeRemove" multiple :limit="3" :on-exceed="handleExceed" :file-list="fileList">
      <div class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
    </el-upload> -->
    <h1>多worker计算哈希</h1>
    <input @change="inputFile" type="file">上传</input>
  </div>
</template>
<script setup>
import { ref } from 'vue';

const fileList = ref([]);
const THREAD_NUMS = navigator.hardwareConcurrency || 2;// 用户浏览器cpu总线程数
const FILE_CHUNK_SIZE = 5 * 1024 * 1024;
function cufTile(file) {
  console.time()
  return new Promise((resolve) => {
    const chunkNums = Math.ceil(file.size / FILE_CHUNK_SIZE)
    const perThreadChunks = Math.ceil(chunkNums / THREAD_NUMS);
    let FINISH_COUNT = 0;
    const result = [];
    console.log('file chunks:' + chunkNums);

    /**
     * worker并行，根据线程数分发任务
     */
    for (let i = 0; i < THREAD_NUMS; i++) {
      const start = i * perThreadChunks; // 根据总任务数量开是划分chunk
      const end = Math.min((i + 1) * perThreadChunks, chunkNums) // 防止剩下的没被处理，用min取
      const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })
      // const worker = new Worker('./worker.js')

      // 下达任务
      worker.postMessage({
        file,
        start,
        end,
        chunkSize: FILE_CHUNK_SIZE
      })
      // 接收消息
      worker.onmessage = (e) => {
        worker.terminate();
        result[i] = e.data;// 每个线程完成任务的时机不一定都一样，所以用下标记录并存储保证chunk顺序正确，不用push
        FINISH_COUNT++;
        if (FINISH_COUNT === THREAD_NUMS) {
          console.timeEnd()
          resolve(result)
        }
      }
    }
  })
}

async function inputFile(e) {
  const file = e.target.files[0];
  const chunks = await cufTile(file)
  console.log(chunks)
}
</script>
<style scoped></style>
