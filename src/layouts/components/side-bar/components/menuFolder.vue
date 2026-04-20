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
      <ul v-show="opened && !collapsed" class="fold-submenu">
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

const childMenuItemActive = computed(() => route.path.startsWith(props.baseIndex));
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
  color: #253041;
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
  transition: all 0.2s ease;
}

.submenu-collapse-enter-from,
.submenu-collapse-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
