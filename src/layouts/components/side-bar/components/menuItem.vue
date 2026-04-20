<template>
  <li class="menu-item" :class="{ active: isActive, 'sub-item': level === 'sub', collapsed }"
    :title="collapsed && showNativeTitle ? label : ''" @click="handleClick">
    <div class="label-context">
      <span class="prefix-wrap">
        <slot name="prefix" />
      </span>
      <span v-show="!collapsed" class="menu-text">{{ label }}</span>
    </div>
  </li>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
const props = defineProps({
  index: {
    type: String,
    default: ""
  },
  label: {
    type: String,
    default: ''
  },
  active: {
    type: [Boolean, null],
    default: null,
  },
  level: {
    type: String,
    default: "root",
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
  showNativeTitle: {
    type: Boolean,
    default: true,
  },
});

const emits = defineEmits(["clicked"]);
const router = useRouter();
const route = useRoute();

const normalizePath = (path) => {
  if (!path) return "";
  return path.startsWith("/") ? path : `/${path}`;
};

const itemActive = computed(() => {
  return route.path === normalizePath(props.index);
});
const isActive = computed(() => {
  return props.active === null ? itemActive.value : props.active;
});

const handleClick = () => {
  if (props.index) router.push(normalizePath(props.index));
  // menuContext?.setActive?.(props.index);
  emits("clicked", props.index);
};
</script>

<style scoped>
.menu-item {
  min-height: 40px;
  font-size: 14px;
  font-weight: 500;
  color: #253041;
  border-radius: 12px;
  margin: 2px 4px;
  padding: 0 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  user-select: none;
  list-style: none;
  display: flex;
  align-items: center;
}

.menu-item:hover {
  background-color: rgba(15, 23, 42, 0.06);
  border-color: rgba(15, 23, 42, 0.06);
}

.menu-item.active {
  background: linear-gradient(135deg, #0a84ff, #0a69d7);
  color: #fff;
  border-color: rgba(10, 132, 255, 0.4);
  box-shadow: 0 10px 18px rgba(10, 132, 255, 0.3);
}

.label-context {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.prefix-wrap {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.menu-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-item.sub-item {
  margin-left: 20px;
  font-size: 13px;
  font-weight: 450;
  color: #4b5565;
}

.menu-item.sub-item.active {
  color: #fff;
}

.menu-item.collapsed {
  width: 48px;
  min-height: 46px;
  justify-content: center;
  padding: 0;
}

.menu-item.collapsed.sub-item {
  margin-left: 4px;
}

.menu-item.collapsed .label-context {
  width: auto;
  gap: 0;
}

.menu-item :deep(.el-icon) {
  font-size: 18px;
}
</style>
