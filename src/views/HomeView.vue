<script setup>
import { ref, onMounted, watch } from 'vue'
import TheNavbar from '../components/TheNavbar.vue'
import RecordModal from '../components/RecordModal.vue'
import { useCarbonStore } from '../stores/carbon'
import * as echarts from 'echarts'
import { ArrowRight, Odometer } from '@element-plus/icons-vue'
// --- Swiper ---
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/autoplay'
import 'swiper/css/effect-fade'

const store = useCarbonStore()
const showModal = ref(false)
const chartRef = ref(null)
let myChart = null

// 轮播图数据
const heroImages = [
  '/wiki/forest.jpg',
  '/wiki/travel.jpg',
  '/wiki/energy.jpg',
  '/wiki/food.jpg'
]
const swiperModules = [Autoplay, EffectFade]

// 图表初始化
const initChart = () => {
  if (!chartRef.value) return
  myChart = echarts.init(chartRef.value)
  updateChart()
}

const updateChart = () => {
  const { days, values } = store.last7DaysData
  
  const option = {
    grid: { top: 30, right: 20, bottom: 20, left: 40, containLabel: true },
    tooltip: { 
      trigger: 'axis',
      formatter: '{b} <br/> 碳排放: {c} kg'
    },
    xAxis: { 
      type: 'category', 
      data: days,
      axisLine: { show: false }, 
      axisTick: { show: false }, 
      axisLabel: { color: '#86868b' }
    },
    yAxis: { 
      type: 'value', 
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } },
      axisLabel: { color: '#86868b' }
    },
    series: [{
      data: values,
      type: 'line', 
      smooth: true, 
      symbol: 'circle', 
      symbolSize: 8,
      itemStyle: { color: '#0071e3', borderColor: '#fff', borderWidth: 2 },
      areaStyle: { 
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0, 113, 227, 0.2)' }, 
          { offset: 1, color: 'rgba(0, 113, 227, 0)' }
        ]) 
      },
      lineStyle: { width: 3, shadowColor: 'rgba(0, 113, 227, 0.2)', shadowBlur: 10 }
    }]
  }
  myChart.setOption(option)
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => myChart?.resize())
})

watch(() => store.last7DaysData, () => {
  if (myChart) updateChart()
}, { deep: true })

</script>

<template>
  <div class="home-view">
    <TheNavbar />
    
    <main class="content">
      <section class="hero fade-up">
        <div class="hero-text">
          <h2 class="section-tag">个人碳足迹监测</h2>
          <h1 class="title">自然，<br>触手可及。</h1>
          <p class="subtitle">每一次低碳选择，都是给未来的一份礼物。</p>
          <button class="cta-btn" @click="showModal = true">
            开始记录 <el-icon><ArrowRight /></el-icon>
          </button>
        </div>
        
        <div class="hero-image-box interactive-container">
          <swiper
            :modules="swiperModules"
            :slides-per-view="1"
            :space-between="0"
            :loop="true"
            effect="fade"
            :autoplay="{ delay: 4000, disableOnInteraction: false }"
            :speed="1200"
            class="hero-swiper"
          >
            <swiper-slide v-for="(img, index) in heroImages" :key="index">
              <img :src="img" class="hero-img-slider" alt="Hero Image" />
            </swiper-slide>
          </swiper>
          <div class="hero-overlay"></div>
        </div>
      </section>

      <section class="dashboard fade-up delay">
        <div class="bento-card wide white-card">
          <div class="stat-info">
            <div class="card-header">
              <span class="label">累计排放</span>
              <el-icon color="#0071e3"><Odometer /></el-icon>
            </div>
            <div class="value-group">
              <div class="value">{{ store.totalCo2Saved.toFixed(2) }}</div>
              <span class="unit">kg</span>
            </div>
            <div class="tag">数据实时同步</div>
          </div>
          <div class="chart-container" ref="chartRef"></div>
        </div>
      </section>

    </main>

    <RecordModal v-model:visible="showModal" />
  </div>
</template>

<style scoped>
/* --- 核心新增：果冻弹跳动画关键帧 --- */
@keyframes jelly-bounce {
  0%   { transform: scale(1.05); } /* 初始状态 */
  30%  { transform: scale(1.15) skewX(-1deg); } /* 快速放大并轻微倾斜 */
  50%  { transform: scale(1.08) skewX(0.5deg); } /* 回弹 */
  70%  { transform: scale(1.12); } /* 小幅波动 */
  100% { transform: scale(1.1); } /* 停留在微微放大的状态 */
}

.home-view { min-height: 100vh; padding-top: 50px; background-color: #f5f5f7; }
.content { max-width: 1000px; margin: 0 auto; padding: 60px 20px; }

/* Hero Section */
.hero { display: flex; align-items: center; justify-content: space-between; gap: 40px; margin-bottom: 40px; height: 480px; }
.hero-text { flex: 1; max-width: 400px; z-index: 2; }
.section-tag { color: #f56300; font-size: 16px; font-weight: 600; margin-bottom: 5px; }
.title { font-size: 56px; line-height: 1.05; font-weight: 700; margin: 0 0 20px; letter-spacing: -1px; }
.subtitle { font-size: 20px; color: #86868b; margin-bottom: 30px; line-height: 1.4; }
.cta-btn { background: #0071e3; color: #fff; border: none; padding: 18px 36px; border-radius: 98px; font-size: 17px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
.cta-btn:hover { transform: scale(1.03); background: #0077ed; box-shadow: 0 10px 20px rgba(0,113,227,0.3); }

/* Swiper & 果冻交互 */
.hero-image-box { 
  flex: 1.5; height: 100%; border-radius: 30px; overflow: hidden; 
  box-shadow: 0 20px 40px rgba(0,0,0,0.1); position: relative; 
  /* 增加鼠标样式指示 */
  cursor: pointer;
}
.hero-swiper { width: 100%; height: 100%; }

/* 图片基础状态：缓慢移动 */
.hero-img-slider { 
  width: 100%; height: 100%; object-fit: cover; 
  transform: scale(1.05); 
  /* 这里的长过渡用于鼠标移开时的平滑恢复 */
  transition: transform 4s cubic-bezier(0.25, 0.46, 0.45, 0.94); 
  will-change: transform; /* 性能优化 */
}

/* ★★★ 鼠标悬停触发果冻特效 ★★★ */
/* 使用容器 hover 来触发内部图片的动画，体验更稳定 */
.interactive-container:hover .hero-img-slider {
  /* 鼠标放上去时，禁用原有的长过渡，立即执行动画 */
  transition: none;
  /* 执行 0.8s 的果冻动画，forwards 表示动画结束后停留在最后一帧 (scale 1.1) */
  animation: jelly-bounce 0.8s cubic-bezier(0.25, 0.8, 0.25, 1.5) forwards;
}

.hero-overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(0,0,0,0.05), transparent); pointer-events: none; z-index: 1; }

/* Dashboard */
.dashboard { width: 100%; }
.bento-card { border-radius: 24px; overflow: hidden; position: relative; box-shadow: 2px 4px 12px rgba(0,0,0,0.05); }
.white-card { background: #fff; padding: 30px; display: flex; flex-direction: row; align-items: center; justify-content: space-between; height: 320px; }
.stat-info { flex: 0 0 220px; display: flex; flex-direction: column; height: 100%; justify-content: center; }
.card-header { display: flex; justify-content: space-between; margin-bottom: 10px; color: #86868b; font-weight: 600; }
.value-group { margin: 10px 0 20px; }
.value { font-size: 72px; font-weight: 700; letter-spacing: -2px; line-height: 1; color: #1d1d1f; }
.unit { font-size: 24px; color: #86868b; margin-left: 5px; }
.tag { background: #eaffea; color: #009900; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; width: fit-content; }
.chart-container { flex: 1; height: 100%; width: 100%; }

/* Animation */
.fade-up { animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(30px); }
.delay { animation-delay: 0.2s; }
@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
</style>