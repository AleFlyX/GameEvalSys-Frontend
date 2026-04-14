<template>
  <!-- 定义淡入淡出效果以及基本样式css -->
  <article :class="['base-card', `shadow-${shadow}`]">
    <slot>
      <header>
        <slot name="header"></slot>
      </header>

      <body>
        <slot name="body"></slot>
      </body>

      <footer>
        <slot name="footer"></slot>
      </footer>
    </slot>
  </article>
</template>
<script setup>
defineProps({
  shadow: {
    type: String,
    default: 'always' //shadow: always hover never
  }
})
</script>

<style scoped>
.base-card {
  --card-border: rgba(20, 42, 74, 0.1);
  border-radius: 16px;
  padding: 18px;
  background: #ffffff;
  animation: fadeUp 0.5s ease both;
  transition: all 0.2s;
}

.base-card.shadow-always {
  box-shadow: 0 10px 28px var(--card-border);
}

.base-card.shadow-hover,
.base-card.shadow-never {
  border: 1px solid var(--card-border);
}

.base-card.shadow-hover:hover {
  box-shadow: 0 10px 28px var(--card-border);
}
</style>
