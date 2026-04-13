<template>
  <div class="project-statistic-list-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">项目打分统计</h1>
      <p class="page-subtitle">选择项目查看详细的打分数据统计</p>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-filter-area">
      <el-input v-model="searchKeywords" placeholder="搜索项目名称..." clearable class="search-input" @input="handleSearch">
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>

      <el-select v-model="filterStatus" placeholder="项目状态" clearable class="status-select" @change="handleStatusChange">
        <el-option label="未开始" value="not_started" />
        <el-option label="进行中" value="ongoing" />
        <el-option label="已结束" value="ended" />
      </el-select>

      <el-button type="primary" @click="handleRefresh">
        <el-icon>
          <Refresh />
        </el-icon>
        刷新
      </el-button>
    </div>

    <!-- 加载状态 -->
    <el-skeleton v-if="loading" :rows="5" animated />

    <!-- 项目列表 -->
    <div v-else class="projects-grid">
      <div v-for="project in filteredProjects" :key="project.id" class="project-card" @click="selectProject(project)">
        <div class="card-header">
          <h3 class="project-name">{{ project.name }}</h3>
          <el-tag :type="getStatusType(project.status)">
            {{ getStatusLabel(project.status) }}
          </el-tag>
        </div>

        <div class="card-content">
          <p class="project-description">{{ project.description || "暂无描述" }}</p>

          <div class="project-meta">
            <span class="meta-item">
              <el-icon>
                <Calendar />
              </el-icon>
              {{ formatDate(project.startDate) }} ~ {{ formatDate(project.endDate) }}
            </span>
            <span class="meta-item">
              <el-icon>
                <User />
              </el-icon>
              共 {{ project.groupCount || 0 }} 个小组
            </span>
          </div>
        </div>

        <div class="card-footer">
          <el-button type="primary" size="small" @click.stop="goToDetail(project.id)">
            查看统计
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredProjects.length === 0" class="empty-state">
        <el-empty description="暂无项目" />
      </div>
    </div>

    <!-- 分页器 -->
    <div v-if="filteredProjects.length > 0" class="pagination-wrapper">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="defaultPageSizes"
        :total="total" layout="total, sizes, prev, pager, next, jumper" @current-change="handleCurrentChange"
        @size-change="handleSizeChange" :disabled="disabled" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Search, Refresh, Calendar, User } from "@element-plus/icons-vue";
import { getProjectList } from "@/api/project";
import { useElPagination } from "@/composables/useElPagination";

const router = useRouter();

// ==================== 数据定义 ====================
const projects = ref([]);
const searchKeywords = ref("");
const filterStatus = ref("");

// ==================== 分页控制 ====================
const {
  currentPage, pageSize, total, loading, disabled, totalPages, defaultPageSizes,
  setTotal, setCurrentPage, handleSizeChange, handleCurrentChange
} = useElPagination({
  initialPage: 1,
  initialPageSize: 10,
  defaultPageSizes: [10, 20, 30, 50],
  maxPageSize: 100,
  onPageChange: async (page, size) => {
    await loadProjects(page, size);
  },
  debounceTime: 300,
});

// ==================== 方法 ====================
/**
 * 加载项目列表
 * @param {Number} page 页码
 * @param {Number} size 分页大小
 */
const loadProjects = async (page, size) => {
  try {
    const params = {
      page,
      size,
      // 如果搜索条件或状态过滤不为空，添加到请求参数
      ...(searchKeywords.value && { keyWords: searchKeywords.value }),
      ...(filterStatus.value && { status: filterStatus.value }),
    };
    console.log(params)
    const response = await getProjectList(params);
    if (response.data) {
      projects.value = response.data.list || [];

      setTotal(response.data.total || 0);
    }
  } catch (error) {
    ElMessage.error("加载项目列表失败");
    console.error(error);
  }
};

// ==================== 计算属性 ====================
/**
 * 分页后的项目列表（后端已经处理分页和过滤）
 */
const filteredProjects = computed(() => {
  return projects.value;
});

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
 * 查询首页
 */
const queryFirstPage = async () => {
  if (currentPage.value !== 1) {
    setCurrentPage(1);
    return
  }

  await loadProjects(1, pageSize.value)
}

/**
 * 搜索处理
 */
const handleSearch = () => {
  // 重置到第1页并刷新列表
  queryFirstPage(1);
};

/**
 * 状态变化处理
 */
const handleStatusChange = () => {
  // 重置到第1页并刷新列表
  queryFirstPage(1);
};

/**
 * 刷新列表
 */
const handleRefresh = () => {
  queryFirstPage(1)
};

/**
 * 选择项目跳转
 */
const goToDetail = (projectId) => {
  router.push({
    name: "projectStatisticDetail",
    params: { projectId },
  });
};

/**
 * 选择项目（用于其他交互）
 */
const selectProject = (project) => {
  goToDetail(project.id);
};

// ==================== 生命周期 ====================
onMounted(() => {
  loadProjects(1, 10);
});
</script>

<style scoped>
/* ==================== 全局布局 ==================== */
.project-statistic-list-container {
  padding: 32px 24px;
  background-color: #f9fafb;
  min-height: 100vh;
}

/* ==================== 页面标题 ==================== */
.page-header {
  margin-bottom: 32px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
}

/* ==================== 搜索筛选区域 ==================== */
.search-filter-area {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 300px;
}

.status-select {
  width: 180px;
}

/* ==================== 项目网格 ==================== */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

/* ==================== 项目卡片 ==================== */
.project-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
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

/* ==================== 空状态 ==================== */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

/* ==================== 分页器 ==================== */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 32px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
}

.pagination-wrapper :deep(.el-pagination) {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .search-filter-area {
    flex-direction: column;
  }

  .search-input,
  .status-select {
    width: 100%;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 1.5rem;
  }
}
</style>
