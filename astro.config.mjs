import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: '中文多元关系文库', // 你的网站标题 PolyCN
      
      // ⚠️ 修复部分：这里必须是数组 [...]
      social: [
        {
          label: 'GitHub',
          url: 'https://github.com/jeambos/polycn.org', // 你的仓库地址
          icon: 'github',
        },
      ],

      // 侧边栏配置 (Starlight 会自动读取目录，这里可以手动指定顺序)
      sidebar: [
        {
          label: '书籍',
          autogenerate: { directory: 'books' }, 
        },
        {
          label: '文章',
          autogenerate: { directory: 'articles' },
        },
      ],

      // 自定义 CSS 路径
      customCss: [
        './src/styles/custom.css',
      ],
    }),
  ],
});