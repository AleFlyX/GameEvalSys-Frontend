<template>
  <div class="sidebar">
    <span class="title">项目评分平台</span>
    <ul class="nav-items">
      <MenuItem v-for="item in visibleNormMenus" :key="item.path" :index="item.path" :label="item.name">
      <template #prefix>
        <el-icon>
          <component :is="elementIconMap[item.meta.icon] || null" />
        </el-icon>
      </template>
      </MenuItem>

      <MenuFolder v-if="userStore.isAdmin" base-index="/admin" label="管理面板">
        <template #prefix>
          <el-icon>
            <component :is="elementIconMap.Setting" />
          </el-icon>
        </template>

        <MenuItem v-for="item in visibleAdminMenus" :key="item.path" :index="item.path" :label="item.name" level="sub">
        <template #prefix>
          <el-icon>
            <component :is="elementIconMap[item.meta.icon] || null" />
          </el-icon>
        </template>
        </MenuItem>

      </MenuFolder>

      <MenuFolder v-if="userStore.isSuperAdmin" base-index="superAdmin" label="后台管理">
        <template #prefix>
          <el-icon>
            <component :is="elementIconMap.Setting" />
          </el-icon>
        </template>
        <MenuItem v-for="item in visibleSuperAdminMenus" :key="item.path" :index="item.path" :label="item.name"
          level="sub">
        <template #prefix>
          <el-icon>
            <component :is="elementIconMap[item.meta.icon] || null" />
          </el-icon>
        </template>
        </MenuItem>
      </MenuFolder>

      <MenuItem v-if="userStore.isAdmin" :active="showAgent" label="使用PageAgent" @click="handleAgentShow">
      <template #prefix>
        <el-icon>
          <component :is="elementIconMap.ChatSquare" />
        </el-icon>
      </template>
      </MenuItem>
    </ul>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { norm } from "@/router/modules/normalRoutes";
import { admin } from "@/router/modules/adminRoutes";
import { superAdmin } from "@/router/modules/superAdminRoutes";
import { useUserStore } from "@/stores/modules/userStore";
import { elementIconMap } from "@/utils/elementIcons";
import MenuItem from "./components/menuItem.vue";
import MenuFolder from "./components/menuFolder.vue";

defineOptions({
  name: "SidebarMenu",
});

const userStore = useUserStore();

// 找出可直接进入的路径
const visibleNormMenus = computed(() => norm.filter((item) => !item.meta?.hidden));
const visibleAdminMenus = computed(() => admin.filter((item) => !item.meta?.hidden));
const visibleSuperAdminMenus = computed(() =>
  superAdmin.filter((item) => !item.meta?.hidden)
);

const emits = defineEmits(["showAgent"]);
const showAgent = ref(false);
const handleAgentShow = () => {
  showAgent.value = !showAgent.value;
  emits("showAgent", showAgent.value);
};


</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.sidebar {
  display: flex;
  flex-direction: column;
  background-color: #2c3e50;
  color: #fff;
  height: 100%;
  width: 220px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.title {
  padding: 0 10px;
  text-align: center;
  line-height: 60px;
  font-size: 18px;
  font-weight: 600;
  background-color: #1a2533;
  border-bottom: 1px solid #34495e;
}
</style>
