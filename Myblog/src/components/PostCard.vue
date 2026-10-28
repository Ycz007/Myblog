<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  blog: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <article>
    <h2>
      <RouterLink :to="`/blog/${blog.slug}`">
        {{ blog.title }}
      </RouterLink>
    </h2>

    <p>{{ blog.description }}</p>
    <time>{{ blog.date }}</time>
  </article>
</template>