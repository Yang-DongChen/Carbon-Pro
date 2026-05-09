<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { ElMessage } from "element-plus";
import { User, Lock, ArrowRight, Collection } from "@element-plus/icons-vue";

const router = useRouter();
const store = useUserStore();
const form = reactive({ email: "", password: "", confirmPassword: "" });
const loading = ref(false);

const handleRegister = () => {
  if (!form.email || !form.password || !form.confirmPassword)
    return ElMessage.warning("请填写完整信息");
  if (form.password !== form.confirmPassword)
    return ElMessage.error("两次输入的密码不一致");
  if (form.password.length < 3) return ElMessage.warning("密码长度至少 3 位");
  loading.value = true;

  setTimeout(() => {
    store.register(form);
    ElMessage.success("注册成功，欢迎加入低碳生活！");
    router.push("/");
  }, 1000);
};
</script>

<template>
  <div class="register-container">
    <div class="register-card fade-up">
      <div class="logo-area">
        <el-icon class="logo-icon" color="#1d1d1f" :size="40"
          ><Collection
        /></el-icon>
        <h2>创建碳迹 ID</h2>
        <p class="subtitle">开启一段新的旅程</p>
      </div>
      <div class="form-area">
        <div class="input-group">
          <el-input
            v-model="form.email"
            placeholder="邮箱 / 用户名"
            :prefix-icon="User"
            size="large"
            class="custom-input"
          />
        </div>
        <div class="input-group">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="设置密码"
            :prefix-icon="Lock"
            size="large"
            show-password
            class="custom-input"
          />
        </div>
        <div class="input-group">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="确认密码"
            :prefix-icon="Lock"
            size="large"
            show-password
            class="custom-input"
            @keyup.enter="handleRegister"
          />
        </div>
        <button
          class="register-btn"
          @click="handleRegister"
          :disabled="loading"
        >
          <span v-if="!loading">创建账户</span>
          <span v-else class="loader"></span>
          <el-icon v-if="!loading"><ArrowRight /></el-icon>
        </button>
      </div>
      <div class="footer-links">
        <router-link to="/login" class="back-link"
          ><span class="arrow">←</span> 返回登录</router-link
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f7;
  padding: 20px;
}
.register-card {
  background: white;
  width: 100%;
  max-width: 400px;
  border-radius: 30px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  text-align: center;
}
.logo-area {
  margin-bottom: 30px;
}
.logo-icon {
  margin-bottom: 10px;
}
h2 {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 8px;
  color: #1d1d1f;
}
.subtitle {
  color: #86868b;
  font-size: 14px;
  margin: 0;
}
.form-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
}
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
.register-btn {
  background: #0071e3;
  color: white;
  border: none;
  height: 50px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  margin-top: 10px;
}
.register-btn span,
.register-btn .el-icon {
  color: #ffffff !important;
}
.register-btn:hover {
  background: #0077ed;
  transform: scale(1.02);
}
.register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.footer-links {
  font-size: 14px;
}
.back-link {
  color: #86868b;
  text-decoration: none;
  transition: 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.back-link:hover {
  color: #1d1d1f;
}
.arrow {
  transition: transform 0.2s;
}
.back-link:hover .arrow {
  transform: translateX(-4px);
}
.loader {
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: rotate 1s linear infinite;
}
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.fade-up {
  animation: fadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
