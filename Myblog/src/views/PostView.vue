<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { blogs } from '../services/posts.js'
import MarkdownIt from 'markdown-it'

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
})

const route = useRoute()

const blog = computed(() => blogs.posts.find((blog) => blog.slug === route.params.slug))

const renderedContent = computed(() => {
  return markdown.render(blog.value?.content ?? '')
})
</script>

<template>
  <article v-if="blog" class="reading-surface surface">
    <header class="article-heading">
      <p class="eyebrow">NOTES & THOUGHTS</p>
      <h1>{{ blog.title }}</h1>
      <div class="article-meta">
        <time :datetime="blog.date">{{ blog.date }}</time
        ><span v-for="tag in blog.tags" :key="tag" class="tag-chip"># {{ tag }}</span>
      </div>
    </header>
    <div class="markdown-body" v-html="renderedContent"></div>
  </article>
  <p v-else class="reading-surface surface">文章不存在</p>
</template>
