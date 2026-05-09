<template>
  <header class="hero-card">
    <div class="hero-copy">
      <p class="eyebrow">服务器监控</p>
      <h1>GameEvalSys-Monitor</h1>
      <p class="hero-desc">
        聚焦总览、健康态、资源使用和配置摘要
      </p>
      <div class="hero-meta">
        <el-tag :type="statusMeta.type" effect="light" size="small">
          {{ statusMeta.text }}
        </el-tag>
        <span>{{ dashboardSummary.message }}</span>
        <span class="meta-dot">·</span>
        <span>接口更新时间 {{ dashboardSummary.updatedAt }}</span>
        <span class="meta-dot">·</span>
        <span>页面刷新 {{ lastRefreshText }}</span>
      </div>
    </div>

    <div class="hero-actions">
      <el-button type="primary" :loading="loading" class="refresh-btn" @click="handleRefresh">
        刷新数据
      </el-button>
      <div class="hero-state">
        <span class="state-dot" :class="statusMeta.className"></span>
        <span>{{ transportText }}</span>
        <span class="state-dot state-dot--small" :class="connectionMeta.className"></span>
        <span>{{ connectionMeta.text }}</span>
      </div>
    </div>
  </header>
</template>
<script setup>
import { debounce } from '@/utils/debounce'
defineOptions({
  name: 'HeadPart',
})

defineProps({
  dashboardSummary: {
    type: Object,
    required: true,
  },
  transportText: {
    type: String,
    required: true,
  },
  lastRefreshText: {
    type: String,
    required: true,
  },
  connectionMeta: {
    type: Object,
    required: true,
  },
  statusMeta: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  }
})

const emit = defineEmits(['refresh'])
const handleRefresh = debounce(() => {
  emit('refresh')
}, 300)

</script>
<style scoped>
@import '../styles/media.css';

.hero-card {
  background: var(--monitor-card);
  border: 1px solid var(--monitor-border);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.07);
  backdrop-filter: blur(10px);
}

.hero-card {
  border-radius: 24px;
  padding: 26px 28px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-end;
  margin-bottom: 16px;
}

.hero-copy h1 {
  margin: 0;
  font-size: clamp(26px, 3vw, 40px);
  line-height: 1.12;
  font-weight: 800;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 13px;
  color: #2563eb;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.hero-desc {
  margin: 12px 0 0;
  max-width: 760px;
  color: var(--monitor-sub);
  line-height: 1.7;
  font-size: 14px;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  color: var(--monitor-sub);
  font-size: 13px;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

.hero-state {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--monitor-sub);
  font-size: 13px;
}


.state-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #94a3b8;
  box-shadow: 0 0 0 6px rgba(148, 163, 184, 0.12);
}

.state-dot--small {
  width: 8px;
  height: 8px;
  box-shadow: none;
}

.state-dot.is-success {
  background: #22c55e;
  box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.12);
}

.state-dot.is-warning {
  background: #f59e0b;
  box-shadow: 0 0 0 6px rgba(245, 158, 11, 0.12);
}

.state-dot.is-danger {
  background: #ef4444;
  box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.12);
}
</style>
