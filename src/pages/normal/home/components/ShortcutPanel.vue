<template>
    <BaseCard shadow="hover">
        <template #header>
            <slot name="header"></slot>
        </template>
        <template #body>
            <div class="shortcut-grid">
                <button v-for="item in shortcutList" :key="item.id" class="shortcut-item" type="button"
                    @click="emit('navigate', item.path)">
                    <el-icon class="shortcut-icon" :style="{ color: item.color }">
                        <component :is="resolveIcon(item.icon)" />
                    </el-icon>
                    <span>{{ item.name }}</span>
                </button>
            </div>
        </template>
    </BaseCard>
</template>

<script setup>
import BaseCard from '@/components/common/data/BaseCard.vue';
import { getElementIcon } from '@/utils/elementIcons';

const props = defineProps({
    shortcutList: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['navigate']);

const resolveIcon = (iconName) => getElementIcon(iconName);
</script>

<style scoped>
.shortcut-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
}

.shortcut-item {
    border: none;
    border-radius: 10px;
    padding: 12px 10px;
    cursor: pointer;
    background: #f6f9fc;
    color: #45576f;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
}

.shortcut-item:hover {
    transform: translateY(-2px);
    background: #ebf3ff;
}

.shortcut-icon {
    font-size: 18px;
}

@media (max-width: 768px) {
    .shortcut-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>
