<template>
  <BaseCard class="project-card" shadow="hover" @click="selectProject(project)">
    <!-- {{ project }} -->
    <div class="card-header">
      <h3 class="project-name">{{ project.name }}</h3>
      <div class="header-tags">
        <el-tag :type="getStatusType(project.status)">
          {{ getStatusLabel(project.status) }}
        </el-tag>
        <el-tag size="small" :type="project.maliciousRuleType === 'THRESHOLD' ? 'warning' : 'info'">
          {{ project.maliciousRuleType === 'THRESHOLD' ? '阈值模式' : '默认模式' }}
        </el-tag>
      </div>
    </div>

    <div class="card-content">
      <p class="project-description">{{ project.description || "暂无描述" }}</p>

      <div class="project-meta">
        <span class="meta-item">
          <el-icon>
            <component :is="getElementIcon('Calendar')" />
          </el-icon>
          {{ formatDate(project.startDate) }} ~ {{ formatDate(project.endDate) }}
        </span>
        <span class="meta-item">
          <el-icon>
            <component :is="getElementIcon('User')" />
          </el-icon>
          共 {{ project.groupIds.length || 0 }} 个小组,
          评审团共{{ project.scorerIds.length || 0 }}个人
        </span>
      </div>
    </div>

    <div class="card-footer">
      <MyBtn type="pro" size="large" style="width: 100%;">查看统计</MyBtn>
    </div>

  </BaseCard>
</template>
<script setup>
import { useRouter } from "vue-router";
import { getElementIcon } from "@/utils/elementIcons";
defineProps({
  project: {
    type: Object,
    default: () => { }
  }
})

const router = useRouter();
/**
 * 获取状态标签类型
 */
const getStatusType = (status) => {
  const typeMap = {
    not_started: "info",
    ongoing: "success",
    ended: "danger",
  };
  return typeMap[status] || "info";
};

/**
 * 获取状态标签
 */
const getStatusLabel = (status) => {
  const statusMap = {
    not_started: "未开始",
    ongoing: "进行中",
    ended: "已结束",
  };
  return statusMap[status] || "未知";
};

/**
 * 格式化日期
 */
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("zh-CN");
  } catch {
    return dateStr;
  }
};

/**
 * 选择项目（用于其他交互）
 */
const selectProject = (project) => {
  router.push({
    name: "projectStatisticDetail",
    params: { projectId: project.id },
  });

};
</script>
<style scoped>
/* ==================== 项目卡片 ==================== */
.project-card {
  background-color: #ffffffe1;
  padding: 20px;
  cursor: pointer;
  min-height: 260px;
  display: flex;
  flex-direction: column;

}


.project-card:hover {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.header-tags {
  display: flex;
  align-items: center;
  gap: 6px;
}

.project-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
  word-break: break-word;
}

.card-content {
  flex: 1;
  margin-bottom: 16px;
}

.project-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #6b7280;
}

.meta-item :deep(.el-icon) {
  width: 16px;
  height: 16px;
}

.card-footer {
  display: flex;
  gap: 8px;
}

.card-footer :deep(.el-button) {
  flex: 1;
}
</style>
