import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { ElNotification } from 'element-plus'

export const useCarbonStore = defineStore('carbon', () => {
  // --- 基础数据 ---
  const records = ref(JSON.parse(localStorage.getItem('carbon_records')) || [])
  const points = ref(parseInt(localStorage.getItem('carbon_points')) || 1250)
  
  // --- 成就系统数据 ---
  const totalCo2Saved = computed(() => records.value.reduce((sum, r) => sum + parseFloat(r.co2), 0))
  const recordCount = computed(() => records.value.length)
  
  // 勋章定义
  const defaultBadges = [
    { id: 1, title: '初次见面', desc: '完成第 1 次碳排记录', icon: '🌱', condition: (s) => s.recordCount >= 1, unlocked: false },
    { id: 2, title: '低碳先行者', desc: '累计记录达到 10 次', icon: '🚀', condition: (s) => s.recordCount >= 10, unlocked: false },
    { id: 3, title: '百里挑一', desc: '累计减排 CO2 超过 100kg', icon: '💎', condition: (s) => s.totalCo2Saved >= 100, unlocked: false },
    { id: 4, title: '绿色饮食家', desc: '记录饮食低碳行为 5 次', icon: '🥗', condition: (s) => s.records.filter(r => r.type === 'food').length >= 5, unlocked: false },
    { id: 5, title: '行万里路', desc: '绿色出行累计超过 500km', icon: '🚲', condition: (s) => s.records.filter(r => r.type === 'traffic').reduce((sum, r) => sum + parseFloat(r.value), 0) >= 500, unlocked: false },
    { id: 6, title: '地球卫士', desc: '拥有 5000 积分存款', icon: '🌍', condition: (s) => s.points >= 5000, unlocked: false },
  ]

  // 读取或初始化勋章
  const savedBadges = JSON.parse(localStorage.getItem('carbon_badges'))
  const badges = ref(savedBadges ? mergeBadges(defaultBadges, savedBadges) : defaultBadges)

  function mergeBadges(defaults, saved) {
    return defaults.map(d => {
      const found = saved.find(s => s.id === d.id)
      if (found && found.unlocked) d.unlocked = true
      return d
    })
  }

  // --- 监听保存 ---
  watch(records, (newVal) => localStorage.setItem('carbon_records', JSON.stringify(newVal)), { deep: true })
  watch(points, (newVal) => localStorage.setItem('carbon_points', newVal.toString()))
  watch(badges, (newVal) => localStorage.setItem('carbon_badges', JSON.stringify(newVal)), { deep: true })

  // --- 检查成就 ---
  function checkAchievements() {
    const state = { recordCount: recordCount.value, totalCo2Saved: totalCo2Saved.value, records: records.value, points: points.value }
    badges.value.forEach(badge => {
      if (!badge.unlocked && badge.condition(state)) {
        badge.unlocked = true
        ElNotification({ title: '解锁新勋章！', message: `恭喜获得「${badge.title}」`, type: 'success' })
      }
    })
  }

  // --- 添加记录 ---
  function addRecord(value, type) {
    const factors = { traffic: { factor: 0.15, reward: 50 }, food: { factor: 0.08, reward: 30 }, energy: { factor: 0.785, reward: 20 } }
    const factorInfo = factors[type]
    const co2 = (parseFloat(value) * factorInfo.factor).toFixed(2)
    let earnedPoints = factorInfo.reward
    
    // 暴击逻辑
    const isCrit = Math.random() > 0.9
    if (isCrit) earnedPoints *= 2

    points.value += earnedPoints
    records.value.push({ type, value, co2, date: new Date().toLocaleDateString(), timestamp: Date.now() })
    
    checkAchievements() // 检查成就
    return { co2, earnedPoints }
  }

  // --- 兑换 ---
  function redeem(cost) {
    if (points.value >= cost) {
      points.value -= cost
      return true
    }
    return false
  }

  // --- 等级计算 ---
  const userLevel = computed(() => {
    const score = totalCo2Saved.value
    if (score < 50) return { name: '环保萌新', lv: 1, next: 50, progress: (score/50)*100 }
    if (score < 200) return { name: '低碳达人', lv: 2, next: 200, progress: ((score-50)/150)*100 }
    if (score < 500) return { name: '森林守护者', lv: 3, next: 500, progress: ((score-200)/300)*100 }
    return { name: '地球卫士', lv: 4, next: 9999, progress: 100 }
  })

  // 7天数据
  const last7DaysData = computed(() => {
    const days = []; const values = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString()
      days.push(`${d.getMonth() + 1}/${d.getDate()}`)
      const daySum = records.value.filter(r => r.date === dateStr).reduce((sum, r) => sum + parseFloat(r.co2), 0)
      values.push(daySum.toFixed(2))
    }
    return { days, values }
  })

  return { records, points, totalCo2Saved, badges, userLevel, last7DaysData, addRecord, redeem }
})