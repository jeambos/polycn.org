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
          collapsed: false, // 如果你想默认展开就加上这句
        },

        {
          label: '🧪 自我测评',
          autogenerate: { directory: 'assessment' },
          // collapsed: true, // 如果你想默认折叠就加上这句
        },

        // 3. 【馆藏大厅】(拆解版)
        {
          label: '🏛️ 全部馆藏',
          collapsed: false,
          // 这里是 library 下的 items 数组内容
items: [
  // 3.1 馆藏首页
  {
    label: '🏛️ 馆藏大厅',
    link: '/library', 
  },

  // 3.2 📚 书籍推荐 (Books)
  // 保持扁平结构，因为书籍数量有限，直接列出书名文件夹即可，无需再分类
  {
    label: '📚 书籍推荐',
    collapsed: true,
    autogenerate: { directory: 'library/books' },
    // 预期目录结构：
    // library/books/ethical-slut/
    // library/books/more-than-two/
    // ...
  },

  // 3.3 🗺️ 实操指南 (Guides)
  // 侧重“How-to”和具体问题解决
  {
    label: '🗺️ 实操指南',
    collapsed: true,
    items: [
      {
        label: '🚀 启程：打开关系',
        autogenerate: { directory: 'library/guides/basics' },
        // 包含：从单偶到多边的过渡、如何向伴侣提出、知情同意的基础、常见误区
      },
      {
        label: '💬 沟通与冲突',
        autogenerate: { directory: 'library/guides/communication' },
        // 包含：非暴力沟通(NVC)、RADAR复盘法、争吵后的修复、如何谈论需求
      },
      {
        label: '🚧 边界与协议',
        autogenerate: { directory: 'library/guides/boundaries' },
        // 包含：制定规则(Rules) vs 设立边界(Boundaries)、否决权(Veto)的争议、安全词、关系协议书模板
      },
      {
        label: '❤️‍🩹 情绪与嫉妒',
        autogenerate: { directory: 'library/guides/emotions' },
        // 包含：嫉妒急救箱、不安全感处理、NRE(新雷能量)管理、孤独感
      },
      {
        label: '🏥 性与健康',
        autogenerate: { directory: 'library/guides/sex-health' },
        // 包含：性健康检测频率、如何谈论性安全、多边性爱(Threesome/Orgy)的礼仪与协商
      },
      {
        label: '🧩 进阶议题',
        autogenerate: { directory: 'library/guides/advanced' },
        // 包含：出柜(向家人/朋友)、养育子女、职场生存、法律风险等综合议题
      },
    ]
  },

  // 3.4 📰 深度文章 (Articles)
  // 侧重“Why”和宏观思考
  {
    label: '📰 深度文章',
    collapsed: true,
    items: [
      {
        label: '🧠 理论前沿',
        autogenerate: { directory: 'library/articles/theory' },
        // 包含：关系安那其(RA)宣言解读、单偶制规范(Mononormativity)批判、女权主义与多边恋
      },
      {
        label: '🌍 社会观察',
        autogenerate: { directory: 'library/articles/society' },
        // 包含：人类学视角、历史上的非单偶制、流行文化中的多边关系分析
      },
      {
        label: '🎓 学术译介',
        autogenerate: { directory: 'library/articles/academic' },
        // 包含：心理学论文翻译、社会学研究报告、数据统计
      },
      {
        label: '✍️ 观点与书评',
        autogenerate: { directory: 'library/articles/reviews' },
        // 包含：对经典书籍的书评、对时事热点的评论、争议性话题辩论
      },
    ]
  },

  // 3.5 📖 真人故事 (Stories)
  // 侧重个体叙事和感性体验
  {
    label: '📖 真人故事',
    collapsed: true,
    items: [
      {
        label: '👣 亲身经历',
        autogenerate: { directory: 'library/stories/experiences' },
        // 包含：我的开放故事、踩坑实录、采访记录
      },
      {
        label: '💭 思考随笔',
        autogenerate: { directory: 'library/stories/essays' },
        // 包含：碎片化的感悟、日记、诗歌、非理论性的个人哲学
      },
      {
        label: '🎬 影音推荐',
        autogenerate: { directory: 'library/stories/media' },
        // 包含：播客(Podcast)推荐、电影/剧集推荐、视频搬运
      },
    ]
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