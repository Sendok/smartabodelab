# SmartAbodeLab — Phase 3 Content Engine

Production-oriented Astro + Tailwind editorial starter for SmartAbodeLab. Phase 3 includes the complete Phase 1 technical SEO/GEO foundation and Phase 2 Editorial Authority layer, then adds a scalable topic-cluster content engine.

## What Phase 3 adds

### 1. Topic-cluster architecture

Content collection:

```text
src/content/clusters/
├── smart-energy.md
├── home-automation.md
├── urban-living.md
└── reviews.md
```

Generated hub index and topic pages:

```text
/topics
/topics/smart-energy
/topics/home-automation
/topics/urban-living
/topics/reviews
```

Each hub has a pillar article, subtopics, key questions, funnel-stage organization, connected topics, and `CollectionPage` structured data.

### 2. Content intent metadata

Articles now define:

- `cluster`
- `searchIntent`
- `funnelStage`
- `primaryKeyword`
- `secondaryKeywords`
- `entities`
- `directAnswer`
- `questions`

These fields drive navigation and recommendations. They are not intended for keyword stuffing.

### 3. Semantic recommendations

`src/utils/recommendations.ts` calculates related content from:

- explicit editor-defined `relatedPosts`
- shared cluster
- category/topic
- tags
- entities
- secondary keywords
- search intent

Manual relations receive the strongest score and semantic matching fills remaining slots.

### 4. Answer-first and decision components

Reusable UI now includes:

- Quick Answer
- visible common-question/FAQ block
- Comparison Snapshot
- Review Summary with score/pros/cons
- Topic Navigator sidebar
- Topic Cards

The Matter vs Zigbee sample demonstrates `comparisonSummary`. `_REVIEW_TEMPLATE.md` demonstrates review metadata without publishing a fake hands-on review.

### 5. Internal-link engine

Run:

```bash
npm run content:audit
```

It reports cluster coverage and contextual-link opportunities to:

```text
reports/content-engine-report.json
```

### 6. Content brief generator

```bash
npm run content:brief -- \
  --cluster home-automation \
  --keyword "Matter vs Thread" \
  --intent comparison \
  --type comparison
```

Output goes to `reports/briefs/`.

### 7. New-article generator

```bash
npm run article:new -- \
  --slug matter-vs-thread \
  --title "Matter vs. Thread: What Is the Difference?" \
  --cluster home-automation \
  --keyword "Matter vs Thread" \
  --author your-author-slug \
  --intent comparison \
  --type comparison
```

New articles are created as drafts.

## Content structure

```text
src/
├── content.config.ts
├── content/
│   ├── articles/
│   │   ├── _ARTICLE_TEMPLATE.md
│   │   ├── _REVIEW_TEMPLATE.md
│   │   └── *.md
│   ├── authors/
│   │   └── *.md
│   └── clusters/
│       └── *.md
├── components/
│   └── content-engine/
│       ├── ComparisonSnapshot.astro
│       ├── DirectAnswer.astro
│       ├── FAQSection.astro
│       ├── ReviewSummary.astro
│       ├── TopicCard.astro
│       └── TopicNavigator.astro
├── pages/
│   ├── articles/[id].astro
│   ├── topics/[cluster].astro
│   ├── category/[category].astro
│   └── ...
└── utils/
    ├── clusters.ts
    ├── recommendations.ts
    └── ...

scripts/
├── content-engine-audit.mjs
├── content-brief.mjs
├── new-article.mjs
├── editorial-readiness.mjs
├── setup-indexnow.mjs
└── indexnow.mjs

docs/
├── CONTENT_ENGINE.md
└── EDITORIAL_WORKFLOW.md
```

## Development

```bash
npm install
npm run dev
```

## Pre-publish checks

```bash
npm run content:audit
npm run editorial:check
npm run build
```

The normal `npm run build` also runs the non-strict editorial audit, content-engine audit, IndexNow key setup, and then Astro build.

## Important production note

The bundled author profiles are demo identities for the starter UI. Replace them with real contributors before public launch. Never use the review or expert-review fields unless the stated work actually occurred.

See `docs/CONTENT_ENGINE.md` for the Phase 3 editorial workflow and `docs/EDITORIAL_WORKFLOW.md` for Phase 2 trust requirements.
