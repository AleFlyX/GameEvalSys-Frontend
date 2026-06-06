import SparkMD5 from 'spark-md5';
/**
 * 创建文件分片
 * @param {File} file
 * @param index
 * @param chunkSize
 */
function createChunks(file, index, chunkSize) {
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

onmessage = async e => {
  const { file, start, end, chunkSize } = e.data;
  const result = [];
  for (let idx = start; idx < end; idx++) {
    result.push(
      createChunks(file, idx, chunkSize)
    )
  }
  postMessage(await Promise.all(result));
}

