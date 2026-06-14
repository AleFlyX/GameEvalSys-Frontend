<template>
    <div class="preview-box">
        <div class="file-line">
            <span>项目文件</span>
            <strong>{{ record.fileOriginalName || '未上传' }}</strong>
            <el-button v-if="record.filePath" text size="small" @click="openFile(record.filePath)">下载</el-button>
        </div>
        <div class="file-line">
            <span>答辩文件</span>
            <strong>{{ record.pptOriginalName || '未上传' }}</strong>
            <el-button v-if="record.pptPath" text size="small" @click="openFile(record.pptPath)">下载</el-button>
        </div>
    </div>
</template>

<script setup>
defineProps({
    record: { type: Object, required: true }
});

const openFile = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
};
</script>

<style scoped>
.preview-box {
    display: grid;
    gap: 8px;
}

.file-line {
    display: grid;
    grid-template-columns: 72px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
}

.file-line strong {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
