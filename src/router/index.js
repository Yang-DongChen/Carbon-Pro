import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AnalysisView from '../views/AnalysisView.vue'
import WikiView from '../views/WikiView.vue'
import RewardsView from '../views/RewardsView.vue'
import HistoryView from '../views/HistoryView.vue'
import ArticleDetailView from '../views/ArticleDetailView.vue'
// ★★★ 引入 AdminView
import AdminView from '../views/AdminView.vue' 
import { useUserStore } from '../stores/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/', 
      name: 'home', 
      component: HomeView, 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/login', 
      name: 'login', 
      component: LoginView 
    },
    { 
      path: '/register', 
      name: 'register', 
      component: RegisterView 
    },
    // ★★★ 新增管理员路由
    { 
      path: '/admin', 
      name: 'admin', 
      component: AdminView,
      meta: { requiresAuth: true, requiresAdmin: true } // 需要登录且需要是管理员
    },
    { 
      path: '/analysis', 
      name: 'analysis', 
      component: AnalysisView, 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/wiki', 
      name: 'wiki', 
      component: WikiView, 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/wiki/:id', 
      name: 'article', 
      component: ArticleDetailView, 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/rewards', 
      name: 'rewards', 
      component: RewardsView, 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/history', 
      name: 'history', 
      component: HistoryView, 
      meta: { requiresAuth: true } 
    }
  ]
})

// ★★★ 升级路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 1. 停服维护检查 (优先级最高)
  // 如果处于维护模式 + 用户不是管理员 + 目标不是登录页
  if (userStore.isMaintenance && userStore.userInfo.role !== 'admin' && to.path !== '/login') {
    // 强制踢回登录页
    next('/login')
    return
  }

  // 2. 权限检查
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } 
  // 3. 管理员权限检查
  else if (to.meta.requiresAdmin && userStore.userInfo.role !== 'admin') {
    next('/') // 如果普通用户想硬闯 admin 页面，踢回首页
  } 
  else {
    next()
  }
})

export default router