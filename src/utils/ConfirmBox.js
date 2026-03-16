
import { createVNode, render } from 'vue'
// import testMxgBox from '@/test/testMxgBox.vue'
import BaseConfirmModal from '@/components/common/modal/BaseConfirmModal.vue'

// 单例模式
let instance = null

/**
 *
 * @param {Object} options -要渲染的弹窗的选项
 * @param {String} title
 * @param {String} content
 * @returns
 */
export const showMsgBox = (options) => {
  if (instance) {
    instance.destroy()//调用上一个弹窗实例的摧毁方法
  }

  return new Promise((resolve, reject) => {
    const container = document.createElement('div')
    const ANIMATION_DURATION = 300 // 定义动画时长，方便统一管理

    // 1. 定义状态
    let isVisible = false // 这里不用 ref 也行，用闭包变量更简单，或者用 ref 也可以

    // 2. 销毁函数
    const destroy = () => {
      render(null, container)
      instance = null
    }

    // 3. 关闭函数（先播动画，再销毁，最后 resolve/reject）
    const doClose = (action) => {
      isVisible = false
      updateVNode() // 手动更新 VNode，触发关闭动画

      // 等动画播完了再执行后续操作
      setTimeout(() => {
        destroy()
        if (action === 'confirm') {
          resolve('confirm')
        } else {
          reject('cancel')
        }
      }, ANIMATION_DURATION)
    }

    // 4. 封装一个更新 VNode 的函数
    // 不用 watch 了，需要手动触发重渲染
    const updateVNode = () => {
      const vnode = createVNode(BaseConfirmModal, {
        title: options.title || '提示',
        content: options.content || '确认执行此操作？',
        visible: isVisible,
        'onUpdate:visible': (val) => {
          if (!val) doClose('cancel') // 点击遮罩层关闭
        },
        onConfirm: () => doClose('confirm'),
        onCancel: () => doClose('cancel'),
        ...options // 其他自定义内容展开
      })
      render(vnode, container)
    }

    // 5. 初始渲染 (visible: false)
    updateVNode()

    // 6. 下一帧开启 (visible: true)，触发入场动画
    requestAnimationFrame(() => {
      isVisible = true
      updateVNode()
    })

    instance = { destroy }
  })

}
