export const REVIEWER_GROUPS_FORM_RULES = {
  name: [
    { required: true, message: '请输入评审组名称', trigger: 'blur' },
    { min: 2, max: 50, message: '评审组名称长度2-50个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '描述长度不超过500个字符', trigger: 'blur' }
  ],
  memberIds: [
    { required: true, message: '请至少选择一个成员', trigger: 'change' }
  ]
};
