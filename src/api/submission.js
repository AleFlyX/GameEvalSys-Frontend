import service from "@/utils/request";
import { normalizeProjectSubmissionConfig } from "@/utils/submission";

const pickFirstDefined = (source, keys, fallback = undefined) => {
  if (!source || typeof source !== 'object') {
    return fallback;
  }

  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return source[key];
    }
  }

  return fallback;
};

const toNullableNumber = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

export const normalizeSubmissionProject = (project = {}) => {
  const submissionConfig = normalizeProjectSubmissionConfig(project);
  return {
    id: pickFirstDefined(project, ['id']),
    name: pickFirstDefined(project, ['name', 'projectName', 'project_name'], ''),
    status: pickFirstDefined(project, ['status'], ''),
    ...submissionConfig,
  };
};

export const normalizeSubmissionRecord = (record = {}) => ({
  id: pickFirstDefined(record, ['id']),
  projectId: pickFirstDefined(record, ['projectId', 'project_id']),
  projectName: pickFirstDefined(record, ['projectName', 'project_name', 'name'], ''),
  description: pickFirstDefined(record, ['description'], ''),
  status: pickFirstDefined(record, ['status'], 'pending'),
  submitCount: toNullableNumber(pickFirstDefined(record, ['submitCount', 'submit_count'])) || 1,
  createdAt: pickFirstDefined(record, ['createdAt', 'created_at', 'submitTime', 'submit_time'], ''),
  updatedAt: pickFirstDefined(record, ['updatedAt', 'updated_at', 'reviewedAt', 'reviewed_at'], ''),
  finalScore: toNullableNumber(pickFirstDefined(record, ['finalScore', 'final_score', 'score'])),
  totalScore: toNullableNumber(pickFirstDefined(record, ['totalScore', 'total_score'])),
  reviewComment: pickFirstDefined(record, ['reviewComment', 'review_comment', 'comment'], ''),
  reviewerId: pickFirstDefined(record, ['reviewerId', 'reviewer_id']),
  gradingStandardId: pickFirstDefined(record, ['gradingStandardId', 'grading_standard_id']),
  filePath: pickFirstDefined(record, ['filePath', 'file_path'], ''),
  fileHash: pickFirstDefined(record, ['fileHash', 'file_hash'], ''),
  fileSize: toNullableNumber(pickFirstDefined(record, ['fileSize', 'file_size'])),
  fileOriginalName: pickFirstDefined(record, ['fileOriginalName', 'file_original_name'], ''),
  pptPath: pickFirstDefined(record, ['pptPath', 'ppt_path'], ''),
  pptHash: pickFirstDefined(record, ['pptHash', 'ppt_hash'], ''),
  pptSize: toNullableNumber(pickFirstDefined(record, ['pptSize', 'ppt_size'])),
  pptOriginalName: pickFirstDefined(record, ['pptOriginalName', 'ppt_original_name'], ''),
});

export const normalizeSubmissionScore = (score = {}) => ({
  id: pickFirstDefined(score, ['id']),
  submissionId: pickFirstDefined(score, ['submissionId', 'submission_id']),
  scorerType: pickFirstDefined(score, ['scorerType', 'scorer_type'], 'teacher'),
  totalScore: toNullableNumber(pickFirstDefined(score, ['totalScore', 'total_score'])),
  maxScore: toNullableNumber(pickFirstDefined(score, ['maxScore', 'max_score'])),
  comment: pickFirstDefined(score, ['comment', 'reviewComment', 'review_comment'], ''),
  dimensionScores: Array.isArray(pickFirstDefined(score, ['dimensionScores', 'dimension_scores'], []))
    ? pickFirstDefined(score, ['dimensionScores', 'dimension_scores'], [])
    : [],
});

export const getMySubmissionProjects = () => {
  return service.get('/submissions/my/projects');
};

export const getMySubmission = (projectId) => {
  return service.get('/submissions/my', { params: { projectId } });
};

export const createSubmission = (params) => {
  return service.post('/submissions', params);
};

export const getMySubmissionHistory = (params = {}) => {
  const defaultParams = { page: 1, size: 10, ...params };
  return service.get('/submissions/my/history', { params: defaultParams });
};

export const getMySubmissionScore = (submissionId) => {
  return service.get('/submissions/my/score', { params: { submissionId } });
};

export const submissionApi = {
  getMySubmissionProjects,
  getMySubmission,
  createSubmission,
  getMySubmissionHistory,
  getMySubmissionScore,
};
