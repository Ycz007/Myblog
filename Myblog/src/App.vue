<script setup>
import { RouterView } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
</script>

<template>
  <SiteHeader />
  <section class="hero" aria-label="博客寄语">
    <div class="hero-copy">
      <p class="hero-overline">A LITTLE SPACE FOR MY THOUGHTS</p>
      <p class="hero-title">在这里，记录每一点成长。</p>
      <p class="hero-subtitle">把学习写成故事，把日常留在字里行间。</p>
    </div>
    <div class="hero-wave" aria-hidden="true"></div>
  </section>
  <div class="page-layout">
    <aside class="sidebar" aria-label="博客介绍">
      <section class="profile surface">
        <div class="profile-cover" aria-hidden="true"></div>
        <div class="avatar" aria-hidden="true">M<span>✦</span></div>
        <h2>我的博客</h2>
        <p class="profile-line">保持好奇，慢慢生长。</p>
        <div class="profile-divider"></div>
        <p class="profile-description">写代码，也写生活。<br />在实践中学习，在记录中成长。</p>
        <span class="profile-label"><span aria-hidden="true">●</span> 学习与记录进行中</span>
      </section>
      <section class="side-note surface">
        <h2 class="section-title">一隅随记</h2>
        <p>不必等到足够优秀，<br />才开始记录。</p>
        <span class="note-bottom">EVERY LITTLE STEP COUNTS <span aria-hidden="true">↗</span></span>
      </section>
    </aside>
    <div class="page-content"><RouterView /></div>
  </div>
  <footer class="site-footer">
    <p>我的博客 <span aria-hidden="true">·</span> 记录学习，分享生活</p>
    <p>
      Built with Vue & Vite <span aria-hidden="true">/</span> 视觉灵感来自
      <a href="https://github.com/CuteLeaf/Firefly" target="_blank" rel="noopener noreferrer"
        >Firefly ↗</a
      >
    </p>
  </footer>
</template>

<style scoped>
.hero {
  position: relative;
  height: 340px;
  overflow: hidden;
  background: #c4e1d5 var(--blog-banner) center 56% / cover;
}
.hero-copy {
  position: relative;
  z-index: 1;
  padding: 70px 20px 0;
  text-align: center;
  color: #294e40;
}
.hero-overline {
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0.3em;
  opacity: 0.8;
}
.hero-title {
  margin: 14px 0 10px;
  font-size: clamp(25px, 3.4vw, 42px);
  font-weight: 650;
  letter-spacing: 0.08em;
}
.hero-subtitle {
  font-size: 14px;
  letter-spacing: 0.12em;
}
.hero-wave {
  position: absolute;
  bottom: -62px;
  left: -10%;
  width: 120%;
  height: 100px;
  border-radius: 50% 50% 0 0;
  background: var(--color-background);
}
.page-layout {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  align-items: start;
  gap: 24px;
  max-width: 1180px;
  margin: -35px auto 0;
  padding: 0 24px;
}
.page-content {
  min-width: 0;
}
.sidebar {
  display: grid;
  gap: 20px;
}
.profile {
  overflow: hidden;
  padding-bottom: 26px;
  text-align: center;
}
.profile-cover {
  height: 84px;
  background: var(--blog-banner) center 35% / cover;
}
.avatar {
  position: relative;
  display: grid;
  place-items: center;
  width: 80px;
  height: 80px;
  margin: -38px auto 12px;
  border: 5px solid var(--color-card);
  border-radius: 28px;
  background: var(--accent-soft);
  color: var(--accent);
  font:
    600 38px Georgia,
    serif;
  transform: rotate(-5deg);
}
.avatar span {
  position: absolute;
  right: -7px;
  bottom: -2px;
  font-size: 22px;
}
.profile h2 {
  font-size: 20px;
}
.profile-line {
  margin-top: 7px;
  color: var(--color-muted);
  font-size: 13px;
}
.profile-divider {
  width: 28px;
  height: 3px;
  margin: 18px auto;
  border-radius: 4px;
  background: var(--accent);
}
.profile-description {
  font-size: 13px;
  line-height: 1.9;
}
.profile-label {
  display: inline-block;
  margin-top: 20px;
  padding: 5px 12px;
  background: var(--accent-soft);
  color: var(--accent);
  border-radius: 8px;
  font-size: 11px;
}
.profile-label span {
  margin-right: 5px;
  font-size: 8px;
}
.side-note {
  padding: 23px;
}
.side-note p {
  margin-top: 18px;
  font-size: 14px;
  line-height: 2;
}
.note-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 26px;
  font-size: 8px;
  letter-spacing: 0.08em;
  color: var(--color-muted);
}
.note-bottom span {
  font-size: 20px;
  color: var(--accent);
}
.site-footer {
  padding: 42px 20px 30px;
  text-align: center;
  color: var(--color-muted);
  font-size: 12px;
  line-height: 2;
}
.site-footer span {
  margin: 0 8px;
}
@media (prefers-color-scheme: dark) {
  .hero {
    background-blend-mode: multiply;
    background-color: #83a193;
  }
  .hero-copy {
    color: #102f23;
  }
}
@media (max-width: 850px) {
  .page-layout {
    grid-template-columns: minmax(0, 1fr);
    max-width: 760px;
  }
  .sidebar {
    display: none;
  }
  .hero {
    height: 290px;
  }
  .hero-copy {
    padding-top: 55px;
  }
}
@media (max-width: 480px) {
  .page-layout {
    padding: 0 14px;
    margin-top: -25px;
  }
  .hero {
    height: 255px;
  }
  .hero-overline {
    font-size: 8px;
    letter-spacing: 0.15em;
  }
  .hero-title {
    letter-spacing: 0.02em;
  }
  .hero-subtitle {
    font-size: 12px;
    letter-spacing: 0;
  }
}
</style>
