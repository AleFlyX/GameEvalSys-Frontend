<template>
  <div class="submission-page">
    <!-- 页面标题区 -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="url(#iconGrad)" />
            <path d="M18 10L26 26H10L18 10Z" fill="white" opacity="0.9" />
            <circle cx="18" cy="22" r="3" fill="#1a1a2e" />
            <defs>
              <linearGradient id="iconGrad" x1="0" y1="0" x2="36" y2="36">
                <stop offset="0%" stop-color="#667eea" />
                <stop offset="100%" stop-color="#764ba2" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="header-text">
          <h1>作业提交</h1>
          <p>提交你的 C++ 游戏作品与答辩 PPT</p>
        </div>
      </div>
      <div class="header-deco">
        <div class="deco-circle circle-1"></div>
        <div class="deco-circle circle-2"></div>
        <div class="deco-dots"></div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="page-main">
      <!-- 提交表单卡片 -->
      <section class="form-section">
        <el-card class="form-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon>
                  <Upload />
                </el-icon>
                上传文件
              </span>
              <span class="card-tip">支持断点续传，大文件也能轻松上传</span>
            </div>
          </template>

          <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="submission-form">
            <!-- 项目名称 -->
            <el-form-item label="项目名称" prop="projectName">
              <el-input v-model="formData.projectName" placeholder="例如：C++ 迷宫逃脱游戏" :prefix-icon="Document" size="large"
                clearable />
            </el-form-item>

            <!-- 项目描述 -->
            <el-form-item label="项目描述" prop="description">
              <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="简要描述你的游戏作品（技术亮点、游戏玩法等）"
                resize="none" />
            </el-form-item>

            <!-- 文件上传区 -->
            <div class="upload-section">
              <!-- 项目文件上传 -->
              <div class="upload-item">
                <div class="upload-label">
                  <span class="label-text">
                    <el-icon>
                      <FolderOpened />
                    </el-icon>
                    项目文件（源码压缩包）
                  </span>
                  <span class="label-hint">必填 · .zip/.rar/.7z · 最大 500MB</span>
                </div>
                <div class="upload-zone" :class="{
                  'is-dragover': dragStates.project,
                  'has-file': projectFile,
                  'is-uploading': uploadStates.project === 'uploading',
                  'is-done': uploadStates.project === 'done',
                  'is-error': uploadStates.project === 'error'
                }" @dragover.prevent="dragStates.project = true" @dragleave="dragStates.project = false"
                  @drop.prevent="handleDrop($event, 'project')" @click="triggerUpload('project')">
                  <input ref="projectInputRef" type="file" accept=".zip,.rar,.7z" class="hidden-input"
                    @change="handleFileChange($event, 'project')" />

                  <!-- 无文件状态 -->
                  <div v-if="!projectFile" class="zone-empty">
                    <div class="empty-icon">
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <rect x="8" y="6" width="32" height="36" rx="4" stroke="currentColor" stroke-width="2"
                          fill="none" />
                        <path d="M16 20h16M16 28h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        <path d="M24 36v-8M20 32l4-4 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                          stroke-linejoin="round" />
                      </svg>
                    </div>
                    <p class="empty-text">拖拽文件到此处，或<span class="link">点击选择</span></p>
                    <p class="empty-hint">支持压缩包格式，上传即表示你已阅读并同意相关条款</p>
                  </div>

                  <!-- 上传中状态 -->
                  <div v-else-if="uploadStates.project === 'uploading'" class="zone-uploading">
                    <div class="file-info">
                      <el-icon class="file-icon uploading">
                        <Loading />
                      </el-icon>
                      <span class="file-name">{{ projectFile.name }}</span>
                      <el-button text class="btn-cancel" @click.stop="cancelUpload('project')">取消</el-button>
                    </div>
                    <div class="progress-wrap">
                      <el-progress :percentage="uploadProgress.project" :stroke-width="6" :show-text="false" />
                      <span class="progress-text">
                        {{ formatSize(uploadedSize.project) }} / {{ formatSize(projectFile.size) }}
                        <span class="speed" v-if="uploadSpeed.project"> · {{ uploadSpeed.project }}/s</span>
                      </span>
                    </div>
                  </div>

                  <!-- 上传完成状态 -->
                  <div v-else-if="uploadStates.project === 'done'" class="zone-done">
                    <div class="file-info">
                      <el-icon class="file-icon success">
                        <CircleCheck />
                      </el-icon>
                      <span class="file-name">{{ projectFile.name }}</span>
                      <el-button text class="btn-reupload" @click.stop="reupload('project')">重新上传</el-button>
                    </div>
                    <div class="done-meta">
                      <span>{{ formatSize(projectFile.size) }}</span>
                      <span class="done-hash">Hash: {{ fileHashes.project?.slice(0, 12) }}...</span>
                    </div>
                  </div>

                  <!-- 上传失败状态 -->
                  <div v-else-if="uploadStates.project === 'error'" class="zone-error">
                    <div class="file-info">
                      <el-icon class="file-icon error">
                        <CircleClose />
                      </el-icon>
                      <span class="file-name error-text">{{ uploadErrorMsg.project }}</span>
                      <el-button text class="btn-retry" @click.stop="retryUpload('project')">重试</el-button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- PPT 文件上传 -->
              <div class="upload-item">
                <div class="upload-label">
                  <span class="label-text">
                    <el-icon>
                      <Reading />
                    </el-icon>
                    答辩 PPT
                  </span>
                  <span class="label-hint">必填 · .ppt/.pptx/.pdf · 最大 100MB</span>
                </div>
                <div class="upload-zone" :class="{
                  'is-dragover': dragStates.ppt,
                  'has-file': pptFile,
                  'is-uploading': uploadStates.ppt === 'uploading',
                  'is-done': uploadStates.ppt === 'done',
                  'is-error': uploadStates.ppt === 'error'
                }" @dragover.prevent="dragStates.ppt = true" @dragleave="dragStates.ppt = false"
                  @drop.prevent="handleDrop($event, 'ppt')" @click="triggerUpload('ppt')">
                  <input ref="pptInputRef" type="file" accept=".ppt,.pptx,.pdf" class="hidden-input"
                    @change="handleFileChange($event, 'ppt')" />

                  <div v-if="!pptFile" class="zone-empty">
                    <div class="empty-icon">
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <rect x="6" y="10" width="28" height="32" rx="3" fill="currentColor" opacity="0.1"
                          stroke="currentColor" stroke-width="2" />
                        <rect x="14" y="6" width="28" height="32" rx="3" fill="currentColor" opacity="0.15"
                          stroke="currentColor" stroke-width="2" />
                        <rect x="22" y="2" width="28" height="32" rx="3" fill="currentColor" opacity="0.2"
                          stroke="currentColor" stroke-width="2" />
                        <path d="M30 14h12M30 20h12M30 26h8" stroke="currentColor" stroke-width="2"
                          stroke-linecap="round" opacity="0.6" />
                      </svg>
                    </div>
                    <p class="empty-text">拖拽 PPT 文件到此处，或<span class="link">点击选择</span></p>
                    <p class="empty-hint">推荐使用 PDF 格式，兼容性最佳</p>
                  </div>

                  <div v-else-if="uploadStates.ppt === 'uploading'" class="zone-uploading">
                    <div class="file-info">
                      <el-icon class="file-icon uploading">
                        <Loading />
                      </el-icon>
                      <span class="file-name">{{ pptFile.name }}</span>
                      <el-button text class="btn-cancel" @click.stop="cancelUpload('ppt')">取消</el-button>
                    </div>
                    <div class="progress-wrap">
                      <el-progress :percentage="uploadProgress.ppt" :stroke-width="6" :show-text="false" />
                      <span class="progress-text">
                        {{ formatSize(uploadedSize.ppt) }} / {{ formatSize(pptFile.size) }}
                        <span class="speed" v-if="uploadSpeed.ppt"> · {{ uploadSpeed.ppt }}/s</span>
                      </span>
                    </div>
                  </div>

                  <div v-else-if="uploadStates.ppt === 'done'" class="zone-done">
                    <div class="file-info">
                      <el-icon class="file-icon success">
                        <CircleCheck />
                      </el-icon>
                      <span class="file-name">{{ pptFile.name }}</span>
                      <el-button text class="btn-reupload" @click.stop="reupload('ppt')">重新上传</el-button>
                    </div>
                    <div class="done-meta">
                      <span>{{ formatSize(pptFile.size) }}</span>
                      <span class="done-hash">Hash: {{ fileHashes.ppt?.slice(0, 12) }}...</span>
                    </div>
                  </div>

                  <div v-else-if="uploadStates.ppt === 'error'" class="zone-error">
                    <div class="file-info">
                      <el-icon class="file-icon error">
                        <CircleClose />
                      </el-icon>
                      <span class="file-name error-text">{{ uploadErrorMsg.ppt }}</span>
                      <el-button text class="btn-retry" @click.stop="retryUpload('ppt')">重试</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 提交按钮 -->
            <div class="form-actions">
              <el-button type="primary" size="large" :loading="submitting" :disabled="!canSubmit" class="btn-submit"
                @click="handleSubmit">
                <el-icon v-if="!submitting">
                  <Upload />
                </el-icon>
                提交作业
              </el-button>
              <p class="submit-note" v-if="!canSubmit">
                请完善必填信息并等待文件上传完成
              </p>
            </div>
          </el-form>
        </el-card>
      </section>

      <!-- 提交历史区 -->
      <section class="history-section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon>
              <Clock />
            </el-icon>
            提交记录
          </h2>
          <span class="record-count" v-if="historyTotal > 0">
            共 {{ historyTotal }} 条记录
          </span>
        </div>

        <!-- 空状态 -->
        <div v-if="!historyLoading && historyList.length === 0" class="history-empty">
          <div class="empty-illust">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
              <rect x="10" y="20" width="100" height="50" rx="6" fill="currentColor" opacity="0.05"
                stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3" />
              <path d="M40 45h40M40 55h25" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                opacity="0.3" />
              <circle cx="85" cy="30" r="12" fill="currentColor" opacity="0.08" stroke="currentColor"
                stroke-width="1.5" />
              <path d="M80 30l4 4 8-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" opacity="0.4" />
            </svg>
          </div>
          <p class="empty-title">暂无提交记录</p>
          <p class="empty-desc">完成首次作业提交后，这里将展示你的历史提交</p>
        </div>

        <!-- 记录列表 -->
        <div v-else class="history-list" v-loading="historyLoading">
          <div v-for="record in historyList" :key="record.id" class="history-item" :class="`status-${record.status}`">
            <div class="item-left">
              <div class="item-title">{{ record.projectName }}</div>
              <div class="item-meta">
                <span class="meta-time">
                  <el-icon>
                    <Clock />
                  </el-icon>
                  {{ formatDate(record.submitTime) }}
                </span>
                <span class="meta-files">
                  <el-icon>
                    <FolderOpened />
                  </el-icon>
                  {{ record.fileCount || 2 }} 个文件
                </span>
              </div>
              <p v-if="record.description" class="item-desc">{{ record.description }}</p>
            </div>
            <div class="item-right">
              <el-tag :type="statusTagType(record.status)" :effect="record.status === 'pending' ? 'plain' : 'light'"
                class="status-tag">
                <el-icon v-if="record.status === 'pending'">
                  <Clock />
                </el-icon>
                <el-icon v-else-if="record.status === 'approved'">
                  <CircleCheck />
                </el-icon>
                <el-icon v-else-if="record.status === 'rejected'">
                  <CircleClose />
                </el-icon>
                {{ statusLabel(record.status) }}
              </el-tag>
              <div class="item-actions">
                <el-button text size="small" @click="previewRecord(record)">
                  <el-icon>
                    <View />
                  </el-icon>
                  查看
                </el-button>
                <el-button text size="small" @click="downloadFiles(record)">
                  <el-icon>
                    <Download />
                  </el-icon>
                  下载
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="history-pagination" v-if="historyTotal > pageSize">
          <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="historyTotal"
            layout="prev, pager, next" background @current-change="loadHistory" />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import {
  Upload, Document, FolderOpened, Reading,
  Clock, View, Download, Loading, CircleCheck,
  CircleClose
} from '@element-plus/icons-vue';

const formRef = ref(null);
const projectInputRef = ref(null);
const pptInputRef = ref(null);

// 表单数据
const formData = reactive({
  projectName: '',
  description: '',
});

const formRules = {
  projectName: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 100, message: '项目名称长度在 2 到 100 个字符', trigger: 'blur' }
  ]
};

// 文件状态
const projectFile = ref(null);
const pptFile = ref(null);

// 上传状态: idle | uploading | done | error
const uploadStates = reactive({
  project: 'idle',
  ppt: 'idle',
});

// 上传进度
const uploadProgress = reactive({ project: 0, ppt: 0 });
const uploadedSize = reactive({ project: 0, ppt: 0 });
const uploadSpeed = reactive({ project: '', ppt: '' });
const fileHashes = reactive({ project: '', ppt: '' });
const uploadErrorMsg = reactive({ project: '', ppt: '' });
const cancelTokens = reactive({ project: null, ppt: null });

// 拖拽状态
const dragStates = reactive({ project: false, ppt: false });

// 提交状态
const submitting = ref(false);

// 历史记录
const historyList = ref([]);
const historyTotal = ref(0);
const historyLoading = ref(false);
const currentPage = ref(1);
const pageSize = 6;

// 文件类型配置
const fileConfig = {
  project: {
    accept: '.zip,.rar,.7z',
    maxSize: 500 * 1024 * 1024, // 500MB
    types: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
  },
  ppt: {
    accept: '.ppt,.pptx,.pdf',
    maxSize: 100 * 1024 * 1024, // 100MB
    types: ['application/pdf', 'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  }
};

// 能否提交
const canSubmit = computed(() => {
  return formData.projectName.trim().length >= 2
    && uploadStates.project === 'done'
    && uploadStates.ppt === 'done'
    && !submitting.value;
});

// 文件大小格式化
function formatSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// 日期格式化
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// 状态标签
function statusTagType(status) {
  const map = { pending: 'warning', approved: 'success', rejected: 'danger' };
  return map[status] || 'info';
}
function statusLabel(status) {
  const map = { pending: '待审核', approved: '已通过', rejected: '已驳回' };
  return map[status] || status;
}

// 触发文件选择
function triggerUpload(type) {
  const ref = type === 'project' ? projectInputRef : pptInputRef;
  ref.value?.click();
}

// 处理文件选择
async function handleFileChange(event, type) {
  const file = event.target.files?.[0];
  if (file) {
    await validateAndUpload(file, type);
  }
  event.target.value = '';
}

// 处理拖拽
async function handleDrop(event, type) {
  dragStates[type] = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    await validateAndUpload(file, type);
  }
}

// 校验并上传
async function validateAndUpload(file, type) {
  const config = fileConfig[type];

  // 类型校验
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  const validExts = config.accept.split(',');
  if (!validExts.includes(ext)) {
    uploadStates[type] = 'error';
    uploadErrorMsg[type] = `不支持的文件类型 ${ext}，请上传 ${config.accept}`;
    return;
  }

  // 大小校验
  if (file.size > config.maxSize) {
    uploadStates[type] = 'error';
    uploadErrorMsg[type] = `文件超过大小限制（${formatSize(config.maxSize)}）`;
    return;
  }

  if (type === 'project') {
    projectFile.value = file;
  } else {
    pptFile.value = file;
  }

  await startUpload(file, type);
}

// 开始上传（模拟分片上传进度）
async function startUpload(file, type) {
  uploadStates[type] = 'uploading';
  uploadProgress[type] = 0;
  uploadedSize[type] = 0;
  uploadErrorMsg[type] = '';

  const totalSize = file.size;
  const chunkSize = 5 * 1024 * 1024; // 5MB per chunk
  const totalChunks = Math.ceil(totalSize / chunkSize);

  // 模拟计算文件 hash（实际应用中用 Web Crypto API）
  const fakeHash = await computeFakeHash(file);
  fileHashes[type] = fakeHash;

  let lastTime = Date.now();
  let lastUploaded = 0;

  // 模拟分片上传
  for (let i = 0; i < totalChunks; i++) {
    // 模拟每个分片 200-500ms 上传时间
    await new Promise(r => setTimeout(r, 200 + Math.random() * 300));

    const uploaded = Math.min((i + 1) * chunkSize, totalSize);
    uploadedSize[type] = uploaded;
    uploadProgress[type] = Math.round((uploaded / totalSize) * 100);

    // 计算速度
    const now = Date.now();
    const timeDiff = (now - lastTime) / 1000;
    if (timeDiff >= 0.5) {
      const sizeDiff = uploaded - lastUploaded;
      uploadSpeed[type] = formatSize(Math.round(sizeDiff / timeDiff));
      lastTime = now;
      lastUploaded = uploaded;
    }
  }

  uploadStates[type] = 'done';
  uploadProgress[type] = 100;
}

// 模拟文件 hash 计算
async function computeFakeHash(file) {
  const buffer = await file.slice(0, 1024 * 1024).arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 重新上传
async function reupload(type) {
  if (type === 'project') {
    projectFile.value = null;
  } else {
    pptFile.value = null;
  }
  uploadStates[type] = 'idle';
  uploadProgress[type] = 0;
  uploadedSize[type] = 0;
  triggerUpload(type);
}

// 取消上传
function cancelUpload(type) {
  uploadStates[type] = 'idle';
  uploadProgress[type] = 0;
  uploadedSize[type] = 0;
  if (type === 'project') projectFile.value = null;
  else pptFile.value = null;
}

// 重试上传
async function retryUpload(type) {
  const file = type === 'project' ? projectFile.value : pptFile.value;
  if (file) {
    uploadStates[type] = 'idle';
    await startUpload(file, type);
  }
}

// 提交作业
async function handleSubmit() {
  if (!canSubmit.value) return;

  try {
    await formRef.value?.validate();
    submitting.value = true;

    // 模拟提交 API 调用
    await new Promise(r => setTimeout(r, 1500));

    // 重置表单
    formData.projectName = '';
    formData.description = '';
    projectFile.value = null;
    pptFile.value = null;
    uploadStates.project = 'idle';
    uploadStates.ppt = 'idle';
    uploadProgress.project = 0;
    uploadProgress.ppt = 0;
    fileHashes.project = '';
    fileHashes.ppt = '';

    // 刷新历史
    await loadHistory();

  } catch (e) {
    console.error('submit error', e);
  } finally {
    submitting.value = false;
  }
}

// 加载历史记录
async function loadHistory() {
  historyLoading.value = true;
  try {
    // 模拟 API
    await new Promise(r => setTimeout(r, 800));

    // 模拟数据
    historyList.value = [
      {
        id: 1,
        projectName: 'C++ 迷宫逃脱游戏',
        description: '基于 A* 算法的自动寻路功能，支持多难度关卡',
        submitTime: new Date(Date.now() - 86400000).toISOString(),
        status: 'approved',
        fileCount: 2
      },
      {
        id: 2,
        projectName: '贪吃蛇大战 AI',
        description: '人机对战版贪吃蛇，带有简单机器学习决策',
        submitTime: new Date(Date.now() - 172800000).toISOString(),
        status: 'pending',
        fileCount: 2
      },
      {
        id: 3,
        projectName: '俄罗斯方块联机版',
        submitTime: new Date(Date.now() - 604800000).toISOString(),
        status: 'rejected',
        fileCount: 2,
        rejectReason: '缺少答辩 PPT'
      }
    ];
    historyTotal.value = 3;

  } catch (e) {
    console.error('load history error', e);
  } finally {
    historyLoading.value = false;
  }
}

function previewRecord(record) {
  console.log('preview', record);
}

function downloadFiles(record) {
  console.log('download', record);
}

// 初始化
loadHistory();
</script>

<style scoped>
.submission-page {
  min-height: 100vh;
  background: var(--bg-page, #f0f2f5);
  padding: 0 0 60px;
}

/* ========== 页面头部 ========== */
.page-header {
  position: relative;
  overflow: hidden;
  padding: 40px 40px 36px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #fff;
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  flex-shrink: 0;
  filter: drop-shadow(0 4px 12px rgba(102, 126, 234, 0.4));
}

.header-text h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 1px;
}

.header-text p {
  margin: 6px 0 0;
  font-size: 14px;
  opacity: 0.65;
}

.header-deco {
  position: absolute;
  right: -20px;
  top: -20px;
  width: 260px;
  height: 160px;
  z-index: 1;
  pointer-events: none;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.15);
}

.circle-1 {
  width: 180px;
  height: 180px;
  right: -60px;
  top: -60px;
}

.circle-2 {
  width: 100px;
  height: 100px;
  right: 80px;
  top: 20px;
  background: rgba(118, 75, 162, 0.1);
}

.deco-dots {
  position: absolute;
  right: 40px;
  bottom: 10px;
  width: 120px;
  height: 60px;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.2) 1px, transparent 1px);
  background-size: 12px 12px;
}

/* ========== 主内容区 ========== */
.page-main {
  max-width: 860px;
  margin: -20px auto 0;
  padding: 0 24px;
  position: relative;
  z-index: 2;
}

/* ========== 表单卡片 ========== */
.form-section {
  margin-bottom: 28px;
}

.form-card {
  border-radius: 16px;
  border: 1px solid var(--border, #e8e8e8);
  overflow: hidden;
}

.form-card :deep(.el-card__header) {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border, #e8e8e8);
  background: var(--card-bg, #fff);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text, #1a1a2e);
}

.card-tip {
  font-size: 12px;
  color: var(--text-secondary, #909399);
}

.form-card :deep(.el-card__body) {
  padding: 24px;
}

.submission-form :deep(.el-form-item__label) {
  font-weight: 600;
  font-size: 14px;
}

.submission-form :deep(.el-input__wrapper),
.submission-form :deep(.el-textarea__inner) {
  border-radius: 10px;
}

/* ========== 上传区 ========== */
.upload-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 8px 0;
}

.upload-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.label-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text, #1a1a2e);
}

.label-hint {
  font-size: 12px;
  color: var(--text-secondary, #909399);
}

.upload-zone {
  position: relative;
  border: 2px dashed var(--border, #dcdfe6);
  border-radius: 14px;
  padding: 28px 24px;
  cursor: pointer;
  transition: all 0.25s ease;
  background: var(--card-bg, #fff);
  min-height: 110px;
  display: flex;
  align-items: center;
}

.upload-zone:hover,
.upload-zone.is-dragover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.04);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.12);
}

.upload-zone.has-file {
  border-style: solid;
  border-color: var(--border, #dcdfe6);
}

.upload-zone.is-done {
  border-color: #67c23a;
  background: rgba(103, 194, 58, 0.03);
}

.upload-zone.is-error {
  border-color: #f56c6c;
  background: rgba(245, 108, 108, 0.03);
}

.hidden-input {
  display: none;
}

/* 空状态 */
.zone-empty {
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.empty-icon {
  color: #c0c4cc;
  transition: color 0.2s;
}

.upload-zone:hover .empty-icon {
  color: #667eea;
}

.empty-text {
  font-size: 14px;
  color: var(--text-secondary, #606266);
  margin: 0;
}

.empty-text .link {
  color: #667eea;
  font-weight: 600;
}

.empty-hint {
  font-size: 12px;
  color: #c0c4cc;
  margin: 0;
}

/* 上传中状态 */
.zone-uploading {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.file-icon.uploading {
  color: #667eea;
  animation: spin 1s linear infinite;
}

.file-icon.success {
  color: #67c23a;
}

.file-icon.error {
  color: #f56c6c;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text, #1a1a2e);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-name.error-text {
  color: #f56c6c;
}

.btn-cancel,
.btn-reupload,
.btn-retry {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  flex-shrink: 0;
}

.btn-cancel:hover,
.btn-reupload:hover,
.btn-retry:hover {
  color: #667eea;
}

.progress-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-wrap :deep(.el-progress-bar__outer) {
  border-radius: 3px;
  background: var(--border, #e8e8e8);
}

.progress-wrap :deep(.el-progress-bar__inner) {
  border-radius: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  text-align: right;
}

.speed {
  color: #667eea;
}

/* 上传完成状态 */
.zone-done {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.done-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary, #909399);
}

.done-hash {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  opacity: 0.7;
}

/* ========== 提交按钮 ========== */
.form-actions {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.btn-submit {
  height: 48px;
  padding: 0 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.35);
  transition: all 0.3s ease;
  letter-spacing: 1px;
}

.btn-submit:hover:not(:disabled) {
  box-shadow: 0 6px 24px rgba(102, 126, 234, 0.5);
  transform: translateY(-2px);
}

.btn-submit:disabled {
  opacity: 0.5;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.submit-note {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  margin: 0;
}

/* ========== 历史记录区 ========== */
.history-section {
  background: var(--card-bg, #fff);
  border-radius: 16px;
  border: 1px solid var(--border, #e8e8e8);
  padding: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text, #1a1a2e);
  margin: 0;
}

.record-count {
  font-size: 13px;
  color: var(--text-secondary, #909399);
  background: var(--bg-page, #f5f7fa);
  padding: 4px 12px;
  border-radius: 20px;
}

/* 历史空状态 */
.history-empty {
  text-align: center;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-illust {
  color: #c0c4cc;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary, #909399);
  margin: 0;
}

.empty-desc {
  font-size: 13px;
  color: #c0c4cc;
  margin: 0;
}

/* 历史列表 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.history-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid var(--border, #ebeef5);
  background: var(--card-bg, #fff);
  transition: all 0.2s ease;
}

.history-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.history-item.status-approved {
  border-left: 3px solid #67c23a;
}

.history-item.status-pending {
  border-left: 3px solid #e6a23c;
}

.history-item.status-rejected {
  border-left: 3px solid #f56c6c;
}

.item-left {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text, #1a1a2e);
  margin-bottom: 6px;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: var(--text-secondary, #909399);
  margin-bottom: 6px;
}

.meta-time,
.meta-files {
  display: flex;
  align-items: center;
  gap: 4px;
}

.item-desc {
  font-size: 13px;
  color: var(--text-secondary, #909399);
  margin: 4px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.status-tag {
  font-size: 12px;
}

.item-actions {
  display: flex;
  gap: 4px;
}

.item-actions .el-button {
  font-size: 12px;
}

/* 分页 */
.history-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* ========== 动画 ========== */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* ========== 暗色主题适配 ========== */
@media (dark-mode) {
  .page-header {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  }

  .form-card,
  .history-section {
    background: var(--el-bg-color);
    border-color: var(--el-border-color);
  }

  .form-card :deep(.el-card__header) {
    background: var(--el-bg-color-page);
    border-color: var(--el-border-color);
  }

  .card-title,
  .label-text,
  .item-title {
    color: var(--el-text-color-primary);
  }

  .card-tip,
  .empty-text,
  .empty-hint,
  .progress-text,
  .done-meta,
  .meta-time,
  .meta-files,
  .item-desc,
  .record-count {
    color: var(--el-text-color-secondary);
  }

  .submit-note {
    color: var(--el-text-color-placeholder);
  }

  .upload-zone {
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
  }

  .upload-zone:hover,
  .upload-zone.is-dragover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.08);
  }

  .upload-zone.is-done {
    border-color: #67c23a;
    background: rgba(103, 194, 58, 0.05);
  }

  .upload-zone.is-error {
    border-color: #f56c6c;
    background: rgba(245, 108, 108, 0.05);
  }

  .zone-done {
    background: transparent;
  }

  .history-item {
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
  }

  .progress-wrap :deep(.el-progress-bar__outer) {
    background: var(--el-border-color);
  }

  .form-card :deep(.el-input__wrapper),
  .form-card :deep(.el-textarea__inner) {
    background: var(--el-fill-color-light);
  }
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .page-header {
    padding: 28px 20px;
  }

  .header-text h1 {
    font-size: 22px;
  }

  .page-main {
    padding: 0 12px;
  }

  .form-card :deep(.el-card__body) {
    padding: 16px;
  }

  .history-section {
    padding: 16px;
  }

  .history-item {
    flex-direction: column;
    gap: 12px;
  }

  .item-right {
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-between;
  }
}
</style>
