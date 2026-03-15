import { render, createVNode, ref } from "vue";
import testMxgBox from "@/test/components/testMxgBox.vue";

let instance = null;

export const showMsgBox2 = () => {
  const ANIMATION_DURATION = 300;
  const container = document.createElement('div');

  // 如果已有实例，先销毁旧的（并清除其未执行的定时器）
  if (instance) {
    instance.destory();
    instance = null;
  }

  return new Promise((resolve, reject) => {
    let visible = ref(false);
    let timer = null; // 用于存储定时器 ID，以便手动销毁时清除

    const destory = () => {
      if (timer) {
        clearTimeout(timer); // 清除尚未触发的定时器，防止影响新实例
        timer = null;
      }
      render(null, container); // 卸载组件
      instance = null; // 清空实例引用
    };

    const doClose = (action) => {
      // 防止重复关闭（例如多次点击）
      if (!visible.value) return;

      visible.value = false; // 触发淡出动画

      // 等待动画结束后再销毁组件并改变 Promise 状态
      timer = setTimeout(() => {
        if (action === 'confirm') {
          resolve();
        } else {
          reject();
        }
        render(Vnode, container);
        destory(); // 动画完成后销毁组件
      }, ANIMATION_DURATION);
    };

    const Vnode = createVNode(testMxgBox, {
      title: 'testTitle',
      content: 'testContent',
      visible: visible,
      'update:visible': (val) => {
        if (!val) doClose('cancel'); // 外部（如组件内部）将 visible 设为 false 时触发取消
      },
      onConfirm: () => { doClose('confirm') },
      onCancel: () => { doClose('cancel') }
    });

    render(Vnode, container);

    // 下一帧将 visible 设为 true，触发淡入动画
    requestAnimationFrame(() => {
      visible.value = true;
    });

    instance = { destory }; // 保存实例以便后续手动销毁
  });
};
