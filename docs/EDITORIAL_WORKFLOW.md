# SmartAbodeLab Editorial Workflow

Use this as the operating checklist before setting `draft: false`.

## 1. Define the article type

Choose one truthful `contentType`:

- `guide` — practical instructions or decision support
- `explainer` — explains a concept or feature set
- `comparison` — compares alternatives using explicit criteria
- `review` — evaluates a product/service; document whether the work is research-only or hands-on
- `opinion` — analysis or viewpoint; separate opinion from factual claims

## 2. Identify the author

Use a real author profile. The byline should map to someone who meaningfully created the article. Update the author page with only verifiable expertise, credentials, experience, and external profiles.

## 3. Record how the article was created

Use `creationMethod` only when it accurately describes the work:

- `editorial-research`
- `hands-on-testing`
- `first-hand-experience`
- `expert-analysis`

Hands-on testing, first-hand experience, and original research require `methodologyNote`. Include enough detail to understand test conditions, tools, duration, sample size, limitations, or research scope.

## 4. Add sources

Prefer primary and authoritative evidence. Typical source order:

1. Standards bodies / government / regulators
2. Academic or peer-reviewed research
3. Official technical documentation
4. Utilities / recognized industry institutions
5. Manufacturer documentation
6. High-quality secondary reporting for context

Do not add sources simply to make a page look authoritative. A source should materially support or contextualize the article.

## 5. Review and fact-check honestly

Only set `reviewedBy` when another person performed an editorial review. Pair it with `reviewedAt`.

Only set `factCheckedBy` when another person verified material factual claims. Pair it with `factCheckedAt`.

Do not use either label for spellcheck, grammar cleanup, or automated validation.

## 6. Commercial disclosure

Set `affiliateDisclosure: true` when affiliate links are present. Disclose supplied products, sponsored access, paid travel, or other material relationships in the article or methodology note when relevant.

## 7. AI assistance

If AI materially assisted production in a way readers would reasonably want to know, set:

```yaml
aiAssisted: true
aiDisclosure: "Describe the role of AI and the human review performed."
```

Do not list an AI system as the author.

## 8. Corrections

Use `corrections` for material factual corrections, not ordinary typo fixes.

```yaml
corrections:
  - date: 2026-08-08
    summary: "Corrected the protocol version and updated the affected recommendation."
```

## 9. Pre-publish checks

- Title accurately describes the article.
- Direct answer appears early where appropriate.
- Claims are supported or clearly framed as analysis/opinion.
- Product testing claims have evidence and methodology.
- Sources point to originals where practical.
- Image alt text is accurate.
- Author identity is real.
- Reviewer/fact-check labels are truthful.
- Affiliate and AI disclosures are set when applicable.
- Related posts are genuinely relevant.
- `draft: false` only after editorial review is complete.

Run:

```bash
npm run editorial:check
```

The bundled demo author profiles intentionally trigger strict warnings until replaced.
