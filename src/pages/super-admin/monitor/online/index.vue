<template>
  <div class="online-panel">
    <base-card shadow="hover" class="online-card">
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px" class="online-form">
        <el-form-item label="登录地址" prop="ipaddr">
          <el-input v-model="queryParams.ipaddr" placeholder="请输入登录地址" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="用户名称" prop="userName">
          <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="pagedList" style="width: 100%" border
        :empty-text="loading ? '加载中...' : '暂无在线用户'" class="online-table">
        <el-table-column label="序号" width="60" align="center" type="index">
          <template #default="scope">
            <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="会话编号" align="center" prop="tokenId" :show-overflow-tooltip="true" />
        <el-table-column label="登录名称" align="center" prop="userName" :show-overflow-tooltip="true" />
        <el-table-column label="所属部门" align="center" prop="deptName" :show-overflow-tooltip="true" />
        <el-table-column label="主机" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
        <el-table-column label="登录地点" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
        <el-table-column label="操作系统" align="center" prop="os" :show-overflow-tooltip="true" />
        <el-table-column label="浏览器" align="center" prop="browser" :show-overflow-tooltip="true" />
        <el-table-column label="登录时间" align="center" prop="loginTime" width="180">
          <template #default="scope">
            <span>{{ scope.row.loginTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100">
          <template #default="scope">
            <el-button link type="danger" icon="Delete" size="small"
              @click="handleForceLogout(scope.row)">强退</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="online-pagination">
        <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total"
          layout="total, prev, pager, next, sizes" :page-sizes="[10, 20, 50, 100]" background
          @size-change="handleSizeChange" @current-change="handlePageChange" />
      </div>
    </base-card>
  </div>
</template>

<script setup>
import BaseCard from '@/components/common/data/BaseCard.vue';
import { ref, computed } from 'vue';

const queryRef = ref(null)
const onlineList = ref([
  {
    loginTime: "2028-2-3 10:00:00",
    browser: "Mozilla Firefox",
    os: "macOS",
    loginLocation: "烟台",
    ipaddr: "192.168.1.10",
    deptName: "研发部",
    userName: "ccb",
    tokenId: "990"
  },
  {
    loginTime: "2028-2-3 10:05:00",
    browser: "Chrome",
    os: "Windows 11",
    loginLocation: "北京",
    ipaddr: "192.168.1.11",
    deptName: "产品部",
    userName: "alice",
    tokenId: "991"
  }
]);
const loading = ref(false);
const total = ref(2);
const pageNum = ref(1);
const pageSize = ref(10);

const queryParams = ref({
  ipaddr: '',
  userName: '',
});

const pagedList = computed(() => {
  const start = (pageNum.value - 1) * pageSize.value;
  const end = pageNum.value * pageSize.value;
  return onlineList.value.slice(start, end);
});

function handleQuery() {
  pageNum.value = 1;
  // TODO: 调用接口获取数据，设置 loading.value = true/false
  // getList();
}

function resetQuery() {
  queryParams.value.ipaddr = '';
  queryParams.value.userName = '';
  handleQuery();
}

function handleForceLogout(row) {
  // TODO: 调用强退接口
  window.alert(`是否确认强退名称为“${row.userName}”的用户?`);
}

function handleSizeChange(size) {
  pageSize.value = size;
  pageNum.value = 1;
}

function handlePageChange(page) {
  pageNum.value = page;
}
</script>

<style scoped>
.online-panel {
  width: 100%;
  min-height: 100vh;
  background: #f6f8fa;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 32px 0;
  box-sizing: border-box;
}

.online-card {
  width: 100%;
  max-width: 1200px;
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.07), 0 1.5px 6px 0 rgba(0, 0, 0, 0.03);
  padding: 24px 32px 32px 32px;
  box-sizing: border-box;
}

.online-form {
  margin-bottom: 18px;
}

.online-table {
  margin-bottom: 18px;
}

.online-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
