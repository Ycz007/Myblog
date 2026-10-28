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

const blog = computed(() =>
  blogs.posts.find(blog => blog.slug === route.params.slug)
)

const renderedContent = computed(() => {
  return markdown.render(blog.value?.content ?? '')
})
</script>

<template>
  <article v-if="blog">
    <h1>{{ blog.title }}</h1>
    <time>{{ blog.date }}</time>
    <div class="markdown-body" v-html="renderedContent"></div>
  </article>

  <p v-else>文章不存在</p>
</template>