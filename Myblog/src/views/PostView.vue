<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { blogs } from '../services/posts.js'

const route = useRoute()

const blog = computed(() =>
  blogs.posts.find(blog => blog.slug === route.params.slug)
)
</script>

<template>
  <article v-if="blog">
    <h1>{{ blog.title }}</h1>
    <time>{{ blog.date }}</time>
    <p>{{ blog.content }}</p>
  </article>

  <p v-else>文章不存在</p>
</template>