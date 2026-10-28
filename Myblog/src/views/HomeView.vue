<script setup>
import PostCard from '../components/PostCard.vue'
import { blogs } from '../services/posts.js'
</script>

<template>
  <main>
    <h1>最新文章</h1>

    <PostCard
      v-for="blog in blogs.posts"
      :key="blog.slug"
      :blog="blog"
    />
  </main>
</template>