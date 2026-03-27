<template>
  <BaseDialogModal :max-width="handleMaxWidth()" :min-width="handleMinWidth()" v-bind="$attrs" :visible="visible"
    @update:visible="$emit('update:visible', $event)" :showDefaultClose="false" :allowMaskClose="isSuccess">
    <template #header>
      验证
    </template>
    <template #body>
      <div class="slider-captcha">
        <div class="captcha-container">
          <!-- 提示文字区域 -->
          <div class="captcha-header" :class="{ success: isSuccess }">
            <span>{{ statusText }}</span>
            <button class="refresh-btn" @click="reset" title="刷新验证码">⟳</button>
          </div>

          <!-- 滑动区域：背景轨道 + 缺口标记 -->
          <div class="slider-track" ref="trackRef">
            <!-- 缺口指示器（视觉提示） -->
            <div class="gap-marker" v-show="!isSuccess" :style="{ left: targetOffset + 'px' }"></div>

            <!-- 滑块按钮 -->
            <div class="slider-button"
              :class="{ dragging: isDragging, success: isSuccess, reset: !isSuccess && !isDragging }"
              :style="{ transform: `translateX(${currentOffset}px)` }" @mousedown="startDrag" @touchstart="startDrag">
              <span v-if="!isSuccess">→</span>
              <span v-else>✓</span>
            </div>
          </div>

          <!-- 错误提示 -->
          <div class="error-msg" :class="{ show: errorMsg !== '' }">{{ errorMsg }}</div>
        </div>
      </div>
    </template>
    <!-- <template #footer>
      <button @click="$emit('success', true)">CLOSE</button>
    </template> -->
  </BaseDialogModal>

</template>

<script setup>
import { ref, computed, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['success', "update:visible"])

// DOM 引用
const trackRef = ref(null)
// 状态变量
const targetOffset = ref(0)          // 目标缺口位置（px）
const currentOffset = ref(0)         // 滑块当前偏移量（px）
const isDragging = ref(false)        // 是否正在拖拽
const isSuccess = ref(false)         // 验证是否成功
const errorMsg = ref('')             // 错误提示信息

// 拖拽相关临时变量
let startX = 0
let startOffset = 0
let trackWidth = 0
let sliderWidth = 0
let maxOffset = 0

// 验证阈值（允许误差像素）
const TOLERANCE = 8

// 动态提示文字
const statusText = computed(() => {
  if (isSuccess.value) return '验证通过'
  if (isDragging.value) return '请拖动滑块至缺口处'
  return '向右拖动滑块完成验证'
})

/**
 * 初始化或重置验证码
 * 随机生成缺口位置（范围：滑块宽度 ~ 轨道宽度 - 滑块宽度 - 余量）
 */
const initCaptcha = () => {
  if (!trackRef.value) return

  // 获取轨道和滑块的准确宽度
  const track = trackRef.value
  console.log(track.clientWidth)
  trackWidth = track.clientWidth
  sliderWidth = track.querySelector('.slider-button')?.clientWidth || 40

  // 滑块可移动的最大距离 = 轨道宽度 - 滑块宽度
  maxOffset = trackWidth - sliderWidth

  // 缺口位置随机范围（避免贴边过于极端）
  const min = sliderWidth * 2
  const max = maxOffset - sliderWidth * 0.3
  const randomOffset = Math.floor(Math.random() * (max - min + 1) + min)
  targetOffset.value = randomOffset
  // console.log("POSITION:" + targetOffset.value)

  // 重置滑块位置和状态
  currentOffset.value = 0
  isSuccess.value = false
  errorMsg.value = ''
}

/**
 * 拖拽开始
 */
const startDrag = (event) => {
  if (isSuccess.value) return

  event.preventDefault()
  const clientX = event.clientX ?? event.touches[0]?.clientX
  if (clientX === undefined) return

  startX = clientX
  startOffset = currentOffset.value
  isDragging.value = true

  // 绑定全局事件
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchmove', onDrag)
  window.addEventListener('touchend', stopDrag)
}

/**
 * 拖拽移动
 */
const onDrag = (event) => {
  if (!isDragging.value || isSuccess.value) return

  let clientX = event.clientX ?? event.touches[0]?.clientX
  if (clientX === undefined) return

  let deltaX = clientX - startX
  let newOffset = startOffset + deltaX

  // 边界限制
  newOffset = Math.max(0, Math.min(maxOffset, newOffset))
  currentOffset.value = newOffset
}

/**
 * 拖拽结束，验证结果
 */
const stopDrag = () => {
  if (!isDragging.value) return
  isDragging.value = false

  // 移除全局事件
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('touchend', stopDrag)

  // 如果已经成功，不再验证
  if (isSuccess.value) return

  // 检查当前偏移与目标偏移的差值
  const diff = Math.abs(currentOffset.value - targetOffset.value)
  if (diff <= TOLERANCE) {
    // 验证成功
    isSuccess.value = true
    setTimeout(() => {
      emit('success', isSuccess.value);
      errorMsg.value = ''
    }, 1000)
  } else {
    // 验证失败，提示并复位
    errorMsg.value = '验证失败，请重试'
    // sliderBtnRef.value.className = 'slider-button reset'
    // 0.5秒后复位滑块（用户体验）
    setTimeout(() => {
      if (!isSuccess.value) {
        currentOffset.value = 0
        errorMsg.value = ''
      }
    }, 500)
  }
}

/**
 * 重置组件（供外部调用）
 */
const reset = () => {
  initCaptcha()
}

const handleMaxWidth = () => {
  if (window.innerWidth < 768) {
    return 350;
  }
  return 0;
}
const handleMinWidth = () => {
  if (window.innerWidth < 768) {
    return 100;
  }
  return 0;
}

// 监听 visible 变化，当显示时重新初始化
// 也可在外部调用 reset 来主动刷新
defineExpose({ reset })

// 监听轨道尺寸变化（例如窗口缩放时重新计算最大偏移，但简单场景忽略）
// 这里在组件挂载时初始化一次
watch(() => props.visible, (nv) => {
  if (nv) {
    nextTick(initCaptcha)
  }
})

// 组件卸载时清理事件
onUnmounted(() => {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
.slider-captcha {
  margin: 20px 0;
  font-family: system-ui, 'Segoe UI', sans-serif;
}

.captcha-container {
  background: #f7f9fc;
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: ease-in-out 0.3s;
}

.captcha-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #1e293b;
  transition: ease-in-out 0.15s;
}

.captcha-header.success {
  color: var(--success);
}

.refresh-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 0 6px;
  color: #64748b;
  transition: color 0.2s;
}

.refresh-btn:hover {
  color: #3b82f6;
}

.slider-track {
  position: relative;
  height: 40px;
  background: #eef2f6;
  border-radius: 40px;
  cursor: pointer;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 缺口视觉标记（灰色虚线区域） */
.gap-marker {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40px;
  /* 与滑块同宽 */
  background: repeating-linear-gradient(45deg,
      rgba(100, 116, 139, 0.3),
      rgba(100, 116, 139, 0.3) 8px,
      rgba(148, 163, 184, 0.3) 8px,
      rgba(148, 163, 184, 0.3) 16px);
  border-radius: 40px;
  pointer-events: none;
  /* 让缺口标记不干扰拖拽 */
  box-shadow: 0 0 50px var(--success);
}

.slider-button {
  position: absolute;
  top: 0;
  left: 0;
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 40px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: grab;
  transition: box-shadow 0.15s;
  transition: background-color 0.3s;
  z-index: 2;
  user-select: none;
  will-change: transform;
}

.slider-button.reset {
  transition: ease-in-out 0.25s;
}

.slider-button.dragging {
  cursor: grabbing;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background: #f8fafc;
}

.slider-button.success {
  background: #10b981;
  color: white;
  cursor: default;
  box-shadow: none;
}

.error-msg {
  opacity: 0;
  height: 13px;
  margin-top: 8px;
  font-size: 12px;
  color: #ef4444;
  text-align: center;
  transition: ease-in-out 0.2s;
}

.error-msg.show {
  opacity: 1;
}
</style>
