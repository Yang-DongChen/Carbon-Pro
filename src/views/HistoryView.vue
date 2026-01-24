<script setup>
import { computed } from 'vue'
import TheNavbar from '../components/TheNavbar.vue'
import { useCarbonStore } from '../stores/carbon'
import { Bicycle, Food, Lightning, Delete, Clock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useCarbonStore()

// 映射图标和颜色
const typeConfig = {
  traffic: { icon: Bicycle, color: '#0071e3', label: '交通出行' },
  food:    { icon: Food, color: '#ff9500', label: '饮食消费' },
  energy:  { icon: Lightning, color: '#34c759', label: '家庭能耗' }
}

// 核心逻辑：将记录按“日期”分组
const groupedRecords = computed(() => {
  const groups = {}
  // 按时间倒序排列
  const sorted = [...store.records].sort((a, b) => b.timestamp - a.timestamp)
  
  sorted.forEach(record => {
    if (!groups[record.date]) {
      groups[record.date] = []
    }
    groups[record.date].push(record)
  })
  return groups
})

// 删除功能
const handleDelete = (record) => {
  ElMessageBox.confirm('确定要删除这条记录吗？积分将被扣回。', '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = store.records.indexOf(record)
    if (index > -1) {
      store.records.splice(index, 1)
      ElMessage.success('记录已删除')
    }
  }).catch(() => {})
}
</script>

<template>
  <div class="history-page">
    <TheNavbar />
    
    <main class="content">
      <div class="page-header">
        <h1><el-icon><Clock /></el-icon> 历史足迹</h1>
        <p>您为地球做出的每一次贡献，都值得被记录。</p>
      </div>

      <div v-if="store.records.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>暂无记录，快去首页添加第一笔碳足迹吧！</p>
      </div>

      <div v-else class="timeline-container">
        <div v-for="(list, date) in groupedRecords" :key="date" class="date-group">
          <div class="date-header">{{ date }}</div>
          
          <div class="record-list">
            <div v-for="item in list" :key="item.timestamp" class="record-item">
              <div class="icon-box" :style="{ background: typeConfig[item.type].color }">
                <el-icon><component :is="typeConfig[item.type].icon" /></el-icon>
              </div>
              
              <div class="info-box">
                <div class="item-title">{{ typeConfig[item.type].label }}</div>
                <div class="item-details">
                  <span class="detail-tag">录入: <strong>{{ item.value }}</strong></span>
                  <span class="detail-divider">/</span>
                  <span class="detail-tag">减排: <strong>{{ item.co2 }} kg</strong></span>
                </div>
              </div>

              <div class="action-box">
                <span class="time-tag">{{ new Date(item.timestamp).getHours() }}:{{ String(new Date(item.timestamp).getMinutes()).padStart(2, '0') }}</span>
                <button class="del-btn" @click="handleDelete(item)" title="删除记录">
                  <el-icon><Delete /></el-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </main>
  </div>
</template>

<style scoped>
.history-page { min-height: 100vh; padding-top: 52px; background: #f5f5f7; }

/* --- 核心修改：宽度增加到 1100px --- */
.content { max-width: 1100px; margin: 0 auto; padding: 40px 30px; }

.page-header { margin-bottom: 40px; }
.page-header h1 { font-size: 36px; margin: 0 0 8px; color: #1d1d1f; display: flex; align-items: center; gap: 12px; letter-spacing: -0.5px; }
.page-header p { color: #86868b; font-size: 16px; }

/* 空状态 */
.empty-state { text-align: center; padding: 80px 0; color: #86868b; }
.empty-icon { font-size: 80px; margin-bottom: 24px; opacity: 0.5; }

/* 列表样式 */
.date-group { margin-bottom: 40px; animation: slideUp 0.5s ease forwards; }

.date-header { 
  font-size: 14px; color: #86868b; font-weight: 700; margin-bottom: 12px; 
  padding-left: 12px; text-transform: uppercase; letter-spacing: 1px;
  position: sticky; top: 60px; z-index: 10; 
  background: linear-gradient(180deg, #f5f5f7 80%, rgba(245,245,247,0) 100%); /* 防止文字重叠的渐变背景 */
  display: inline-block; width: 100%;
}

.record-list { 
  background: white; border-radius: 24px; overflow: hidden; 
  box-shadow: 0 4px 20px rgba(0,0,0,0.03); 
  border: 1px solid rgba(0,0,0,0.02);
}

.record-item { 
  display: flex; align-items: center; 
  padding: 20px 24px; /* 增加内边距，让条目更舒展 */
  border-bottom: 1px solid #f5f5f7; transition: background 0.2s;
}
.record-item:last-child { border-bottom: none; }
.record-item:hover { background: #fafafa; }

.icon-box { 
  width: 48px; height: 48px; border-radius: 14px; /* 图标稍大一点 */
  display: flex; align-items: center; justify-content: center; 
  color: white; font-size: 24px; margin-right: 20px; flex-shrink: 0;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.info-box { flex: 1; }
.item-title { font-size: 17px; font-weight: 600; color: #1d1d1f; margin-bottom: 6px; }

.item-details { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #666; }
.detail-tag strong { color: #1d1d1f; font-weight: 600; }
.detail-divider { color: #e5e5e5; font-size: 12px; }

.action-box { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; min-width: 60px; }
.time-tag { font-size: 13px; color: #aaa; font-variant-numeric: tabular-nums; }

.del-btn { 
  border: none; background: #fff1f0; color: #ff3b30; cursor: pointer; 
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transform: translateX(10px); transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1); 
}
.record-item:hover .del-btn { opacity: 1; transform: translateX(0); } /* 悬停时平滑出现 */
.del-btn:hover { background: #ff3b30; color: white; }

@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>