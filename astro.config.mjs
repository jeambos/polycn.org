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
        {
          label: '书籍',
          autogenerate: { directory: 'books' }, 
        },
        {
          label: '文章',
          autogenerate: { directory: 'articles' },
        },
      ],

     
    //  customCss: ['./src/styles/custom.css'], 
    }),
  ],
});