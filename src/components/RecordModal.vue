<script setup>
import { ref, computed } from 'vue'
import { useCarbonStore } from '../stores/carbon'
import { ElMessage } from 'element-plus'
import { Bicycle, Food, Lightning, Close } from '@element-plus/icons-vue'

const props = defineProps(['visible'])
const emit = defineEmits(['update:visible', 'saved'])
const store = useCarbonStore()

const activeType = ref('traffic')
const inputValue = ref('')

const types = [
  { id: 'traffic', icon: Bicycle, label: '出行', unit: 'km', color: '#0071e3' },
  { id: 'food', icon: Food, label: '饮食', unit: '元', color: '#ff9500' },
  { id: 'energy', icon: Lightning, label: '能耗', unit: '度', color: '#34c759' }
]

const currentTypeInfo = computed(() => types.find(t => t.id === activeType.value))

const handleClose = () => {
  emit('update:visible', false)
  inputValue.value = ''
}

const handleSave = () => {
  if (!inputValue.value) return ElMessage.warning('请输入数值')
  
  // ★★★ 修复核心：接收对象结果 ★★★
  const result = store.addRecord(parseFloat(inputValue.value), activeType.value)
  
  // ★★★ 修复核心：分别显示 CO2 和 积分 ★★★
  ElMessage({
    message: `记录成功！产生碳排放 ${result.co2} kg，获得积分 +${result.earnedPoints}`,
    type: 'success',
    duration: 3000
  })

  emit('saved')
  handleClose()
}
</script>

<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-card fade-up">
      <div class="modal-header">
        <h3>新增记录</h3>
        <button class="close-btn" @click="handleClose"><el-icon><Close /></el-icon></button>
      </div>

      <div class="type-selector">
        <div 
          v-for="t in types" 
          :key="t.id"
          class="type-item"
          :class="{ active: activeType === t.id }"
          @click="activeType = t.id"
          :style="activeType === t.id ? { background: t.color } : {}"
        >
          <el-icon><component :is="t.icon" /></el-icon>
          <span>{{ t.label }}</span>
        </div>
      </div>

      <div class="input-section">
        <div class="input-label">请输入{{ currentTypeInfo.label }}数值 ({{ currentTypeInfo.unit }})</div>
        <input 
          type="number" 
          v-model="inputValue" 
          class="big-input" 
          placeholder="0" 
          autofocus
        />
      </div>

      <button class="save-btn" @click="handleSave">确认记录</button>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px);
  z-index: 2000; display: flex; align-items: center; justify-content: center;
}
.modal-card {
  background: white; width: 320px; border-radius: 24px; padding: 24px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.modal-header h3 { margin: 0; font-size: 18px; }
.close-btn { border: none; background: #f0f0f0; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; }

.type-selector { display: flex; gap: 10px; margin-bottom: 30px; background: #f5f5f7; padding: 4px; border-radius: 16px; }
.type-item { 
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; 
  padding: 10px 0; border-radius: 12px; cursor: pointer; transition: 0.3s; color: #86868b;
  font-size: 12px;
}
.type-item.active { color: white; transform: scale(1.05); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.type-item .el-icon { font-size: 20px; margin-bottom: 2px; }

.input-section { margin-bottom: 30px; text-align: center; }
.input-label { color: #86868b; font-size: 14px; margin-bottom: 10px; }
.big-input { 
  width: 100%; border: none; border-bottom: 2px solid #eee; font-size: 40px; 
  text-align: center; font-weight: 700; color: #1d1d1f; outline: none; padding-bottom: 10px;
}
.big-input:focus { border-color: #0071e3; }

.save-btn { 
  width: 100%; background: #1d1d1f; color: white; border: none; padding: 16px; 
  border-radius: 16px; font-size: 16px; font-weight: 600; cursor: pointer; transition: 0.2s;
}
.save-btn:hover { background: #000; transform: scale(1.02); }

.fade-up { animation: fadeUp 0.3s ease; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>