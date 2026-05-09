import { defineStore } from 'pinia' // 定义一个全局共享的“仓库”
import { ref, reactive } from 'vue'
import { useCarbonStore } from './carbon'//引入了另一个碳排放数据仓库

export const useUserStore = defineStore('user', () => {
  // 1. 初始化数据 (从本地读取用户信息)
  const storedData = JSON.parse(localStorage.getItem('carbon_user_data'))



  const userInfo = ref(storedData)
  const isLoggedIn = ref(!!localStorage.getItem('carbon_is_logged_in'))
  const isMaintenance = ref(false)// 全局维护状态


  // 用户列表 (管理员用) - 优先从本地读取，确保持久化
  const defaultUserList = [
    { id: 101, name: 'Jason', email: 'jason@terra.com', role: 'user', status: 'normal' },
    { id: 102, name: 'Amy', email: 'amy@terra.com', role: 'user', status: 'banned' },
  ]

  const storedList = JSON.parse(localStorage.getItem('carbon_user_list')) || defaultUserList
  const userList = reactive(storedList)


  
  // 自动加载 Carbon 数据 (防止刷新丢失)
  if (isLoggedIn.value && userInfo.value.email) {
    setTimeout(() => {
      const carbonStore = useCarbonStore()
      carbonStore.loadUserData(userInfo.value.email)
    }, 0)
  }

  const saveState = () => {
    localStorage.setItem('carbon_user_data', JSON.stringify(userInfo.value))
    localStorage.setItem('carbon_user_list', JSON.stringify(userList))
  }

  // --- 核心动作 ---
  function login(form) {
    const inputEmail = (form.email || '').trim()
    const inputPwd = (form.password || '').trim()

    // 1. 维护模式检查
    if (isMaintenance.value && inputEmail !== 'admin@terra.com') {
      return { success: false, msg: '🚧 系统正在停服维护中，请稍后访问。' }
    }

    // 2. 管理员登录 (硬编码)
    if (inputEmail === 'admin@terra.com' && inputPwd === 'admin123') {
      userInfo.value = { name: '超级管理员', avatar: '', role: 'admin', email: 'admin@terra.com', password: 'admin123' }
      isLoggedIn.value = true
      localStorage.setItem('carbon_is_logged_in', 'true')
      
      const carbonStore = useCarbonStore()
      carbonStore.loadUserData('admin@terra.com')
      
      return { success: true, role: 'admin' }
    }

    // 3. 普通用户登录验证
    // 1. 先去花名册里找这个邮箱
    const existingUser = userList.find(u => u.email === inputEmail)
    
    // 【漏洞修复核心】：如果花名册里没有这个人，并且他也不是你刚在本地注册的那个账号
    if (!existingUser && inputEmail !== userInfo.value.email) {
      return { success: false, msg: '该账号不存在，请先注册或检查拼写' }
    }

    // 2. 检查是否被封禁
    if (existingUser && existingUser.status === 'banned') {
      return { success: false, msg: '该账号已被封禁，请联系管理员' }
    }

    // 3. 密码校验 (这里核对的是本地存储的真实密码)
    if (inputPwd !== userInfo.value.password) {
      return { success: false, msg: '密码错误，请重新输入' }
    }
    
    // 登录成功：同步用户信息
    if (existingUser) {
      // 如果是老用户，加载他的名字和角色
      userInfo.value.name = existingUser.name
      userInfo.value.role = existingUser.role
    } else {
      // 如果是新设备登录/新数据，使用默认名字
      userInfo.value.name = inputEmail.split('@')[0]
      userInfo.value.role = 'user'
    }
    
    userInfo.value.email = inputEmail
    isLoggedIn.value = true
    localStorage.setItem('carbon_is_logged_in', 'true')
    saveState()

    // 加载该用户的 Carbon 数据
    const carbonStore = useCarbonStore()
    carbonStore.loadUserData(inputEmail)

    return { success: true, role: 'user' }
  }

  function register(form) {
    if (isMaintenance.value) return { success: false, msg: '维护期间暂停注册' }

    const inputEmail = form.email.trim()
    
    // 更新当前登录态
    userInfo.value.name = inputEmail.split('@')[0] || '新用户'
    userInfo.value.email = inputEmail
    userInfo.value.password = form.password
    userInfo.value.avatar = ''
    userInfo.value.role = 'user'

    // 添加到用户列表 (如果不存在)
    const exists = userList.find(u => u.email === inputEmail)
    if (!exists) {
      userList.push({
        id: Date.now(),
        name: userInfo.value.name,
        email: inputEmail,
        role: 'user',
        status: 'normal'
      })
    } else {
      // 如果已存在，更新列表里的名字
      exists.name = userInfo.value.name
    }

    isLoggedIn.value = true
    localStorage.setItem('carbon_is_logged_in', 'true')
    saveState()

    // 初始化数据
    const carbonStore = useCarbonStore()
    carbonStore.loadUserData(inputEmail)
    
    return { success: true }
  }

  function logout() {
    isLoggedIn.value = false
    userInfo.value.role = 'user'
    localStorage.removeItem('carbon_is_logged_in')
    
    // 清除 Carbon Store 的会话数据 (但不删本地文件)
    const carbonStore = useCarbonStore()
    carbonStore.clearSession()
  }

  function updateProfile(data) {
    if (data.name) userInfo.value.name = data.name
    if (data.avatar) userInfo.value.avatar = data.avatar
    
    // 同步更新用户列表里的数据
    const currentUserInList = userList.find(u => u.email === userInfo.value.email)
    if (currentUserInList && data.name) currentUserInList.name = data.name
    
    saveState()
  }

  function changePassword(oldPwd, newPwd) {
    if (oldPwd !== userInfo.value.password) return false
    userInfo.value.password = newPwd
    saveState()
    return true
  }

  const toggleMaintenance = (status) => { isMaintenance.value = status }
  const toggleUserStatus = (row) => { row.status = row.status === 'normal' ? 'banned' : 'normal' }

  return { 
    userInfo, isLoggedIn, isMaintenance, userList,
    login, register, logout, updateProfile, changePassword,
    toggleMaintenance, toggleUserStatus
  }
})