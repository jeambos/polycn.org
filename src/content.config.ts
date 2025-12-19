import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    // 保留 loader，这是新版 Astro 读取文档的关键
    loader: docsLoader(),
    
    // 在这里植入我们的扩展规则
    schema: docsSchema({
      extend: z.object({
        // 允许 date 字段
        date: z.date().optional(),
        // 允许 author 字段
        author: z.string().optional(),
        // 允许 summary 字段
        summary: z.string().optional(),
        // 允许 status 字段
        status: z.enum(["draft", "published", "archived"]).optional(),
      }),
    }),
  }),
};