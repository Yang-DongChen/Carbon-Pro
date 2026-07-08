<template>
  <div class="community-page">
    <TheNavbar />

    <main class="content">
      <div class="page-header fade-up">
        <h1>
          <el-icon><ChatDotRound /></el-icon> 低碳星球社区
        </h1>
        <p>分享你的减排日常，与低碳达人们一起交流吧 🌍</p>
      </div>

      <section class="fade-up delay-1">
        <el-card class="publish-card" shadow="hover">
          <div class="publish-header">
            <el-avatar :size="40" :src="currentUser.avatar">{{
              currentUser.name.charAt(0)
            }}</el-avatar>
            <span class="user-greeting"
              >今天有什么低碳环保的小妙招想分享？</span
            >
          </div>
          <el-input
            v-model="newPostContent"
            type="textarea"
            :rows="3"
            placeholder="例如：今天又骑车通勤啦，减排打卡！或者：刚解锁了地球卫士勋章..."
            maxlength="200"
            show-word-limit
            class="post-input"
          />
          <div class="action-bar">
            <div class="tags">
              <el-tag type="success" effect="plain" round size="small"
                ># 绿色出行</el-tag
              >
              <el-tag type="warning" effect="plain" round size="small"
                ># 变废为宝</el-tag
              >
            </div>
            <el-button type="primary" color="#1d1d1f" @click="publishPost">
              发布动态
            </el-button>
          </div>
        </el-card>
      </section>

      <section class="post-list fade-up delay-2">
        <el-empty
          v-if="posts.length === 0"
          description="社区还在建设中，快来发布第一条动态吧！"
        />

        <transition-group name="list" tag="div">
          <el-card
            v-for="post in posts"
            :key="post.id"
            class="post-item"
            shadow="never"
          >
            <div class="post-header">
              <div class="author-info">
                <el-avatar
                  :size="45"
                  :src="post.avatar"
                  :style="{ backgroundColor: post.bgColor }"
                >
                  {{ post.author.charAt(0) }}
                </el-avatar>
                <div class="meta">
                  <div class="author-name">
                    {{ post.author }}
                    <el-tag
                      v-if="post.role === 'admin'"
                      type="danger"
                      size="small"
                      effect="dark"
                      class="role-tag"
                      >官方</el-tag
                    >
                  </div>
                  <div class="post-time">{{ post.time }}</div>
                </div>
              </div>
            </div>

            <div class="post-content">
              {{ post.content }}
            </div>

            <div class="post-footer">
              <div
                class="interaction-btn"
                :class="{ liked: post.isLiked }"
                @click="toggleLike(post.id)"
              >
                点赞 ({{ post.likes }})
              </div>
              <div class="interaction-btn" @click="focusComment(post.id)">
                评论
              </div>
              <div class="interaction-btn">分享</div>
            </div>
          </el-card>
        </transition-group>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { ChatDotRound } from "@element-plus/icons-vue";
// 正确引入你的导航栏组件
import TheNavbar from "../components/TheNavbar.vue";

// --- 状态定义 ---
const newPostContent = ref("");
const posts = ref([]);
const currentUser = ref({ name: "低碳达人", avatar: "", role: "user" });

// --- 预设数据 ---
const defaultPosts = [
  {
    id: 1002,
    author: "绿叶使者",
    role: "user",
    avatar: "",
    bgColor: "#3b82f6",
    content:
      "刚刚用日常攒下来的积分在商城兑换了一个环保帆布袋，系统设计的成就勋章真的绝美，满满的成就感！🌱",
    time: "2026-06-10 14:20",
    likes: 24,
    isLiked: false,
  },
  {
    id: 1001,
    author: "系统管理员",
    role: "admin",
    avatar: "",
    bgColor: "#ef4444",
    content:
      "欢迎来到低碳星球社区！在这里，你可以记录每次绿色出行、光盘行动和二手回收的日常。让我们一起为双碳目标贡献力量！",
    time: "2026-06-01 09:00",
    likes: 88,
    isLiked: false,
  },
];

// --- 初始化 ---
onMounted(() => {
  const storedUser = localStorage.getItem("carbon_user_data");
  if (storedUser) {
    currentUser.value = JSON.parse(storedUser);
  }

  const storedPosts = localStorage.getItem("carbon_community_posts");
  if (storedPosts) {
    posts.value = JSON.parse(storedPosts);
  } else {
    posts.value = defaultPosts;
    savePosts();
  }
});

const savePosts = () => {
  localStorage.setItem("carbon_community_posts", JSON.stringify(posts.value));
};

const publishPost = () => {
  if (!newPostContent.value.trim()) {
    ElMessage.warning("发布内容不能为空哦！");
    return;
  }

  const newPost = {
    id: Date.now(),
    author: currentUser.value.name,
    role: currentUser.value.role,
    avatar: currentUser.value.avatar || "",
    bgColor: "#1d1d1f",
    content: newPostContent.value,
    time: new Date().toLocaleString(),
    likes: 0,
    isLiked: false,
  };

  posts.value.unshift(newPost);
  savePosts();
  newPostContent.value = "";
  ElMessage.success("发布成功，经验值 +5！");
};

const toggleLike = (id) => {
  const post = posts.value.find((p) => p.id === id);
  if (post) {
    if (post.isLiked) {
      post.likes -= 1;
      post.isLiked = false;
    } else {
      post.likes += 1;
      post.isLiked = true;
    }
    savePosts();
  }
};

const focusComment = () => {
  ElMessage.info("评论功能正在升级维护中...");
};
</script>

<style scoped>
/* 保持与百科页面一致的底层样式 */
.community-page {
  min-height: 100vh;
  padding-top: 52px;
  background: #f5f5f7;
  padding-bottom: 60px; /* 给手机端底部留白 */
}
.content {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}
.page-header h1 {
  font-size: 32px;
  color: #1d1d1f;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.page-header p {
  color: #86868b;
  margin-bottom: 30px;
}

.publish-card {
  border-radius: 20px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: none;
}
.publish-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}
.user-greeting {
  margin-left: 15px;
  font-weight: bold;
  color: #1d1d1f;
}
.post-input {
  margin-bottom: 15px;
}
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.post-item {
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: none;
  transition: transform 0.3s;
}
.post-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.06);
}
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.author-info {
  display: flex;
  align-items: center;
}
.meta {
  margin-left: 12px;
}
.author-name {
  font-weight: 600;
  font-size: 16px;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}
.post-time {
  font-size: 13px;
  color: #86868b;
  margin-top: 4px;
}
.post-content {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 20px;
  white-space: pre-wrap;
}
.post-footer {
  display: flex;
  border-top: 1px solid #f5f5f7;
  padding-top: 15px;
}
.interaction-btn {
  flex: 1;
  text-align: center;
  color: #86868b;
  cursor: pointer;
  transition: color 0.2s;
  font-size: 14px;
  font-weight: 500;
}
.interaction-btn:hover {
  color: #1d1d1f;
}
.interaction-btn.liked {
  color: #0071e3; /* 苹果蓝 */
}

/* 动画效果 (与你百科页面的动画完全一致) */
.fade-up {
  animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  opacity: 0;
  transform: translateY(20px);
}
.delay-1 {
  animation-delay: 0.1s;
}
.delay-2 {
  animation-delay: 0.2s;
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 列表过渡动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
