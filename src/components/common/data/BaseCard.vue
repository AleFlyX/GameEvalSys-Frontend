<template>
  <article :class="[
    'base-card',
    rootClass,
    `shadow-${shadow}`,
    `variant-${variant}`,
    {
      'base-card--interactive': interactive,
      'base-card--entered': isEntered,
    },
  ]" :style="cardStyle">
    <header v-if="$slots.header" class="base-card__header">
      <slot name="header" />
    </header>

    <section :class="[bodyClass, `base-card__body`]" :style="bodyStyle">
      <slot />
      <slot name="body" />
    </section>

    <footer v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </footer>
  </article>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const isEntered = ref(false);

onMounted(() => {
  requestAnimationFrame(() => {
    isEntered.value = true;
  });
});

defineProps({
  shadow: {
    type: String,
    default: 'always', // always | hover | never
  },
  variant: { // 卡片风格，提供多种预设样式，适用于不同场景
    type: String,
    default: 'default', // default | soft | outline | highlight
  },
  interactive: { //将卡片变为可交互状态，会在hover时有提升感
    type: Boolean,
    default: false,
  },
  rootClass: { type: [String, Object, Array], default: '', },
  bodyClass: { type: [String, Object, Array], default: '', },
  cardStyle: { type: Object, default: () => ({}) },
  bodyStyle: { type: Object, default: () => ({}), },
})
</script>

<style scoped>
.base-card {
  --card-surface: var(--card-bg, rgba(255, 255, 255, 0.92));
  --card-border: var(--border, rgba(225, 233, 244, 0.95));
  --card-shadow: 0 10px 28px rgba(31, 42, 68, 0.08);
  --card-radius: 16px;
  --card-padding: 18px;
  --card-gap: 14px;
  --card-enter-offset: 8px;
  --card-hover-offset: 0px;
  --card-hover-scale: 1;
  border-radius: var(--card-radius);
  padding: var(--card-padding);
  box-sizing: border-box;
  background: var(--card-surface);
  color: var(--text);
  border: 1px solid transparent;
  box-shadow: none;
  opacity: 0;
  transform: translateY(var(--card-enter-offset)) translateY(var(--card-hover-offset)) scale(var(--card-hover-scale));
  transition: transform 0.25s ease, opacity 0.25s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease, color 0.2s ease, filter 0.2s ease;
  will-change: transform, opacity, box-shadow;
}

.base-card--entered {
  --card-enter-offset: 0px;
  opacity: 1;
}

html[data-theme="dark"] .base-card {
  --card-shadow: 0 10px 28px rgba(0, 0, 0, 0.4);
}

.base-card.variant-soft {
  --card-surface: var(--bg-secondary, rgba(248, 251, 255, 0.96));
}

.base-card.variant-outline {
  background: var(--card-bg, rgba(255, 255, 255, 0.86));
}

.base-card.variant-highlight {
  background: var(--card-bg, linear-gradient(180deg, rgba(246, 249, 255, 0.98), rgba(255, 255, 255, 0.96)));
}

.base-card__header,
.base-card__body,
.base-card__footer {
  min-width: 0;
}

.base-card__header+.base-card__body,
.base-card__body+.base-card__footer {
  margin-top: var(--card-gap);
}

.base-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--card-gap);
}

.base-card__footer {
  margin-top: var(--card-gap);
}

.base-card.shadow-always {
  box-shadow: var(--card-shadow);
}

.base-card.shadow-hover,
.base-card.shadow-never {
  border-color: var(--card-border);
}

.base-card.shadow-hover:hover {
  box-shadow: var(--card-shadow);
  --card-hover-offset: -3px;
}

.base-card.shadow-never {
  box-shadow: none;
}

.base-card--interactive {
  cursor: pointer;
  --card-hover-offset: -1px;
}

.base-card--interactive:hover {
  --card-hover-offset: -5px;
  --card-hover-scale: 1.01;
  box-shadow: 0 14px 32px rgba(31, 42, 68, 0.12);
  filter: brightness(1.02);
}

.base-card--interactive:active {
  --card-hover-offset: 0px;
  --card-hover-scale: 0.99;
}
</style>
