<template>
  <div class="submission-config">
    <el-alert
      title="提交规则"
      type="info"
      description="开启后，学生端会按这里的提交窗口、文件类型和大小限制展示表单与校验。"
      :closable="false"
      show-icon
    />

    <el-form ref="formRef" :model="formData" :rules="rules" label-width="140px" class="config-form">
      <el-form-item label="启用作业提交" prop="allowSubmission">
        <el-switch v-model="formData.allowSubmission" inline-prompt active-text="开启" inactive-text="关闭" />
      </el-form-item>

      <el-form-item label="提交是否必填" prop="submissionRequired">
        <el-switch
          v-model="formData.submissionRequired"
          :disabled="!formData.allowSubmission"
          inline-prompt
          active-text="必填"
          inactive-text="可选"
        />
      </el-form-item>

      <el-form-item label="允许覆盖提交" prop="enableResubmit">
        <el-switch
          v-model="formData.enableResubmit"
          :disabled="!formData.allowSubmission"
          inline-prompt
          active-text="允许"
          inactive-text="禁止"
        />
      </el-form-item>

      <el-form-item label="AI 评分" prop="enableAiScoring">
        <el-switch
          v-model="formData.enableAiScoring"
          :disabled="!formData.allowSubmission"
          inline-prompt
          active-text="开启"
          inactive-text="关闭"
        />
      </el-form-item>

      <el-form-item label="提交开始时间" prop="submissionStartDate">
        <el-date-picker
          v-model="formData.submissionStartDate"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm"
          format="YYYY-MM-DD HH:mm"
          placeholder="为空时跟随项目开始时间"
          :disabled="!formData.allowSubmission"
          :editable="false"
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item label="提交截止时间" prop="submissionEndDate">
        <el-date-picker
          v-model="formData.submissionEndDate"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm"
          format="YYYY-MM-DD HH:mm"
          placeholder="为空时跟随项目结束时间"
          :disabled="!formData.allowSubmission"
          :editable="false"
          style="width: 100%;"
        />
      </el-form-item>

      <div class="config-grid">
        <el-form-item label="项目文件类型" prop="submissionFileTypes">
          <el-checkbox-group v-model="formData.submissionFileTypes" :disabled="!formData.allowSubmission">
            <el-checkbox v-for="type in projectFileTypeOptions" :key="type" :label="type">
              .{{ type }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="答辩文件类型" prop="submissionPptTypes">
          <el-checkbox-group v-model="formData.submissionPptTypes" :disabled="!formData.allowSubmission">
            <el-checkbox v-for="type in pptFileTypeOptions" :key="type" :label="type">
              .{{ type }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </div>

      <div class="config-grid">
        <el-form-item label="项目文件上限" prop="submissionMaxSize">
          <div class="size-row">
            <el-input-number
              v-model="projectFileLimitMb"
              :min="1"
              :max="2048"
              :disabled="!formData.allowSubmission"
              controls-position="right"
            />
            <span class="size-unit">MB</span>
          </div>
        </el-form-item>

        <el-form-item label="答辩文件上限" prop="submissionPptMaxSize">
          <div class="size-row">
            <el-input-number
              v-model="pptFileLimitMb"
              :min="1"
              :max="1024"
              :disabled="!formData.allowSubmission"
              controls-position="right"
            />
            <span class="size-unit">MB</span>
          </div>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import {
  DEFAULT_PROJECT_FILE_MAX_SIZE,
  DEFAULT_PROJECT_FILE_TYPES,
  DEFAULT_PPT_FILE_MAX_SIZE,
  DEFAULT_PPT_FILE_TYPES,
  normalizeProjectSubmissionConfig,
} from '@/utils/submission';

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});

const formRef = ref(null);
const formData = props.data;
const projectFileTypeOptions = DEFAULT_PROJECT_FILE_TYPES;
const pptFileTypeOptions = DEFAULT_PPT_FILE_TYPES;

const ensureDefaults = () => {
  Object.assign(formData, normalizeProjectSubmissionConfig(formData));
};

ensureDefaults();

const projectFileLimitMb = computed({
  get: () => Math.round((Number(formData.submissionMaxSize) || DEFAULT_PROJECT_FILE_MAX_SIZE) / 1024 / 1024),
  set: (value) => {
    formData.submissionMaxSize = Number(value || 0) * 1024 * 1024;
  }
});

const pptFileLimitMb = computed({
  get: () => Math.round((Number(formData.submissionPptMaxSize) || DEFAULT_PPT_FILE_MAX_SIZE) / 1024 / 1024),
  set: (value) => {
    formData.submissionPptMaxSize = Number(value || 0) * 1024 * 1024;
  }
});

const validateDateRange = (_, __, callback) => {
  if (!formData.allowSubmission) {
    callback();
    return;
  }

  if (formData.submissionStartDate && formData.submissionEndDate) {
    const start = new Date(String(formData.submissionStartDate).replace(/-/g, '/'));
    const end = new Date(String(formData.submissionEndDate).replace(/-/g, '/'));
    if (start.getTime() > end.getTime()) {
      callback(new Error('提交开始时间不能晚于截止时间'));
      return;
    }
  }

  callback();
};

const validateRequiredTypes = (label) => (_, value, callback) => {
  if (!formData.allowSubmission) {
    callback();
    return;
  }

  if (!Array.isArray(value) || value.length === 0) {
    callback(new Error(`请至少选择一种${label}`));
    return;
  }

  callback();
};

const validateRequiredSize = (label) => (_, value, callback) => {
  if (!formData.allowSubmission) {
    callback();
    return;
  }

  if (!Number.isFinite(Number(value)) || Number(value) <= 0) {
    callback(new Error(`请输入有效的${label}大小限制`));
    return;
  }

  callback();
};

const rules = {
  submissionStartDate: [{ validator: validateDateRange, trigger: 'change' }],
  submissionEndDate: [{ validator: validateDateRange, trigger: 'change' }],
  submissionFileTypes: [{ validator: validateRequiredTypes('项目文件类型'), trigger: 'change' }],
  submissionPptTypes: [{ validator: validateRequiredTypes('答辩文件类型'), trigger: 'change' }],
  submissionMaxSize: [{ validator: validateRequiredSize('项目文件'), trigger: 'change' }],
  submissionPptMaxSize: [{ validator: validateRequiredSize('答辩文件'), trigger: 'change' }],
};

const validate = async () => {
  try {
    await formRef.value?.validate();
    return { valid: true, data: formData };
  } catch (error) {
    return { valid: false, data: formData, error };
  }
};

defineExpose({
  validate,
});
</script>

<style scoped>
.submission-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-form {
  max-width: 860px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.size-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.size-unit {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

@media (max-width: 768px) {
  .config-grid {
    grid-template-columns: 1fr;
  }
}
</style>
