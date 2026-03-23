<template>
  <div class="excel-parser-container">
    <h2>Excel 文件解析工具</h2>

    <!-- 文件上传区域 -->
    <div class="upload-area">
      <input type="file" accept=".xlsx,.xls" @change="handleFileUpload" ref="fileInput" />
      <button @click="clearResult">清空结果</button>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>

    <!-- 解析结果展示 -->
    <div v-if="resultList.length > 0" class="result-area">
      <h3>解析结果 (共 {{ resultList.length }} 条)</h3>
      <pre>{{ JSON.stringify(resultList, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import * as XLSX from 'xlsx'; // 引入 xlsx 库

// 响应式数据
const resultList = ref([]);
const errorMsg = ref('');
const fileInput = ref(null);

/**
 * 处理 Excel 文件上传
 * @param {Event} e - 文件选择事件
 */
const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 重置状态
  resultList.value = [];
  errorMsg.value = '';

  // 验证文件类型
  const fileType = file.name.split('.').pop().toLowerCase();
  if (!['xlsx', 'xls'].includes(fileType)) {
    errorMsg.value = '请上传正确的 Excel 文件（.xlsx/.xls）！';
    fileInput.value.value = '';
    return;
  }

  // 读取 Excel 文件
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      // 解析 Excel 文件
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // 获取第一个工作表（可根据需求指定工作表名称）
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // 将工作表转换为 JSON 数组（header: 1 表示第一行为表头）
      const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (excelData.length === 0) {
        throw new Error('Excel 文件中无数据！');
      }

      // 解析数据并转换格式
      parseExcelData(excelData);
    } catch (err) {
      errorMsg.value = `解析失败：${err.message}`;
    }
  };
  reader.onerror = () => {
    errorMsg.value = '文件读取失败，请重试！';
  };
  // 以 ArrayBuffer 格式读取
  reader.readAsArrayBuffer(file);
};

/**
 * 解析 Excel 数据并转换为指定格式
 * @param {Array} excelData - Excel 解析后的二维数组
 */
const parseExcelData = (excelData) => {
  // 跳过表头行（第一行），如果无表头则改为 const dataRows = excelData;
  const dataRows = excelData.slice(1);

  // 遍历每一行数据
  dataRows.forEach((row, index) => {
    // 行数据格式：[姓名, 学号]（确保 Excel 中第一列是姓名，第二列是学号）
    const [name, studentId] = row.map(item => (item ? item.toString().trim() : ''));

    // 验证数据完整性
    if (!name || !studentId) {
      throw new Error(`第 ${index + 2} 行数据不完整：姓名=${name}，学号=${studentId}`);
    }

    // 转换为指定格式的对象
    const userObj = {
      username: studentId, // 学号作为 username
      name: name,          // 姓名
      role: "scorer",
      isEnabled: true,
      password: "123458"
    };

    resultList.value.push(userObj);
  });
};

/**
 * 清空解析结果
 */
const clearResult = () => {
  resultList.value = [];
  errorMsg.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};
</script>

<style scoped>
.excel-parser-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.upload-area {
  margin: 20px 0;
  padding: 15px;
  border: 1px dashed #ccc;
  border-radius: 4px;
}

.error-message {
  color: #e53935;
  padding: 10px;
  background: #ffebee;
  border-radius: 4px;
  margin: 10px 0;
}

.result-area {
  margin-top: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.5;
}

button {
  margin-left: 15px;
  padding: 6px 12px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #1976d2;
}
</style>
