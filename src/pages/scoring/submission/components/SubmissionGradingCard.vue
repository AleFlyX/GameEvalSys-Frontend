<template>
    <article class="grading-card">
        <header class="card-head">
            <div>
                <h3>{{ record.userName || record.submitterName || `用户 #${record.userId || '-'}` }}</h3>
                <p>{{ record.projectName || `项目 #${record.projectId}` }} · {{ formatDisplayDate(record.updatedAt ||
                    record.createdAt) }}</p>
            </div>
            <el-tag :type="statusTagType(record.status)">{{ statusLabel(record.status) }}</el-tag>
        </header>

        <p v-if="record.description" class="description">{{ record.description }}</p>
        <SubmissionPreview :record="record" />
        <AiScoreReference :score="aiScore" @adopt="handleAdopt" />
        <ScorePanel v-model="scoreForm" :submitting="submitting" @save-draft="$emit('save-draft', record, $event)"
            @submit-score="$emit('submit-score', record, $event)" />
    </article>
</template>

<script setup>
import { ref, watch } from 'vue';

import AiScoreReference from './AiScoreReference.vue';
import ScorePanel from './ScorePanel.vue';
import SubmissionPreview from './SubmissionPreview.vue';

const props = defineProps({
    record: { type: Object, required: true },
    aiScore: { type: Object, default: null },
    submitting: { type: Boolean, default: false }
});

defineEmits(['save-draft', 'submit-score']);

const scoreForm = ref({ dimensionScores: [], totalScore: 0, maxScore: 100, comment: '' });

watch(
    () => props.record,
    (record) => {
        scoreForm.value = {
            dimensionScores: record.dimensionScores || [],
            totalScore: record.finalScore || 0,
            maxScore: record.totalScore || 100,
            comment: record.reviewComment || '',
        };
    },
    { immediate: true }
);

const handleAdopt = (score) => {
    scoreForm.value = {
        dimensionScores: score.dimensionScores || [],
        totalScore: score.totalScore || 0,
        maxScore: score.maxScore || 100,
        comment: score.comment || '',
    };
};

const statusLabelMap = { pending: '待评分', scoring: '评分中', scored: '已评分', returned: '已打回' };
const statusTypeMap = { pending: 'warning', scoring: 'primary', scored: 'success', returned: 'danger' };
const statusLabel = (status) => statusLabelMap[status] || '未知';
const statusTagType = (status) => statusTypeMap[status] || 'info';

const formatDisplayDate = (value) => {
    if (!value) return '-';
    const date = new Date(String(value).replace(/-/g, '/'));
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};
</script>

<style scoped>
.grading-card {
    display: grid;
    gap: 18px;
    padding: 22px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--card-bg);
}

.card-head {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
}

.card-head h3,
.card-head p,
.description {
    margin: 0;
}

.card-head p,
.description {
    color: var(--text-secondary);
    line-height: 1.7;
}
</style>
