<template>
    <el-form label-position="top" class="score-panel">
        <div v-if="form.dimensionScores.length" class="dimension-list">
            <el-form-item v-for="dimension in form.dimensionScores"
                :key="dimension.dimensionId || dimension.dimensionName"
                :label="dimension.dimensionName || dimension.name">
                <div class="slider-row">
                    <el-slider v-model="dimension.score" :min="0" :max="Number(dimension.maxScore) || 100" />
                    <span>{{ dimension.score }} / {{ dimension.maxScore || 100 }}</span>
                </div>
            </el-form-item>
        </div>
        <el-empty v-else description="暂无评分维度，提交总分和评语即可" />

        <el-form-item label="总分">
            <el-input-number v-model="form.totalScore" :min="0" :max="form.maxScore || 100" :precision="1" />
            <span class="max-score">满分 {{ form.maxScore || 100 }}</span>
        </el-form-item>
        <el-form-item label="评语">
            <el-input v-model="form.comment" type="textarea" :rows="3" maxlength="500" show-word-limit resize="none" />
        </el-form-item>
        <div class="actions">
            <el-button @click="$emit('save-draft', buildPayload())">暂存</el-button>
            <el-button type="primary" :loading="submitting"
                @click="$emit('submit-score', buildPayload())">提交评分</el-button>
        </div>
    </el-form>
</template>

<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
    modelValue: { type: Object, default: () => ({}) },
    submitting: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'save-draft', 'submit-score']);

const form = reactive({ dimensionScores: [], totalScore: 0, maxScore: 100, comment: '' });

watch(
    () => props.modelValue,
    (value) => {
        form.dimensionScores = Array.isArray(value?.dimensionScores)
            ? value.dimensionScores.map((item) => ({ ...item, score: Number(item.score) || 0, maxScore: Number(item.maxScore) || 100 }))
            : [];
        form.totalScore = Number(value?.totalScore) || form.dimensionScores.reduce((sum, item) => sum + (Number(item.score) || 0), 0);
        form.maxScore = Number(value?.maxScore) || form.dimensionScores.reduce((sum, item) => sum + (Number(item.maxScore) || 0), 0) || 100;
        form.comment = value?.comment || '';
    },
    { immediate: true, deep: true }
);

watch(
    form,
    () => emit('update:modelValue', buildPayload()),
    { deep: true }
);

const buildPayload = () => ({
    dimensionScores: form.dimensionScores.map((item) => ({ ...item })),
    totalScore: form.totalScore,
    maxScore: form.maxScore,
    comment: form.comment,
});
</script>

<style scoped>
.score-panel {
    display: grid;
    gap: 6px;
}

.slider-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 88px;
    align-items: center;
    gap: 16px;
    width: 100%;
}

.max-score {
    margin-left: 12px;
    color: var(--text-secondary);
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}
</style>
