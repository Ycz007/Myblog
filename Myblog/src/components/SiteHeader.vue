<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <RouterLink class="brand" :to="{ name: 'home' }" aria-label="我的博客，返回首页">
        <span class="brand-mark" aria-hidden="true">M.</span>
        <span class="brand-name">我的博客</span>
      </RouterLink>

      <nav class="site-nav" aria-label="主导航">
        <RouterLink :to="{ name: 'home' }">首页</RouterLink>
        <RouterLink :to="{ name: 'about' }">关于</RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px 24px;
  max-width: 1040px;
  min-height: 80px;
  margin: 0 auto;
  padding: 16px 24px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 0;
  color: var(--color-heading);
  border-radius: 8px;
}

.brand:hover {
  background: transparent;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #276749;
  color: white;
  font-size: 22px;
  font-weight: 700;
}

.brand-name {
  font-size: 18px;
  font-weight: 600;
}

.site-nav {
  display: flex;
  gap: 8px;
}

.site-nav a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 8px 16px;
  border-radius: 8px;
  color: var(--color-text);
}

.site-nav a:hover {
  background: var(--color-background-soft);
}

.site-nav a.router-link-exact-active {
  background: #276749;
  color: white;
  font-weight: 600;
}

a:focus-visible {
  outline: 2px solid var(--color-text);
  outline-offset: 4px;
}

@media (max-width: 480px) {
  .header-inner {
    padding: 12px 16px;
    gap: 12px;
  }

  .site-nav a {
    padding: 8px 12px;
  }
}
</style>
