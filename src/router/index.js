import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AnalysisView from '../views/AnalysisView.vue'
import WikiView from '../views/WikiView.vue'
import RewardsView from '../views/RewardsView.vue'
// 1. 引入新页面
import HistoryView from '../views/HistoryView.vue'
import { useUserStore } from '../stores/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/analysis', name: 'analysis', component: AnalysisView, meta: { requiresAuth: true } },
    { path: '/wiki', name: 'wiki', component: WikiView, meta: { requiresAuth: true } },
    { path: '/rewards', name: 'rewards', component: RewardsView, meta: { requiresAuth: true } },
    // 2. 添加路由规则
    { path: '/history', name: 'history', component: HistoryView, meta: { requiresAuth: true } }
  ]
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isLoggedIn) next('/login')
  else next()
})

export default router