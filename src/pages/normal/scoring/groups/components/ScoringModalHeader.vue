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
  gap: 8px;
}

.title-text {
  margin: 0;
  font-size: 22px;
  line-height: 1.35;
  font-weight: 700;
  color: #1f2a44;
}

.description-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #7b8798;
}

.extra-area {
  margin-top: 4px;
}

@media (max-width: 768px) {
  .title-text {
    font-size: 20px;
  }
}
</style>
