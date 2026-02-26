<template>
  <button :class="type">
    <slot>
      empty
    </slot>
  </button>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: '' //danger primary pro
  }
})
</script>

<style scoped>
/* 穿透scoped，作用到插槽内的所有按钮 */
button {
  /* 基础按钮样式 */
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 8px 20px;
  border-radius: 6px;
  border: 1px solid;

  background-color: #f5f7fa;
  color: #606266;
  border-color: #e4e7ed;

  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

button:hover {
  background-color: var(--primary-light);
  border-color: var(--primary);
}

button:active {
  transform: scale(0.97);
  /* border: 1px solid var(--primary-havy); */
}

/* 禁用状态通用样式 */
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

button:disabled:hover {
  /* background-color: inherit;
  border-color: inherit; */
  /* 继承css属性会导致opacity=1 */
  opacity: 0.5;
  cursor: not-allowed;
}

/* 确认按钮（默认样式，可通过class="primary-btn"指定） */
.primary {
  background-color: var(--primary-havy);
  color: #ffffff;
}

.primary:hover {
  background-color: var(--primary-hover);
}

/* 危险按钮（删除，class="danger-btn"） */
.danger {
  background-color: var(--danger);
  color: #ffffff;
}

.danger:hover {
  background-color: var(--danger-hover);
}

.pro {
  margin: 5px;
  width: 100px;
  height: 50px;
  border: none;
  border-radius: 16px;
  box-shadow: 8px 8px 16px #b6b9ba,
    -8px -8px 16px #fafafd;
  background-image: linear-gradient(154deg, #f4f6f8, #b6b9ba);
  transition: all 0.3s ease-in-out;
}

.pro:active {
  box-shadow: 8px 8px 16px #b6b9ba,
    -8px -8px 16px #fafafd;
  background-image: linear-gradient(154deg, #b6b9ba, #f4f6f8);
}
</style>
