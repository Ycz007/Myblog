<script setup>
import { ref, computed } from 'vue'
import PostCard from '../components/PostCard.vue'
import { blogs } from '../services/posts.js'

// 用户输入的搜索词
const keyword = ref('')

// 根据搜索词计算要展示的文章
const filteredPosts = computed(() => {
  const query = keyword.value.trim().toLowerCase()

  // 没有输入关键词时，展示全部文章
  if (!query) {
    return blogs.posts
  }

  return blogs.posts.filter(blog => {
    const title = blog.title.toLowerCase()
    const description = blog.description.toLowerCase()

    return title.includes(query) || description.includes(query)
  })
})
</script>

<template>
  <main>
    <h1>最新文章</h1>

    <div class="search-bar">
      <label for="post-search">搜索文章</label>

      <input
        id="post-search"
        v-model="keyword"
        type="search"
        placeholder="输入标题或摘要关键词"
      />

      <button v-if="keyword" type="button" @click="keyword = ''">
        清空搜索
      </button>
    </div>

    <p>共 {{ filteredPosts.length }} 篇文章</p>

    <PostCard
      v-for="blog in filteredPosts"
      :key="blog.slug"
      :blog="blog"
    />

    <p v-if="filteredPosts.length === 0">
      没有找到匹配的文章，试试其他关键词。
    </p>
  </main>
</template>