<script setup>
import { ref, onMounted, watch } from "vue";
import TheNavbar from "../components/TheNavbar.vue";
import RecordModal from "../components/RecordModal.vue";
import { useCarbonStore } from "../stores/carbon";
import * as echarts from "echarts";
import { ArrowRight, Odometer } from "@element-plus/icons-vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/effect-fade";

const store = useCarbonStore();
const showModal = ref(false);
const chartRef = ref(null);
let myChart = null;
const heroImages = [
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2560&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501854140884-074bf64cad1c?q=80&w=2560&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=2560&auto=format&fit=crop",
];
const swiperModules = [Autoplay, EffectFade];

const initChart = () => {
  if (!chartRef.value) return;
  myChart = echarts.init(chartRef.value);
  updateChart();
};

const updateChart = () => {
  const { days, values } = store.last7DaysData;
  const option = {
    grid: { top: 30, right: 20, bottom: 20, left: 40, containLabel: true },
    tooltip: {
      trigger: "axis",
      formatter: "{b} <br/> 减排量: {c} kg",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderColor: "#eee",
      textStyle: { color: "#1d1d1f" },
    },
    xAxis: {
      type: "category",
      data: days,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#86868b", fontSize: 12 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { type: "dashed", color: "#f0f0f0" } },
      axisLabel: { color: "#86868b" },
    },
    series: [
      {
        data: values,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        itemStyle: { color: "#34c759", borderColor: "#fff", borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(52, 199, 89, 0.15)" },
            { offset: 1, color: "rgba(52, 199, 89, 0)" },
          ]),
        },
        lineStyle: {
          width: 3,
          shadowColor: "rgba(52, 199, 89, 0.2)",
          shadowBlur: 10,
        },
      },
    ],
  };
  myChart.setOption(option);
};

onMounted(() => {
  initChart();
  window.addEventListener("resize", () => myChart?.resize());
});
watch(
  () => store.records,
  () => {
    if (myChart) updateChart();
  },
  { deep: true },
);
</script>

<template>
  <div class="home-view">
    <TheNavbar />
    <main class="content">
      <section class="hero fade-up">
        <div class="hero-text">
          <h2 class="section-tag">个人碳足迹监测</h2>
          <h1 class="title">自然，<br />触手可及。</h1>
          <p class="subtitle">
            每一次低碳选择，都是给未来的一份礼物。记录减排，改变世界。
          </p>
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
            <swiper-slide v-for="(img, index) in heroImages" :key="index"
              ><img :src="img" class="hero-img-slider" alt="Hero Image"
            /></swiper-slide>
          </swiper>

          <div class="glass-overlay">
            <div class="glass-badge">
              <span class="badge-dot"></span>Live Eco
            </div>
          </div>
        </div>
      </section>

      <section class="dashboard fade-up delay">
        <div class="bento-card wide white-card">
          <div class="stat-info">
            <div class="card-header">
              <span class="label">累计减排</span>
              <el-icon color="#34c759"><Odometer /></el-icon>
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
@keyframes jelly-bounce {
  0% {
    transform: scale(1.05);
  }
  30% {
    transform: scale(1.15) skewX(-2deg);
  }
  50% {
    transform: scale(1.08) skewX(1deg);
  }
  70% {
    transform: scale(1.12);
  }
  100% {
    transform: scale(1.1);
  }
}
.home-view {
  min-height: 100vh;
  padding-top: 50px;
  background-color: var(--bg-page);
}
.content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 60px 20px;
}
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 60px;
  margin-bottom: 60px;
  height: 480px;
}
.hero-text {
  flex: 0.8;
  z-index: 2;
}
.section-tag {
  color: #f56300;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.title {
  font-size: 56px;
  line-height: 1.05;
  font-weight: 800;
  margin: 0 0 24px;
  letter-spacing: -2px;
  color: var(--text-primary);
}
.subtitle {
  font-size: 20px;
  color: var(--text-secondary);
  margin-bottom: 36px;
  line-height: 1.5;
  font-weight: 400;
}
.cta-btn {
  background: var(--text-primary);
  color: var(--bg-card);
  border: none;
  padding: 16px 32px;
  border-radius: 98px;
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.cta-btn:hover {
  background: var(--accent-color);
  color: white;
  transform: scale(1.02);
  padding-right: 28px;
}
.hero-image-box {
  flex: 1.2;
  height: 100%;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.12);
  position: relative;
  cursor: pointer;
  transform: translateZ(0);
  background: #000;
}
.hero-swiper {
  width: 100%;
  height: 100%;
}
.hero-img-slider {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.05);
  transition: transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
  opacity: 0.9;
}
.interactive-container:hover .hero-img-slider {
  transition: none;
  animation: jelly-bounce 0.8s cubic-bezier(0.25, 0.8, 0.25, 1.5) forwards;
  opacity: 1;
}
.glass-overlay {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 10;
  pointer-events: none;
}
.glass-badge {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px) saturate(180%);
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.badge-dot {
  width: 6px;
  height: 6px;
  background: #34c759;
  border-radius: 50%;
  box-shadow: 0 0 8px #34c759;
}
.dashboard {
  width: 100%;
}
.bento-card {
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--border-color);
}
.white-card {
  background: var(--bg-card);
  padding: 30px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 320px;
}
.stat-info {
  flex: 0 0 220px;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 14px;
}
.value-group {
  margin: 10px 0 20px;
}
.value {
  font-size: 64px;
  font-weight: 700;
  letter-spacing: -2px;
  line-height: 1;
  color: var(--text-primary);
}
.unit {
  font-size: 20px;
  color: var(--text-secondary);
  margin-left: 4px;
  font-weight: 500;
}
.tag {
  background: var(--input-bg);
  color: var(--text-primary);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;
}
.chart-container {
  flex: 1;
  height: 100%;
  width: 100%;
}
.fade-up {
  animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
  transform: translateY(30px);
}
.delay {
  animation-delay: 0.2s;
}
@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    height: auto;
    gap: 30px;
    margin-bottom: 40px;
  }
  .hero-text {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .title {
    font-size: 40px;
  }
  .hero-image-box {
    width: 100%;
    height: 300px;
  }
  .white-card {
    flex-direction: column;
    height: auto;
    gap: 20px;
  }
  .stat-info {
    width: 100%;
    text-align: center;
    flex: 0 0 auto;
  }
  .chart-container {
    height: 250px;
  }
}
</style>
