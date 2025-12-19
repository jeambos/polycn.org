import { defineCollection, z } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    schema: docsSchema({
      // 这里扩展了 Starlight 默认的结构
      extend: z.object({
        // 增加 date 字段，类型是日期，而且是可选的
        date: z.date().optional(),
      }),
    }),
  }),
};