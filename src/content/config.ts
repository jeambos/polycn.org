import { defineCollection, z } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  // 1. 集合名称必须叫 'docs'，不能改，否则 Starlight 不识别
  docs: defineCollection({
    
    // 2. 必须使用 docsSchema 作为基础
    schema: docsSchema({
      
      // 3. 使用 extend 来融合教程里的自定义字段
      extend: z.object({
        
        // --- 下面这些是你从教程里学来的好东西 ---
        
        // 日期 (建议设为 optional，防止旧文章报错)
        date: z.date().optional(),
        
        // 摘要/简介 (用于在列表页展示)
        summary: z.string().optional(),
        
        // 标签 (用于分类索引)
        tags: z.array(z.string()).optional(),
        
        // 文章状态 (用于标记草稿或归档)
        // z.enum 限制了只能填这三个词中的一个
        status: z.enum(["draft", "published", "archived"]).default("published"),
        
        // 分类 (其实你的文件夹目录已经是分类了，这个字段可视情况选填)
        category: z.string().optional(),
        
        // 作者 (文库站可能需要记录译者或原作者)
        author: z.string().optional(),
      }),
    }),
  }),
};