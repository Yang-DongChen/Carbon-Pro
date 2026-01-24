<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router' // 引入 useRoute 用于底部导航高亮
import { useUserStore } from '../stores/user'
import { 
  CaretBottom, Camera, Edit, Key, SwitchButton, UploadFilled,
  HomeFilled, DataAnalysis, Clock, Medal, Reading // 引入底部导航图标
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute() // 获取当前路由
const userStore = useUserStore()

// --- 弹窗控制状态 ---
const showAvatarDialog = ref(false)
const showProfileDialog = ref(false)
const showPasswordDialog = ref(false)
const tempAvatar = ref('')
const profileForm = reactive({ name: '' })
const passwordForm = reactive({ oldPass: '', newPass: '', confirmPass: '' })

// 处理下拉菜单点击
const handleCommand = (command) => {
  switch (command) {
    case 'logout': handleLogout(); break;
    case 'avatar': 
      tempAvatar.value = userStore.userInfo.avatar; 
      showAvatarDialog.value = true; 
      break;
    case 'profile': 
      profileForm.name = userStore.userInfo.name; 
      showProfileDialog.value = true; 
      break;
    case 'password': 
      passwordForm.oldPass = ''; passwordForm.newPass = ''; passwordForm.confirmPass = '';
      showPasswordDialog.value = true; 
      break;
  }
}

// 业务逻辑保持不变 (退出、头像、信息、密码)
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', { confirmButtonText: '退出', cancelButtonText: '取消', type: 'warning' })
    .then(() => { userStore.logout(); router.push('/login'); ElMessage.success('已安全退出'); })
}
const handleFileChange = (e) => {
  const file = e.target.files[0]; if (!file) return;
  if (file.size > 2 * 1024 * 1024) return ElMessage.warning('图片大小不能超过 2MB');
  const reader = new FileReader(); reader.readAsDataURL(file);
  reader.onload = (evt) => { tempAvatar.value = evt.target.result; }
}
const saveAvatar = () => { if (!tempAvatar.value) return; userStore.updateProfile({ avatar: tempAvatar.value }); showAvatarDialog.value = false; ElMessage.success('头像更新成功'); }
const saveProfile = () => { if (!profileForm.name.trim()) return ElMessage.warning('昵称不能为空'); userStore.updateProfile({ name: profileForm.name }); showProfileDialog.value = false; ElMessage.success('个人信息保存成功'); }
const savePassword = () => {
  if (!passwordForm.oldPass || !passwordForm.newPass) return ElMessage.warning('请填写完整');
  if (passwordForm.newPass !== passwordForm.confirmPass) return ElMessage.error('两次输入的新密码不一致');
  if (userStore.changePassword(passwordForm.oldPass, passwordForm.newPass)) {
    showPasswordDialog.value = false; ElMessage.success('密码修改成功，请重新登录'); userStore.logout(); router.push('/login');
  } else { ElMessage.error('旧密码错误'); }
}
const triggerFileInput = () => { document.getElementById('hidden-file-input').click() }
</script>

<template>
  <div>
    <nav class="apple-nav">
      <div class="nav-content">
        <div class="nav-left">
          <div class="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.0002 21.5C12.0002 21.5 12.0002 14.5 9.50024 11C7.00024 7.5 3.50024 7 3.50024 7C3.50024 7 6.00024 2 12.0002 2C18.0002 2 20.5002 7 20.5002 7C20.5002 7 17.0002 7.5 14.5002 11C12.0002 14.5 12.0002 21.5 12.0002 21.5Z" stroke="#1d1d1f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 21.5V13" stroke="#1d1d1f" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="brand-name">Carbon Pro</span>
        </div>
        
        <div class="nav-links desktop-only">
          <router-link to="/" class="nav-item" active-class="active">概览</router-link>
          <router-link to="/analysis" class="nav-item" active-class="active">AI 分析</router-link>
          <router-link to="/history" class="nav-item" active-class="active">历史</router-link>
          <router-link to="/rewards" class="nav-item" active-class="active">奖励</router-link>
          <router-link to="/wiki" class="nav-item" active-class="active">百科</router-link>
        </div>
        
        <div class="nav-right">
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-dropdown-trigger">
              <div class="avatar-circle">
                <img v-if="userStore.userInfo.avatar" :src="userStore.userInfo.avatar" class="avatar-img" />
                <span v-else>{{ userStore.userInfo.name.charAt(0).toUpperCase() }}</span>
              </div>
              <span class="username desktop-only">{{ userStore.userInfo.name }}</span>
              <el-icon class="dropdown-arrow desktop-only"><CaretBottom /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="custom-dropdown">
                <el-dropdown-item command="avatar" :icon="Camera">修改头像</el-dropdown-item>
                <el-dropdown-item command="profile" :icon="Edit">修改个人信息</el-dropdown-item>
                <el-dropdown-item command="password" :icon="Key">修改密码</el-dropdown-item>
                <el-dropdown-item divided command="logout" :icon="SwitchButton" class="danger-item">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </nav>

    <div class="mobile-tab-bar mobile-only">
      <router-link to="/" class="tab-item" :class="{ active: route.path === '/' }">
        <el-icon><HomeFilled /></el-icon>
        <span>概览</span>
      </router-link>
      <router-link to="/analysis" class="tab-item" :class="{ active: route.path === '/analysis' }">
        <el-icon><DataAnalysis /></el-icon>
        <span>分析</span>
      </router-link>
      <router-link to="/history" class="tab-item" :class="{ active: route.path === '/history' }">
        <el-icon><Clock /></el-icon>
        <span>历史</span>
      </router-link>
      <router-link to="/rewards" class="tab-item" :class="{ active: route.path === '/rewards' }">
        <el-icon><Medal /></el-icon>
        <span>奖励</span>
      </router-link>
      <router-link to="/wiki" class="tab-item" :class="{ active: route.path === '/wiki' }">
        <el-icon><Reading /></el-icon>
        <span>百科</span>
      </router-link>
    </div>

    <el-dialog v-model="showAvatarDialog" title="更换头像" width="90%" align-center class="custom-dialog" append-to-body>
      <div class="avatar-uploader" @click="triggerFileInput">
        <img v-if="tempAvatar" :src="tempAvatar" class="preview-img" />
        <div v-else class="upload-placeholder"><el-icon class="upload-icon"><UploadFilled /></el-icon><span>点击上传图片</span></div>
        <input type="file" id="hidden-file-input" accept="image/*" @change="handleFileChange" style="display: none" />
      </div>
      <template #footer><div class="dialog-footer"><el-button @click="showAvatarDialog = false">取消</el-button><el-button type="primary" @click="saveAvatar" color="#1d1d1f">保存</el-button></div></template>
    </el-dialog>

    <el-dialog v-model="showProfileDialog" title="编辑资料" width="90%" align-center class="custom-dialog" append-to-body>
      <div class="form-item"><label>用户昵称</label><el-input v-model="profileForm.name" /></div>
      <template #footer><div class="dialog-footer"><el-button @click="showProfileDialog = false">取消</el-button><el-button type="primary" @click="saveProfile" color="#1d1d1f">保存</el-button></div></template>
    </el-dialog>

    <el-dialog v-model="showPasswordDialog" title="安全设置" width="90%" align-center class="custom-dialog" append-to-body>
      <div class="form-group">
        <div class="form-item"><label>当前密码</label><el-input v-model="passwordForm.oldPass" type="password" show-password /></div>
        <div class="form-item"><label>新密码</label><el-input v-model="passwordForm.newPass" type="password" show-password /></div>
        <div class="form-item"><label>确认新密码</label><el-input v-model="passwordForm.confirmPass" type="password" show-password /></div>
      </div>
      <template #footer><div class="dialog-footer"><el-button @click="showPasswordDialog = false">取消</el-button><el-button type="danger" @click="savePassword">修改</el-button></div></template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 基础导航栏 */
.apple-nav {
  position: fixed; top: 0; left: 0; width: 100%; height: 52px;
  background: rgba(255, 255, 255, 0.85); backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid rgba(0,0,0,0.08); z-index: 1000;
}
.nav-content { max-width: 1100px; margin: 0 auto; height: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
.nav-left { display: flex; align-items: center; gap: 8px; }
.brand-name { font-weight: 600; font-size: 15px; color: #1d1d1f; }
.logo-icon { width: 24px; height: 24px; }

/* 链接样式 */
.nav-links { display: flex; gap: 32px; }
.nav-item { font-size: 13px; color: #6e6e73; text-decoration: none; transition: 0.2s; position: relative; }
.nav-item.active { color: #1d1d1f; font-weight: 500; }

/* 用户区 */
.nav-right { display: flex; align-items: center; }
.user-dropdown-trigger { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.avatar-circle { width: 28px; height: 28px; border-radius: 50%; background: #1d1d1f; color: white; display: flex; justify-content: center; align-items: center; font-size: 12px; overflow: hidden; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.username { font-size: 13px; font-weight: 500; }

/* --- 响应式核心逻辑 --- */

/* 默认隐藏手机版 Tab Bar */
.mobile-only { display: none; }

/* 手机屏幕适配 (宽度小于 768px) */
@media (max-width: 768px) {
  /* 1. 隐藏电脑版元素 */
  .desktop-only { display: none !important; }
  
  /* 2. 显示手机版 Tab Bar */
  .mobile-only { display: flex !important; }

  /* 3. 调整顶部导航栏 */
  .nav-content { padding: 0 16px; }
  
  /* 4. 底部导航栏样式 */
  .mobile-tab-bar {
    position: fixed; bottom: 0; left: 0; width: 100%; height: 50px; /* 增加底部安全区 */
    background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);
    border-top: 1px solid rgba(0,0,0,0.1);
    display: flex; justify-content: space-around; align-items: center;
    z-index: 1000; padding-bottom: env(safe-area-inset-bottom);
  }

  .tab-item {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: #999; text-decoration: none; font-size: 10px; gap: 2px; flex: 1; height: 100%;
  }
  .tab-item .el-icon { font-size: 22px; margin-bottom: 1px; }
  .tab-item.active { color: #0071e3; }
}

/* 弹窗样式 */
.avatar-uploader { width: 100px; height: 100px; border-radius: 50%; border: 2px dashed #ccc; margin: 20px auto; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.form-group { display: flex; flex-direction: column; gap: 15px; padding: 10px 0; }
:global(.custom-dialog) { border-radius: 20px !important; max-width: 400px; }
</style>