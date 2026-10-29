<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <RouterLink class="brand" :to="{ name: 'home' }" aria-label="我的博客，返回首页">
        <span class="brand-mark" aria-hidden="true">✦</span>
        <span class="brand-name"
          >我的博客<span class="brand-subtitle">MY LITTLE JOURNAL</span></span
        >
      </RouterLink>
      <nav class="site-nav" aria-label="主导航">
        <RouterLink :to="{ name: 'home' }"
          ><svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
          >
            <path d="m3 10 9-7 9 7v10H4V10m5 10v-7h6v7" /></svg
          >首页</RouterLink
        >
        <RouterLink :to="{ name: 'about' }"
          ><svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
          >
            <circle cx="12" cy="7" r="3.5" />
            <path d="M5 21v-3a7 7 0 0 1 14 0v3" /></svg
          >关于</RouterLink
        >
      </nav>
      <span class="header-note">记录，让成长有迹可循 <span aria-hidden="true">✧</span></span>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: relative;
  z-index: 3;
  background: var(--color-card);
  border-bottom: 1px solid var(--color-border);
}
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  max-width: 1180px;
  min-height: 80px;
  margin: 0 auto;
  padding: 14px 24px;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--color-heading);
  border-radius: 8px;
}
.brand-mark {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 13px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 28px;
}
.brand-name {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.5;
}
.brand-subtitle {
  display: block;
  font-size: 7px;
  letter-spacing: 0.18em;
  color: var(--color-muted);
}
.site-nav {
  display: flex;
  gap: 8px;
}
.site-nav a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 8px 18px;
  border-radius: 9px;
  color: var(--color-text);
  font-size: 14px;
  transition: background 0.2s;
}
.site-nav svg {
  width: 16px;
  height: 16px;
}
.site-nav a:hover,
.site-nav a.router-link-exact-active {
  background: var(--accent-soft);
  color: var(--accent);
}
.site-nav a.router-link-exact-active {
  font-weight: 600;
}
.header-note {
  font-size: 11px;
  color: var(--color-muted);
}
.header-note span {
  margin-left: 12px;
  font-size: 20px;
  color: var(--accent);
}
@media (max-width: 700px) {
  .header-note {
    display: none;
  }
}
@media (max-width: 480px) {
  .header-inner {
    min-height: 72px;
    padding: 12px 16px;
    gap: 8px;
  }
  .site-nav {
    gap: 2px;
  }
  .site-nav a {
    padding: 8px 10px;
  }
  .brand {
    gap: 8px;
  }
  .brand-name {
    font-size: 16px;
  }
}
</style>
