export const roleOptions = [
  { label: '超级管理员', value: 'super_admin' },
  { label: '管理员', value: 'admin' },
  { label: '打分用户', value: 'scorer' },
  { label: '普通用户', value: 'normal' },
];

export const roleLabelMap = Object.fromEntries(roleOptions.map((item) => [item.value, item.label]));

export const menuTypeLabelMap = {
  dir: '目录',
  menu: '菜单',
  button: '按钮',
};

export const menuTypeTagMap = {
  dir: 'info',
  menu: 'primary',
  button: 'success',
};

export const createDefaultMenuFormModel = () => ({
  id: null,
  parentId: null,
  menuCode: '',
  menuType: 'dir',
  title: '',
  path: '',
  routeName: '',
  icon: '',
  hidden: false,
  componentCode: '',
  sortNum: 0,
  isEnabled: true,
  roleCodes: [],
});

