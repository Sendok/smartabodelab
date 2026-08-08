import type { CollectionEntry } from "astro:content";
import { getPublishedArticles } from "./content";

type Article = CollectionEntry<"articles">;

function normalize(values: string[]) {
  return new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean));
}

function overlapScore(a: string[], b: string[], weight: number) {
  const left = normalize(a);
  let score = 0;
  for (const value of b) if (left.has(value.trim().toLowerCase())) score += weight;
  return score;
}

export function scoreRelatedArticle(source: Article, candidate: Article) {
  if (source.id === candidate.id) return Number.NEGATIVE_INFINITY;

  let score = 0;
  const manualIds = new Set(source.data.relatedPosts.map((item) => item.id));

  if (manualIds.has(candidate.id)) score += 100;
  if (source.data.cluster.id === candidate.data.cluster.id) score += 32;
  if (source.data.categorySlug === candidate.data.categorySlug) score += 12;
  if (source.data.topic === candidate.data.topic) score += 8;
  if (source.data.searchIntent === candidate.data.searchIntent) score += 4;
  if (source.data.funnelStage !== candidate.data.funnelStage) score += 2;

  score += overlapScore(source.data.tags, candidate.data.tags, 5);
  score += overlapScore(source.data.entities, candidate.data.entities, 4);
  score += overlapScore(source.data.secondaryKeywords, candidate.data.secondaryKeywords, 2);

  return score;
}

export async function getRelatedArticles(source: Article, limit = 4) {
  const articles = await getPublishedArticles();

  return articles
    .map((candidate) => ({ candidate, score: scoreRelatedArticle(source, candidate) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.candidate.data.publishedAt.getTime() - a.candidate.data.publishedAt.getTime();
    })
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export async function getClusterArticles(clusterId: string, currentId?: string, limit?: number) {
  const articles = (await getPublishedArticles())
    .filter((article) => article.data.cluster.id === clusterId && article.id !== currentId);

  return typeof limit === "number" ? articles.slice(0, limit) : articles;
}
