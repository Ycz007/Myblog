<script setup>
import { RouterView } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
</script>

<template>
  <SiteHeader />
  <div class="page-content">
    <RouterView />
  </div>
</template>

<style scoped>
.page-content {
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  padding: 32px 24px;
}

@media (max-width: 480px) {
  .page-content {
    padding: 24px 16px;
  }
}
</style>
