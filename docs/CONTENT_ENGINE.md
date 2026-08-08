# SmartAbodeLab Content Engine

Phase 3 turns the publication from a chronological article list into a topic-cluster system.

## Publishing model

Each article belongs to one broad `cluster` and retains its narrower editorial `category`.

Current cluster hubs:

- `/topics/smart-energy`
- `/topics/home-automation`
- `/topics/urban-living`
- `/topics/reviews`

A cluster defines:

- primary topic / keyword
- aliases
- pillar article
- subtopics
- reader questions
- related clusters

The hub groups supporting articles by reader journey:

- `awareness` — understand the problem or concept
- `consideration` — compare approaches and trade-offs
- `decision` — reviews, recommendations, or action-ready guidance

## Article semantic fields

Required Phase 3 fields:

```yaml
cluster: "home-automation"
searchIntent: "comparison"
funnelStage: "consideration"
primaryKeyword: "Matter vs Zigbee"
secondaryKeywords:
  - "Matter smart home"
  - "Zigbee smart home"
entities:
  - "Matter"
  - "Zigbee"
directAnswer: "A concise answer..."
questions:
  - question: "Is Matter better than Zigbee?"
    answer: "A concise visible answer..."
```

These fields are used to organize the site and improve content completeness. They should reflect the actual article, not be stuffed with query variants.

## Semantic related-post engine

`src/utils/recommendations.ts` scores candidates using:

1. manual `relatedPosts` — strongest signal
2. same topic cluster
3. same category / broad topic
4. shared tags
5. shared named entities
6. shared secondary keywords
7. search-intent relationship

Manual relationships remain available when an editor knows a specific article is the best next read.

## Contextual internal links

Automatic recommendation cards do not replace links inside the article body.

When another article genuinely helps explain a concept or next step, add a normal Markdown link with descriptive anchor text:

```md
See our [Matter vs. Zigbee comparison](/articles/matter-vs-zigbee) before choosing a hub.
```

Avoid generic anchors such as `click here` or large blocks of repetitive links.

## Content audit

Run:

```bash
npm run content:audit
```

The command checks:

- cluster assignment
- primary keyword / intent / funnel stage
- answer-first metadata
- question coverage
- entity metadata
- contextual article links
- cluster coverage by funnel stage
- internal-link opportunities

It writes machine-readable suggestions to:

```text
reports/content-engine-report.json
```

## Content brief generator

Create a brief before writing:

```bash
npm run content:brief -- \
  --cluster home-automation \
  --keyword "Matter vs Thread" \
  --intent comparison \
  --type comparison
```

The brief is written to `reports/briefs/` and includes:

- cluster purpose
- reader outcome placeholder
- answer-first requirement
- cluster questions
- existing cluster articles to link
- evidence plan
- suggested outline
- GEO extraction checklist

## Article scaffold generator

Create a new draft:

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

The generated article remains `draft: true` until editorial work is complete.

## Review articles

Use `_REVIEW_TEMPLATE.md` only when the product was genuinely evaluated using the stated method.

`reviewSummary` creates the visible score, verdict, pros, and cons box. Hands-on review claims still require `creationMethod: hands-on-testing` and a real `methodologyNote` from Phase 2.

## Comparison articles

`comparisonSummary` creates a responsive comparison snapshot before the prose body:

```yaml
comparisonSummary:
  options:
    - "Matter"
    - "Zigbee"
  rows:
    - criterion: "Primary role"
      values:
        - "Interoperability layer"
        - "Low-power mesh networking"
  bottomLine: "..."
```

Every row must contain exactly one value for every option.

## Recommended production rhythm

For each cluster, aim for coverage breadth before publishing dozens of near-duplicate posts:

1. one strong pillar / start-here guide
2. several awareness explainers
3. several consideration/comparison pieces
4. decision-stage reviews or recommendations only where editorial evidence supports them
5. contextual internal links among pages that genuinely help each other
6. refresh older pages when new supporting content changes the best next step
