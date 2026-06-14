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
  gradingStandardId: pickFirstDefined(score, ['gradingStandardId', 'grading_standard_id']),
  scorerType: pickFirstDefined(score, ['scorerType', 'scorer_type'], 'teacher'),
  scorerId: pickFirstDefined(score, ['scorerId', 'scorer_id']),
  totalScore: toNullableNumber(pickFirstDefined(score, ['totalScore', 'total_score'])),
  maxScore: toNullableNumber(pickFirstDefined(score, ['maxScore', 'max_score'])),
  comment: pickFirstDefined(score, ['comment', 'reviewComment', 'review_comment'], ''),
  aiConfidence: toNullableNumber(pickFirstDefined(score, ['aiConfidence', 'ai_confidence'])),
  aiReasoning: pickFirstDefined(score, ['aiReasoning', 'ai_reasoning'], ''),
  isFinal: Boolean(pickFirstDefined(score, ['isFinal', 'is_final'], false)),
  dimensionScores: Array.isArray(pickFirstDefined(score, ['dimensionScores', 'dimension_scores'], []))
    ? pickFirstDefined(score, ['dimensionScores', 'dimension_scores'], [])
    : [],
});

export const normalizeSubmissionStats = (stats = {}) => ({
  total: toNullableNumber(pickFirstDefined(stats, ['total', 'totalSubmissions', 'total_submissions'])) || 0,
  pending: toNullableNumber(pickFirstDefined(stats, ['pending', 'pendingCount', 'pending_count'])) || 0,
  scoring: toNullableNumber(pickFirstDefined(stats, ['scoring', 'scoringCount', 'scoring_count'])) || 0,
  scored: toNullableNumber(pickFirstDefined(stats, ['scored', 'scoredCount', 'scored_count'])) || 0,
  returned: toNullableNumber(pickFirstDefined(stats, ['returned', 'returnedCount', 'returned_count'])) || 0,
  averageScore: toNullableNumber(pickFirstDefined(stats, ['averageScore', 'average_score', 'avgScore', 'avg_score'])),
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

export const getSubmissionList = (params = {}) => {
  const defaultParams = { page: 1, size: 10, ...params };
  return service.get('/submissions', { params: defaultParams });
};

export const getSubmissionStats = (params = {}) => {
  return service.get('/submissions/stats', { params });
};

export const exportSubmissions = (params = {}) => {
  return service.get('/submissions/export', { params, responseType: 'blob' });
};

export const getGradingSubmissionList = (params = {}) => {
  const defaultParams = { page: 1, size: 10, ...params };
  return service.get('/submissions/grading-list', { params: defaultParams });
};

export const getSubmissionDetail = (submissionId) => {
  return service.get(`/submissions/${submissionId}`);
};

export const getSubmissionAiScore = (submissionId) => {
  return service.get(`/submissions/${submissionId}/ai-score`);
};

export const submitSubmissionScore = (submissionId, params) => {
  return service.post(`/submissions/${submissionId}/score`, params);
};

export const finalizeSubmissionScore = (submissionId, params = {}) => {
  return service.put(`/submissions/${submissionId}/score/finalize`, params);
};

export const returnSubmission = (submissionId, params) => {
  return service.post(`/submissions/${submissionId}/return`, params);
};

export const getGradingStats = (params = {}) => {
  return service.get('/submissions/grading-stats', { params });
};

export const submissionApi = {
  getMySubmissionProjects,
  getMySubmission,
  createSubmission,
  getMySubmissionHistory,
  getMySubmissionScore,
  getSubmissionList,
  getSubmissionStats,
  exportSubmissions,
  getGradingSubmissionList,
  getSubmissionDetail,
  getSubmissionAiScore,
  submitSubmissionScore,
  finalizeSubmissionScore,
  returnSubmission,
  getGradingStats,
};
