import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 1. 初始化数据：优先从 localStorage 读取
  const storedData = JSON.parse(localStorage.getItem('carbon_user_data')) || {
    name: '低碳达人',
    avatar: '', 
    password: '123' // 默认初始密码
  }

  const userInfo = ref(storedData)
  const isLoggedIn = ref(!!localStorage.getItem('carbon_is_logged_in'))

  // 保存数据通用方法
  const saveState = () => {
    localStorage.setItem('carbon_user_data', JSON.stringify(userInfo.value))
  }

  // --- 核心动作 ---

  // 1. 登录
  function login(form) {
    if (form.password !== userInfo.value.password) {
      return false // 密码错误
    }
    // 如果是默认名字且用邮箱登录，自动把邮箱前缀当名字
    if (userInfo.value.name === '低碳达人' && form.email) {
      userInfo.value.name = form.email.split('@')[0]
    }
    
    isLoggedIn.value = true
    localStorage.setItem('carbon_is_logged_in', 'true')
    saveState()
    return true
  }

  // 2. 注册 (本次修复的核心)
  function register(form) {
    // 将注册表单的数据，写入到 userInfo
    userInfo.value.name = form.email.split('@')[0] || '新用户' // 简单处理：用邮箱前缀做昵称
    userInfo.value.password = form.password
    userInfo.value.avatar = '' // 新用户没头像

    // 注册即登录
    isLoggedIn.value = true
    localStorage.setItem('carbon_is_logged_in', 'true')
    
    // 保存到本地
    saveState()
    return true
  }

  // 3. 退出
  function logout() {
    isLoggedIn.value = false
    localStorage.removeItem('carbon_is_logged_in')
  }

  // 4. 更新资料
  function updateProfile(data) {
    if (data.name) userInfo.value.name = data.name
    if (data.avatar) userInfo.value.avatar = data.avatar
    saveState()
  }

  // 5. 修改密码
  function changePassword(oldPwd, newPwd) {
    if (oldPwd !== userInfo.value.password) return false
    userInfo.value.password = newPwd
    saveState()
    return true
  }

  return { userInfo, isLoggedIn, login, register, logout, updateProfile, changePassword }
})