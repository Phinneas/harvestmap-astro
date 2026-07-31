import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const guides = await getCollection('guides');
  const sorted = guides.sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
  );

  return rss({
    title: 'HarvestMap — Harvest Guides',
    description: 'Guides to u-pick crops across America. When to go, what to bring, and how to pick the best fruit.',
    site: context.site,
    items: sorted.map((guide) => ({
      title: guide.data.title,
      description: guide.data.description,
      pubDate: guide.data.publishDate,
      link: `/guides/${guide.slug}/`,
      categories: [guide.data.crop, guide.data.season, guide.data.region],
    })),
  });
}
