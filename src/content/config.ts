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
    type: z.enum(['guide', 'outing']).default('guide'),
    stops: z.array(z.object({
      name: z.string(),
      kind: z.enum(['u-pick', 'pumpkin-patch', 'farm-stand', 'market', 'orchard', 'cider-mill', 'corn-maze']),
      timing: z.string(),
      note: z.string(),
    })).optional(),
    bestWindow: z.string().optional(),
    states: z.array(z.string()).optional(),
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
