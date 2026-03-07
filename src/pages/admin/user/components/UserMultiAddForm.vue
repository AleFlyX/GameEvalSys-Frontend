<template>
  <div style="padding: 0 10px;">
    <div class="base-info">
      <el-form-item label="选择评审团">
        <el-select v-model="revirewerGroup.id" filterable remote clearable :remote-method="getReviewerGroupList"
          debounce="300" :loading="loading" placeholder="选择这批用户所属评审团/班级">
          <el-option v-for="item in reviewerGroups" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="用户角色">
        <el-select clearable v-model="revirewerGroup.groupMemberRole" placeholder="选择这批用户身份">
          <el-option label="超级管理员" value="super_admin" />
          <el-option label="管理员" value="admin" />
          <el-option label="打分用户" value="scorer" />
          <el-option label="普通用户" value="normal" />
        </el-select>
      </el-form-item>
      <MyBtn @click="downloadExcelTemplate" type="primary">下载学生信息批量注册模板</MyBtn>
    </div>

    <div class="excel-parser-container">
      <h2>上传学生信息Excel</h2>
      <!-- 文件上传区域 -->
      <div class="upload-area">
        <input type="file" accept=".xlsx,.xls" @change="handleFileUpload" ref="fileInput" :disabled="disableUpload" />
        <MyBtn @click="clearResult" :disabled="disableUpload">清空结果</MyBtn>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>

      <!-- 解析结果展示 -->
      <div v-if="resultList.length > 0" class="result-area">
        <h3>解析结果 (共 {{ resultList.length }} 条)</h3>
        <pre>{{ JSON.stringify(resultList, null, 2) }}</pre>
      </div>

    </div>
  </div>

</template>

<script setup>
import MyBtn from '@/components/common/form/MyBtn.vue';
import { ref, watch } from 'vue';
import * as XLSX from 'xlsx'; // 引入 xlsx 库

import { groupApi } from '@/api/group';
const props = defineProps({
  // revirewerGroupList: { //接受父组件UserAdd传入的陪审团数据
  //   type: Array,
  //   default: () => [
  //     { id: 'error1', name: '网络错误' }, { id: 'error2', name: '网络错误' },
  //   ]
  // },
  // remoteMethod: {
  //   type: Function,
  // }
})

const loading = ref(false)
const reviewerGroups = ref([])

const getReviewerGroupList = async (keywords) => {
  loading.value = true;
  console.log('searching reviewer group list', keywords)
  try {
    const response = await groupApi.getReviewerGroupList({ keyWords: keywords })
    reviewerGroups.value = response.data;
    loading.value = false;
  } catch (err) {
    console.log(err)
  }
}
// // const revirewerGroupList = ref([
//   { id: 1, name: '111' }, { id: 2, name: '222' },
// ])
const revirewerGroup = ref({
  id: '',
  groupMemberRole: '',
});

// 响应式数据
const resultList = ref([]);
const errorMsg = ref('请先选择评审团以及用户角色');
const fileInput = ref(null);
const disableUpload = ref(true)

watch(revirewerGroup.value, (newv) => {
  console.log(newv)

  if (revirewerGroup.value.id && revirewerGroup.value.groupMemberRole) {
    disableUpload.value = false;
    errorMsg.value = '';
  }
  else {
    disableUpload.value = true;
    errorMsg.value = '请先选择评审团以及用户角色';
  }
})

/**
 * 下载 Excel 模板（前端直接生成，无后端依赖）
 */
const downloadExcelTemplate = () => {
  try {
    // 1. 创建模板数据（表头 + 空行示例）
    const templateData = [
      ['姓名', '学号'], // 表头行
      ['', '']          // 空行，供用户填写
    ];

    // 2. 创建工作簿和工作表
    const workbook = XLSX.utils.book_new(); // 新建工作簿
    const worksheet = XLSX.utils.aoa_to_sheet(templateData); // 数组转工作表

    // 3. 设置列宽（优化模板体验）
    const wscols = [
      { wch: 15 }, // 姓名列宽
      { wch: 20 }  // 学号列宽
    ];
    worksheet['!cols'] = wscols;

    // 4. 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '学生信息模板');

    // 5. 导出并下载 Excel 文件
    XLSX.writeFile(workbook, '学生信息模板.xlsx');
  } catch (err) {
    errorMsg.value = `模板下载失败：${err.message}`;
  }
};

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
      password: "ytu123456",
      name: name,          // 姓名
      role: revirewerGroup.value.groupMemberRole,//每个用户的身份
      isEnabled: true,
      reviewerGroupId: revirewerGroup.value.id //选择绑定的评审组
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

defineExpose({
  validate: () => {
    try {

      const valid = ((resultList.value.length) && (revirewerGroup.value.groupMemberRole.trim() !== '') && (!!revirewerGroup.value.id))
      console.log(valid, resultList.value)
      const data = {
        users: resultList.value
      }
      return { valid, data }
    } catch (err) {
      console.log('批量创建用户验证失败', err)
      console.log('err DATA', resultList.value)

    }
  }
})
</script>

<style scoped>
.base-info {
  /* width: 100%; */
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.excel-parser-container {
  max-width: 800px;
  margin: 20px auto;

  font-family: Arial, sans-serif;
}

.upload-area {
  margin: 20px 0;
  padding: 15px;
  display: flex;
  align-items: center;
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
  max-height: 400px;
  overflow-y: scroll;
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
</style>
