import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: '中文多元关系文库',
      
      // ✅ 修复点：将 url 改为 href
      social: [
        {
          label: 'GitHub',
          href: 'https://github.com/jeambos/polycn.org', 
          icon: 'github',
        },
      ],


      sidebar: [
        // 1. 快速入门
        {
          label: '🚀 快速入门',
          // 自动折叠，保持侧边栏整洁
          collapsed: false, 
          autogenerate: { directory: 'start' },
        },

        // 2. 文库馆藏 (核心区域，手动分组)
        {
          label: '🏛️ 文库馆藏',
          items: [
            {
              label: '📚 书籍',
              collapsed: true,
              autogenerate: { directory: 'library/books' },
            },
            {
              label: '🧭 实操指南',
              collapsed: true,
              autogenerate: { directory: 'library/guides' },
            },
            {
              label: '📰 深度文章',
              collapsed: true,
              autogenerate: { directory: 'library/articles' },
            },
          ],
        },

        // 3. 百科 Wiki
        {
          label: '🧠 百科 Wiki',
          collapsed: true,
          autogenerate: { directory: 'wiki' },
        },

        // 4. 访谈录
        {
          label: '🎤 访谈录',
          collapsed: true,
          autogenerate: { directory: 'stories' },
        },

        // 5. 关于本站
        {
          label: 'ℹ️ 关于本站',
          collapsed: true,
          autogenerate: { directory: 'about' },
        },
      ],

     
    //  customCss: ['./src/styles/custom.css'], 
    }),
  ],
});