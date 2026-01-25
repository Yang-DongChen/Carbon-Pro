<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock, ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const store = useUserStore()

const form = reactive({
  email: '',
  password: ''
})

const loading = ref(false)

const handleLogin = () => {
  if (!form.email || !form.password) {
    return ElMessage.warning('请输入账号和密码')
  }

  loading.value = true

  // 模拟网络延迟，增加真实感
  setTimeout(() => {
    // 调用 Store 的登录方法
    const success = store.login(form)
    
    if (success) {
      ElMessage.success('欢迎回来，' + store.userInfo.name)
      router.push('/') // 跳转到首页
    } else {
      ElMessage.error('密码错误 (默认密码是 123)')
      loading.value = false
    }
  }, 800)
}
</script>

<template>
  <div class="login-container">
    <div class="login-card fade-up">
      <div class="logo-area">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="leaf-logo">
           <path d="M12.0002 21.5C12.0002 21.5 12.0002 14.5 9.50024 11C7.00024 7.5 3.50024 7 3.50024 7C3.50024 7 6.00024 2 12.0002 2C18.0002 2 20.5002 7 20.5002 7C20.5002 7 17.0002 7.5 14.5002 11C12.0002 14.5 12.0002 21.5 12.0002 21.5Z" stroke="#1d1d1f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
           <path d="M12 21.5V13" stroke="#1d1d1f" stroke-width="2" stroke-linecap="round"/>
        </svg>
        
        <h2>Terra ID</h2>
        <p class="subtitle">登录您的低碳生活</p>
      </div>

      <div class="form-area">
        <div class="input-group">
          <el-input 
            v-model="form.email" 
            placeholder="邮箱 / 账号" 
            :prefix-icon="User"
            size="large"
            class="custom-input"
          />
        </div>
        <div class="input-group">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="密码" 
            :prefix-icon="Lock"
            size="large"
            show-password
            class="custom-input"
            @keyup.enter="handleLogin"
          />
        </div>

        <button class="login-btn" @click="handleLogin" :disabled="loading">
          <span v-if="!loading">登录</span>
          <span v-else class="loader"></span>
          <el-icon v-if="!loading" class="btn-icon"><ArrowRight /></el-icon>
        </button>
      </div>

      <div class="footer-links">
        <span>还没有账号? <router-link to="/register">立即注册</router-link></span>
        <span class="divider">|</span>
        <span class="tip">默认密码: 123</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: #f5f5f7;
  padding: 20px;
}

.login-card {
  background: white;
  width: 100%; max-width: 400px;
  border-radius: 30px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.05);
  text-align: center;
}

.logo-area { margin-bottom: 40px; }
.leaf-logo { margin-bottom: 10px; color: #1d1d1f; }
h2 { font-size: 28px; font-weight: 700; margin: 0 0 8px; color: #1d1d1f; }
.subtitle { color: #86868b; font-size: 14px; margin: 0; }

.form-area { display: flex; flex-direction: column; gap: 20px; margin-bottom: 30px; }

/* 深度定制 Element Input */
:global(.custom-input .el-input__wrapper) {
  border-radius: 16px;
  padding: 8px 15px;
  box-shadow: 0 0 0 1px #e5e5e5 inset !important;
  transition: 0.2s;
  background: #f9f9fa;
}
:global(.custom-input .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #0071e3 inset !important;
  background: white;
}

.login-btn {
  background: #1d1d1f; color: white; border: none;
  height: 50px; border-radius: 25px;
  font-size: 16px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.2s; margin-top: 10px;
}
.login-btn:hover { background: #000; transform: scale(1.02); }
.login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

.footer-links { font-size: 13px; color: #86868b; }
.footer-links a { color: #0071e3; text-decoration: none; font-weight: 500; }
.divider { margin: 0 10px; color: #ddd; }
.tip { color: #999; }

/* 简单的 Loading 圈 */
.loader {
  width: 18px; height: 18px; border: 2px solid #fff;
  border-bottom-color: transparent; border-radius: 50%;
  animation: rotate 1s linear infinite;
}
@keyframes rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.fade-up { animation: fadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>