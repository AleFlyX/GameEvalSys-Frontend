<template>
  <li class="fold-menu-group">
    <div class="fold-menu-header" :class="{ active: opened }" @click="handleToggle">
      <div class="label-prefix">
        <slot name="prefix" />
        {{ label }}
      </div>
      <span class="arrow" :class="{ active: opened, hidden: alwaysOpen }">
        <el-icon>
          <ArrowUpBold />
        </el-icon>
      </span>
    </div>

    <transition name="submenu-collapse">
      <ul v-show="opened" class="fold-submenu">
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
});

const emits = defineEmits(['update:active']);

const route = useRoute();

const childMenuItemActive = computed(() => route.path.startsWith(props.baseIndex)) // fold的子item被点击或进入子item的path
const opened = ref(false);

const handleToggle = () => {
  if (props.alwaysOpen) {
    return;
  }
  opened.value = !opened.value;
  console.log('update:active', opened.value)
  emits('update:active', opened.value);
};
watch(
  () => childMenuItemActive.value,
  (nv) => {
    if (!nv) { //点击folder外部路径时关闭正在展开的folder
      opened.value = false;
    }
  })
</script>

<style scoped>
.fold-menu-group {
  list-style: none;
}

.label-prefix {
  display: flex;
  align-items: center;
  gap: 5px;
}

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

.fold-menu-header:hover,
.fold-menu-header.active {
  background-color: #34495e;
  padding-left: 25px;
}

.fold-menu-header.active {
  background-color: #1abc9c;
  border-left-color: #0f997d;
  color: #fff;
}

.arrow {
  font-size: 14px;
  transition: all 0.2s ease;
}

.arrow.active {
  transform: rotate(0.5turn);
}

.arrow.hidden {
  opacity: 0;
}

.fold-submenu {
  list-style: none;
  margin: 0;
  padding: 0;
  background-color: #1a2533;
  overflow: hidden;
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
