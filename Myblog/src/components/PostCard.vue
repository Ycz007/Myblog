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
  <article class="post-card surface">
    <div class="post-content">
      <p class="post-meta">
        <span class="calendar-icon" aria-hidden="true">▦</span
        ><time :datetime="blog.date">{{ blog.date }}</time
        ><span class="meta-divider">/</span><span>学习笔记</span>
      </p>
      <h2>
        <RouterLink :to="`/blog/${blog.slug}`"
          >{{ blog.title }}<span class="read-arrow" aria-hidden="true">↗</span></RouterLink
        >
      </h2>
      <p class="post-description">{{ blog.description }}</p>
      <div class="post-tags">
        <span v-for="tag in blog.tags" :key="tag" class="tag-chip"># {{ tag }}</span>
      </div>
    </div>
    <div class="card-art" aria-hidden="true">
      <span class="art-orbit"></span><span class="art-symbol">&lt;/&gt;</span
      ><span class="art-caption">NOTES & IDEAS</span>
    </div>
  </article>
</template>

<style scoped>
.post-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 145px;
  gap: 24px;
  padding: 26px;
  overflow: hidden;
  transition:
    border-color 0.2s,
    transform 0.2s,
    box-shadow 0.2s;
}
.post-card:hover {
  border-color: var(--accent);
  transform: translateY(-3px);
  box-shadow: 0 9px 25px #305c3c0b;
}
.post-content {
  min-width: 0;
}
.post-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px;
  color: var(--color-muted);
  font-size: 11px;
}
.calendar-icon {
  color: var(--accent);
  font-size: 17px;
}
.meta-divider {
  opacity: 0.45;
}
h2 {
  margin: 10px 0 12px;
  font-size: 21px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
h2 a {
  color: var(--color-heading);
  transition: color 0.2s;
}
h2 a:hover {
  color: var(--accent);
}
.read-arrow {
  margin-left: 10px;
  font-size: 16px;
  color: var(--accent);
}
.post-description {
  font-size: 13px;
  line-height: 1.9;
  color: var(--color-muted);
  overflow-wrap: anywhere;
}
.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 20px;
}
.card-art {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  overflow: hidden;
  border-radius: 13px;
  background: linear-gradient(145deg, var(--accent-soft), var(--color-background-mute));
  color: var(--accent);
}
.art-orbit {
  position: absolute;
  width: 145px;
  height: 145px;
  border: 1px solid currentColor;
  border-radius: 50%;
  right: -50px;
  top: -50px;
  opacity: 0.18;
}
.art-symbol {
  font:
    500 34px Consolas,
    monospace;
  transform: rotate(-8deg);
  opacity: 0.65;
}
.art-caption {
  margin-top: 20px;
  font-size: 8px;
  letter-spacing: 0.14em;
  opacity: 0.8;
}
@media (max-width: 600px) {
  .post-card {
    grid-template-columns: minmax(0, 1fr);
    padding: 22px;
  }
  .card-art {
    display: none;
  }
  h2 {
    font-size: 20px;
  }
}
</style>
