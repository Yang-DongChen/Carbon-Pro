import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AnalysisView from '../views/AnalysisView.vue'
import WikiView from '../views/WikiView.vue'
import RewardsView from '../views/RewardsView.vue'
import HistoryView from '../views/HistoryView.vue'
// 引入文章详情页
import ArticleDetailView from '../views/ArticleDetailView.vue' 
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
    // 文章详情页路由
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

// 路由守卫：检查是否登录
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  // 如果要去的地方需要验证，且用户没登录 -> 跳去登录页
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router