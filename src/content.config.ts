import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const sourceSchema = z.object({
  title: z.string(),
  publisher: z.string(),
  url: z.string().url(),
  accessedAt: z.coerce.date().optional(),
  note: z.string().optional()
});

const correctionSchema = z.object({
  date: z.coerce.date(),
  summary: z.string()
});

const faqSchema = z.object({
  question: z.string(),
  answer: z.string()
});

const reviewSummarySchema = z.object({
  score: z.number().min(0).max(5),
  bestFor: z.string(),
  verdict: z.string(),
  pros: z.array(z.string()).min(1),
  cons: z.array(z.string()).min(1)
});

const comparisonSummarySchema = z.object({
  options: z.array(z.string()).min(2).max(4),
  rows: z.array(z.object({
    criterion: z.string(),
    values: z.array(z.string()).min(2).max(4)
  })).min(1),
  bottomLine: z.string()
});

const authors = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/authors" }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    avatar: z.string(),
    bio: z.string(),
    twitter: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    website: z.string().url().optional(),
    expertise: z.array(z.string()).default([]),
    credentials: z.array(z.string()).default([]),
    experience: z.string().optional()
  })
});

const clusters = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/clusters" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    shortDescription: z.string(),
    primaryKeyword: z.string(),
    aliases: z.array(z.string()).default([]),
    order: z.number().int().default(100),
    icon: z.enum(["energy", "automation", "urban", "reviews"]),
    pillarArticle: z.string().optional(),
    subtopics: z.array(z.object({
      name: z.string(),
      description: z.string(),
      keywords: z.array(z.string()).default([])
    })).default([]),
    keyQuestions: z.array(z.string()).default([]),
    relatedClusters: z.array(z.string()).default([])
  })
});

const articleSchema = z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(["Smart Energy", "Home Automation", "Urban Living", "Reviews", "IoT Protocols", "Apartment Hacks"]),
    categorySlug: z.string(),
    topic: z.enum(["energy", "iot", "appliances", "apartment"]),
    cluster: reference("clusters"),
    contentType: z.enum(["guide", "explainer", "comparison", "review", "opinion"]).default("guide"),
    searchIntent: z.enum(["informational", "commercial", "comparison", "transactional", "navigational"]).default("informational"),
    funnelStage: z.enum(["awareness", "consideration", "decision"]).default("awareness"),
    primaryKeyword: z.string(),
    secondaryKeywords: z.array(z.string()).default([]),
    entities: z.array(z.string()).default([]),
    directAnswer: z.string().optional(),
    questions: z.array(faqSchema).default([]),
    reviewSummary: reviewSummarySchema.optional(),
    comparisonSummary: comparisonSummarySchema.optional(),
    author: reference("authors"),
    reviewedBy: reference("authors").optional(),
    reviewedAt: z.coerce.date().optional(),
    factCheckedBy: reference("authors").optional(),
    factCheckedAt: z.coerce.date().optional(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    readTime: z.string(),
    image: z.string(),
    imageAlt: z.string(),
    featured: z.boolean().default(false),
    editorsPick: z.boolean().default(false),
    draft: z.boolean().default(false),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    tags: z.array(z.string()).default([]),
    relatedPosts: z.array(reference("articles")).default([]),
    keyTakeaways: z.array(z.string()).default([]),
    sources: z.array(sourceSchema).default([]),
    creationMethod: z.enum(["editorial-research", "hands-on-testing", "first-hand-experience", "expert-analysis"]).optional(),
    methodologyNote: z.string().optional(),
    originalResearch: z.boolean().default(false),
    affiliateDisclosure: z.boolean().default(false),
    aiAssisted: z.boolean().default(false),
    aiDisclosure: z.string().optional(),
    corrections: z.array(correctionSchema).default([])
  }).superRefine((data, ctx) => {
    if (Boolean(data.reviewedBy) !== Boolean(data.reviewedAt)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "reviewedBy and reviewedAt must be supplied together." });
    }
    if (Boolean(data.factCheckedBy) !== Boolean(data.factCheckedAt)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "factCheckedBy and factCheckedAt must be supplied together." });
    }
    if ((data.creationMethod === "hands-on-testing" || data.creationMethod === "first-hand-experience" || data.originalResearch) && !data.methodologyNote) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Hands-on, first-hand, and original-research claims require methodologyNote." });
    }
    if (data.aiAssisted && !data.aiDisclosure) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "aiAssisted: true requires aiDisclosure." });
    }
    if (!data.aiAssisted && data.aiDisclosure) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "aiDisclosure should only be supplied when aiAssisted is true." });
    }
    if (data.reviewSummary && data.contentType !== "review") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "reviewSummary should only be used with contentType: review." });
    }
    if (data.comparisonSummary) {
      for (const row of data.comparisonSummary.rows) {
        if (row.values.length !== data.comparisonSummary.options.length) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Comparison row '${row.criterion}' must contain one value per option.` });
        }
      }
    }
  });

const articles = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/articles" }),
  schema: articleSchema
});

export const collections = { articles, authors, clusters };
