<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useWikiStore } from "../stores/wiki";
import TheNavbar from "../components/TheNavbar.vue";
import { ArrowLeft, Timer } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const wikiStore = useWikiStore();

const articleId = route.params.id;
const article = computed(() => wikiStore.getArticleById(articleId));

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="article-page">
    <TheNavbar />

    <main class="content">
      <div v-if="!article" class="not-found">
        <h2>未找到文章</h2>
        <button class="back-link" @click="goBack">返回列表</button>
      </div>

      <article v-else class="article-container fade-up">
        <div class="article-nav">
          <button class="back-btn" @click="goBack">
            <el-icon><ArrowLeft /></el-icon> 返回百科
          </button>
        </div>

        <header class="article-header">
          <div class="cover-image-box">
            <img :src="article.image" class="cover-image" />
            <div class="article-tag" :style="{ background: article.color }">
              {{ article.tag }}
            </div>
          </div>
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-meta">
            <span class="meta-item"
              ><el-icon><Timer /></el-icon> {{ article.readTime }} 阅读</span
            >
          </div>
        </header>

        <div class="article-body" v-html="article.content"></div>

        <div class="article-footer">
          <p>感谢阅读，每一次学习都是改变的开始。</p>
          <button class="share-btn" @click="goBack">阅读更多文章</button>
        </div>
      </article>
    </main>
  </div>
</template>

<style scoped>
.article-page {
  min-height: 100vh;
  padding-top: 52px;
  background: #fff;
}
.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.article-nav {
  margin-bottom: 20px;
}
.back-btn {
  background: none;
  border: none;
  font-size: 15px;
  color: #86868b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: 0.2s;
  padding: 0;
}
.back-btn:hover {
  color: #1d1d1f;
  transform: translateX(-3px);
}

/* 头部样式 */
.article-header {
  margin-bottom: 40px;
}
.cover-image-box {
  width: 100%;
  height: 360px;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}
.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.article-tag {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 6px 14px;
  border-radius: 8px;
  color: white;
  font-size: 13px;
  font-weight: 700;
  backdrop-filter: blur(10px);
}

.article-title {
  font-size: 36px;
  font-weight: 800;
  color: #1d1d1f;
  line-height: 1.2;
  margin-bottom: 16px;
  letter-spacing: -1px;
}
.article-meta {
  display: flex;
  gap: 20px;
  color: #86868b;
  font-size: 14px;
  font-weight: 500;
}

/* 正文样式 */
.article-body {
  font-size: 18px;
  line-height: 1.8;
  color: #333;
  font-family: -apple-system, "Georgia", serif;
}
/* 深度选择器控制注入的HTML样式 */
:deep(h3) {
  font-size: 24px;
  margin: 40px 0 16px;
  color: #1d1d1f;
  font-weight: 700;
}
:deep(p) {
  margin-bottom: 24px;
  color: #424245;
}
:deep(strong) {
  color: #1d1d1f;
}
:deep(ul) {
  margin-bottom: 24px;
  padding-left: 20px;
  color: #424245;
}
:deep(li) {
  margin-bottom: 10px;
}

/* 底部 */
.article-footer {
  margin-top: 60px;
  padding-top: 40px;
  border-top: 1px solid #f5f5f7;
  text-align: center;
  color: #86868b;
}
.share-btn {
  margin-top: 20px;
  background: #f5f5f7;
  border: none;
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  cursor: pointer;
  transition: 0.2s;
}
.share-btn:hover {
  background: #e5e5ea;
}

.not-found {
  text-align: center;
  padding-top: 100px;
}
.back-link {
  background: none;
  border: 1px solid #ccc;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 20px;
}

/* 手机适配 */
@media (max-width: 768px) {
  .cover-image-box {
    height: 240px;
  }
  .article-title {
    font-size: 28px;
  }
  .article-body {
    font-size: 17px;
  }
}

.fade-up {
  animation: fadeUp 0.6s ease forwards;
  opacity: 0;
  transform: translateY(20px);
}
@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
