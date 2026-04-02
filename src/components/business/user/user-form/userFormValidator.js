export const noWhiteSpace = (rule, value, callback) => {
  if (value.trim() === '') {
    callback(new Error('请输入有效内容'))
  }
  callback()

}
