<template>
  <div class="drag-container">
    <!-- 轨道（限制拖拽范围） -->
    <div class="track" ref="trackRef">
      <!-- 可拖拽方块 -->
      <div class="draggable-block" :style="{ transform: `translateX(${offsetX}px)` }" @mousedown="startDrag"
        @touchstart="startDrag">
        拖拽
      </div>
    </div>
    <!-- 显示当前位置 -->
    <div class="position-info">当前位置：{{ offsetX }}px</div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const trackRef = ref(null)
const offsetX = ref(0)          // 当前水平偏移量
const isDragging = ref(false)

// 拖拽临时变量
let startX = 0
let startOffset = 0
let maxOffset = 0

// 拖拽开始
const startDrag = (e) => {
  e.preventDefault()
  const clientX = e.clientX ?? e.touches[0]?.clientX
  if (clientX === undefined) return

  // 获取最大偏移量（轨道宽度 - 方块宽度）
  const track = trackRef.value
  const blockWidth = track.querySelector('.draggable-block').offsetWidth
  maxOffset = track.clientWidth - blockWidth

  startX = clientX
  startOffset = offsetX.value
  isDragging.value = true

  // 绑定全局移动和松开事件
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchmove', onDrag)
  window.addEventListener('touchend', stopDrag)
}

// 拖拽移动
const onDrag = (e) => {
  if (!isDragging.value) return
  let clientX = e.clientX ?? e.touches[0]?.clientX
  if (clientX === undefined) return

  let delta = clientX - startX
  let newOffset = startOffset + delta

  // 边界限制
  newOffset = Math.max(0, Math.min(maxOffset, newOffset))
  offsetX.value = newOffset
}

// 拖拽结束
const stopDrag = () => {
  isDragging.value = false
  // 移除全局事件
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('touchend', stopDrag)
}

// 组件卸载时清理事件
onUnmounted(() => {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
.drag-container {
  margin: 20px;
}

.track {
  position: relative;
  width: 300px;
  height: 50px;
  background: #eef2f6;
  border-radius: 25px;
  overflow: hidden;
  cursor: pointer;
}

.draggable-block {
  position: absolute;
  top: 0;
  left: 0;
  width: 50px;
  height: 50px;
  background: #3b82f6;
  color: white;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  transition: box-shadow 0.1s;
}

.draggable-block:active {
  cursor: grabbing;
}

.position-info {
  margin-top: 12px;
  font-size: 14px;
  color: #334155;
}
</style>
