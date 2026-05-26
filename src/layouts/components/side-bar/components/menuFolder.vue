<template>
  <li class="fold-menu-group" :class="{ collapsed }">
    <div class="fold-menu-header" :class="{ active: opened || childMenuItemActive }" :title="collapsed ? label : ''"
      @click="handleToggle">
      <div class="label-prefix">
        <span class="prefix-wrap">
          <slot name="prefix" />
        </span>
        <span v-show="!collapsed">{{ label }}</span>
      </div>

      <span v-show="!collapsed" class="arrow" :class="{ active: opened, hidden: alwaysOpen }">
        <el-icon>
          <ArrowUpBold />
        </el-icon>
      </span>
    </div>
    <transition name="submenu-collapse">
      <!-- 使用 v-if 而不是 v-show, 让 enter/leave 动画可以平滑过渡高度，从而推开下方菜单更连贯 -->
      <ul v-if="opened && !collapsed" class="fold-submenu">
        <slot />
      </ul>
    </transition>
  </li>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ArrowUpBold } from "@element-plus/icons-vue";

const props = defineProps({
  activePaths: {
    type: Array,
    default: () => [],
  },
  excludePaths: {
    type: Array,
    default: () => [],
  },
  baseIndex: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: "",
  },
  active: {
    type: Boolean,
    default: false,
  },
  alwaysOpen: {
    type: Boolean,
    default: false,
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(["update:active"]);

const route = useRoute();

const normalizePath = (path) => {
  if (!path) return "";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized.length > 1 ? normalized.replace(/\/$/, "") : normalized;
};

const childMenuItemActive = computed(() => {
  const currentPath = normalizePath(route.path);
  // 先排除不属于当前 folder 的子路径，避免同一前缀下的分组互相展开。
  const isExcluded = props.excludePaths.some((path) => currentPath === normalizePath(path));

  if (isExcluded) {
    return false;
  }

  if (props.activePaths.length) {
    // 显式匹配当前 folder 负责的路由列表，比单纯依赖 baseIndex 更精确。
    return props.activePaths.some((path) => currentPath === normalizePath(path));
  }

  return currentPath === normalizePath(props.baseIndex);
});
const opened = ref(props.alwaysOpen || props.active || childMenuItemActive.value);

const handleToggle = () => {
  if (props.alwaysOpen || props.collapsed) {
    return;
  }
  opened.value = !opened.value;
  emits("update:active", opened.value);
};
watch(
  () => childMenuItemActive.value,
  (nv) => {
    if (nv) {
      opened.value = true;
      return;
    }
    if (!props.alwaysOpen) {
      opened.value = false;
    }
  }
);
watch(
  () => props.collapsed,
  (nv) => {
    if (nv && !props.alwaysOpen) {
      opened.value = false;
    }
  }
);
</script>

<style scoped>
.fold-menu-group {
  list-style: none;
}

.label-prefix {
  display: flex;
  align-items: center;
  gap: 10px;
}

.prefix-wrap {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fold-menu-header {
  min-height: 40px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text, #253041);
  border-radius: 12px;
  margin: 2px 4px;
  padding: 0 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fold-menu-header:hover {
  background-color: rgba(15, 23, 42, 0.06);
  border-color: rgba(15, 23, 42, 0.06);
}

.fold-menu-header.active {
  background: linear-gradient(135deg, #0a84ff, #0a69d7);
  border-color: rgba(10, 132, 255, 0.4);
  box-shadow: 0 10px 18px rgba(10, 132, 255, 0.3);
  color: #fff;
}

.arrow {
  font-size: 13px;
  transition: all 0.2s ease;
  color: inherit;
}

.arrow.active {
  transform: rotate(0.5turn);
}

.arrow.hidden {
  opacity: 0;
}

.fold-submenu {
  list-style: none;
  margin: 2px 0 4px;
  padding: 2px 0;
  border-left: 1px solid rgba(148, 163, 184, 0.26);
  background-color: transparent;
  overflow: hidden;
  /* 不直接过渡 height（性能/布局抖动），改为过渡 max-height + opacity + transform，使展开推开下方元素更平滑 */
  /* 默认不限制 max-height，让展开后保持可见；enter/leave 状态负责从 0 到上限的过渡动画 */
  max-height: none;
}

.fold-menu-group.collapsed .fold-menu-header {
  width: 48px;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
  padding: 0;
}

.fold-menu-group.collapsed .label-prefix {
  gap: 0;
}

.submenu-collapse-enter-active,
.submenu-collapse-leave-active {
  transition: max-height 240ms cubic-bezier(.2, .8, .2, 1), opacity 180ms ease, transform 180ms ease;
}

.submenu-collapse-enter-from,
.submenu-collapse-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-6px);
}

.submenu-collapse-enter-to,
.submenu-collapse-leave-from {
  /* 给一个足够大的 max-height 以容纳子菜单内容（避免使用固定 height） */
  max-height: 500px;
  opacity: 1;
  transform: translateY(0);
}
</style>
