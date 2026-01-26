import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { useCarbonStore } from './carbon'

export const useUserStore = defineStore('user', () => {
  // --- 初始化数据 ---
  const storedData = JSON.parse(localStorage.getItem('carbon_user_data')) || {
    name: '低碳达人',
    avatar: '', 
    role: 'user', 
    password: '123' 
  }

  const userInfo = ref(storedData)
  const isLoggedIn = ref(!!localStorage.getItem('carbon_is_logged_in'))
  const isMaintenance = ref(false)

  // 用户列表 (用于管理员后台)
  const defaultUserList = [
    { id: 101, name: 'Jason', email: 'jason@terra.com', role: 'user', status: 'normal' },
    { id: 102, name: 'Amy', email: 'amy@terra.com', role: 'user', status: 'banned' },
  ]
  const storedList = JSON.parse(localStorage.getItem('carbon_user_list')) || defaultUserList
  const userList = reactive(storedList)

  const saveState = () => {
    localStorage.setItem('carbon_user_data', JSON.stringify(userInfo.value))
    localStorage.setItem('carbon_user_list', JSON.stringify(userList))
  }

  // --- 核心动作 ---

  function login(form) {
    const inputEmail = (form.email || '').trim()
    const inputPwd = (form.password || '').trim()

    // 维护模式检查
    if (isMaintenance.value && inputEmail !== 'admin@terra.com') {
      return { success: false, msg: '🚧 系统正在停服维护中，请稍后访问。' }
    }

    // 管理员登录
    if (inputEmail === 'admin@terra.com' && inputPwd === 'admin123') {
      userInfo.value = { name: '超级管理员', avatar: '', role: 'admin', email: 'admin@terra.com', password: 'admin123' }
      isLoggedIn.value = true
      localStorage.setItem('carbon_is_logged_in', 'true')
      
      // ★★★ 修复点：管理员也可以有一套空的数据，或者不加载
      const carbonStore = useCarbonStore()
      carbonStore.loadUserData('admin@terra.com')
      
      return { success: true, role: 'admin' }
    }

    // 普通用户验证
    // 这里简单演示：只要密码不是 123 (默认) 且不是当前缓存密码就报错
    // (注意：真实项目这里应该遍历 userList 校验密码，目前为了简便，只校验当前 session 或默认密码)
    const storedUserInList = userList.find(u => u.email === inputEmail)
    // 如果是列表里的用户，这里默认密码假设都是 123 或者之前保存的
    // 为了不破坏您现有的逻辑，这里保留简单校验：
    if (inputPwd !== '123' && inputPwd !== userInfo.value.password) {
       return { success: false, msg: '密码错误 (默认密码 123)' }
    }
    
    // 登录成功逻辑
    // 更新 userInfo
    if (userInfo.value.name === '低碳达人' && inputEmail) {
      userInfo.value.name = inputEmail.split('@')[0]
    }
    userInfo.value.email = inputEmail // 确保记录了邮箱
    userInfo.value.role = 'user'
    
    isLoggedIn.value = true
    localStorage.setItem('carbon_is_logged_in', 'true')
    saveState()

    // ★★★ 核心修复：登录成功后，立刻加载这个用户的数据！
    const carbonStore = useCarbonStore()
    carbonStore.loadUserData(inputEmail)

    return { success: true, role: 'user' }
  }

  function register(form) {
    if (isMaintenance.value) return { success: false, msg: '维护期间暂停注册' }

    const inputEmail = form.email.trim()
    
    // 更新当前用户状态
    userInfo.value.name = inputEmail.split('@')[0] || '新用户'
    userInfo.value.email = inputEmail
    userInfo.value.password = form.password
    userInfo.value.avatar = ''
    userInfo.value.role = 'user'

    // 添加到管理员列表
    const exists = userList.find(u => u.email === inputEmail)
    if (!exists) {
      userList.push({
        id: Date.now(),
        name: userInfo.value.name,
        email: inputEmail,
        role: 'user',
        status: 'normal'
      })
    }

    isLoggedIn.value = true
    localStorage.setItem('carbon_is_logged_in', 'true')
    saveState()

    // ★★★ 核心修复：注册成功后，初始化该用户的数据 (加载会是空的，但 key 已经建立了)
    const carbonStore = useCarbonStore()
    carbonStore.loadUserData(inputEmail)
    
    return { success: true }
  }

  function logout() {
    isLoggedIn.value = false
    userInfo.value.role = 'user'
    localStorage.removeItem('carbon_is_logged_in')
    
    // ★★★ 核心修复：退出时，只清理内存，不删文件
    const carbonStore = useCarbonStore()
    carbonStore.clearSession()
  }

  function updateProfile(data) {
    if (data.name) userInfo.value.name = data.name
    if (data.avatar) userInfo.value.avatar = data.avatar
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