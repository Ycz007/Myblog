<script setup>
import { ref, computed } from 'vue'
import PostCard from '../components/PostCard.vue'
import { blogs } from '../services/posts.js'

// 用户输入的搜索词
const keyword = ref('')
// 空字符串代表“全部标签”
const selectedTag = ref('')
// 排序方式？最新：最旧
const sortOrder = ref('newest')

//获取所有标签
const allTags = computed(()=>{
    const tags = blogs.posts.flatMap(blog => blog.tags ?? [])

  return [...new Set(tags)]
})

// 根据搜索词计算要展示的文章
const filteredPosts = computed(() => {
    const query = keyword.value.trim().toLowerCase()

    const result = blogs.posts.filter(blog => {
    const matchesKeyword =
        !query ||
        blog.title.toLowerCase().includes(query) ||
        blog.description.toLowerCase().includes(query)

    const matchesTag =
        selectedTag.value === '' ||
        (blog.tags ?? []).includes(selectedTag.value)

    return matchesKeyword && matchesTag
    })

    return result.sort((a,b)=>{
        return sortOrder.value === 'newest'
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date)
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
    
    
    <div class="tag-list" role="group" aria-label="按标签筛选">
  <button
    type="button"
    :class="{ active: selectedTag === '' }"
    :aria-pressed="selectedTag === ''"
    @click="selectedTag = ''"
  >
    全部
  </button>

  <button
    v-for="tag in allTags"
    :key="tag"
    type="button"
    :class="{ active: selectedTag === tag }"
    :aria-pressed="selectedTag === tag"
    @click="selectedTag = tag"
  >
    {{ tag }}
  </button>
</div>



    <p>共 {{ filteredPosts.length }} 篇文章</p>

    <label for="post-sort">排序方式</label>

<select id="post-sort" v-model="sortOrder">
  <option value="newest">最新发布</option>
  <option value="oldest">最早发布</option>
</select>
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

<style scoped>
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
}

.tag-list button {
  padding: 6px 14px;
  border: 1px solid #888;
  border-radius: 16px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.tag-list button.active {
  background: #276749;
  border-color: #276749;
  color: white;
}
</style>