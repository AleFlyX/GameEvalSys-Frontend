<template>
  <li class="fold-menu-group">
    <!-- 折叠菜单头部 -->
    <div class="fold-menu-header" :class="{ active: showSubMenu }" @click="handleExtend()">
      {{ props.label }}
      <span class="arrow" :class="{ active: showSubMenu }">
        <el-icon>
          <ArrowUpBold />
        </el-icon>
      </span>
    </div>
    <!-- 折叠菜单子项 -->
    <ul class="fold-submenu">
      <slot>

      </slot>
    </ul>
  </li>
</template>
<script setup>
import { ref, watch } from 'vue';
import { ArrowUpBold } from "@element-plus/icons-vue";
const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  inFolder: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['update:showSubMenu']);

const showSubMenu = ref(props.inFolder);
//是否展开
const handleExtend = () => {
  showSubMenu.value = !showSubMenu.value;
}

watch(() => props.inFolder, (nv) => {
  showSubMenu.value = nv;
}, { immediate: true })

watch(() => showSubMenu.value, (nv) => {
  emits('update:showSubMenu', nv);
})
</script>
<style scoped>
/* 折叠菜单组 - 包裹头部+子项 */
.fold-menu-group {
  list-style: none;
}

/* 折叠菜单头部 */
.fold-menu-header {
  line-height: 48px;
  font-size: 16px;
  font-weight: 700;
  padding: 0 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 7px solid transparent;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 折叠头部悬浮/展开态 */
.fold-menu-header:hover,
.fold-menu-header.active {
  background-color: #34495e;
  padding-left: 25px;
}

/* 折叠头部展开选中态（和普通菜单统一视觉） */
.fold-menu-header.active {
  background-color: #1abc9c;
  border-left-color: #0f997d;
  color: #fff;
}

/* 折叠箭头样式 */
.arrow {
  font-size: 14px;

  transition: all 0.2s ease;
}

.arrow.active {
  transform: rotate(0.5turn);
}

/* 折叠子菜单容器 */
.fold-submenu {
  list-style: none;
  margin: 0;
  padding: 0;
  background-color: #1a2533;
  /* 子菜单背景加深，区分层级 */
  overflow: hidden;
  /* 隐藏溢出，配合子项动画 */
}
</style>
