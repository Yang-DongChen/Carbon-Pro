<script setup>
import { ref, reactive } from "vue";
import { useUserStore } from "../stores/user";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  SwitchButton,
  UserFilled,
  Tools,
  ChatDotRound,
  Check,
  Delete,
  Goods,
  Warning,
  Plus,
  Edit,
  RefreshLeft
} from "@element-plus/icons-vue";

const store = useUserStore();
const router = useRouter();

// UI 状态：用于切换左侧主菜单
const activeMenu = ref('mall'); // 默认展示新加的商城模块方便你查看

// ---------------- 1. 原有状态 ----------------
const communityPosts = ref([
  { id: 2001, author: "绿叶使者", content: "今天骑共享单车通勤，顺便用积分兑换了环保袋，减排打卡！", time: "2026-06-10 09:30", status: "pending" },
  { id: 2002, author: "TestUser", content: "这个系统有刷分外挂吗？想刷点积分换东西。", time: "2026-06-10 10:15", status: "pending" },
  { id: 2003, author: "环保小卫士", content: "分享一个旧衣物改造的教程，大家一起变废为宝~", time: "2026-06-09 14:20", status: "approved" }
]);

// ---------------- 2. 新增：商城与订单状态 ----------------
const mallActiveTab = ref('products'); // 商城模块的子标签页

// 模拟的商城商品库数据
const mallProducts = ref([
  { id: 1, name: "环保帆布袋", cost: 500, stock: 150, status: "online", color: "#10b981" },
  { id: 2, name: "共享单车周卡", cost: 1200, stock: 50, status: "online", color: "#3b82f6" },
  { id: 3, name: "地铁5元抵用券", cost: 800, stock: 0, status: "offline", color: "#f59e0b" },
  { id: 4, name: "瑞幸自带杯券", cost: 300, stock: 200, status: "online", color: "#6366f1" }
]);

// 模拟的异常兑换订单数据
const exceptionOrders = ref([
  { orderId: "ERR-9901", user: "李同学", product: "共享单车周卡", cost: 1200, time: "2026-06-10 08:12", issue: "网络超时，积分已扣但未生成核销码", status: "unhandled" },
  { orderId: "ERR-9902", user: "张三", product: "环保帆布袋", cost: 500, time: "2026-06-09 18:45", issue: "库存并发不足导致超卖", status: "unhandled" }
]);

// 编辑商品的弹窗状态
const showProductDialog = ref(false);
const editingProduct = reactive({ id: null, name: "", cost: 0, stock: 0 });

// ---------------- 交互逻辑 ----------------

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

// 社区审核交互
const handleApprovePost = (row) => {
  row.status = 'approved';
  ElMessage.success("动态审核已通过，将展示在社区前端");
};
const handleDeletePost = (row) => {
  ElMessageBox.confirm("确定要删除这条违规动态吗？", "敏感操作", {
    confirmButtonText: "删除", cancelButtonText: "取消", type: "warning",
  }).then(() => {
    communityPosts.value = communityPosts.value.filter(p => p.id !== row.id);
    ElMessage.success("动态已强制删除");
  });
};

// 商城交互：上下架商品
const handleToggleProduct = (row) => {
  row.status = row.status === 'online' ? 'offline' : 'online';
  ElMessage.success(`商品 ${row.name} 已${row.status === 'online' ? '上架' : '下架'}`);
};

// 商城交互：打开编辑弹窗
const openEditDialog = (row) => {
  editingProduct.id = row.id;
  editingProduct.name = row.name;
  editingProduct.cost = row.cost;
  editingProduct.stock = row.stock;
  showProductDialog.value = true;
};

// 商城交互：保存编辑
const saveProductEdit = () => {
  const target = mallProducts.value.find(p => p.id === editingProduct.id);
  if (target) {
    target.name = editingProduct.name;
    target.cost = editingProduct.cost;
    target.stock = editingProduct.stock;
    ElMessage.success("商品信息已更新");
  }
  showProductDialog.value = false;
};

// 异常订单交互：退还积分
const handleRefund = (row) => {
  ElMessageBox.confirm(`确定要为用户 ${row.user} 退还 ${row.cost} 积分吗？`, "退还积分", {
    confirmButtonText: "确认退还", cancelButtonText: "取消", type: "warning"
  }).then(() => {
    row.status = 'refunded';
    ElMessage.success(`已冲正，${row.cost} 积分已退还至用户账户`);
  });
};

// 异常订单交互：强制补发
const handleForceComplete = (row) => {
  row.status = 'completed';
  ElMessage.success(`已强制补发核销码至 ${row.user} 的账户`);
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
        <div class="menu-item" :class="{ active: activeMenu === 'users' }" @click="activeMenu = 'users'">
          <el-icon><UserFilled /></el-icon> 用户与控制
        </div>
        <div class="menu-item" :class="{ active: activeMenu === 'community' }" @click="activeMenu = 'community'">
          <el-icon><ChatDotRound /></el-icon> 社区审核管理
        </div>
        <div class="menu-item" :class="{ active: activeMenu === 'mall' }" @click="activeMenu = 'mall'">
          <el-icon><Goods /></el-icon> 商城与订单管理
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

      <div v-if="activeMenu === 'users'" class="dashboard-grid fade-in">
        <div class="card control-card">
          <div class="card-header">
            <h4><el-icon><Tools /></el-icon> 全局控制</h4>
          </div>
          <div class="control-item">
            <div class="control-info">
              <span class="label">停服维护模式</span>
              <p class="desc">开启后，除管理员外的所有用户将被强制登出且无法登录。</p>
            </div>
            <el-switch
              v-model="store.isMaintenance" active-text="开启维护" inactive-text="正常服务" inline-prompt
              style="--el-switch-on-color: #ff4949; --el-switch-off-color: #13ce66;"
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
            <el-table-column label="环保积分" width="120">
              <template #default="scope">
                <span style="color: #10b981; font-weight: bold;">{{ scope.row.points || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="role" label="角色" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.role === 'admin' ? 'warning' : ''">{{ scope.row.role }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button
                  v-if="scope.row.role !== 'admin'" size="small"
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

      <div v-else-if="activeMenu === 'community'" class="dashboard-grid fade-in">
        <div class="card table-card">
          <div class="card-header">
            <h4>社区动态审核</h4>
          </div>
          <el-table :data="communityPosts" style="width: 100%" border>
            <el-table-column prop="id" label="动态ID" width="80" />
            <el-table-column prop="author" label="发布者" width="120" />
            <el-table-column prop="content" label="动态内容" show-overflow-tooltip />
            <el-table-column prop="time" label="发布时间" width="160" />
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'approved' ? 'success' : 'warning'">
                  {{ scope.row.status === 'approved' ? '已展示' : '待审核' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="内容管控" width="180" fixed="right">
              <template #default="scope">
                <el-button
                  v-if="scope.row.status === 'pending'" size="small" type="success" :icon="Check" circle
                  @click="handleApprovePost(scope.row)"
                />
                <el-button size="small" type="danger" :icon="Delete" circle @click="handleDeletePost(scope.row)" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <div v-else-if="activeMenu === 'mall'" class="dashboard-grid fade-in">
        <div class="card">
          <el-tabs v-model="mallActiveTab" class="demo-tabs">
            
            <el-tab-pane label="权益商品配置" name="products">
              <div class="tab-toolbar">
                <el-button type="primary" :icon="Plus">新增权益商品</el-button>
              </div>
              <el-table :data="mallProducts" style="width: 100%" border>
                <el-table-column prop="id" label="商品ID" width="80" />
                <el-table-column prop="name" label="商品名称" width="180" />
                <el-table-column prop="cost" label="所需积分" width="120">
                  <template #default="scope">
                    <span style="color: #f59e0b; font-weight: bold;">{{ scope.row.cost }} pts</span>
                  </template>
                </el-table-column>
                <el-table-column prop="stock" label="当前库存" width="100" />
                <el-table-column label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.status === 'online' ? 'success' : 'info'">
                      {{ scope.row.status === 'online' ? '上架中' : '已下架' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                  <template #default="scope">
                    <el-button size="small" :icon="Edit" @click="openEditDialog(scope.row)">编辑</el-button>
                    <el-button 
                      size="small" 
                      :type="scope.row.status === 'online' ? 'danger' : 'success'"
                      @click="handleToggleProduct(scope.row)"
                    >
                      {{ scope.row.status === 'online' ? '下架' : '上架' }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <el-tab-pane label="异常订单处理" name="exceptions">
              <div class="tab-toolbar">
                <el-alert title="请及时处理因网络或并发问题导致的兑换失败订单" type="warning" show-icon :closable="false" />
              </div>
              <el-table :data="exceptionOrders" style="width: 100%" border>
                <el-table-column prop="orderId" label="异常流水号" width="120" />
                <el-table-column prop="user" label="受影响用户" width="120" />
                <el-table-column prop="product" label="目标商品" width="150" />
                <el-table-column prop="issue" label="异常原因检测" show-overflow-tooltip>
                  <template #default="scope">
                    <span style="color: #ef4444;"><el-icon><Warning /></el-icon> {{ scope.row.issue }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="处理状态" width="120">
                  <template #default="scope">
                    <el-tag v-if="scope.row.status === 'unhandled'" type="danger">待处理</el-tag>
                    <el-tag v-else-if="scope.row.status === 'refunded'" type="info">已退还积分</el-tag>
                    <el-tag v-else type="success">已补发凭证</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="人工干预" width="220" fixed="right">
                  <template #default="scope">
                    <el-button 
                      v-if="scope.row.status === 'unhandled'" 
                      size="small" type="primary" plain :icon="RefreshLeft" 
                      @click="handleRefund(scope.row)"
                    >
                      退还积分
                    </el-button>
                    <el-button 
                      v-if="scope.row.status === 'unhandled'" 
                      size="small" type="success" plain :icon="Check" 
                      @click="handleForceComplete(scope.row)"
                    >
                      强制核销
                    </el-button>
                    <span v-if="scope.row.status !== 'unhandled'" style="color: #9ca3af; font-size: 13px;">结案</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </main>

    <el-dialog v-model="showProductDialog" title="编辑权益商品" width="400px" append-to-body>
      <el-form :model="editingProduct" label-width="80px">
        <el-form-item label="商品名称">
          <el-input v-model="editingProduct.name" />
        </el-form-item>
        <el-form-item label="所需积分">
          <el-input-number v-model="editingProduct.cost" :min="10" :step="50" />
        </el-form-item>
        <el-form-item label="库存量">
          <el-input-number v-model="editingProduct.stock" :min="0" :step="10" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showProductDialog = false">取消</el-button>
          <el-button type="primary" @click="saveProductEdit">保存修改</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.admin-container {
  display: flex;
  min-height: 100vh;
  background: #f5f5f7;
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
.logo-area h2 { margin: 0; font-size: 20px; color: white !important; }
.logo-area p { margin: 0; font-size: 12px; opacity: 0.7; }
.menu { flex: 1; padding: 20px 0; }
.menu-item {
  padding: 16px 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: 0.2s;
  color: rgba(255, 255, 255, 0.65);
}
.menu-item:hover, .menu-item.active { background: #1890ff; color: white; }
.sidebar-footer { padding: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn {
  width: 100%; padding: 10px; background: rgba(255, 255, 255, 0.1); border: none;
  color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;
  gap: 8px; border-radius: 4px;
}
.logout-btn:hover { background: #ff4d4f; }

.main-content { flex: 1; display: flex; flex-direction: column; overflow-y: auto;}
.top-bar {
  height: 64px; background: white; padding: 0 24px; display: flex; align-items: center;
  justify-content: space-between; box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08); border-bottom: 1px solid #e8e8e8;
}
.dashboard-grid { padding: 24px; display: flex; flex-direction: column; gap: 24px; }
.card { background: white; border-radius: 8px; padding: 24px; border: 1px solid #e8e8e8; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05); }
.card-header { margin-bottom: 20px; border-bottom: 1px solid #e8e8e8; padding-bottom: 10px; font-weight: bold; }
.control-item {
  display: flex; align-items: center; justify-content: space-between; background: #fafafa;
  padding: 16px; border-radius: 6px; border: 1px solid #e8e8e8;
}
.control-info .label { display: block; font-weight: 600; color: #333; }
.control-info .desc { margin: 0; color: #666; font-size: 13px; }

/* 页面切换动画 */
.fade-in {
  animation: fadeIn 0.4s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.tab-toolbar {
  margin-bottom: 15px;
}
</style>