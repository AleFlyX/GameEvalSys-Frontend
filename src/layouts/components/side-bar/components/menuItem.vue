<template>
  <li class="menu-item" :class="{ active: props.active || itemActive, 'sub-item': level === 'sub' }"
    @click="handleClick">
    <div class="label-context">
      <slot name="prefix">
      </slot>
      {{ label }}
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
});

const emits = defineEmits(["clicked"]);
const router = useRouter();
const route = useRoute();

const itemActive = computed(() => {
  return route.path == `/${props.index}`;
})

const handleClick = () => {
  if (props.index) router.push(`/${props.index}`);
  // menuContext?.setActive?.(props.index);
  emits("clicked", props.index);
};
</script>

<style scoped>
.menu-item {
  position: relative;
  line-height: 48px;
  font-size: 16px;
  font-weight: 500;
  padding: 0 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 7px solid transparent;
  user-select: none;
  list-style: none;
}

.menu-item:hover {
  background-color: #34495e;
  padding-left: 25px;
}

.menu-item.active {
  background-color: #1abc9c;
  color: #fff;
  border-left-color: #0f997d;
  padding-left: 25px;
}

.label-context {
  display: flex;
  align-items: center;
  gap: 5px;
}

.menu-item.sub-item {
  font-weight: 400;
  padding-left: 35px;
}

.menu-item.sub-item:hover,
.menu-item.sub-item.active {
  padding-left: 40px;
  background-color: #1abc9c79;
  border-left-color: #0f997d;
}
</style>
