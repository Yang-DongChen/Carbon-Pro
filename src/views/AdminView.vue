<script setup>
import { useUserStore } from "../stores/user";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  SwitchButton,
  UserFilled,
  Tools,
  Lock,
  Unlock,
} from "@element-plus/icons-vue";

const store = useUserStore();
const router = useRouter();

const handleLogout = () => {
  store.logout();
  router.push("/login");
  ElMessage.success("管理员已退出");
};

const handleMaintenanceChange = (val) => {
  store.toggleMaintenance(val);
  if (val) {
    ElMessage.warning("已开启停服维护模式，普通用户将无法登录！");
  } else {
    ElMessage.success("系统已恢复正常服务");
  }
};

const handleToggleStatus = (user) => {
  store.toggleUserStatus(user);
  ElMessage.success(`用户状态已更新`);
};
</script>

<template>
  <div class="admin-container">
    <aside class="sidebar">
      <div class="logo-area">
        <h2>碳迹管理后台</h2>
        <p>Carbon Tracks Admin</p>
      </div>
      <nav class="menu">
        <div class="menu-item active">
          <el-icon><UserFilled /></el-icon> 用户管理
        </div>
      </nav>
      <div class="sidebar-footer">
        <button class="logout-btn" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon> 退出后台
        </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <h3>欢迎回来，管理员</h3>
        <div class="system-status">
          <span>当前状态：</span>
          <el-tag :type="store.isMaintenance ? 'danger' : 'success'">
            {{ store.isMaintenance ? "🔴 维护中" : "🟢 运行正常" }}
          </el-tag>
        </div>
      </header>

      <div class="dashboard-grid">
        <div class="card control-card">
          <div class="card-header">
            <h4>
              <el-icon><Tools /></el-icon> 全局控制
            </h4>
          </div>
          <div class="control-item">
            <div class="control-info">
              <span class="label">停服维护模式</span>
              <p class="desc">
                开启后，除管理员外的所有用户将被强制登出且无法登录。
              </p>
            </div>
            <el-switch
              v-model="store.isMaintenance"
              active-text="开启维护"
              inactive-text="正常服务"
              inline-prompt
              style="
                --el-switch-on-color: #ff4949;
                --el-switch-off-color: #13ce66;
              "
              @change="handleMaintenanceChange"
            />
          </div>
        </div>

        <div class="card table-card">
          <div class="card-header">
            <h4>用户列表 ({{ store.userList.length }})</h4>
          </div>
          <el-table :data="store.userList" style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="昵称" width="120" />
            <el-table-column prop="email" label="邮箱" />

            <!-- 插槽！！！ -->
            <el-table-column prop="role" label="角色" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.role === 'admin' ? 'warning' : ''">
                  {{ scope.row.role }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button
                  v-if="scope.row.role !== 'admin'"
                  size="small"
                  :type="scope.row.status === 'normal' ? 'danger' : 'success'"
                  @click="handleToggleStatus(scope.row)"
                >
                  {{ scope.row.status === "normal" ? "封禁" : "解封" }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-container {
  display: flex;
  min-height: 100vh;
  background: var(--bg-page);
}
.sidebar {
  width: 240px;
  background: #001529;
  color: white;
  display: flex;
  flex-direction: column;
}
.logo-area {
  height: 64px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #002140;
}
.logo-area h2 {
  margin: 0;
  font-size: 20px;
  color: white !important;
}
.logo-area p {
  margin: 0;
  font-size: 12px;
  opacity: 0.7;  /* 不透明度 */
}
.menu {
  flex: 1;
  padding: 20px 0;
}
.menu-item {
  padding: 16px 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: 0.2s;
  color: rgba(30, 9, 214, 0.65);

}
.menu-item:hover,
.menu-item.active {
  background: #1890ff;
  color: white;
}
/* 退出 */
.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.logout-btn {
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 4px;
}
.logout-btn:hover {
  background: #ff4d4f;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.top-bar {
  height: 64px;
  background: var(--bg-card);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  border-bottom: 1px solid var(--border-color);
}
.dashboard-grid {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.card {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 24px;
  border: 1px solid var(--border-color);
}
.card-header {
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
  font-weight: bold;
}
.control-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--input-bg);
  padding: 16px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
}
.control-info .label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
}
.control-info .desc {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
}
</style>
