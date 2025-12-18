import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: '中文多元关系文库', // 这里填你的新名字 PolyCN
      social: {
        github: 'https://github.com/你的用户名/polycn-archive',
      },
      sidebar: [
        // Starlight 默认会自动根据文件夹生成侧边栏！
        // 你也可以在这里手动指定顺序，类似 Docusaurus 的 sidebars.js
        {
          label: '书籍',
          autogenerate: { directory: 'books' }, // 假设你把书放在 src/content/docs/books
        },
        {
          label: '文章',
          autogenerate: { directory: 'articles' },
        },
      ],
      customCss: [
        // 稍后我们要在这里引入你的落日橙样式
        './src/styles/custom.css',
      ],
    }),
  ],
});