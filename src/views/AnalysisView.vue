<script setup>
import { ref, computed, onMounted, watch } from "vue";
import TheNavbar from "../components/TheNavbar.vue";
import { useCarbonStore } from "../stores/carbon";
import * as echarts from "echarts";
import {
  DataAnalysis,
  Refresh,
  Trophy,
  WarnTriangleFilled,
  CircleCheckFilled,
} from "@element-plus/icons-vue";

const store = useCarbonStore();
const chartRef = ref(null);//空画布
const loading = ref(false);
const aiReport = ref("");
const isTyping = ref(false);
let myChart = null;

const analysisData = computed(() => {
  const records = store.records;
  const summary = {
    traffic: records
      .filter((r) => r.type === "traffic")//筛选器
      .reduce((sum, r) => sum + parseFloat(r.co2), 0),//遍历，算出最终的sum
    food: records
      .filter((r) => r.type === "food")
      .reduce((sum, r) => sum + parseFloat(r.co2), 0),
    energy: records
      .filter((r) => r.type === "energy")
      .reduce((sum, r) => sum + parseFloat(r.co2), 0),
    total: 0,
    count: records.length,
  };
  summary.total = summary.traffic + summary.food + summary.energy;
  return summary;
});

const generateReport = async () => { //异步
  if (analysisData.value.count === 0) {
    aiReport.value =
      "暂无数据。请先去首页添加一些碳排记录,AI 才能为您进行分析哦。";
    initChart();
    return;
  }

  loading.value = true;
  aiReport.value = "";

  setTimeout(() => {
    loading.value = false;
    const { traffic, food, energy, total } = analysisData.value;
    
    let content = `📊 Carbon AI 深度减排评估报告\n\n`;
    content += `**累计减少碳排放：${total.toFixed(2)} kg**\n\n`;
    content += `**💡 核心洞察：**\n`;

    if (traffic > food && traffic > energy) {
      content += `太棒了！您的**低碳出行**对减排贡献最大 (${traffic.toFixed(1)}kg)。继续保持乘坐公共交通的习惯，您是城市绿色出行的先锋。\n\n`;
    } else if (food > traffic && food > energy) {
      content += `数据显示**绿色饮食**是您的主要减排来源 (${food.toFixed(1)}kg)。素食和少用一次性餐具不仅健康，更对地球充满善意。\n\n`;
    } else {
      content += `您的**节能习惯**表现得非常出色！随手关灯、调高空调温度，这些日常小事已经为您积累了可观的减排成就。\n\n`;
    }
    content += `**🌟 AI 建议：**\n`;
    content += `- 您的低碳生活已初见成效，建议尝试解锁更多场景的环保行为！\n`;

    typeWriter(content);
    initChart();
  }, 1000);
};
// 打字机
const typeWriter = (text) => {
  isTyping.value = true;
  let i = 0;
  aiReport.value = "";
  const speed = 20;
  const type = () => {
    if (i < text.length) {
      aiReport.value += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else {
      isTyping.value = false;
    }
  };
  type();
};

const initChart = () => {
  if (!chartRef.value) return;
  if (!myChart) myChart = echarts.init(chartRef.value);
  const { traffic, food, energy } = analysisData.value;
  const isDataEmpty = traffic + food + energy === 0;
  const option = {
    tooltip: { trigger: "item" },
    legend: { bottom: "0%", left: "center" },
    series: [
      {
        name: "减排贡献构成",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: "#fff", borderWidth: 2 },
        label: { show: false, position: "center" },
        emphasis: { label: { show: true, fontSize: 20, fontWeight: "bold" } },
        data: isDataEmpty
          ? [{ value: 0, name: "暂无数据", itemStyle: { color: "#eee" } }]
          : [
              {
                value: traffic,
                name: "低碳出行",
                itemStyle: { color: "#0071e3" },
              },
              {
                value: food,
                name: "绿色饮食",
                itemStyle: { color: "#ff9500" },
              },
              {
                value: energy,
                name: "环保节能",
                itemStyle: { color: "#34c759" },
              },
            ],
      },
    ],
  };
  myChart.setOption(option);
};

watch(
  () => store.records,
  () => {
    generateReport();
  },
  { deep: true },
);

onMounted(() => {
  generateReport();
  window.addEventListener("resize", () => myChart?.resize());
});
</script>

<template>
  <div class="analysis-page">
    <TheNavbar />

    <main class="content">
      <div class="page-header">
        <h1>AI 智能分析</h1>
        <p>基于 {{ analysisData.count }} 条数据的深度洞察</p>
      </div>
      <div class="dashboard-grid">
        <div class="card report-card">
          <div class="card-header">
            <span class="title-icon">
              <el-icon><DataAnalysis /></el-icon> AI 评估报告
            </span>
            <button
              class="refresh-btn"
              @click="generateReport"
              :disabled="loading || isTyping"
            >
              <el-icon :class="{ spinning: loading }"><Refresh /></el-icon>
              重新分析
            </button>
          </div>

          <div class="report-body">
            <div v-if="loading" class="loading-state">
              <div class="ai-orb"></div>
              <p>AI 正在分析您的碳足迹数据...</p>
            </div>

            <div v-else class="markdown-content">
              <div
                v-html="
                  aiReport
                    .replace(/\n/g, '<br>')
                    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                "
              ></div>
              <span v-if="isTyping" class="cursor">|</span>
            </div>
          </div>
        </div>

        <div class="right-column">
          <div class="card chart-card">
            <h3>排放结构</h3>
            <div class="chart-box" ref="chartRef"></div>
          </div>

          <div class="card score-card">
            <h3>环保指数</h3>
            <div class="score-circle">
              <span class="score-num">{{
                Math.min(100, 60 + Math.floor(analysisData.total / 5)).toFixed(0)
              }}
              </span>
              <span class="score-label">分</span>
            </div>
            <p class="score-desc">
              击败了全国
              {{
                Math.min(
                  99,
                  Math.max(10, 10 + Math.floor(analysisData.total / 2)),
                ).toFixed(0)
              }}% 的用户
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.analysis-page {
  min-height: 100vh;
  padding-top: 52px;
  background: #f5f5f7;
}
.content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  margin-bottom: 30px;
}
.page-header h1 {
  font-size: 32px;
  margin: 0 0 5px;
  color: #1d1d1f;
}
.page-header p {
  color: #86868b;
  font-size: 14px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .report-card {
    min-height: 300px;
  }
}

/* 卡片通用样式 */
.card {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

/* AI 报告卡片 */
.report-card {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}
.title-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1d1d1f;
  font-size: 18px;
}
.title-icon .el-icon {
  color: #0071e3;
}

.refresh-btn {
  border: none;
  background: #f5f5f7;
  padding: 8px 16px;
  border-radius: 20px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  transition: 0.2s;
}
.refresh-btn:hover {
  background: #e5e5e5;
  color: #000;
}
.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.spinning {
  animation: spin 1s linear infinite;
}

.report-body {
  flex: 1;
  font-size: 15px;
  line-height: 1.8;
  color: #333;
}

/* AI Loading 动画 */
.loading-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #86868b;
  gap: 20px;
}
.ai-orb {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #0071e3, #00c6ff);
  border-radius: 50%;
  animation: pulse 1.5s infinite ease-in-out;
}

.markdown-content b {
  color: #0071e3;
  font-weight: 600;
}
.cursor {
  animation: blink 1s infinite;
  font-weight: 100;
  color: #0071e3;
}

/* 右侧图表区 */
.right-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.chart-card {
  height: 300px;
  display: flex;
  flex-direction: column;
}
.chart-card h3,
.score-card h3 {
  margin: 0 0 15px;
  font-size: 16px;
  color: #86868b;
}
.chart-box {
  flex: 1;
  width: 100%;
}

.score-card {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.score-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 6px solid #34c759;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}
.score-num {
  font-size: 36px;
  font-weight: 700;
  color: #1d1d1f;
  line-height: 1;
}
.score-label {
  font-size: 12px;
  color: #34c759;
  font-weight: 600;
}
.score-desc {
  color: #86868b;
  font-size: 12px;
  margin: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 113, 227, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 20px rgba(0, 113, 227, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 113, 227, 0);
  }
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
