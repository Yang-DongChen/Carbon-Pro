import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

// 路由懒加载：解决首屏加载慢和切换卡顿的问题
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/', 
      name: 'home', 
      component: () => import('../views/HomeView.vue'), // ⚡️ 懒加载
      meta: { requiresAuth: true } 
    },
    { 
      path: '/login', 
      name: 'login', 
      component: () => import('../views/LoginView.vue') 
    },
    { 
      path: '/register', 
      name: 'register', 
      component: () => import('../views/RegisterView.vue') 
    },
    { 
      path: '/analysis', 
      name: 'analysis', 
      component: () => import('../views/AnalysisView.vue'), 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/wiki', 
      name: 'wiki', 
      component: () => import('../views/WikiView.vue'), // ⚡️ 重点优化：百科页面通常资源较多，懒加载效果明显
      meta: { requiresAuth: true } 
    },
    { 
      path: '/wiki/:id', 
      name: 'article', 
      component: () => import('../views/ArticleDetailView.vue'), 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/rewards', 
      name: 'rewards', 
      component: () => import('../views/RewardsView.vue'), 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/history', 
      name: 'history', 
      component: () => import('../views/HistoryView.vue'), 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/admin', 
      name: 'admin', 
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (userStore.isMaintenance && userStore.userInfo.role !== 'admin' && to.path !== '/login') {
    next('/login')
    return
  }
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.meta.requiresAdmin && userStore.userInfo.role !== 'admin') {
    next('/')
  } else {
    next()
  }
})

export default router