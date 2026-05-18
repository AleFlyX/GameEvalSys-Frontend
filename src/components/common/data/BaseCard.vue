<template>
  <article :class="[
    'base-card',
    `shadow-${shadow}`,
    `variant-${variant}`,
    {
      'base-card--interactive': interactive,
    },
  ]">
    <header v-if="$slots.header" class="base-card__header">
      <slot name="header" />
    </header>

    <section class="base-card__body">
      <slot />
      <slot name="body" />
    </section>

    <footer v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </footer>
  </article>
</template>

<script setup>
defineProps({
  shadow: {
    type: String,
    default: 'always', // always | hover | never
  },
  variant: {
    type: String,
    default: 'default', // default | soft | outline | highlight
  },
  interactive: { //将卡片变为可交互状态，会在hover时有提升感
    type: Boolean,
    default: false,
  },
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
  border-radius: var(--card-radius);
  padding: var(--card-padding);
  box-sizing: border-box;
  background: var(--card-surface);
  color: var(--text, inherit);
  border: 1px solid transparent;
  box-shadow: none;
  animation: fadeUp 0.5s ease both;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
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

.base-card.shadow-hover:hover,
.base-card--interactive:hover {
  box-shadow: var(--card-shadow);
  transform: translateY(-2px);
}

.base-card.shadow-never {
  box-shadow: none;
}

.base-card--interactive {
  cursor: pointer;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
