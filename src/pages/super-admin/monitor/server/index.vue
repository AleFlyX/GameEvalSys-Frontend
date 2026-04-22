<template>
  <div class="server-dashboard">
    <div class="server-dashboard">
      <!-- 顶部信息卡片区 -->
      <div class="dashboard-cards">
        <el-card class="dashboard-card" shadow="hover">
          <el-descriptions title="服务器信息" :column="2" size="small">
            <el-descriptions-item label="主机名">server-01</el-descriptions-item>
            <el-descriptions-item label="IP">192.168.1.100</el-descriptions-item>
            <el-descriptions-item label="操作系统">Ubuntu 22.04</el-descriptions-item>
            <el-descriptions-item label="运行时长">12天3小时</el-descriptions-item>
          </el-descriptions>
        </el-card>
        <el-card class="dashboard-card" shadow="hover">
          <el-descriptions title="数据库配置" :column="2" size="small">
            <el-descriptions-item label="类型">MySQL</el-descriptions-item>
            <el-descriptions-item label="地址">127.0.0.1</el-descriptions-item>
            <el-descriptions-item label="端口">3306</el-descriptions-item>
            <el-descriptions-item label="数据库">game_evaluate</el-descriptions-item>
          </el-descriptions>
        </el-card>
        <el-card class="dashboard-card" shadow="hover">
          <el-descriptions title="应用服务" :column="2" size="small">
            <el-descriptions-item label="服务">GameEvaluate-frontend</el-descriptions-item>
            <el-descriptions-item label="端口">8080</el-descriptions-item>
            <el-descriptions-item label="版本">v1.2.3</el-descriptions-item>
            <el-descriptions-item label="启动时间">2026-04-01 09:00:00</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>

      <!-- 资源趋势图表区（mock） -->
      <div class="dashboard-charts">
        <el-card class="dashboard-chart" shadow="hover">
          <div class="chart-title">CPU使用率</div>
          <div class="chart-mock">[折线图]</div>
        </el-card>
        <el-card class="dashboard-chart" shadow="hover">
          <div class="chart-title">内存使用率</div>
          <div class="chart-mock">[折线图]</div>
        </el-card>
        <el-card class="dashboard-chart" shadow="hover">
          <div class="chart-title">磁盘空间</div>
          <div class="chart-mock">[折线图]</div>
        </el-card>
        <el-card class="dashboard-chart" shadow="hover">
          <div class="chart-title">网络流量</div>
          <div class="chart-mock">[折线图]</div>
        </el-card>
      </div>

      <!-- 日志/告警表格区 -->
      <el-card class="dashboard-log-card" shadow="hover">
        <div class="log-title">最近告警 / 日志</div>
        <el-table :data="logList" style="width: 100%" size="small">
          <el-table-column prop="time" label="时间" width="160" />
          <el-table-column prop="level" label="级别" width="80" />
          <el-table-column prop="content" label="内容" />
        </el-table>
      </el-card>
    </div>
    <el-card class="ops-card" shadow="hover">
      <div class="ops-title">安全运维操作</div>
      <div class="ops-btns">
        <el-button type="primary" icon="Refresh" @click="handleRestart">服务重启</el-button>
        <el-button type="info" icon="Download" @click="handleDownloadLog">下载日志</el-button>
        <el-button type="warning" icon="Document" @click="handleBackup">手动备份</el-button>
        <el-button type="success" icon="Check" @click="handleHealthCheck">健康检查</el-button>
        <el-button type="danger" icon="Close" @click="handleStop">服务下线</el-button>
      </div>
      <div class="ops-tip">* 仅提供安全的运维操作，不支持直接修改敏感配置。</div>
    </el-card>
  </div>
</template>


<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

function handleRestart() {
  ElMessage.success('服务重启指令已发送');
}
function handleDownloadLog() {
  ElMessage.info('日志下载任务已发起');
}
function handleBackup() {
  ElMessage.warning('备份任务已发起');
}
function handleHealthCheck() {
  ElMessage.success('健康检查已执行');
}
function handleStop() {
  ElMessage.error('服务下线指令已发送');
}
const logList = ref([
  { time: '2026-04-17 10:00:00', level: 'INFO', content: '服务启动完成' },
  { time: '2026-04-17 10:05:00', level: 'WARN', content: 'CPU使用率高于80%' },
  { time: '2026-04-17 10:10:00', level: 'ERROR', content: '数据库连接超时' },
  { time: '2026-04-17 10:15:00', level: 'INFO', content: '自动备份完成' },
]);
</script>

<style scoped>
.server-dashboard {
  width: 100%;
  min-height: 100vh;
  background: #f6f8fa;
  padding: 32px 0 24px 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.dashboard-cards {
  width: 100%;
  max-width: 1200px;
  display: flex;
  gap: 24px;
  margin-bottom: 8px;
}

.dashboard-card {
  flex: 1;
  min-width: 0;
  border-radius: 16px;
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.07), 0 1.5px 6px 0 rgba(0, 0, 0, 0.03);
}

.dashboard-charts {
  width: 100%;
  max-width: 1200px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.dashboard-chart {
  min-width: 0;
  border-radius: 16px;
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.chart-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.chart-mock {
  width: 90%;
  height: 120px;
  background: repeating-linear-gradient(135deg, #e3e8ee 0 10px, #fff 10px 20px);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bbb;
  font-size: 18px;
}

.dashboard-log-card {
  width: 100%;
  max-width: 1200px;
  border-radius: 16px;
}

.log-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

/* 运维操作面板样式 */
.ops-card {
  width: 100%;
  max-width: 1200px;
  border-radius: 16px;
  margin-top: 8px;
  margin-bottom: 16px;
}

.ops-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
  font-size: 18px;
}

.ops-btns {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.ops-tip {
  color: #888;
  font-size: 13px;
  margin-top: 8px;
}
</style>
