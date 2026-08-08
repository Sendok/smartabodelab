import { getCollection, getEntry } from "astro:content";

export async function getOrderedClusters() {
  const clusters = await getCollection("clusters");
  return clusters.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

export async function getClusterPillar(clusterId: string) {
  const cluster = await getEntry("clusters", clusterId);
  if (!cluster?.data.pillarArticle) return undefined;
  return getEntry("articles", cluster.data.pillarArticle);
}
