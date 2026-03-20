export const REVIEWER_GROUPS_FORM_RULES = {
    name: [
        { required: true, message: '请输入小组名称', trigger: 'blur' },
        { min: 2, max: 50, message: '小组名称长度在2-50之间', trigger: 'blur' }
    ],
    description: [
        { max: 500, message: '描述长度最多500字', trigger: 'blur' }
    ],
    isEnabled: [
        { required: true, message: '请选择小组状态', trigger: 'change' }
    ]
};
