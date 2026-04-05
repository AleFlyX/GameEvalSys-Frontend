
/**
 * 判断是否为纯对象，若为Date, RegExp, Map, Set 等则为否
 * @param {Any} data
 * @return {Boolean} 判断后的值
 */
function isPlainObj(data) {
  if (data === null || typeof data !== 'object') return false;
  const propt = Object.getPrototypeOf(data);
  return Object.prototype === propt || propt === null; //propt === null ,若对象是通过Object.create(null)创建的，则其prototype为null

}

/**
 * 递归处理对象/数组，去除字符串中的空格
 * @param {Any} input - 要处理的数据（对象、数组、基本类型等）
 * @param {Boolean} [removeAll=false] - 是否移除全部空格（默认仅去除首尾空格）
 * @returns {Any} 处理后的新对象/值
 */
export function removeSpacesFromObject(input, removeAll = false) {

  if (typeof input === 'string') {
    return removeAll ? input.replace(/\s/g, '') : input.trim();
  }
  // 处理基本类型（数字、布尔、bigint、symbol、undefined）或 null：直接返回
  if (input === undefined || input === null || typeof input !== 'object') {
    return input;
  }

  //若为数组类型，则递归调用，让每一项数据都去除空格
  if (Array.isArray(input)) {
    return input.map(item => removeSpacesFromObject(item, removeAll));
  }

  if (isPlainObj(input)) {
    const result = {};
    for (const key in input) { //for循环 它会遍历对象自身 以及 原型链上所有可枚举属性,hasOwnProperty可判断是否为原型链上的内容
      if (Object.prototype.hasOwnProperty.call(input, key)) { //使用对象方法的hasOwnProperty判断，
        // 防止输入的对象是Object.create(null),通过此方法创建的对象没有原型,
        // 防止对象可能自己定义了一个 hasOwnProperty
        const value = input[key];
        if (typeof value === 'string') {
          result[key] = removeAll ? value.replace(/\s/g, '') : value.trim(); // ✅ 处理 value
        } else {
          result[key] = removeSpacesFromObject(value, removeAll);
        }
      }
    }
    return result;
  }
  //其他特殊对象（Date, RegExp, Map, Set 等）直接返回原值，不做处理
  return input;
}

/**
 * 检查form值是否有效
 * El Form Validator属性自定义验证器
 * @param {Object} rule
 * @param {Any} value
 * @param {Function} callback
 */
export const validateSpace = (rule, value, callback) => {
  if (removeSpacesFromObject(value, true) === '') {
    callback(new Error('请输入有效值'))
  }
  else {
    callback()
  }
}
