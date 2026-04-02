import { noWhiteSpace } from "./userFormValidator";

export const userFormRules = {
  name: [
    { required: true, message: '请输入用户昵称', trigger: 'blur' },
    { min: 2, max: 10, message: '昵称长度请控制到2到5个字', trigger: 'blur' },
    { validator: noWhiteSpace, trigger: 'blur' }
  ],
  password: { min: 6, max: 100, message: '密码长度应该在6到100位', trigger: 'change' },
  oldPassword: { min: 6, max: 100, message: '密码长度应该在6到100位', trigger: 'change' },
  newPassword: { min: 6, max: 100, message: '密码长度应该在6到100位', trigger: 'change' },
  username: [
    { required: true, message: '请输入用户登录账户', trigger: 'blur' },
    { min: 3, max: 50, message: '登陆账户长度应该在3到50位', trigger: 'change' }
  ],
  // group: [
  //   { required: true, message: '请输入用户所属组别', trigger: 'blur' },
  //   // { validator: noWhiteSpace, trigger: 'blur' }
  // ],
  role: { required: true, message: '请选择用户角色', trigger: 'blur' },
}

