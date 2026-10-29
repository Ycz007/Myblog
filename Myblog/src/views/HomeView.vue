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
const allTags = computed(() => {
  const tags = blogs.posts.flatMap((blog) => blog.tags ?? [])

  return [...new Set(tags)]
})

// 根据搜索词计算要展示的文章
const filteredPosts = computed(() => {
  const query = keyword.value.trim().toLowerCase()

  const result = blogs.posts.filter((blog) => {
    const matchesKeyword =
      !query ||
      blog.title.toLowerCase().includes(query) ||
      blog.description.toLowerCase().includes(query)

    const matchesTag = selectedTag.value === '' || (blog.tags ?? []).includes(selectedTag.value)

    return matchesKeyword && matchesTag
  })

  return result.sort((a, b) => {
    return sortOrder.value === 'newest'
      ? b.date.localeCompare(a.date)
      : a.date.localeCompare(b.date)
  })
})
</script>

<template>
  <main>
    <section class="filter-panel surface" aria-labelledby="posts-heading">
      <div class="list-heading">
        <div>
          <p class="eyebrow">THE JOURNAL</p>
          <h1 id="posts-heading" class="section-title">最新文章</h1>
        </div>
        <span class="heading-note">记录 · 探索 · 分享</span>
      </div>
      <div class="search-bar">
        <label for="post-search" class="search-label">搜索文章</label>
        <div class="search-input">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 5 5" />
          </svg>
          <input
            id="post-search"
            v-model="keyword"
            type="search"
            placeholder="输入标题或摘要关键词"
          />
          <button v-if="keyword" class="clear-search" type="button" @click="keyword = ''">
            清空搜索
          </button>
        </div>
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
          <span aria-hidden="true"># </span>{{ tag }}
        </button>
      </div>
    </section>
    <div class="list-toolbar">
      <p>
        共 <strong>{{ filteredPosts.length }}</strong> 篇文章
      </p>
      <div class="sort-control">
        <label for="post-sort">排序方式</label>
        <select id="post-sort" v-model="sortOrder">
          <option value="newest">最新发布</option>
          <option value="oldest">最早发布</option>
        </select>
      </div>
    </div>
    <div class="post-list">
      <PostCard v-for="blog in filteredPosts" :key="blog.slug" :blog="blog" />
    </div>
    <div v-if="filteredPosts.length === 0" class="empty-state surface">
      <span aria-hidden="true">⌕</span>
      <p>没有找到匹配的文章，试试其他关键词。</p>
    </div>
  </main>
</template>

<style scoped>
.filter-panel {
  padding: 25px 28px 22px;
}
.list-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.list-heading h1 {
  margin-top: 6px;
  font-size: 23px;
}
.heading-note {
  font-size: 12px;
  color: var(--color-muted);
}
.search-bar {
  margin-top: 22px;
}
.search-label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--color-muted);
}
.search-input {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-soft);
}
.search-input:focus-within {
  border-color: var(--accent);
}
.search-input svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--color-muted);
}
.search-input input {
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: 8px 0;
  border: none;
  background: transparent;
  color: var(--color-text);
}
.search-input input:focus-visible {
  outline-offset: 0;
}
.search-input input::placeholder {
  color: var(--color-muted);
}
.clear-search {
  flex-shrink: 0;
  padding: 6px 0;
  border: none;
  background: transparent;
  color: var(--accent);
  font-size: 12px;
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}
.tag-list button {
  padding: 6px 14px;
  min-height: 36px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: var(--color-background-soft);
  color: var(--color-muted);
  font-size: 12px;
  transition:
    background 0.18s,
    color 0.18s;
}
.tag-list button:hover {
  color: var(--accent);
  background: var(--accent-soft);
}
.tag-list button.active {
  color: var(--accent);
  background: var(--accent-soft);
  border-color: var(--accent);
  font-weight: 600;
}
.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 5px;
  color: var(--color-muted);
  font-size: 12px;
}
.list-toolbar strong {
  color: var(--accent);
}
.sort-control {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sort-control select {
  max-width: 150px;
  padding: 6px 10px;
  color: var(--color-text);
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 12px;
}
.post-list {
  display: grid;
  gap: 18px;
}
.empty-state {
  padding: 48px 20px;
  text-align: center;
  color: var(--color-muted);
}
.empty-state > span {
  font-size: 40px;
  color: var(--accent);
}
@media (max-width: 480px) {
  .filter-panel {
    padding: 22px 18px;
  }
  .heading-note {
    display: none;
  }
  .sort-control {
    gap: 6px;
  }
}
</style>
