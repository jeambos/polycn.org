import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
 site: 'https://polycn.org',
 
 integrations: [starlight({
    title: 'PolyCN',
    
// ✅ 社交图标配置区 (v0.33+ 数组格式)
      social: [
        {
          label: 'RSS',
          href: '/rss.xml',
          icon: 'rss',
        },
        {
          label: 'X',
          href: 'https://x.com/polycn_org',
          icon: 'x.com',
        },
        {
          label: 'Telegram',
          href: 'https://t.me/polycn_org',
          icon: 'telegram',
        },
        {
          label: 'Email',
          href: 'mailto:hi@polycn.org',
          icon: 'email',
        },
      ],


    sidebar: [
        // 1. 【开始使用】是一个单纯的链接，没问题
        { 
          label: '🚀 开始探索', 
          link: '/start' 
        },

        {
          label: '🧪 自我测评',
          autogenerate: { directory: 'assessment' },
          // collapsed: true, // 如果你想默认折叠就加上这句
        },

        // 3. 【馆藏大厅】(拆解版)
        {
          label: '🏛️ 全部馆藏',
          collapsed: true,
          items: [
            // 3.1 馆藏首页 (对应 library/index.mdx)
            {
              label: '🏛️ 馆藏大厅',
              link: '/library', 
            },
            // 3.2 深度文章 (手动命名 + 自动生成内容)
            {
              label: '📰 深度文章',
              autogenerate: { directory: 'library/articles' },
              collapsed: true,
            },
            // 3.3 书籍推荐
            {
              label: '📚 书籍推荐',
              autogenerate: { directory: 'library/books' },
              collapsed: true,
            },
            // 3.4 实操指南
            {
              label: '🗺️ 实操指南',
              autogenerate: { directory: 'library/guides' },
              collapsed: true,
            },
            // 3.5 真人故事
            {
              label: '📖 真人故事',
              autogenerate: { directory: 'library/stories' },
              collapsed: true,
            },
          ]
        },

        // 3. 【Wiki 百科】同理
        {
          label: '🧠 Wiki 百科',
          // ❌ 删除下面这一行
          // link: '/wiki',
          
          autogenerate: { directory: 'wiki' },
          collapsed: true,
        },
        
        // ... 其他配置
        {
          label: '关于我们',
          autogenerate: { directory: 'about' },
          collapsed: true, 
        }
      ],

   
    customCss: ['./src/styles/custom.css'], 
  }), sitemap(), react()],
});