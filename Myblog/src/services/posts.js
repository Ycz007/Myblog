import { reactive } from "vue"
import firstPostContent from '../../content/posts/hello-world.md?raw'

export const blogs = reactive({
  posts: [
    {
      slug: 'vue3-vitepress-blog-setup',
      title: '用 Vue 3 + VitePress 从零搭建个人博客',
      date: '2026-10-20',
      description: '记录从初始化项目到部署上线的完整流程，适合第一次接触静态站点生成器的开发者。',
      tags: ['Vue', 'VitePress', '博客搭建'],
      content: firstPostContent
    },
    {
      slug: 'markdown-front-matter-guide',
      title: 'Markdown Front-matter 到底该怎么写',
      date: '2026-10-24',
      description: '解释 slug、title、date、description、tags 这几个字段的含义与常见写法，以及解析时容易踩的坑。',
      tags: ['Markdown', '前端', '内容管理'],
      content: 'Front-matter 是 Markdown 开头用 --- 包裹的 YAML 元数据，存放 slug、title、date 等字段。'
    },
    {
      slug: 'git-first-push-notes',
      title: 'Git 首次推送常见问题记录',
      date: '2026-10-28',
      description: '整理 remote 配置、upstream 追踪、推送认证等首次推送到 GitHub 时最容易卡住的几个点。',
      tags: ['Git', 'GitHub', '工具'],
      content: '首次推送要用 git remote add 配好远程，再用 git push -u origin main 设置 upstream。'
    }
  ]
})