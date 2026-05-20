<template>
  <div class="scoring-modal-header">
    <h3 class="title-text">{{ title }}</h3>
    <p v-if="description" class="description-text">{{ description }}</p>
    <div v-if="$slots.extra" class="extra-area">
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
});
</script>

<style scoped>
.scoring-modal-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.title-text {
  margin: 0;
  font-size: 22px;
  line-height: 1.3;
  font-weight: 700;
  color: #1f2a44;
  letter-spacing: -0.3px;
}

.description-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #7b8798;
  font-weight: 400;
}

.extra-area {
  margin-top: 6px;
}

@media (max-width: 768px) {
  .title-text {
    font-size: 20px;
  }

  .description-text {
    font-size: 12px;
  }
}
</style>
