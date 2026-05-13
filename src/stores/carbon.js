import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCarbonStore = defineStore('carbon', () => {
  const initialBadges = [
    { id: 1, title: '初次见面', icon: '🌱', desc: '完成第 1 次碳排记录', unlocked: false },
    { id: 2, title: '低碳先行者', icon: '🚀', desc: '累计减排达到 10kg', unlocked: false },
    { id: 3, title: '百里挑一', icon: '💎', desc: '累计记录达到 100 条', unlocked: false },
    { id: 4, title: '绿色饮食家', icon: '🥗', desc: '记录 10 次饮食碳排', unlocked: false },
    { id: 5, title: '行万里路', icon: '🚲', desc: '累计绿色出行 500km', unlocked: false },
    { id: 6, title: '地球卫士', icon: '🛡️', desc: '累计减排达到 100kg', unlocked: false }
  ]
  // --- State (状态) ---
  const records = ref([])
  const badges = ref(JSON.parse(JSON.stringify(initialBadges)))
  const points = ref(0)
  // ★★★ 新增：当前用户的唯一标识 (邮箱)
  const currentUserKey = ref('')

  // --- Getters (计算属性) ---
  const totalCo2Saved = computed(() => {
    return records.value.reduce((sum, r) => sum + parseFloat(r.co2), 0)
  })

  const userLevel = computed(() => {
    const total = totalCo2Saved.value
    if (total < 10) return { lv: 1, name: '萌芽期', next: 10, progress: (total / 10) * 100 }
    if (total < 50) return { lv: 2, name: '成长期', next: 50, progress: ((total - 10) / 40) * 100 }
    if (total < 100) return { lv: 3, name: '成熟期', next: 100, progress: ((total - 50) / 50) * 100 }
    return { lv: 4, name: '繁荣期', next: 9999, progress: 100 }
  })

  const last7DaysData = computed(() => {
    const days = []
    const values = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString()
      days.push(i === 0 ? '今天' : dateStr.slice(5))
      const dayRecords = records.value.filter(r => new Date(r.timestamp).toLocaleDateString() === dateStr)
      const dayTotal = dayRecords.reduce((sum, r) => sum + parseFloat(r.co2), 0)
      values.push(dayTotal)
    }
    return { days, values }
  })

  // --- Actions (动作) ---

  // ★★★ 核心修复1：根据用户邮箱加载数据
  function loadUserData(email) {
    if (!email) return
    currentUserKey.value = `terra_data_${email}` // 生成用户专属 Key

    // 尝试从本地读取该用户的数据
    const savedData = localStorage.getItem(currentUserKey.value)
    
    if (savedData) {
      // 如果有老数据，就加载
      const parsed = JSON.parse(savedData)
      records.value = parsed.records || []
      badges.value = parsed.badges || JSON.parse(JSON.stringify(initialBadges))
      points.value = parsed.points || 0
    } else {
      // 如果是新用户，初始化为空状态
      records.value = []
      badges.value = JSON.parse(JSON.stringify(initialBadges))
      points.value = 0
    }
  }

  // ★★★ 核心修复2：保存数据到用户专属 Key
  const saveState = () => {
    if (!currentUserKey.value) return // 未登录不保存
    
    const dataToSave = {
      records: records.value,
      badges: badges.value,
      points: points.value
    }
    localStorage.setItem(currentUserKey.value, JSON.stringify(dataToSave))
  }

  // ★★★ 核心修复3：退出登录时，只清内存，不删文件！
  function clearSession() {
    records.value = []
    points.value = 0
    badges.value = JSON.parse(JSON.stringify(initialBadges))
    currentUserKey.value = ''
    // 注意：这里不再调用 localStorage.removeItem，确保数据保留在硬盘上
  }

  function addRecord(val, type) {
    let co2 = 0
    if (type === 'traffic') co2 = val * 0.2
    if (type === 'food') co2 = val * 0.1
    if (type === 'energy') co2 = val * 0.5
    
    co2 = parseFloat(co2.toFixed(2))
    const earnedPoints = Math.floor(co2 * 10)

    records.value.push({
      id: Date.now(),
      value: val,
      type,
      co2,
      timestamp: Date.now(),
      date: new Date().toLocaleDateString()
    })

    points.value += earnedPoints
    checkBadges()
    saveState() // 保存

    return { co2, earnedPoints }
  }

  function checkBadges() {
    if (records.value.length >= 1 && !badges.value[0].unlocked) badges.value[0].unlocked = true
    if (totalCo2Saved.value >= 10 && !badges.value[1].unlocked) badges.value[1].unlocked = true
    if (records.value.length >= 100 && !badges.value[2].unlocked) badges.value[2].unlocked = true
    const foodCount = records.value.filter(r => r.type === 'food').length
    if (foodCount >= 10 && !badges.value[3].unlocked) badges.value[3].unlocked = true
    saveState() // 状态变了就保存
  }

  function redeem(cost) {
    if (points.value >= cost) {
      points.value -= cost
      saveState() // 积分变了就保存
      return true
    }
    return false
  }

  return { 
    records, badges, points, 
    totalCo2Saved, userLevel, last7DaysData,
    loadUserData, addRecord, redeem, clearSession
  }
})