<script setup>
import { ref } from "vue";
import TheNavbar from "../components/TheNavbar.vue";
import { useCarbonStore } from "../stores/carbon";
import {
  Van,
  Bicycle,
  Ticket,
  Goods,
  Present,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

const store = useCarbonStore();
const activeTab = ref("badges");
const products = [
  {
    id: 1,
    name: "公交乘车券",
    desc: "市内公交免费乘坐一次",
    cost: 300,
    icon: Van,
    color: "#34c759",
  },
  {
    id: 2,
    name: "共享单车周卡",
    desc: "7天无限次免费骑行",
    cost: 1200,
    icon: Bicycle,
    color: "#0071e3",
  },
  {
    id: 3,
    name: "地铁单程票",
    desc: "轨道交通通用电子票",
    cost: 500,
    icon: Ticket,
    color: "#5e5ce6",
  },
  {
    id: 4,
    name: "环保帆布袋",
    desc: "Carbon ID 限量周边",
    cost: 2000,
    icon: Goods,
    color: "#8e8e93",
  },
  {
    id: 5,
    name: "树苗捐赠",
    desc: "以你之名种下一棵树",
    cost: 8000,
    icon: "🌲",
    color: "#27ae60",
  },
  {
    id: 6,
    name: "星巴克中杯券",
    desc: "自带杯免费升杯",
    cost: 1500,
    icon: Present,
    color: "#00704A",
  },
];

const handleRedeem = (item) => {
  if (store.points < item.cost) return ElMessage.error("积分不足");
  ElMessageBox.confirm(
    `确认消耗 ${item.cost} 积分兑换 ${item.name}？`,
    "兑换确认",
    { confirmButtonText: "确认兑换", cancelButtonText: "再想想" },
  )
    .then(() => {
      if (store.redeem(item.cost)) {
        const code = `ECO-${Math.floor(Math.random() * 1000000)}`;
        ElMessageBox.alert(
          `<div style="text-align: center;">
           <p style="font-size: 16px; margin-bottom: 10px;">兑换成功！🎉</p>
           <div style="background: #f5f5f7; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 20px; font-weight: bold; color: #0071e3; letter-spacing: 2px;">${code}</div>
           <p style="font-size: 12px; color: #86868b; margin-top: 10px;">请截图保存，在对应APP使用</p>
         </div>`,
          "兑换凭证",
          { dangerouslyUseHTMLString: true, center: true },
        );
      }
    })
    .catch(() => {});
};

const showBadgeDetail = (badge) => {
  if (!badge.unlocked) return ElMessage.info(`解锁条件：${badge.desc}`);
  ElMessageBox.alert(badge.desc, badge.title, {
    confirmButtonText: "真棒",
    center: true,
  });
};
</script>

<template>
  <div class="rewards-page">
    <TheNavbar />

    <main class="content">
      <section class="hero-section fade-up">
        <div class="level-card">
          <div class="level-content">
            <div class="rank-info">
              <span class="sub-label">CURRENT LEVEL</span>
              <h1 class="rank-title">
                {{ store.userLevel.name }} Lv.{{ store.userLevel.lv }}
              </h1>
              <div class="progress-bar">
                <div
                  class="fill"
                  :style="{ width: store.userLevel.progress + '%' }"
                ></div>
              </div>
              <p class="progress-text">
                累计减排 {{ store.totalCo2Saved.toFixed(1) }}kg
              </p>
            </div>
            <div class="points-info">
              <div class="points-val">{{ store.points }}</div>
              <div class="points-label">可用积分</div>
            </div>
          </div>
        </div>
      </section>

      <div class="tabs-control fade-up delay-1">
        <div class="tab-slider" :class="{ right: activeTab === 'shop' }"></div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'badges' }"
          @click="activeTab = 'badges'"
        >
          <el-icon><Trophy /></el-icon> 成就勋章
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'shop' }"
          @click="activeTab = 'shop'"
        >
          <el-icon><ShoppingBag /></el-icon> 积分商城
        </div>
      </div>

      <div class="tab-content fade-up delay-2">
        <div v-if="activeTab === 'badges'" class="badges-grid">
          <div
            v-for="badge in store.badges"
            :key="badge.id"
            class="badge-item"
            :class="{ locked: !badge.unlocked }"
            @click="showBadgeDetail(badge)"
          >
            <div class="badge-icon-wrapper">
              <span class="emoji-icon">{{ badge.icon }}</span>
              <div class="lock-overlay" v-if="!badge.unlocked">
                <el-icon><Lock /></el-icon>
              </div>
            </div>
            <h3 class="badge-title">{{ badge.title }}</h3>
            <p class="badge-status">
              {{ badge.unlocked ? "已解锁" : "未解锁" }}
            </p>
          </div>
        </div>

        <div v-if="activeTab === 'shop'" class="shop-grid">
          <div v-for="item in products" :key="item.id" class="product-card">
            <div class="product-icon" :style="{ background: item.color }">
              <span
                v-if="typeof item.icon === 'string'"
                style="font-size: 24px"
                >{{ item.icon }}</span
              >
              <el-icon v-else><component :is="item.icon" /></el-icon>
            </div>

            <div class="product-info">
              <h3>{{ item.name }}</h3>
              <p>{{ item.desc }}</p>
            </div>

            <button
              class="price-btn"
              :class="{ disabled: store.points < item.cost }"
              @click="handleRedeem(item)"
            >
              {{ item.cost }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.rewards-page {
  min-height: 100vh;
  padding-top: 52px;
  background: #f5f5f7;
}
.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px 20px;
}

.level-card {
  background: linear-gradient(135deg, #1d1d1f 0%, #3a3a3c 100%) !important;
  color: white !important;
  border-radius: 24px;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
  position: relative;
  overflow: hidden;
  border: none !important;
}
.level-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1;
}
.sub-label {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6) !important;
  letter-spacing: 1px;
  margin-bottom: 4px;
  display: block;
}
.rank-title {
  font-size: 32px;
  margin: 0 0 12px;
  font-weight: 800;
  color: white !important;
}
.points-info {
  text-align: right;
}
.points-val {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
  display: block;
  color: #34c759 !important;
}
.points-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6) !important;
  margin-top: 4px;
}
.progress-bar {
  width: 200px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}
.fill {
  height: 100%;
  background: #34c759;
  transition: width 0.5s;
}
.progress-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6) !important;
  margin: 0;
}

.tabs-control {
  background: #e3e3e8;
  border-radius: 12px;
  padding: 4px; 
  display: flex;
  position: relative;
  margin-bottom: 30px;
  height: 48px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05); 
}

.tab-slider {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc(50% - 4px); 
  background: white;
  border-radius: 9px;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.12),
    0 0 1px rgba(0, 0, 0, 0.05); 
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); 
  z-index: 1;
}

.tab-slider.right {
  transform: translateX(100%);
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #86868b; 
  z-index: 2; 
  cursor: pointer;
  transition: color 0.3s;
  user-select: none;
}

.tab-item.active {
  color: #1d1d1f;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.badge-item {
  background: white;
  border-radius: 20px;
  padding: 20px 10px;
  text-align: center;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
}
.badge-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}
.badge-icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 15px;
  background: #f2f2f7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 40px;
}
.badge-item:not(.locked) .badge-icon-wrapper {
  background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
.badge-title {
  font-size: 15px;
  margin: 0 0 5px;
  color: #1d1d1f;
}
.badge-status {
  font-size: 12px;
  color: #34c759;
  font-weight: 500;
  margin: 0;
}
.badge-item.locked {
  opacity: 0.7;
}
.badge-item.locked .emoji-icon {
  filter: grayscale(100%) blur(2px);
  opacity: 0.3;
}
.lock-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868b;
  font-size: 24px;
}
.badge-item.locked .badge-status {
  color: #86868b;
}

.shop-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
.product-card {
  background: white;
  padding: 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}
.product-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}
.product-info {
  flex: 1;
}
.product-info h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}
.product-info p {
  margin: 0;
  font-size: 13px;
  color: #86868b;
}
.price-btn {
  background: #f2f2f7;
  color: #1d1d1f;
  border: none;
  padding: 8px 16px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
  min-width: 80px;
}
.price-btn:hover {
  background: #e5e5ea;
}
.price-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: #aaa;
}

.fade-up {
  animation: fadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  opacity: 0;
  transform: translateY(20px);
}
.delay-1 {
  animation-delay: 0.1s;
}
.delay-2 {
  animation-delay: 0.2s;
}
@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .level-card {
    padding: 30px 24px !important;
  }
}
</style>
