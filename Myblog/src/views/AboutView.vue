<template>
  <main class="about">
    <h1>关于这个博客</h1>
    <p>这里记录学习前端、实践项目过程中的笔记与思考。</p>
    <h2>从实践中学习</h2>
    <p>这个博客使用 Vue 3 和 Vite 搭建，通过 Markdown 文件管理文章，在开发中巩固组件、路由和响应式数据的使用。</p>
  </main>
</template>

<style scoped>
.about {
  max-width: 720px;
  line-height: 1.9;
}

h1,
h2 {
  color: var(--color-heading);
  font-weight: 600;
}

h2 {
  margin-top: 32px;
}

p {
  margin-top: 16px;
}
</style>
