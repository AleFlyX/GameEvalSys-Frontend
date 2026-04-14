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
            <component :is="getElementIcon('Search')" />
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
          <component :is="getElementIcon('Refresh')" />
        </el-icon>
        刷新
      </el-button>
    </div>

    <!-- 加载状态 -->
    <el-skeleton v-if="loading" :rows="5" animated />

    <!-- 项目列表 -->
    <div v-else class="projects-grid">

      <div class="project-cards" v-for="project in filteredProjects" :key="project.id">
        <ProjectCard :project="project"></ProjectCard>
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
import { ElMessage } from "element-plus";
import { getElementIcon } from "@/utils/elementIcons";
import ProjectCard from "./components/projectCard.vue";
import { getProjectList } from "@/api/project";
import { useElPagination } from "@/composables/useElPagination";

// ==================== 数据定义 ====================
const projects = ref([]);
const searchKeywords = ref("");
const filterStatus = ref("");

// ==================== 分页控制 ====================
const {
  currentPage, pageSize, total, loading, disabled, defaultPageSizes,
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
