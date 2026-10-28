import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

export default function markdownPostsPlugin() {
  // 前端导入时使用的模块名
  const virtualId = 'virtual:posts'

  // Vite 内部识别虚拟模块的 ID
  const resolvedId = '\0' + virtualId

  let postsDirectory

  return {
    name: 'markdown-posts',

    // 获取项目根目录
    configResolved(config) {
      postsDirectory = path.resolve(config.root, 'content/posts')
    },

    // 告诉 Vite：这个模块由本插件负责提供
    resolveId(id) {
      if (id === virtualId) {
        return resolvedId
      }
    },

    // 生成模块内容
    load(id) {
      if (id !== resolvedId) return

      const files = fs.readdirSync(postsDirectory, {
        withFileTypes: true,
      })

      const posts = files
        .filter(file => file.isFile() && file.name.endsWith('.md'))
        .map(file => {
          const filePath = path.join(postsDirectory, file.name)
          const source = fs.readFileSync(filePath, 'utf-8')

          // data 是顶部元信息，content 是 Markdown 正文
          const { data, content } = matter(source)

          // 尽早提示文章格式错误
          if (
            typeof data.title !== 'string' ||
            typeof data.date !== 'string' ||
            !/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
            typeof data.description !== 'string' ||
            !Array.isArray(data.tags) ||
            !data.tags.every(tag => typeof tag === 'string')
          ) {
            throw new Error(
              `${file.name} 的元信息格式不正确：需要 title、date、description、tags，日期请加引号`,
            )
          }

          return {
            slug: file.name.slice(0, -3),
            title: data.title,
            date: data.date,
            description: data.description,
            tags: data.tags,
            content,
          }
        })

      // 返回一段 JavaScript 模块源码
      return `export const posts = ${JSON.stringify(posts)};`
    },

    // 开发时监听文章新增、修改和删除
    configureServer(server) {
      server.watcher.add(postsDirectory)

      const refreshPosts = file => {
        const absolutePath = path.resolve(file)

        if (
          path.dirname(absolutePath) !== postsDirectory ||
          !absolutePath.endsWith('.md')
        ) {
          return
        }

        const module = server.moduleGraph.getModuleById(resolvedId)

        if (module) {
          server.moduleGraph.invalidateModule(module)
        }

        server.ws.send({ type: 'full-reload' })
      }

      server.watcher.on('add', refreshPosts)
      server.watcher.on('change', refreshPosts)
      server.watcher.on('unlink', refreshPosts)
    },
  }
}