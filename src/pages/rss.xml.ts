import type { APIRoute } from "astro";
import { getEntry } from "astro:content";
import { SITE } from "../config/site";
import { getPublishedArticles } from "../utils/content";
import { escapeXml } from "../utils/xml";

export const prerender = true;

export const GET: APIRoute = async () => {
  const articles = await getPublishedArticles();
  const items = await Promise.all(
    articles.slice(0, 50).map(async (post) => {
      const author = await getEntry(post.data.author);
      const url = new URL(`/articles/${post.id}`, SITE.url).toString();
      return `
        <item>
          <title>${escapeXml(post.data.title)}</title>
          <link>${escapeXml(url)}</link>
          <guid isPermaLink="true">${escapeXml(url)}</guid>
          <pubDate>${post.data.publishedAt.toUTCString()}</pubDate>
          <description>${escapeXml(post.data.description)}</description>
          <category>${escapeXml(post.data.category)}</category>
          ${author ? `<dc:creator>${escapeXml(author.data.name)}</dc:creator>` : ""}
        </item>`;
    })
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${escapeXml(SITE.url)}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${escapeXml(new URL("/rss.xml", SITE.url).toString())}" rel="self" type="application/rss+xml" />
    ${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
};
