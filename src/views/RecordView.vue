<script setup>
import { ref } from 'vue'
import TheNavbar from '../components/TheNavbar.vue'
import { useCarbonStore } from '../stores/carbon'
import { Trophy, ShoppingBag, Lock, VideoPlay, Headset, Present, Goods } from '@element-plus/icons-vue' // 引入 Goods 图标
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useCarbonStore()
const activeTab = ref('badges') // 'badges' | 'shop'

// 商品列表
const products = [
  { id: 1, name: 'YouTube Premium', desc: '1个月免广告权益', cost: 5000, icon: VideoPlay, color: '#FF0000' },
  { id: 2, name: 'Spotify 会员', desc: '30天无限畅听', cost: 3000, icon: Headset, color: '#1DB954' },
  { id: 3, name: '星巴克中杯券', desc: '电子兑换码', cost: 1500, icon: Present, color: '#00704A' },
  { id: 4, name: 'Bilibili 大会员', desc: '30天大会员权益', cost: 4500, icon: VideoPlay, color: '#FB7299' },
  { id: 5, name: '环保帆布袋', desc: 'Carbon ID 限定周边', cost: 2000, icon: Goods, color: '#8e8e93' }, // 使用 Goods 图标
  { id: 6, name: '树苗捐赠', desc: '以你之名种下一棵树', cost: 8000, icon: '🌲', color: '#34c759' }, // 使用 Emoji
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

// 勋章详情
const showBadgeDetail = (badge) => {
  if (!badge.unlocked) {
    ElMessage.info(`解锁条件：${badge.desc}`)
    return
  }
  ElMessageBox.alert(badge.desc, badge.title, {
    confirmButtonText: '真棒',
    center: true,
    icon: 'Trophy' // 这里的 icon 仅作示意，实际 ElMessageBox icon 需单独配置或忽略
  })
}
</script>

<template>
  <div class="rewards-page">
    <TheNavbar />
    
    <main class="content">
      <div class="level-card fade-up">
        <div class="level-header">
          <div class="level-text">
            <span class="label">当前等级</span>
            <h2 class="rank-name">{{ store.userLevel.name }} Lv.{{ store.userLevel.lv }}</h2>
          </div>
          <div class="points-display">
            <span class="pts-num">{{ store.points }}</span>
            <span class="pts-label">积分</span>
          </div>
        </div>
        
        <div class="progress-area">
          <div class="progress-info">
            <span>减排贡献 {{ store.totalCo2Saved.toFixed(1) }}kg</span>
            <span v-if="store.userLevel.lv < 4">下一级还需 {{ (store.userLevel.next - store.totalCo2Saved).toFixed(1) }}kg</span>
            <span v-else>已登顶</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" :style="{ width: store.userLevel.progress + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="tabs-control fade-up delay-1">
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
        <div class="tab-slider" :class="{ right: activeTab === 'shop' }"></div>
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
            <p class="badge-status">{{ badge.unlocked ? '已解锁' : '未解锁' }}</p>
          </div>
        </div>

        <div v-if="activeTab === 'shop'" class="shop-grid">
          <div v-for="item in products" :key="item.id" class="product-card">
            <div class="product-icon" :style="{ background: item.color }">
              <span v-if="typeof item.icon === 'string'" style="font-size:24px">{{ item.icon }}</span>
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
.rewards-page { min-height: 100vh; padding-top: 52px; background: #f5f5f7; }
.content { max-width: 800px; margin: 0 auto; padding: 30px 20px; }

/* 1. Level Card (高级黑金风格) */
.level-card {
  background: linear-gradient(135deg, #1d1d1f 0%, #434343 100%);
  color: white;
  border-radius: 24px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  position: relative;
  overflow: hidden;
}
/* 增加一点纹理装饰 */
.level-card::after {
  content: ''; position: absolute; top: -50%; right: -20%; width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%; pointer-events: none;
}

.level-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
.label { font-size: 12px; text-transform: uppercase; color: rgba(255,255,255,0.6); letter-spacing: 1px; }
.rank-name { font-size: 28px; margin: 5px 0 0; background: linear-gradient(to right, #ffd700, #ffec8b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; }

.points-display { text-align: right; }
.pts-num { font-size: 36px; font-weight: 700; line-height: 1; display: block; }
.pts-label { font-size: 12px; color: rgba(255,255,255,0.6); }

.progress-info { display: flex; justify-content: space-between; font-size: 13px; color: rgba(255,255,255,0.8); margin-bottom: 8px; }
.progress-bar-bg { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: linear-gradient(90deg, #ffd700, #ffaa00); transition: width 0.5s ease; }

/* 2. Tabs Control (仿 iOS Segmented Control) */
.tabs-control {
  background: #e3e3e3;
  border-radius: 12px;
  padding: 4px;
  display: flex;
  position: relative;
  margin-bottom: 30px;
  height: 44px;
}
.tab-item {
  flex: 1;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 14px; font-weight: 600; color: #666;
  z-index: 2; cursor: pointer; transition: color 0.3s;
}
.tab-item.active { color: #000; }
.tab-slider {
  position: absolute; top: 4px; left: 4px; width: calc(50% - 4px); height: 36px;
  background: white; border-radius: 9px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  z-index: 1;
}
.tab-slider.right { transform: translateX(100%); }

/* 3. Badges Grid (勋章墙) */
.badges-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.badge-item {
  background: white; border-radius: 20px; padding: 20px 10px;
  text-align: center; cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 10px rgba(0,0,0,0.03);
}
.badge-item:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.08); }

.badge-icon-wrapper {
  width: 80px; height: 80px; margin: 0 auto 15px;
  background: #f2f2f7; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  position: relative; font-size: 40px;
}
/* 解锁状态下给勋章加光泽 */
.badge-item:not(.locked) .badge-icon-wrapper {
  background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.badge-title { font-size: 15px; margin: 0 0 5px; color: #1d1d1f; }
.badge-status { font-size: 12px; color: #34c759; font-weight: 500; margin: 0; }

/* 锁定状态样式 */
.badge-item.locked { opacity: 0.7; }
.badge-item.locked .emoji-icon { filter: grayscale(100%) blur(2px); opacity: 0.3; }
.lock-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #86868b; font-size: 24px; }
.badge-item.locked .badge-status { color: #86868b; }

/* 4. Shop Grid (商城) */
.shop-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
.product-card {
  background: white; padding: 20px; border-radius: 20px;
  display: flex; align-items: center; gap: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}
.product-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; }
.product-info { flex: 1; }
.product-info h3 { margin: 0 0 4px; font-size: 16px; font-weight: 600; }
.product-info p { margin: 0; font-size: 13px; color: #86868b; }

.price-btn {
  background: #f2f2f7; color: #1d1d1f; border: none; padding: 8px 16px;
  border-radius: 16px; font-weight: 600; font-size: 14px; cursor: pointer;
  transition: 0.2s; min-width: 80px;
}
.price-btn:hover { background: #e5e5ea; }
.price-btn.disabled { opacity: 0.5; cursor: not-allowed; }

/* 动效 */
.fade-up { animation: fadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; transform: translateY(20px); }
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
</style>