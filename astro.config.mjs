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

      // ⚠️ 暂时先注释掉侧边栏配置
      // 原因：如果你本地还没有 src/content/docs/books 文件夹，这行代码会让程序再次报错。
      // 等网站跑起来了，我们再创建文件夹并开启它。
      /*
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
      */
     
      // 如果你还没有创建这个 CSS 文件，这行也可能报错，建议先注释掉
      // customCss: ['./src/styles/custom.css'], 
    }),
  ],
});