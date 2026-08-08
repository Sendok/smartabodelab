import { SITE } from "../config/site";

export type JsonLdNode = Record<string, unknown>;

export function absoluteUrl(pathOrUrl: string) {
  return new URL(pathOrUrl, SITE.url).toString();
}

export function organizationSchema(): JsonLdNode {
  const schema: JsonLdNode = {
    "@type": "Organization",
    "@id": SITE.organizationId,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(SITE.logo),
      width: 512,
      height: 512
    },
    publishingPrinciples: absoluteUrl(SITE.editorial.principles),
    correctionsPolicy: absoluteUrl(SITE.editorial.corrections),
    ethicsPolicy: absoluteUrl(SITE.editorial.principles)
  };

  if (SITE.socialProfiles.length > 0) schema.sameAs = SITE.socialProfiles;
  return schema;
}

export function websiteSchema(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": SITE.websiteId,
    url: SITE.url,
    name: SITE.name,
    description: SITE.description,
    inLanguage: SITE.language,
    publisher: { "@id": SITE.organizationId }
  };
}

export function breadcrumbSchema(
  items: Array<{ name: string; url: string }>
): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url)
    }))
  };
}

export function editorialPageSchema(
  name: string,
  description: string,
  canonicalPath: string
): JsonLdNode {
  const url = absoluteUrl(canonicalPath);
  return {
    "@type": "WebPage",
    "@id": url,
    url,
    name,
    description,
    inLanguage: SITE.language,
    isPartOf: { "@id": SITE.websiteId },
    publisher: { "@id": SITE.organizationId }
  };
}

export function personRef(authorId: string, name: string, url: string, role?: string): JsonLdNode {
  return {
    "@type": "Person",
    "@id": `${url}#person`,
    name,
    url,
    ...(role ? { jobTitle: role } : {})
  };
}

export function jsonLdGraph(pageSchemas: JsonLdNode[] = []) {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema(), websiteSchema(), ...pageSchemas]
  };
}
