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
  }), sitemap(), react()],
});