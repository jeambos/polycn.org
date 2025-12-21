import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
 site: 'https://polycn.org',
 
 integrations: [starlight({
    title: 'PolyCN',
    
    // ✅ 修复点：将 url 改为 href
    social: [
      {
        label: 'GitHub',
        href: 'https://github.com/jeambos/polycn.org', 
        icon: 'github',
      },
    ],


    sidebar: [
        // 1. 【开始使用】是一个单纯的链接，没问题
        { 
          label: '🚀 开始探索', 
          link: '/start' 
        },

        // 2. 【馆藏大厅】必须是一个纯粹的分组
        {
          label: '🏛️ 全部馆藏',
          // ❌ 删除下面这一行：不能同时拥有 link 和 autogenerate
          // link: '/library', 
          
          // ✅ 保留自动生成：它会自动把 index.mdx 作为第一项显示
          autogenerate: { directory: 'library' },
          collapsed: true, 
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
  }), sitemap()],
});