import { defineCollection, z } from 'astro:content';

const guides = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    crop: z.string(),
    region: z.string(),
    season: z.enum(['spring', 'summer', 'autumn', 'winter', 'year']),
    description: z.string(),
    publishDate: z.coerce.date(),
    relatedState: z.string().optional(),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    author: z.string().default('HarvestMap'),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { guides, blog };
