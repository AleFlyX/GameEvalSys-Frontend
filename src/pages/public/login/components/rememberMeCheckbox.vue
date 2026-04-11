<template>
  <div class="remember-me-section">
    <el-checkbox v-model="checked" :label="`记住我（保存最近 ${maxHistory} 个账号）`" @change="handleChange" />

    <!-- 账号历史快速选择 -->
    <el-popover :effect="darkMode ? 'dark' : 'light'" v-if="historyCount > 0" placement="bottom" :width="280"
      trigger="click">
      <template #reference>
        <el-link type="primary" :underline="false" class="account-history-link">
          {{ historyCount }} 个已保存账号
        </el-link>
      </template>

      <div class="account-history-list">
        <div class="history-header">
          <span>最近登录</span>
          <el-link type="danger" :underline="false" size="small" @click="handleClearHistory">
            清空
          </el-link>
        </div>

        <el-scrollbar max-height="200px" class="history-scrollbar">
          <div v-for="account in historyList" :key="account.username" class="history-item"
            @click="handleSelectAccount(account)">
            <div class="account-name">
              <el-icon class="account-icon">
                <User />
              </el-icon>
              {{ account.username }}
            </div>
            <div class="account-time">
              {{ formatTime(account.lastLogin) }}
            </div>
            <el-button link type="danger" size="small" @click.stop="handleRemoveAccount(account.username)">
              删除
            </el-button>
          </div>
        </el-scrollbar>
      </div>
    </el-popover>
    <BaseConfirmModal :dark-mode="darkMode" v-model:visible="showClearConfirm" type="danger"
      @cancel="showClearConfirm = false" @confirm="confirmClearHistory" title="清空历史账号" content="确定要清空所有已保存的账号吗？"
      confirmButtonText="确定清空">
    </BaseConfirmModal>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { elementIconMap } from '@/utils/elementIcons';

const { User } = elementIconMap;

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  historyList: {
    type: Array,
    default: () => []
  },
  maxHistory: {
    type: Number,
    default: 5
  },
  darkMode: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits([
  'update:modelValue',
  'select-account',
  'remove-account',
  'clear-history'
]);

// 本地状态
const checked = ref(props.modelValue);
const showClearConfirm = ref(false);

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  checked.value = newVal;
});

// 历史账号计数
const historyCount = computed(() => props.historyList.length);

/**
 * 处理复选框变化
 */
const handleChange = () => {
  emit('update:modelValue', checked.value);
};

/**
 * 处理选择账号
 */
const handleSelectAccount = (account) => {
  emit('select-account', account);
  ElMessage.success(`已填充账号: ${account.username}`);
};

/**
 * 处理删除账号
 */
const handleRemoveAccount = (username) => {
  emit('remove-account', username);
};

/**
 * 处理清空历史
 */
const handleClearHistory = () => {
  showClearConfirm.value = true;
};

/**
 * 确认清空
 */
const confirmClearHistory = () => {
  showClearConfirm.value = false;
  emit('clear-history');
  ElMessage.success('已清空所有历史账号');
};

/**
 * 格式化时间
 */
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天';
  } else {
    return date.toLocaleDateString('zh-CN');
  }
};
</script>

<style scoped>
.remember-me-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 13px;
}

.account-history-link {
  color: #0071e3;
  cursor: pointer;
  font-size: 13px;
  transition: color 0.2s ease;
}

.account-history-link:hover {
  color: #004bad;
}

:root[data-theme='dark'] .account-history-link {
  color: #0a9eff;
}

:root[data-theme='dark'] .account-history-link:hover {
  color: #0080ff;
}

.account-history-list {
  padding: 8px 0;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
  margin-bottom: 8px;
}

.history-scrollbar {
  border-radius: 6px;
}

.history-item {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  gap: 4px;
}

.history-item:hover {
  background-color: var(--input-bg);
}

.account-name {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: var(--text);
  gap: 6px;
  font-size: 13px;
}

.account-icon {
  font-size: 14px;
  color: var(--text-secondary);
}

.account-time {
  font-size: 12px;
  color: var(--text-secondary);
}

:deep(.el-checkbox__label) {
  font-size: 13px;
  color: var(--text);
}

:deep(.el-dialog) {
  border-radius: 12px;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid var(--login-border);
}

:deep(.el-dialog__body) {
  padding: 16px;
  color: var(--login-text);
}
</style>
