<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router' // 引入路由
import { useWikiStore } from '../stores/wiki' // 引入 Wiki Store
import TheNavbar from '../components/TheNavbar.vue'
import { Search, Reading } from '@element-plus/icons-vue'

const router = useRouter()
const wikiStore = useWikiStore() // 使用 Store
const searchQuery = ref('')

// 使用 Store 里的 articles，而不是写死在组件里
const filteredArticles = computed(() => {
  return wikiStore.articles.filter(item => 
    item.title.includes(searchQuery.value) || 
    item.desc.includes(searchQuery.value)
  )
})

// 跳转到详情页
const goToArticle = (id) => {
  router.push(`/wiki/${id}`)
}
</script>

<template>
  <div class="wiki-page">
    <TheNavbar />
    
    <main class="content">
      <section class="wiki-header fade-up">
        <h1><el-icon><Reading /></el-icon> 环保百科</h1>
        <p>探索低碳生活的科学与艺术</p>
        
        <div class="wiki-search-box">
          <div class="search-wrapper">
            <el-icon class="search-icon"><Search /></el-icon>
            <input v-model="searchQuery" type="text" placeholder="搜索文章关键字..." class="wiki-input" />
          </div>
        </div>
      </section>

      <section class="wiki-grid fade-up delay-1">
        <div v-for="item in filteredArticles" :key="item.id" class="wiki-card" @click="goToArticle(item.id)">
          <div class="wiki-img-box">
            <img :src="item.image" loading="lazy" />
            <div class="category-tag" :style="{ background: item.color }">{{ item.tag }}</div>
          </div>
          
          <div class="wiki-content">
            <div class="meta-info">
              <span class="read-time">{{ item.readTime }} 阅读</span>
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
            <button class="read-btn" :style="{ color: item.color }" @click.stop="goToArticle(item.id)">
              阅读全文 →
            </button>
          </div>
        </div>
      </section>

      <div v-if="filteredArticles.length === 0" class="no-result">
        <p>没有找到相关文章 🌱</p>
      </div>

    </main>
  </div>
</template>

<style scoped>
/* 样式与之前保持一致，稍微增加卡片点击手势 */
.wiki-page { min-height: 100vh; padding-top: 52px; background: #f5f5f7; }
.content { max-width: 900px; margin: 0 auto; padding: 40px 20px; }

.wiki-header { text-align: center; margin-bottom: 40px; }
.wiki-header h1 { font-size: 32px; color: #1d1d1f; margin: 0 0 10px; display: flex; align-items: center; justify-content: center; gap: 10px; }
.wiki-header p { color: #86868b; margin-bottom: 30px; }

.wiki-search-box { display: flex; justify-content: center; }
.search-wrapper { position: relative; width: 100%; max-width: 500px; display: flex; align-items: center; }
.search-icon { position: absolute; left: 16px; color: #86868b; font-size: 18px; }
.wiki-input { width: 100%; padding: 14px 14px 14px 44px; border: none; border-radius: 12px; background: white; font-size: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); outline: none; transition: 0.2s; }
.wiki-input:focus { box-shadow: 0 4px 16px rgba(0,113,227,0.15); }

.wiki-grid { display: grid; grid-template-columns: 1fr; gap: 30px; }

.wiki-card { 
  background: white; border-radius: 20px; overflow: hidden; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.03); 
  display: flex; flex-direction: row; 
  transition: transform 0.3s; cursor: pointer; height: 200px;
}
.wiki-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.08); }

.wiki-img-box { width: 40%; position: relative; overflow: hidden; }
.wiki-img-box img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.wiki-card:hover .wiki-img-box img { transform: scale(1.05); }
.category-tag { position: absolute; top: 12px; left: 12px; padding: 4px 10px; border-radius: 6px; color: white; font-size: 11px; font-weight: 700; backdrop-filter: blur(4px); }

.wiki-content { flex: 1; padding: 30px; display: flex; flex-direction: column; justify-content: center; }
.meta-info { font-size: 12px; color: #86868b; margin-bottom: 8px; font-weight: 500; text-transform: uppercase; }
.wiki-content h3 { font-size: 20px; color: #1d1d1f; margin: 0 0 10px; line-height: 1.3; }
.wiki-content p { font-size: 14px; color: #666; margin: 0 0 20px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.read-btn { background: none; border: none; font-weight: 600; cursor: pointer; padding: 0; text-align: left; font-size: 14px; }

.no-result { text-align: center; color: #86868b; margin-top: 50px; }

.fade-up { animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; transform: translateY(20px); }
.delay-1 { animation-delay: 0.1s; }
@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
</style>