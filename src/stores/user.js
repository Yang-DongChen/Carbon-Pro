import { defineStore } from 'pinia' 
import { ref, reactive } from 'vue'
import { useCarbonStore } from './carbon'

export const useUserStore = defineStore('user', () => {
  const storedData = JSON.parse(localStorage.getItem('carbon_user_data')) || {
    name: '低碳达人',
    avatar: '', 
    role: 'user', 
    password: '123',
    email: ''
  }

  const userInfo = ref(storedData)
  const isLoggedIn = ref(!!localStorage.getItem('carbon_is_logged_in'))
  const isMaintenance = ref(false) 

  const defaultUserList = [
    { id: 101, name: 'Jason', email: 'jason@terra.com', role: 'user', status: 'normal' },
    { id: 102, name: 'Amy', email: 'amy@terra.com', role: 'user', status: 'banned' },
  ]

  let rawList = JSON.parse(localStorage.getItem('carbon_user_list')) || defaultUserList
  rawList = rawList.filter(item => item !== null)
  const userList = reactive(rawList)
  
  if (isLoggedIn.value && userInfo.value?.email) {
    setTimeout(() => {
      const carbonStore = useCarbonStore()
      carbonStore.loadUserData(userInfo.value.email)
    }, 0)
  }

  const saveState = () => {
    localStorage.setItem('carbon_user_data', JSON.stringify(userInfo.value))
    localStorage.setItem('carbon_user_list', JSON.stringify(userList))
  }

  function login(form) {
    const inputEmail = (form.email || '').trim()
    const inputPwd = (form.password || '').trim()

    if (isMaintenance.value && inputEmail !== 'admin@terra.com') {
      return { success: false, msg: '🚧 系统正在停服维护中，请稍后访问。' }
    }
    if (inputEmail === 'admin@terra.com' && inputPwd === 'admin123') {
      userInfo.value = { name: '超级管理员', avatar: '', role: 'admin', email: 'admin@terra.com', password: 'admin123' }
      isLoggedIn.value = true
      localStorage.setItem('carbon_is_logged_in', 'true')
      
      const carbonStore = useCarbonStore()
      carbonStore.loadUserData('admin@terra.com')
      
      return { success: true, role: 'admin' }
    }

    const existingUser = userList.find(u => u?.email === inputEmail)
    
    if (!existingUser && inputEmail !== userInfo.value?.email) {
      return { success: false, msg: '该账号不存在，请先注册或检查拼写' }
    }

    if (existingUser && existingUser.status === 'banned') {
      return { success: false, msg: '该账号已被封禁，请联系管理员' }
    }

    if (inputPwd !== userInfo.value?.password) {
      return { success: false, msg: '密码错误，请重新输入' }
    }
    
    if (existingUser) {
      userInfo.value.name = existingUser.name
      userInfo.value.role = existingUser.role
    } else {
      userInfo.value.name = inputEmail.split('@')[0]
      userInfo.value.role = 'user'
    }
    
    userInfo.value.email = inputEmail
    isLoggedIn.value = true
    localStorage.setItem('carbon_is_logged_in', 'true')
    saveState()

    const carbonStore = useCarbonStore()
    carbonStore.loadUserData(inputEmail)

    return { success: true, role: 'user' }
  }

  

  function register(form) {
    if (isMaintenance.value) return { success: false, msg: '维护期间暂停注册' }

    const inputEmail = form.email.trim()
    
    if (!userInfo.value) userInfo.value = {}

    userInfo.value.name = inputEmail.split('@')[0] || '新用户'
    userInfo.value.email = inputEmail
    userInfo.value.password = form.password
    userInfo.value.avatar = ''
    userInfo.value.role = 'user'

    const exists = userList.find(u => u?.email === inputEmail)
    if (!exists) {
      userList.push({
        id: Date.now(),
        name: userInfo.value.name,
        email: inputEmail,
        role: 'user',
        status: 'normal'
      })
    } else {
      exists.name = userInfo.value.name
    }

    isLoggedIn.value = true
    localStorage.setItem('carbon_is_logged_in', 'true')
    saveState()

    const carbonStore = useCarbonStore()
    carbonStore.loadUserData(inputEmail)
    
    return { success: true }
  }

  function logout() {
    isLoggedIn.value = false
    if (userInfo.value) {
       userInfo.value.role = 'user'
    }
    localStorage.removeItem('carbon_is_logged_in')
    
    const carbonStore = useCarbonStore()
    carbonStore.clearSession()
  }

  function updateProfile(data) {
    if (!userInfo.value) return
    if (data.name) userInfo.value.name = data.name
    if (data.avatar) userInfo.value.avatar = data.avatar
    
    const currentUserInList = userList.find(u => u?.email === userInfo.value?.email)
    if (currentUserInList && data.name) currentUserInList.name = data.name
    
    saveState()
  }

  function changePassword(oldPwd, newPwd) {
    if (!userInfo.value || oldPwd !== userInfo.value.password) return false
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