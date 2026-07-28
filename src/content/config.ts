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

export const collections = { guides };
