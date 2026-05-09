<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { ElMessage } from "element-plus";
import { User, Lock, ArrowRight } from "@element-plus/icons-vue";

const router = useRouter();
const store = useUserStore();
const form = reactive({ email: "", password: "" });
const loading = ref(false);

const handleLogin = () => {
  //非空校验   用 ElMessage 弹窗警告
  if (!form.email || !form.password)
    return ElMessage.warning("请输入账号和密码");

  loading.value = true;

  //用了一个 800 毫秒的延时器
  setTimeout(() => {
    const result = store.login(form);
    if (result.success) {
      if (result.role === "admin") {
        ElMessage.success("管理员登录成功");
        router.push("/admin");
      } else {
        ElMessage.success("欢迎回来，" + store.userInfo.name);
        router.push("/");
      }
    } else {
      ElMessage.error(result.msg);
      loading.value = false;
    }
  }, 800);
};
// 新增：处理跳转注册页的逻辑
const goToRegister = () => {
  // 如果仓库里的维护模式是开启的 (true)
  if (store.isMaintenance) {
    // 弹出红色错误提示，拦住他
    return ElMessage.error(" 🚧 系统维护中，暂不开放新用户注册");
  }
  // 如果没在维护，就正常放行，跳转到注册页
  router.push("/register");
};
</script>

<template>
  <div class="login-container">
    <!-- 大容器。占满整个屏幕，用来把登录框“抓”到屏幕正中间。 -->
    <div class="login-card fade-up">
      <!-- //登录卡片 -->
      <div class="logo-area">
        <!-- //Logo区域 -->
        <!-- //叶子图标。这是一段绘图代码 -->
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="leaf-logo"
        >
          <path
            d="M12.0002 21.5C12.0002 21.5 12.0002 14.5 9.50024 11C7.00024 7.5 3.50024 7 3.50024 7C3.50024 7 6.00024 2 12.0002 2C18.0002 2 20.5002 7 20.5002 7C20.5002 7 17.0002 7.5 14.5002 11C12.0002 14.5 12.0002 21.5 12.0002 21.5Z"
            stroke="#1d1d1f"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12 21.5V13"
            stroke="#1d1d1f"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <h2>碳迹 ID</h2>
        <p class="subtitle">记录您的每一步低碳足迹</p>
      </div>

      <!-- //表单区域 -->
      <div class="form-area">
        <!-- 账号输入框 -->
        <div class="input-group">
          <el-input
            v-model="form.email"
            placeholder="邮箱 / 账号"
            :prefix-icon="User"
            size="large"
            class="custom-input"
          />
        </div>
        <!-- 密码输入框 -->
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
        <!-- 登录按钮 -->
        <button class="login-btn" @click="handleLogin" :disabled="loading">
          <span v-if="!loading">登录</span>
          <span v-else class="loader"></span>
          <el-icon v-if="!loading"><ArrowRight /></el-icon>
        </button>
      </div>

      <div class="footer-links">
        <span
          >没有账户?
          <a
            href="javascript:void(0)"
            @click="goToRegister"
            style="cursor: pointer"
            >立即注册</a
          >
        </span>
        <span class="divider">|</span>
        <span class="tip">管理员: admin@terra.com / admin123</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f7;
  padding: 20px;
}
.login-card {
  background: white;
  width: 100%;
  max-width: 400px;
  border-radius: 30px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  text-align: center;
}
.logo-area {
  margin-bottom: 40px;
}
.leaf-logo {
  margin-bottom: 15px;
  color: #1d1d1f;
}
h2 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
  color: #1d1d1f;
  letter-spacing: -0.5px;
}
.subtitle {
  color: #86868b;
  font-size: 15px;
  margin: 0;
}
.form-area {
  display: flex;
  /* 纵向排列 */
  flex-direction: column;
  gap: 20px;
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
  box-shadow: 0 0 0 2px #000000 inset !important;
  background: white;
}
.login-btn {
  background: #1d1d1f;
  color: white;
  border: none;
  height: 50px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer; /*鼠标变小手 */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  margin-top: 10px;
}
.login-btn span,
.login-btn .el-icon {
  color: #ffffff !important;
}
.login-btn:hover {
  background: #000;
  transform: scale(1.02);
}
/* 加载锁死状态 */
.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.footer-links {
  font-size: 13px;
  color: #86868b;
}
.footer-links a {
  color: #0071e3;
  text-decoration: none;
  font-weight: 500;
}
.divider {
  margin: 0 10px;
  color: #ddd;
}
.tip {
  color: #999;
}
/* 转圈动画 */
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
