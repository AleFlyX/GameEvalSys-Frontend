<template>
  <div class="agent-container">
    <!-- 触发按钮 -->
    <button @click="showAgent = true" class="btn">
      打开 AI 网页助手
    </button>

    <!-- AI Agent 面板 -->
    <div class="agent-panel">
      <textarea v-model="command" placeholder="请输入指令，例如：帮我填写表单、点击按钮、搜索内容" rows="3"></textarea>
      <button @click="runAgent" class="run-btn">执行 AI 指令</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { PageAgent } from 'page-agent'

const showAgent = ref(false)
const command = ref('')
let agent = null

onMounted(() => {
  agent = new PageAgent({
    model: 'qwen3.5-plus',
    // baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    baseURL: 'https://page-ag-testing-ohftxirgbn.cn-shanghai.fcapp.run',
    // apiKey: 'sk-b5f99571835148b092a4daa3a39a366d',
    apiKey: "NA"
  })
  agent.panel.show()
  // 启动 Agent
  // agent.start()
  // agent.panel.show()
})
onUnmounted(() => {
  agent.panel.dispose()
})
// 执行指令
const runAgent = async () => {
  if (!command.value) return
  await agent.execute(command.value)
}

</script>

<style scoped>
.agent-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

.btn {
  padding: 10px 16px;
  background: #1677ff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.agent-panel {
  width: 360px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

textarea {
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.run-btn {
  width: 100%;
  padding: 8px;
  background: #1677ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
