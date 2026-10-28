<script setup>
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <main class="not-found" aria-labelledby="not-found-title">
    <p class="error-code" aria-hidden="true">404</p>
    <h1 id="not-found-title">页面不存在</h1>
    <p class="description">这个地址可能有误，或者页面已经被移走了。</p>
    <p class="requested-path">访问路径：<code>{{ route.path }}</code></p>
    <RouterLink class="home-link" :to="{ name: 'home' }">返回首页</RouterLink>
    <p class="hint">回到首页，继续浏览文章。</p>
  </main>
</template>

<style scoped>
.not-found {
  grid-column: 1 / -1;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: clamp(40px, 10vw, 96px) clamp(16px, 4vw, 48px);
  text-align: center;
}

.error-code {
  color: var(--color-text);
  font-size: clamp(80px, 18vw, 144px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.05em;
  opacity: 0.25;
}

h1 {
  margin-top: 24px;
  color: var(--color-heading);
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 600;
}

.description {
  margin-top: 16px;
}

.requested-path {
  margin-top: 16px;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
  overflow-wrap: anywhere;
}

.home-link {
  display: inline-block;
  margin-top: 28px;
  padding: 10px 24px;
  border-radius: 8px;
  background: #276749;
  color: #fff;
  font-weight: 600;
  transition: background-color 0.2s;
}

.home-link:hover {
  background: #1e5038;
}

.home-link:focus-visible {
  outline: 3px solid var(--color-text);
  outline-offset: 4px;
}

.hint {
  margin-top: 16px;
  font-size: 14px;
}
</style>
