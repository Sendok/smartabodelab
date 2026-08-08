export const SITE = {
  name: "SmartAbodeLab",
  url: "https://smartabodelab.com",
  description:
    "Independent guides, reviews, and practical ideas for smart home automation, home energy efficiency, and urban living.",
  language: "en-US",
  ogLocale: "en_US",
  organizationId: "https://smartabodelab.com/#organization",
  websiteId: "https://smartabodelab.com/#website",
  logo: "/brand/logo-512.png",
  defaultOgImage: "/brand/og-default.png",
  socialProfiles: [] as string[],
  editorial: {
    about: "/about",
    masthead: "/masthead",
    principles: "/editorial-policy",
    reviewMethodology: "/review-methodology",
    factChecking: "/fact-checking-policy",
    corrections: "/corrections-policy",
    affiliateDisclosure: "/affiliate-disclosure"
  }
} as const;

export const STATIC_INDEXABLE_PAGES = [
  "/",
  "/topics",
  SITE.editorial.about,
  SITE.editorial.masthead,
  SITE.editorial.principles,
  SITE.editorial.reviewMethodology,
  SITE.editorial.factChecking,
  SITE.editorial.corrections,
  SITE.editorial.affiliateDisclosure
] as const;
