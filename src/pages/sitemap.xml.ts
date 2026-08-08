import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE, STATIC_INDEXABLE_PAGES } from "../config/site";
import { getPublishedArticles } from "../utils/content";
import { escapeXml } from "../utils/xml";

export const prerender = true;

function xmlUrl(loc: string, lastmod?: Date) {
  const modified = lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : "";
  return `<url><loc>${escapeXml(new URL(loc, SITE.url).toString())}</loc>${modified}</url>`;
}

export const GET: APIRoute = async () => {
  const articles = await getPublishedArticles();
  const authors = await getCollection("authors");
  const clusters = await getCollection("clusters");
  const newestDate = articles[0]?.data.updatedAt ?? articles[0]?.data.publishedAt;

  const categories = [...new Set(articles.filter((post) => post.data.categorySlug !== post.data.cluster.id).map((post) => post.data.categorySlug))];
  const categoryDates = new Map<string, Date>();
  for (const post of articles) {
    const date = post.data.updatedAt ?? post.data.publishedAt;
    const current = categoryDates.get(post.data.categorySlug);
    if (!current || date > current) categoryDates.set(post.data.categorySlug, date);
  }

  const authorDates = new Map<string, Date>();
  for (const post of articles) {
    const date = post.data.updatedAt ?? post.data.publishedAt;
    const involvedAuthors = [post.data.author.id, post.data.reviewedBy?.id, post.data.factCheckedBy?.id].filter(Boolean) as string[];
    for (const authorId of involvedAuthors) {
      const current = authorDates.get(authorId);
      if (!current || date > current) authorDates.set(authorId, date);
    }
  }

  const staticPages = STATIC_INDEXABLE_PAGES.map((path) => xmlUrl(path, newestDate));
  const urls = [
    ...staticPages,
    ...articles.map((post) => xmlUrl(`/articles/${post.id}`, post.data.updatedAt ?? post.data.publishedAt)),
    ...categories.map((category) => xmlUrl(`/category/${category}`, categoryDates.get(category))),
    ...authors.map((author) => xmlUrl(`/author/${author.id}`, authorDates.get(author.id))),
    ...clusters.map((cluster) => {
      const dates = articles.filter((post) => post.data.cluster.id === cluster.id).map((post) => post.data.updatedAt ?? post.data.publishedAt);
      const lastmod = dates.length ? new Date(Math.max(...dates.map((date) => date.getTime()))) : newestDate;
      return xmlUrl(`/topics/${cluster.id}`, lastmod);
    })
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
};
