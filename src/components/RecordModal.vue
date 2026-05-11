<script setup>
import { ref, computed } from "vue";
import { useCarbonStore } from "../stores/carbon";
import { ElMessage } from "element-plus";
import { Close, Check } from "@element-plus/icons-vue";

const props = defineProps(["visible"]);
const emit = defineEmits(["update:visible", "saved"]);
const store = useCarbonStore();
const scenarios = [
  {
    id: "subway",
    label: "地铁出行",
    desc: "替代私家车",
    icon: "🚇",
    type: "traffic",
    unit: "km",
    factor: 0.18,
    min: 1,
    max: 50,
    default: 10,
    color: "#0071e3",
  },
  {
    id: "bus",
    label: "公交出行",
    desc: "绿色公共交通",
    icon: "🚌",
    type: "traffic",
    unit: "km",
    factor: 0.15,
    min: 1,
    max: 30,
    default: 5,
    color: "#5e5ce6",
  },
  {
    id: "bike",
    label: "骑行/步行",
    desc: "零碳出行",
    icon: "🚲",
    type: "traffic",
    unit: "km",
    factor: 0.25,
    min: 1,
    max: 20,
    default: 2,
    color: "#34c759",
  },
  {
    id: "veggie",
    label: "素食餐饮",
    desc: "替代肉食餐",
    icon: "🥗",
    type: "food",
    unit: "餐",
    factor: 1.2,
    min: 1,
    max: 3,
    default: 1,
    color: "#ff9500",
  },
  {
    id: "cup",
    label: "自带水杯",
    desc: "减少塑料使用",
    icon: "🥤",
    type: "food",
    unit: "次",
    factor: 0.08,
    min: 1,
    max: 5,
    default: 1,
    color: "#ac8e68",
  },
  {
    id: "ac_save",
    label: "空调节能",
    desc: "调高1度/定时",
    icon: "❄️",
    type: "energy",
    unit: "小时",
    factor: 0.3,
    min: 1,
    max: 10,
    default: 4,
    color: "#30b0c7",
  },
];

const activeScenario = ref(null);
//记录用户当前点开了哪一个具体场景
const sliderValue = ref(0);

const selectScenario = (item) => {
  activeScenario.value = item;
  sliderValue.value = item.default;
};
//?????

const previewResult = computed(() => {
  if (!activeScenario.value) return { co2: 0, points: 0 };
  const val = sliderValue.value;
  const co2 = (val * activeScenario.value.factor).toFixed(2);
  const points = Math.floor(co2 * 10);
  return { co2, points };
});

const handleClose = () => {
  emit("update:visible", false);
  setTimeout(() => {
    activeScenario.value = null;
  }, 300);
};

const handleSave = () => {
  store.addRecord(sliderValue.value, activeScenario.value.type);
  ElMessage({
    message: `记录成功！减排 ${previewResult.value.co2} kg，积分 +${previewResult.value.points}`,
    type: "success",
    duration: 3000,
    offset: 60, // 手机端提示稍微靠下一点
  });
  emit("saved");
  handleClose();
};
</script>

<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-card fade-up">
      <div class="drag-handle"></div>
      <div class="modal-header">
        <div class="header-text">
          <h3>记录低碳行为</h3>
          <p>选择您今天完成的环保行动</p>
        </div>
        <button class="close-btn" @click="handleClose">
          <el-icon><Close /></el-icon>
        </button>
      </div>

      <div v-if="!activeScenario" class="scenarios-wrapper">
        <div class="scenarios-grid">
          <div
            v-for="item in scenarios"
            :key="item.id"
            class="scenario-item"
            @click="selectScenario(item)"
          >
            <div
              class="scenario-icon"
              :style="{ background: item.color + '15', color: item.color }"
            >
              {{ item.icon }}
            </div>
            <div class="scenario-text">
              <span class="scenario-label">{{ item.label }}</span>
              <span class="scenario-desc">{{ item.desc }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="slider-panel fade-in">
        <div class="selected-header" @click="activeScenario = null">
          <span class="back-text">
            <el-icon style="margin-right: 4px; vertical-align: middle">
              <ArrowLeft />
            </el-icon>
            返回
          </span>
          <div
            class="current-tag"
            :style="{ background: activeScenario.color }"
          >
            {{ activeScenario.icon }} {{ activeScenario.label }}
          </div>
        </div>

        <div class="input-display">
          <span class="big-number">{{ sliderValue }}</span>
          <span class="unit">{{ activeScenario.unit }}</span>
        </div>

        <div class="slider-container">
          <el-slider
            v-model="sliderValue"
            :min="activeScenario.min"
            :max="activeScenario.max"
            :show-tooltip="false"
            size="large"
            :style="{ '--el-slider-main-bg-color': activeScenario.color }"
          />
          <div class="slider-labels">
            <span>{{ activeScenario.min }}</span>
            <span>{{ activeScenario.max }}</span>
          </div>
        </div>

        <div class="live-preview">
          <div class="preview-item">
            <span class="p-label">成功减排</span>
            <span class="p-val green-text">
              -{{ previewResult.co2 }} <small>kg</small>
            </span>
          </div>
          <div class="preview-divider"></div>
          <div class="preview-item">
            <span class="p-label">获得奖励</span>
            <span class="p-val highlight">
              +{{ previewResult.points }} <small>pts</small>
            </span>
          </div>
        </div>

        <button
          class="confirm-btn"
          @click="handleSave"
          :style="{ background: activeScenario.color }"
        >
          <el-icon style="margin-right: 6px"><Check /></el-icon> 
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 遮罩层：手机端 flex-end 到底部 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

/* 弹窗卡片：类似 iOS Bottom Sheet */
.modal-card {
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 24px 24px 0 0;
  padding: 24px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.1);
  padding-bottom: calc(
    20px + env(safe-area-inset-bottom)
  ); /* 适配 iPhone 底部黑条 */
  max-height: 85vh; /* 防止太高溢出屏幕 */
  overflow-y: auto; /* 内容过多可滚动 */
  position: relative;
}

/* 顶部装饰条 */
.drag-handle {
  width: 40px;
  height: 5px;
  background: #e5e5e5;
  border-radius: 3px;
  margin: 0 auto 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.header-text h3 {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
}
.header-text p {
  margin: 0;
  font-size: 13px;
  color: #86868b;
}

/* 关闭按钮优化 */
.close-btn {
  border: none;
  background: #f2f2f7;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868b;
}
.close-btn:active {
  background: #e5e5ea;
}

/* 场景网格优化：间距调整 */
.scenarios-wrapper {
  overflow-y: auto;
}
.scenarios-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.scenario-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fbfbfd;
  border: 1px solid #f2f2f7;
  padding: 16px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  /* 增加点击反馈 */
  touch-action: manipulation;
}
.scenario-item:active {
  transform: scale(0.98);
  background: #f5f5f7;
}

.scenario-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.scenario-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.scenario-label {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 2px;
}
.scenario-desc {
  font-size: 11px;
  color: #86868b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* --- 滑动面板 --- */
.slider-panel {
  animation: fadeIn 0.3s ease;
}

.selected-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  cursor: pointer;
  padding-bottom: 15px;
  border-bottom: 1px solid #f5f5f7;
}
.back-text {
  font-size: 14px;
  color: #0071e3;
  font-weight: 500;
}
.current-tag {
  padding: 6px 12px;
  border-radius: 20px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 核心数字显示 */
.input-display {
  text-align: center;
  margin-bottom: 20px;
}
.big-number {
  font-size: 56px; /* 稍微调小一点，防止手机换行 */
  font-weight: 700;
  color: #1d1d1f;
  line-height: 1;
  letter-spacing: -2px;
}
.unit {
  font-size: 18px;
  color: #86868b;
  font-weight: 500;
  margin-left: 4px;
}

/* 滑块 */
.slider-container {
  padding: 0 10px;
  margin-bottom: 30px;
}
.slider-labels {
  display: flex;
  justify-content: space-between;
  color: #c7c7cc;
  font-size: 12px;
  margin-top: 8px;
  font-weight: 600;
}

/* 预览卡片 */
.live-preview {
  background: #f5f5f7;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.p-label {
  font-size: 11px;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.p-val {
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
}
.green-text {
  color: #34c759;
}
.highlight {
  color: #ff9500;
}
.preview-divider {
  width: 1px;
  height: 30px;
  background: #e5e5ea;
}

/* 确认按钮 */
.confirm-btn {
  width: 100%;
  border: none;
  padding: 16px;
  border-radius: 16px;
  color: white;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.confirm-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* 动画 */
.fade-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 桌面端适配 (保持居中弹窗) */
@media (min-width: 768px) {
  .modal-overlay {
    align-items: center;
  }
  .modal-card {
    border-radius: 24px;
    padding-bottom: 30px;
    margin-bottom: 0;
    max-height: auto;
  }
  .drag-handle {
    display: none;
  }
  .scenarios-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .big-number {
    font-size: 64px;
  }
}
</style>
