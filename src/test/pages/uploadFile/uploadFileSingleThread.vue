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
    <input @change="inputFile" type="file">上传</input>
    <uploadFileMultiWorker></uploadFileMultiWorker>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import SparkMD5 from 'spark-md5';
import uploadFileMultiWorker from './uploadFileMultiWorker.vue'
const fileList = ref([]);

const FILE_CHUNK_SIZE = 5 * 1024 * 1024;
async function cufTile(file) {

  console.time()
  const chunkNums = Math.ceil(file.size / FILE_CHUNK_SIZE)
  const result = [];
  console.log('file chunks:' + chunkNums);

  /**
   * 文件io串行时间稍微久，可以改为并行优化
   */
  // for (let i = 0; i < chunkNums; i++) {
  //   result.push(
  //     await createChunks(file, i, FILE_CHUNK_SIZE)
  //   );
  // }
  // return result;
  /**
   * 一个worker计算一个分片的哈希
   */
  for (let i = 0; i < chunkNums; i++) {
    // 将promise放入array中
    result.push(createChunks(file, i, FILE_CHUNK_SIZE));
  }
  // 等待所有文件完成

  const files = await Promise.all(result);

  console.timeEnd()
  return files;
}

/**
 * 创建文件分片
 * @param {File} file
 * @param index
 * @param chunkSize
 */
async function createChunks(file, index, chunkSize) {
  return new Promise((resolve) => {
    const start = index * chunkSize;
    const end = start + chunkSize;
    const chunk = file.slice(start, end)

    const spark = new SparkMD5.ArrayBuffer();

    const fileReader = new FileReader();

    fileReader.onload = () => {
      spark.append(fileReader.result)
      resolve({
        chunk,
        start,
        end,
        index,
        hash: spark.end()
      })
    }
    fileReader.readAsArrayBuffer(chunk)
  })
}

async function inputFile(e) {
  const file = e.target.files[0];
  const chunks = await cufTile(file)
  console.log(chunks)
}
</script>
<style scoped></style>
