import { noWhiteSpace } from "./userFormValidator";

export const userFormRules = {
  name: [
    { required: true, message: '请输入用户昵称', trigger: 'blur' },
    { min: 2, max: 10, message: '昵称长度请控制到2到5个字', trigger: 'blur' },
    { validator: noWhiteSpace, trigger: 'blur' }
  ],
  username: { required: true, message: '请输入用户登录账户', trigger: 'blur' },
  group: [
    { required: true, message: '请输入用户所属组别', trigger: 'blur' },
    { validator: noWhiteSpace, trigger: 'blur' }
  ],
  role: { required: true, message: '请选中用户角色', trigger: 'blur' },
}

