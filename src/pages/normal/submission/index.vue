<template>
  <div class="submission-page">
    <header class="page-header">
      <div>
        <h1>作业提交</h1>
        <p>按项目提交源码压缩包与答辩文件，提交记录和评分结果会在这里持续更新。</p>
      </div>
      <el-tag type="info" effect="plain">学生端</el-tag>
    </header>

    <main class="page-main">
      <el-card class="selector-card" shadow="never">
        <div class="selector-row">
          <div class="selector-main">
            <span class="selector-label">提交项目</span>
            <el-select
              v-model="formData.projectId"
              placeholder="请选择可提交项目"
              filterable
              clearable
              :loading="loadingProjects"
              :disabled="loadingProjects || projectOptions.length === 0"
              style="width: 100%;"
            >
              <el-option
                v-for="project in projectOptions"
                :key="project.id"
                :label="project.name"
                :value="project.id"
              />
            </el-select>
          </div>
          <div class="selector-meta" v-if="selectedProject">
            <span>提交窗口：{{ submissionWindowLabel }}</span>
            <span>覆盖提交：{{ selectedProject.enableResubmit ? '允许' : '禁止' }}</span>
          </div>
        </div>
      </el-card>

      <el-alert
        v-if="submissionNotice"
        class="status-alert"
        :title="submissionNotice.title"
        :description="submissionNotice.description"
        :type="submissionNotice.type"
        :closable="false"
        show-icon
      />

      <section v-if="!loadingProjects && projectOptions.length === 0" class="empty-section">
        <el-empty description="当前暂无可提交作业的项目" />
      </section>

      <template v-else>
        <el-card class="form-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div>
                <strong>{{ submitButtonText }}</strong>
                <p v-if="selectedProject" class="card-subtitle">
                  文件限制会跟随当前项目自动切换，未联调阶段仍按契约字段提交。
                </p>
              </div>
              <el-tag v-if="currentSubmission" :type="statusTagType(currentSubmission.status)" effect="light">
                {{ statusLabel(currentSubmission.status) }}
              </el-tag>
            </div>
          </template>

          <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="submission-form">
            <el-form-item label="项目描述" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="4"
                resize="none"
                maxlength="500"
                show-word-limit
                :disabled="!selectedProject"
                placeholder="补充你的作品亮点、实现思路，或说明本次重新提交的内容。"
              />
            </el-form-item>

            <div class="file-grid">
              <div class="upload-item">
                <div class="upload-label">
                  <span class="label-title">
                    <el-icon><FolderOpened /></el-icon>
                    项目文件
                  </span>
                  <span class="label-hint">{{ projectUploadHint }}</span>
                </div>
                <div
                  class="upload-zone"
                  :class="uploadClass('project')"
                  @dragover.prevent="handleDragOver('project')"
                  @dragleave="dragStates.project = false"
                  @drop.prevent="handleDrop($event, 'project')"
                  @click="triggerUpload('project')"
                >
                  <input
                    ref="projectInputRef"
                    type="file"
                    class="hidden-input"
                    :accept="projectAccept"
                    @change="handleFileChange($event, 'project')"
                  />

                  <template v-if="!projectFile">
                    <div class="zone-empty">
                      <el-icon class="empty-icon"><Upload /></el-icon>
                      <p>拖拽文件到此处，或点击选择</p>
                    </div>
                  </template>

                  <template v-else-if="uploadStates.project === 'uploading'">
                    <div class="zone-state">
                      <div class="file-row">
                        <el-icon class="file-icon uploading"><Loading /></el-icon>
                        <span class="file-name">{{ projectFile.name }}</span>
                        <el-button text @click.stop="cancelUpload('project')">取消</el-button>
                      </div>
                      <el-progress :percentage="uploadProgress.project" :stroke-width="6" :show-text="false" />
                      <span class="progress-text">
                        {{ formatSize(uploadedSize.project) }} / {{ formatSize(projectFile.size) }}
                        <span v-if="uploadSpeed.project"> · {{ uploadSpeed.project }}/s</span>
                      </span>
                    </div>
                  </template>

                  <template v-else-if="uploadStates.project === 'done'">
                    <div class="zone-state">
                      <div class="file-row">
                        <el-icon class="file-icon success"><CircleCheck /></el-icon>
                        <span class="file-name">{{ projectFile.name }}</span>
                        <el-button text @click.stop="reupload('project')">重新上传</el-button>
                      </div>
                      <span class="progress-text">Hash: {{ fileHashes.project.slice(0, 16) }}...</span>
                    </div>
                  </template>

                  <template v-else-if="uploadStates.project === 'error'">
                    <div class="zone-state">
                      <div class="file-row">
                        <el-icon class="file-icon error"><CircleClose /></el-icon>
                        <span class="file-name error-text">{{ uploadErrorMsg.project }}</span>
                        <el-button text @click.stop="retryUpload('project')">重试</el-button>
                      </div>
                    </div>
                  </template>
                </div>
              </div>

              <div class="upload-item">
                <div class="upload-label">
                  <span class="label-title">
                    <el-icon><Reading /></el-icon>
                    答辩文件
                  </span>
                  <span class="label-hint">{{ pptUploadHint }}</span>
                </div>
                <div
                  class="upload-zone"
                  :class="uploadClass('ppt')"
                  @dragover.prevent="handleDragOver('ppt')"
                  @dragleave="dragStates.ppt = false"
                  @drop.prevent="handleDrop($event, 'ppt')"
                  @click="triggerUpload('ppt')"
                >
                  <input
                    ref="pptInputRef"
                    type="file"
                    class="hidden-input"
                    :accept="pptAccept"
                    @change="handleFileChange($event, 'ppt')"
                  />

                  <template v-if="!pptFile">
                    <div class="zone-empty">
                      <el-icon class="empty-icon"><Upload /></el-icon>
                      <p>拖拽文件到此处，或点击选择</p>
                    </div>
                  </template>

                  <template v-else-if="uploadStates.ppt === 'uploading'">
                    <div class="zone-state">
                      <div class="file-row">
                        <el-icon class="file-icon uploading"><Loading /></el-icon>
                        <span class="file-name">{{ pptFile.name }}</span>
                        <el-button text @click.stop="cancelUpload('ppt')">取消</el-button>
                      </div>
                      <el-progress :percentage="uploadProgress.ppt" :stroke-width="6" :show-text="false" />
                      <span class="progress-text">
                        {{ formatSize(uploadedSize.ppt) }} / {{ formatSize(pptFile.size) }}
                        <span v-if="uploadSpeed.ppt"> · {{ uploadSpeed.ppt }}/s</span>
                      </span>
                    </div>
                  </template>

                  <template v-else-if="uploadStates.ppt === 'done'">
                    <div class="zone-state">
                      <div class="file-row">
                        <el-icon class="file-icon success"><CircleCheck /></el-icon>
                        <span class="file-name">{{ pptFile.name }}</span>
                        <el-button text @click.stop="reupload('ppt')">重新上传</el-button>
                      </div>
                      <span class="progress-text">Hash: {{ fileHashes.ppt.slice(0, 16) }}...</span>
                    </div>
                  </template>

                  <template v-else-if="uploadStates.ppt === 'error'">
                    <div class="zone-state">
                      <div class="file-row">
                        <el-icon class="file-icon error"><CircleClose /></el-icon>
                        <span class="file-name error-text">{{ uploadErrorMsg.ppt }}</span>
                        <el-button text @click.stop="retryUpload('ppt')">重试</el-button>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <el-button
                type="primary"
                size="large"
                :loading="submitting"
                :disabled="!canSubmit"
                @click="handleSubmit"
              >
                <el-icon v-if="!submitting"><Upload /></el-icon>
                {{ submitButtonText }}
              </el-button>
              <span class="submit-note">
                {{ canSubmit ? '上传完成后将按当前项目生成提交记录。' : disabledSubmitReason }}
              </span>
            </div>
          </el-form>
        </el-card>

        <el-card v-if="showScoreCard" class="score-card" shadow="never">
          <template #header>
            <div class="card-header">
              <strong>评分结果</strong>
              <span class="score-summary">{{ scoreSummaryText }}</span>
            </div>
          </template>

          <div class="score-grid" v-if="displayScore.dimensionScores.length">
            <div v-for="dimension in displayScore.dimensionScores" :key="dimension.dimensionId || dimension.dimensionName" class="score-item">
              <span class="score-name">{{ dimension.dimensionName || dimension.name }}</span>
              <strong>{{ dimension.score }}/{{ dimension.maxScore }}</strong>
            </div>
          </div>
          <div class="score-grid" v-else>
            <div class="score-item">
              <span class="score-name">总分</span>
              <strong>{{ scoreSummaryText }}</strong>
            </div>
          </div>

          <p class="score-comment">{{ displayScore.comment || currentSubmission?.reviewComment || '暂无教师评语' }}</p>
        </el-card>

        <section class="history-section">
          <div class="section-header">
            <div>
              <h2>提交记录</h2>
              <p>{{ selectedProject ? `当前按「${selectedProject.name}」过滤` : '展示全部提交记录' }}</p>
            </div>
            <el-tag v-if="historyTotal > 0" effect="plain">{{ historyTotal }} 条</el-tag>
          </div>

          <el-empty v-if="!historyLoading && historyList.length === 0" description="暂无提交记录" />

          <div v-else class="history-list" v-loading="historyLoading">
            <article v-for="record in historyList" :key="record.id" class="history-item">
              <div class="history-main">
                <div class="history-title-row">
                  <strong>{{ record.projectName || `项目 #${record.projectId}` }}</strong>
                  <el-tag :type="statusTagType(record.status)" effect="light">{{ statusLabel(record.status) }}</el-tag>
                </div>
                <div class="history-meta">
                  <span>
                    <el-icon><Clock /></el-icon>
                    {{ formatDate(record.updatedAt || record.createdAt) }}
                  </span>
                  <span v-if="record.finalScore !== null">
                    成绩 {{ record.finalScore }}{{ record.totalScore ? ` / ${record.totalScore}` : '' }}
                  </span>
                  <span>第 {{ record.submitCount || 1 }} 次提交</span>
                </div>
                <p v-if="record.description" class="history-desc">{{ record.description }}</p>
                <p v-if="record.reviewComment" class="history-comment">评语：{{ record.reviewComment }}</p>
              </div>
              <div class="history-actions">
                <el-button text size="small" @click="previewRecord(record)">
                  <el-icon><View /></el-icon>
                  查看
                </el-button>
                <el-button text size="small" @click="downloadFiles(record)">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
              </div>
            </article>
          </div>

          <div class="history-pagination" v-if="historyTotal > pageSize">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="historyTotal"
              layout="prev, pager, next"
              background
            />
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import {
  Upload,
  FolderOpened,
  Reading,
  Clock,
  View,
  Download,
  Loading,
  CircleCheck,
  CircleClose,
} from '@element-plus/icons-vue';

import {
  normalizeSubmissionProject,
  normalizeSubmissionRecord,
  normalizeSubmissionScore,
  submissionApi,
} from '@/api/submission';
import { useMessage } from '@/composables/useMessage';
import {
  DEFAULT_PROJECT_FILE_MAX_SIZE,
  DEFAULT_PPT_FILE_MAX_SIZE,
  normalizeProjectSubmissionConfig,
} from '@/utils/submission';

defineOptions({
  name: 'NormalSubmissionPage'
});

const message = useMessage();

const formRef = ref(null);
const projectInputRef = ref(null);
const pptInputRef = ref(null);

const formData = reactive({
  projectId: '',
  description: '',
});

const formRules = {
  description: [{ max: 500, message: '项目描述最多 500 个字符', trigger: 'blur' }],
};

const pageSize = 10;

const loadingProjects = ref(false);
const loadingCurrent = ref(false);
const historyLoading = ref(false);
const submitting = ref(false);

const projectOptions = ref([]);
const currentSubmission = ref(null);
const currentScore = ref(null);
const historyList = ref([]);
const historyTotal = ref(0);
const currentPage = ref(1);

const projectFile = ref(null);
const pptFile = ref(null);
const uploadedFiles = reactive({ project: null, ppt: null });
const dragStates = reactive({ project: false, ppt: false });
const uploadStates = reactive({ project: 'idle', ppt: 'idle' });
const uploadProgress = reactive({ project: 0, ppt: 0 });
const uploadedSize = reactive({ project: 0, ppt: 0 });
const uploadSpeed = reactive({ project: '', ppt: '' });
const uploadErrorMsg = reactive({ project: '', ppt: '' });
const fileHashes = reactive({ project: '', ppt: '' });
const uploadRunIds = reactive({ project: 0, ppt: 0 });

const selectedProject = computed(() => {
  return projectOptions.value.find((item) => String(item.id) === String(formData.projectId)) || null;
});

const selectedProjectConfig = computed(() => normalizeProjectSubmissionConfig(selectedProject.value || {}));

const projectAccept = computed(() => selectedProjectConfig.value.submissionFileTypes.map((item) => `.${item}`).join(','));
const pptAccept = computed(() => selectedProjectConfig.value.submissionPptTypes.map((item) => `.${item}`).join(','));

const projectUploadHint = computed(() => {
  return `${projectAccept.value || '.zip,.rar,.7z'} · 最大 ${formatSize(selectedProjectConfig.value.submissionMaxSize || DEFAULT_PROJECT_FILE_MAX_SIZE)}`;
});

const pptUploadHint = computed(() => {
  return `${pptAccept.value || '.ppt,.pptx,.pdf'} · 最大 ${formatSize(selectedProjectConfig.value.submissionPptMaxSize || DEFAULT_PPT_FILE_MAX_SIZE)}`;
});

const submissionWindowLabel = computed(() => {
  if (!selectedProject.value) return '--';

  const { submissionStartDate, submissionEndDate } = selectedProjectConfig.value;
  if (!submissionStartDate && !submissionEndDate) {
    return '跟随项目时间';
  }

  return `${submissionStartDate || '立即开始'} - ${submissionEndDate || '不限截止'}`;
});

const submissionNotice = computed(() => {
  if (!selectedProject.value) {
    return {
      type: 'info',
      title: '请选择项目',
      description: '选择项目后，页面会加载该项目的提交规则、你当前的提交记录和历史记录。'
    };
  }

  const now = Date.now();
  const start = parseDateValue(selectedProjectConfig.value.submissionStartDate);
  const end = parseDateValue(selectedProjectConfig.value.submissionEndDate);

  if (!selectedProjectConfig.value.allowSubmission) {
    return {
      type: 'warning',
      title: '当前项目未开启作业提交',
      description: '请等待管理员在项目配置中开启提交流程。'
    };
  }

  if (start && now < start.getTime()) {
    return {
      type: 'info',
      title: '提交尚未开始',
      description: `该项目将于 ${formatDate(selectedProjectConfig.value.submissionStartDate)} 开放提交。`
    };
  }

  if (end && now > end.getTime()) {
    return {
      type: 'error',
      title: '提交已截止',
      description: `该项目的提交窗口已于 ${formatDate(selectedProjectConfig.value.submissionEndDate)} 结束。`
    };
  }

  if (currentSubmission.value?.status === 'returned') {
    return {
      type: 'warning',
      title: '提交已打回',
      description: currentSubmission.value.reviewComment || '请根据教师意见修改后重新提交。'
    };
  }

  if (currentSubmission.value && !selectedProject.value.enableResubmit) {
    return {
      type: 'warning',
      title: '当前项目不允许覆盖提交',
      description: statusLabel(currentSubmission.value.status) === '已评分'
        ? '你的提交已完成评分，当前只读展示结果。'
        : '你已经提交过该项目，需等待后续评分或处理结果。'
    };
  }

  if (currentSubmission.value && selectedProject.value.enableResubmit) {
    return {
      type: 'info',
      title: '你已有一条提交记录',
      description: '新的提交会覆盖当前记录，并按最新文件重新进入评分流程。'
    };
  }

  return {
    type: 'success',
    title: '当前项目可提交',
    description: '请完成两个文件上传后提交。'
  };
});

const submissionState = computed(() => {
  if (!selectedProject.value) {
    return { canSubmit: false, reason: '请先选择项目' };
  }

  const now = Date.now();
  const start = parseDateValue(selectedProjectConfig.value.submissionStartDate);
  const end = parseDateValue(selectedProjectConfig.value.submissionEndDate);

  if (!selectedProjectConfig.value.allowSubmission) {
    return { canSubmit: false, reason: '当前项目未开启作业提交' };
  }

  if (start && now < start.getTime()) {
    return { canSubmit: false, reason: '提交时间尚未开始' };
  }

  if (end && now > end.getTime()) {
    return { canSubmit: false, reason: '提交已截止' };
  }

  if (currentSubmission.value && !selectedProject.value.enableResubmit) {
    return { canSubmit: false, reason: '当前项目不允许覆盖提交' };
  }

  return { canSubmit: true, reason: '' };
});

const canOperateUpload = computed(() => submissionState.value.canSubmit);
const canSubmit = computed(() => {
  return submissionState.value.canSubmit
    && uploadStates.project === 'done'
    && uploadStates.ppt === 'done';
});

const disabledSubmitReason = computed(() => {
  if (submissionState.value.reason) {
    return submissionState.value.reason;
  }

  if (!selectedProject.value) {
    return '请先选择项目';
  }

  if (uploadStates.project !== 'done' || uploadStates.ppt !== 'done') {
    return '请先完成两个文件上传';
  }

  return '请完善必填信息';
});

const submitButtonText = computed(() => {
  return currentSubmission.value && selectedProject.value?.enableResubmit ? '覆盖提交' : '提交作业';
});

const showScoreCard = computed(() => {
  return currentSubmission.value?.status === 'scored' && (displayScore.value.totalScore !== null || currentSubmission.value?.finalScore !== null);
});

const displayScore = computed(() => {
  if (currentScore.value) {
    return currentScore.value;
  }

  return {
    totalScore: currentSubmission.value?.finalScore ?? null,
    maxScore: currentSubmission.value?.totalScore ?? null,
    comment: currentSubmission.value?.reviewComment || '',
    dimensionScores: [],
  };
});

const scoreSummaryText = computed(() => {
  const total = displayScore.value.totalScore;
  const maxScore = displayScore.value.maxScore;
  if (total === null || total === undefined) {
    return '待公布';
  }
  return maxScore ? `${total} / ${maxScore}` : `${total}`;
});

const extractList = (payload) => {
  if (Array.isArray(payload)) {
    return { list: payload, total: payload.length };
  }

  if (Array.isArray(payload?.list)) {
    return {
      list: payload.list,
      total: Number(payload.total ?? payload.list.length),
    };
  }

  return { list: [], total: 0 };
};

function parseDateValue(value) {
  if (!value) return null;
  const date = new Date(String(value).replace(/-/g, '/'));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseDateValue(value);
  if (!date) return '—';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function formatSize(size) {
  if (!Number.isFinite(Number(size)) || Number(size) <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = Number(size);
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 100 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function statusLabel(status) {
  const map = {
    pending: '待评分',
    scoring: '评分中',
    scored: '已评分',
    returned: '已打回',
  };
  return map[status] || '处理中';
}

function statusTagType(status) {
  const map = {
    pending: 'warning',
    scoring: 'info',
    scored: 'success',
    returned: 'danger',
  };
  return map[status] || 'info';
}

function uploadClass(type) {
  return {
    'is-dragover': dragStates[type],
    'has-file': type === 'project' ? !!projectFile.value : !!pptFile.value,
    'is-uploading': uploadStates[type] === 'uploading',
    'is-done': uploadStates[type] === 'done',
    'is-error': uploadStates[type] === 'error',
    'is-disabled': !canOperateUpload.value,
  };
}

function handleDragOver(type) {
  dragStates[type] = canOperateUpload.value;
}

function resetUploadState(type, { clearFile = true } = {}) {
  uploadRunIds[type] += 1;
  dragStates[type] = false;
  uploadStates[type] = 'idle';
  uploadProgress[type] = 0;
  uploadedSize[type] = 0;
  uploadSpeed[type] = '';
  uploadErrorMsg[type] = '';
  fileHashes[type] = '';
  uploadedFiles[type] = null;

  if (clearFile) {
    if (type === 'project') {
      projectFile.value = null;
      if (projectInputRef.value) projectInputRef.value.value = '';
    } else {
      pptFile.value = null;
      if (pptInputRef.value) pptInputRef.value.value = '';
    }
  }
}

function resetDraftUploads() {
  resetUploadState('project');
  resetUploadState('ppt');
}

function triggerUpload(type) {
  if (!canOperateUpload.value) return;
  if (type === 'project') {
    projectInputRef.value?.click();
    return;
  }
  pptInputRef.value?.click();
}

async function computeFileFingerprint(file) {
  const content = `${file.name}|${file.size}|${file.type}|${file.lastModified}`;
  const buffer = new TextEncoder().encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((item) => item.toString(16).padStart(2, '0'))
    .join('');
}

function validateFile(file, type) {
  if (!selectedProject.value) {
    uploadErrorMsg[type] = '请先选择项目';
    uploadStates[type] = 'error';
    return false;
  }

  if (!canOperateUpload.value) {
    uploadErrorMsg[type] = submissionState.value.reason || '当前不可上传';
    uploadStates[type] = 'error';
    return false;
  }

  const allowedTypes = type === 'project'
    ? selectedProjectConfig.value.submissionFileTypes
    : selectedProjectConfig.value.submissionPptTypes;
  const maxSize = type === 'project'
    ? selectedProjectConfig.value.submissionMaxSize
    : selectedProjectConfig.value.submissionPptMaxSize;
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  if (!allowedTypes.includes(ext)) {
    uploadStates[type] = 'error';
    uploadErrorMsg[type] = `不支持的文件类型 .${ext || 'unknown'}`;
    return false;
  }

  if (file.size > maxSize) {
    uploadStates[type] = 'error';
    uploadErrorMsg[type] = `文件超过大小限制（${formatSize(maxSize)}）`;
    return false;
  }

  return true;
}

async function startUpload(file, type) {
  const localRunId = uploadRunIds[type] + 1;
  uploadRunIds[type] = localRunId;
  uploadStates[type] = 'uploading';
  uploadProgress[type] = 0;
  uploadedSize[type] = 0;
  uploadSpeed[type] = '';
  uploadErrorMsg[type] = '';
  uploadedFiles[type] = null;

  const totalSize = file.size || 1;
  const steps = Math.max(8, Math.min(24, Math.ceil(totalSize / (2 * 1024 * 1024))));
  let lastUploaded = 0;
  let lastAt = Date.now();

  for (let step = 1; step <= steps; step += 1) {
    await new Promise((resolve) => setTimeout(resolve, 120));
    if (uploadRunIds[type] !== localRunId) {
      return;
    }

    const uploaded = Math.min(totalSize, Math.round((step / steps) * totalSize));
    uploadedSize[type] = uploaded;
    uploadProgress[type] = Math.round((uploaded / totalSize) * 100);

    const now = Date.now();
    const elapsed = now - lastAt;
    if (elapsed > 0) {
      const delta = uploaded - lastUploaded;
      uploadSpeed[type] = formatSize(Math.round((delta / elapsed) * 1000));
      lastUploaded = uploaded;
      lastAt = now;
    }
  }

  const hash = await computeFileFingerprint(file);
  if (uploadRunIds[type] !== localRunId) {
    return;
  }

  fileHashes[type] = hash;
  uploadedFiles[type] = {
    path: `mock://submissions/${formData.projectId}/${type}/${hash}`,
    hash,
    size: file.size,
    originalName: file.name,
  };
  uploadStates[type] = 'done';
  uploadProgress[type] = 100;
}

async function handleSelectedFile(file, type) {
  dragStates[type] = false;
  if (!file) return;

  resetUploadState(type, { clearFile: false });

  if (!validateFile(file, type)) {
    if (type === 'project') projectFile.value = file;
    else pptFile.value = file;
    return;
  }

  if (type === 'project') {
    projectFile.value = file;
  } else {
    pptFile.value = file;
  }

  try {
    await startUpload(file, type);
  } catch (error) {
    uploadStates[type] = 'error';
    uploadErrorMsg[type] = error?.message || '上传失败，请重试';
  }
}

async function handleFileChange(event, type) {
  const file = event.target?.files?.[0];
  await handleSelectedFile(file, type);
}

async function handleDrop(event, type) {
  if (!canOperateUpload.value) return;
  const file = event.dataTransfer?.files?.[0];
  await handleSelectedFile(file, type);
}

function cancelUpload(type) {
  resetUploadState(type);
}

function reupload(type) {
  resetUploadState(type);
  triggerUpload(type);
}

async function retryUpload(type) {
  const file = type === 'project' ? projectFile.value : pptFile.value;
  if (!file) return;
  await handleSelectedFile(file, type);
}

async function loadProjects() {
  loadingProjects.value = true;
  try {
    const response = await submissionApi.getMySubmissionProjects();
    const { list } = extractList(response.data);
    projectOptions.value = list.map(normalizeSubmissionProject).filter((item) => item.id !== undefined && item.id !== null);

    if (!projectOptions.value.length) {
      formData.projectId = '';
      currentSubmission.value = null;
      currentScore.value = null;
      return;
    }

    const hasCurrentSelection = projectOptions.value.some((item) => String(item.id) === String(formData.projectId));
    if (!hasCurrentSelection) {
      formData.projectId = projectOptions.value[0].id;
    }
  } catch {
    projectOptions.value = [];
    formData.projectId = '';
    formData.description = '';
    currentSubmission.value = null;
    currentScore.value = null;
    historyList.value = [];
    historyTotal.value = 0;
  } finally {
    loadingProjects.value = false;
  }
}

async function loadSubmissionScore(submissionId) {
  if (!submissionId) {
    currentScore.value = null;
    return;
  }

  try {
    const response = await submissionApi.getMySubmissionScore(submissionId);
    currentScore.value = normalizeSubmissionScore(response.data || {});
  } catch {
    currentScore.value = null;
  }
}

async function loadCurrentSubmission() {
  if (!formData.projectId) {
    currentSubmission.value = null;
    currentScore.value = null;
    formData.description = '';
    return;
  }

  loadingCurrent.value = true;
  try {
    const response = await submissionApi.getMySubmission(formData.projectId);
    const payload = response?.data;
    currentSubmission.value = payload ? normalizeSubmissionRecord(payload) : null;
    formData.description = currentSubmission.value?.description || '';

    if (currentSubmission.value?.status === 'scored') {
      await loadSubmissionScore(currentSubmission.value.id);
    } else {
      currentScore.value = null;
    }
  } catch {
    currentSubmission.value = null;
    currentScore.value = null;
    formData.description = '';
  } finally {
    loadingCurrent.value = false;
  }
}

async function loadHistory() {
  historyLoading.value = true;
  try {
    const response = await submissionApi.getMySubmissionHistory({
      page: currentPage.value,
      size: pageSize,
      projectId: formData.projectId || undefined,
    });
    const { list, total } = extractList(response.data);
    historyList.value = list.map(normalizeSubmissionRecord);
    historyTotal.value = Number.isFinite(total) ? total : historyList.value.length;
  } catch {
    historyList.value = [];
    historyTotal.value = 0;
  } finally {
    historyLoading.value = false;
  }
}

function buildSubmissionPayload() {
  return {
    projectId: selectedProject.value.id,
    description: formData.description || '',
    filePath: uploadedFiles.project?.path,
    fileHash: uploadedFiles.project?.hash,
    fileSize: uploadedFiles.project?.size,
    fileOriginalName: uploadedFiles.project?.originalName,
    pptPath: uploadedFiles.ppt?.path,
    pptHash: uploadedFiles.ppt?.hash,
    pptSize: uploadedFiles.ppt?.size,
    pptOriginalName: uploadedFiles.ppt?.originalName,
  };
}

async function handleSubmit() {
  if (!canSubmit.value) return;

  try {
    await formRef.value?.validate();
    submitting.value = true;
    await submissionApi.createSubmission(buildSubmissionPayload());
    message.success(currentSubmission.value ? '覆盖提交成功' : '提交成功');
    resetDraftUploads();
    await Promise.all([loadCurrentSubmission(), loadHistory()]);
  } catch (error) {
    message.error(error?.message || '提交失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
}

function previewRecord(record) {
  if (record?.id && String(record.projectId) !== String(formData.projectId)) {
    formData.projectId = record.projectId;
    return;
  }
  message.info('当前阶段先完成提交流程，文件预览待后续联调接入。');
}

function downloadFiles(record) {
  const targets = [record?.filePath, record?.pptPath].filter((item) => typeof item === 'string' && /^https?:\/\//.test(item));
  if (!targets.length) {
    message.info('下载地址将在上传网关联调后启用。');
    return;
  }
  targets.forEach((target) => window.open(target, '_blank'));
}

watch(
  () => formData.projectId,
  async () => {
    resetDraftUploads();
    currentPage.value = 1;
    await Promise.all([loadCurrentSubmission(), loadHistory()]);
  }
);

watch(currentPage, () => {
  loadHistory();
});

onMounted(async () => {
  await loadProjects();
  if (!formData.projectId) {
    await loadHistory();
  }
});
</script>

<style scoped>
.submission-page {
  min-height: 100%;
  padding: 24px;
  background: var(--bg-page, #f5f7fa);
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px;
  font-size: 28px;
  line-height: 1.2;
  color: var(--text, #1f2937);
}

.page-header p {
  margin: 0;
  color: var(--text-secondary, #6b7280);
  max-width: 720px;
}

.page-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.selector-card,
.form-card,
.score-card,
.history-section {
  border: 1px solid var(--border, #e5e7eb);
}

.selector-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.selector-main {
  width: min(480px, 100%);
}

.selector-label {
  display: inline-block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text, #1f2937);
}

.selector-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 220px;
  color: var(--text-secondary, #6b7280);
  font-size: 13px;
}

.status-alert {
  margin-top: -8px;
}

.empty-section {
  padding: 36px 0;
  background: var(--card-bg, #fff);
  border-radius: 12px;
  border: 1px solid var(--border, #e5e7eb);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.card-subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--text-secondary, #6b7280);
}

.submission-form {
  max-width: 1000px;
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
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
  gap: 8px;
  flex-wrap: wrap;
}

.label-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: var(--text, #1f2937);
}

.label-hint {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
}

.upload-zone {
  min-height: 140px;
  padding: 20px;
  border: 1px dashed var(--border, #d1d5db);
  border-radius: 12px;
  background: var(--card-bg, #fff);
  transition: border-color 0.2s ease, background-color 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.upload-zone.is-dragover {
  border-color: var(--el-color-primary);
  background: rgba(64, 158, 255, 0.05);
}

.upload-zone.is-done {
  border-style: solid;
  border-color: #67c23a;
  background: rgba(103, 194, 58, 0.04);
}

.upload-zone.is-error {
  border-style: solid;
  border-color: #f56c6c;
  background: rgba(245, 108, 108, 0.04);
}

.upload-zone.is-disabled {
  cursor: not-allowed;
  background: var(--el-fill-color-light);
  opacity: 0.72;
}

.hidden-input {
  display: none;
}

.zone-empty,
.zone-state {
  width: 100%;
}

.zone-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary, #6b7280);
  text-align: center;
}

.empty-icon {
  font-size: 28px;
  color: var(--el-color-primary);
}

.file-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.file-icon {
  font-size: 18px;
}

.file-icon.uploading {
  color: var(--el-color-primary);
  animation: spin 1s linear infinite;
}

.file-icon.success {
  color: #67c23a;
}

.file-icon.error {
  color: #f56c6c;
}

.file-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.error-text {
  color: #f56c6c;
}

.progress-text {
  margin-top: 8px;
  display: inline-block;
  color: var(--text-secondary, #6b7280);
  font-size: 12px;
}

.form-actions {
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.submit-note {
  color: var(--text-secondary, #6b7280);
  font-size: 13px;
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.score-item {
  padding: 14px 16px;
  border-radius: 10px;
  background: var(--el-fill-color-light);
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.score-name {
  color: var(--text-secondary, #6b7280);
}

.score-summary {
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
}

.score-comment {
  margin: 16px 0 0;
  color: var(--text, #1f2937);
  line-height: 1.6;
}

.history-section {
  border-radius: 12px;
  background: var(--card-bg, #fff);
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.section-header h2 {
  margin: 0 0 6px;
  font-size: 20px;
}

.section-header p {
  margin: 0;
  color: var(--text-secondary, #6b7280);
  font-size: 13px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.history-main {
  min-width: 0;
  flex: 1;
}

.history-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.history-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  color: var(--text-secondary, #6b7280);
  font-size: 13px;
}

.history-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.history-desc,
.history-comment {
  margin: 10px 0 0;
  color: var(--text, #1f2937);
  line-height: 1.6;
}

.history-comment {
  color: var(--text-secondary, #4b5563);
}

.history-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.history-pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .file-grid,
  .score-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .submission-page {
    padding: 16px;
  }

  .page-header,
  .card-header,
  .history-item,
  .history-actions {
    flex-direction: column;
  }

  .history-actions {
    align-items: flex-start;
  }
}
</style>
