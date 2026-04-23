const checkLength = (rule, value, callback) => {
  if (!Array.isArray(value) || value.length === 0) {
    callback(new Error('请输入有效值'));
    return;
  }
  callback();
}

const validateThresholdLower = (rule, value, callback, source) => {
  if (source?.maliciousRuleType !== 'THRESHOLD') {
    callback();
    return;
  }
  if (value === undefined || value === null || value === '') {
    callback(new Error('阈值模式下请填写最低分阈值'));
    return;
  }
  callback();
}

const validateThresholdUpper = (rule, value, callback, source) => {
  if (source?.maliciousRuleType !== 'THRESHOLD') {
    callback();
    return;
  }
  if (value === undefined || value === null || value === '') {
    callback(new Error('阈值模式下请填写最高分阈值'));
    return;
  }
  const lower = Number(source?.maliciousScoreLower);
  const upper = Number(value);
  if (!Number.isNaN(lower) && !Number.isNaN(upper) && lower > upper) {
    callback(new Error('最低分阈值不能大于最高分阈值'));
    return;
  }
  callback();
}
/**
 * 项目表单验证规则
 */
export const projectFormRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 1, max: 100, message: '项目名称长度为 1 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '项目描述长度不能超过 500 个字符', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择项目开始日期', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择项目结束日期', trigger: 'change' }
  ],
  standardId: [
    { required: true, message: '请选择打分标准', trigger: 'change' }
  ],
  maliciousRuleType: [
    { required: true, message: '请选择恶意判定规则', trigger: 'change' }
  ],
  maliciousScoreLower: [
    { validator: validateThresholdLower, trigger: 'blur' },
    { validator: validateThresholdLower, trigger: 'change' }
  ],
  maliciousScoreUpper: [
    { validator: validateThresholdUpper, trigger: 'blur' },
    { validator: validateThresholdUpper, trigger: 'change' }
  ],
  groupIds: [
    { required: true, message: '请选择至少一个小组', trigger: 'change' },
    { validator: checkLength, trigger: 'blur' }
  ],
  scorerIds: [
    { required: true, message: '请选择至少一个打分用户', trigger: 'change' },
    { validator: checkLength, trigger: 'blur' }
  ]
}
