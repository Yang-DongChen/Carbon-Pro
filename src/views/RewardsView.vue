<script setup>
import { ref } from 'vue'
import TheNavbar from '../components/TheNavbar.vue'
import { useCarbonStore } from '../stores/carbon'
import { Lock, VideoPlay, Headset, Present, Goods, Medal, ShoppingBag, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useCarbonStore()

const products = [
  { id: 1, name: 'YouTube Premium', desc: '1个月免广告权益', cost: 5000, icon: VideoPlay, color: '#FF0000' },
  { id: 2, name: 'Spotify 会员', desc: '30天无限畅听', cost: 3000, icon: Headset, color: '#1DB954' },
  { id: 3, name: '星巴克中杯券', desc: '电子兑换码', cost: 1500, icon: Present, color: '#00704A' },
  { id: 4, name: 'Bilibili 大会员', desc: '30天大会员权益', cost: 4500, icon: VideoPlay, color: '#FB7299' },
  { id: 5, name: '环保帆布袋', desc: 'Carbon ID 限定周边', cost: 2000, icon: Goods, color: '#8e8e93' },
  { id: 6, name: '树苗捐赠', desc: '以你之名种下一棵树', cost: 8000, icon: '🌲', color: '#34c759' },
]

const handleRedeem = (item) => {
  if (store.points < item.cost) return ElMessage.error('积分不足')
  ElMessageBox.confirm(`确认消耗 ${item.cost} 积分兑换 ${item.name}？`, '兑换确认', { confirmButtonText: '兑换', cancelButtonText: '取消' })
    .then(() => {
      if (store.redeem(item.cost)) {
        ElMessageBox.alert(`兑换码：CBN-${Math.random().toString(36).substr(2, 8).toUpperCase()}\n请截图保存。`, '兑换成功 🎉', { center: true })
      }
    }).catch(() => {})
}

const showBadgeDetail = (badge) => {
  if (!badge.unlocked) return ElMessage.info(`解锁条件：${badge.desc}`)
  ElMessageBox.alert(badge.desc, badge.title, { confirmButtonText: '真棒', center: true })
}
</script>

<template>
  <div class="rewards-page">
    <TheNavbar />
    
    <main class="content">
      
      <section class="hero-section fade-up">
        <div class="level-card">
          <div class="card-bg-glow"></div>
          <div class="level-content">
            <div class="rank-info">
              <span class="sub-label">CURRENT LEVEL</span>
              <h1 class="rank-title">{{ store.userLevel.name }} Lv.{{ store.userLevel.lv }}</h1>
              <div class="progress-bar">
                <div class="fill" :style="{ width: store.userLevel.progress + '%' }"></div>
              </div>
              <p class="progress-text">累计减排 {{ store.totalCo2Saved.toFixed(1) }}kg</p>
            </div>
            <div class="points-info">
              <div class="points-val">{{ store.points }}</div>
              <div class="points-label">可用积分</div>
            </div>
          </div>
        </div>
      </section>

      <div class="split-layout fade-up delay-1">
        
        <section class="panel badges-panel">
          <div class="panel-header">
            <h3><el-icon><Medal /></el-icon> 荣誉墙</h3>
          </div>
          <div class="badges-grid">
            <div 
              v-for="badge in store.badges" 
              :key="badge.id" 
              class="badge-item"
              :class="{ locked: !badge.unlocked }"
              @click="showBadgeDetail(badge)"
            >
              <div class="badge-icon">
                {{ badge.icon }}
                <div class="lock-mask" v-if="!badge.unlocked"><el-icon><Lock /></el-icon></div>
              </div>
              <span class="badge-name">{{ badge.title }}</span>
            </div>
          </div>
        </section>

        <section class="panel shop-panel">
          <div class="panel-header">
            <h3><el-icon><ShoppingBag /></el-icon> 兑换中心</h3>
            <span class="more-link">查看全部 <el-icon><ArrowRight /></el-icon></span>
          </div>
          <div class="shop-list">
            <div v-for="item in products" :key="item.id" class="shop-item">
              <div class="item-left">
                <div class="item-icon" :style="{ background: item.color }">
                  <span v-if="typeof item.icon === 'string'">{{ item.icon }}</span>
                  <el-icon v-else><component :is="item.icon" /></el-icon>
                </div>
                <div class="item-text">
                  <h4>{{ item.name }}</h4>
                  <p>{{ item.desc }}</p>
                </div>
              </div>
              <button 
                class="redeem-btn" 
                :class="{ disabled: store.points < item.cost }"
                @click="handleRedeem(item)"
              >
                {{ item.cost }}
              </button>
            </div>
          </div>
        </section>

      </div>

    </main>
  </div>
</template>

<style scoped>
.rewards-page { min-height: 100vh; padding-top: 52px; background: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif; }
.content { max-width: 1100px; margin: 0 auto; padding: 30px 20px; }

/* --- 1. Hero Card --- */
.hero-section { margin-bottom: 24px; }
.level-card {
  background: #1d1d1f; color: white; border-radius: 24px; padding: 40px;
  position: relative; overflow: hidden; display: flex; align-items: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15); height: 180px; box-sizing: border-box;
}
.card-bg-glow {
  position: absolute; top: -50%; right: -10%; width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%; pointer-events: none;
}
.level-content { width: 100%; display: flex; justify-content: space-between; align-items: center; z-index: 1; }

.sub-label { font-size: 11px; font-weight: 700; color: #86868b; letter-spacing: 1px; margin-bottom: 4px; display: block; }
.rank-title { font-size: 32px; font-weight: 700; margin: 0 0 12px; background: linear-gradient(to right, #fff, #cecece); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.progress-bar { width: 200px; height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; overflow: hidden; margin-bottom: 6px; }
.fill { height: 100%; background: #34c759; transition: width 0.5s; }
.progress-text { font-size: 12px; color: #86868b; margin: 0; }

.points-info { text-align: right; }
.points-val { font-size: 48px; font-weight: 700; color: #34c759; line-height: 1; letter-spacing: -1px; }
.points-label { font-size: 13px; color: #86868b; margin-top: 4px; font-weight: 500; }

/* --- 2. Split Layout (左右并排核心) --- */
.split-layout {
  display: grid;
  grid-template-columns: 1fr 1.4fr; /* 左窄右宽比例 */
  gap: 24px;
  align-items: start;
}

/* 面板通用样式 */
.panel { background: white; border-radius: 24px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); height: 100%; box-sizing: border-box; }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.panel-header h3 { font-size: 18px; font-weight: 600; margin: 0; display: flex; align-items: center; gap: 8px; color: #1d1d1f; }
.more-link { font-size: 13px; color: #0071e3; cursor: pointer; display: flex; align-items: center; gap: 2px; }

/* --- Badges Panel (Left) --- */
.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); /* 自适应小格子 */
  gap: 16px;
}
.badge-item {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  cursor: pointer; transition: transform 0.2s;
}
.badge-item:hover { transform: translateY(-3px); }
.badge-icon {
  width: 64px; height: 64px; background: #f5f5f7; border-radius: 16px;
  display: flex; align-items: center; justify-content: center; font-size: 32px;
  position: relative; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.03);
}
.badge-item:not(.locked) .badge-icon { background: white; box-shadow: 0 4px 10px rgba(0,0,0,0.08); }
.badge-name { font-size: 12px; color: #1d1d1f; font-weight: 500; text-align: center; }
.lock-mask { position: absolute; inset: 0; background: rgba(255,255,255,0.6); display: flex; align-items: center; justify-content: center; font-size: 20px; color: #999; border-radius: 16px; }
.badge-item.locked .badge-icon { opacity: 0.6; filter: grayscale(100%); }
.badge-item.locked .badge-name { color: #999; }

/* --- Shop Panel (Right) --- */
.shop-list { display: flex; flex-direction: column; gap: 16px; }
.shop-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px; border-radius: 16px; background: #f9f9fa;
  transition: all 0.2s;
}
.shop-item:hover { background: #f0f0f2; transform: scale(1.01); }
.item-left { display: flex; align-items: center; gap: 14px; }
.item-icon {
  width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;
}
.item-text h4 { font-size: 15px; font-weight: 600; margin: 0 0 2px; color: #1d1d1f; }
.item-text p { font-size: 12px; color: #86868b; margin: 0; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.redeem-btn {
  background: white; border: 1px solid #e5e5e5; color: #0071e3;
  padding: 6px 14px; border-radius: 14px; font-weight: 600; font-size: 13px;
  cursor: pointer; transition: 0.2s; min-width: 60px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}
.redeem-btn:hover { background: #0071e3; color: white; border-color: #0071e3; }
.redeem-btn.disabled { background: #f5f5f7; color: #ccc; border-color: transparent; cursor: not-allowed; box-shadow: none; }

/* 响应式：屏幕窄时自动变回上下堆叠 */
@media (max-width: 768px) {
  .split-layout { grid-template-columns: 1fr; }
}

.fade-up { animation: fadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; transform: translateY(20px); }
.delay-1 { animation-delay: 0.2s; }
@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
</style>