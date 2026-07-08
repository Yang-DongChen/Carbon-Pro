import { createRouter, createWebHistory } from 'vue-router'
//负责建路网     负责记录用户历史足迹
import { useUserStore } from '../stores/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/', 
      //这里的 path 完全是由你（开发者）来自由决定和命名的。
      //它决定了用户在浏览器地址栏里到底会看到什么。
      name: 'home', 
      component: () => import('../views/HomeView.vue'), //懒加载
      meta: { requiresAuth: true } 
      //meta 就是用来存一些自定义信息的
      // 这里意思是：这个房间必须登录（Requires Auth）才能进
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
  path: '/community',
  name: 'community',
  component: () => import('../views/CommunityView.vue'),
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


//权限拦截逻辑（路由守卫）：在文件底部的 router.beforeEach 是系统的安全防线
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