# Workshop Deck — Playwright Automation & Java/Spring Boot App Modernization

A single self-contained HTML slide deck for the 13:30–17:00 hands-on workshop
(two independent tracks, insurance domain). No build step, no dependencies —
just open the file.

## Open it

```
open slides/workshop.html        # macOS
xdg-open slides/workshop.html    # Linux
```

Or double-click `workshop.html` in a file browser. It works fully offline
except for one external stylesheet link (Google Fonts — Manrope + JetBrains
Mono); the deck still renders with fallback system fonts if offline.

## Navigation

| Input | Action |
|---|---|
| `→ / ↓ / Space / Page Down` | Next slide |
| `← / ↑ / Page Up` | Previous slide |
| Mouse wheel | Throttled next/previous |
| Swipe (touch) | Next/previous |
| Nav dots (right edge) | Jump to any slide |

Progress bar (top) and the current slide index (`NN / 32`, top-right) always
reflect position. No inline text editing is included in this build.

## Structure

**32 slides**, split into an intro plus two independently-paced tracks. Content
is reconciled with this repo's actual shipped material — `docs/agenda.md`,
`docs/participant-lab.md`, `docs/app-modernization-demo.md`, and the real
`playwright-lab/` and `app-modernization-demo/` code — not an idealized demo.

- **Slides 1–3** — Title, workshop outcomes, and an agenda that matches
  `docs/agenda.md`'s ten timed rows exactly (13:30 open → 16:45 recap & Q&A).
- **Track A · Playwright (slides 4–19)** — automation value and suitable
  scenarios; a risk-based strategy; core policy/quote journeys; coverage and
  reliability patterns; passed/failed/flaky/skipped result classification;
  Report → Trace diagnostics; the real `tests/workshop-lab.spec.ts` hands-on
  exercise and deterministic failure report; then an Azure Pipeline hosted-agent
  baseline, the Workspaces execution boundary, and a cloud demo of 17 reliable
  tests × 5 = 85 instances with at most 20 client workers. It assumes the
  audience already uses Playwright and avoids a framework API tour.
- **Track B · App Modernization (slides 20–31)** — section divider,
  modernization challenges, modernization types, the Assess → Plan → Apply →
  Verify loop, artifacts, Copilot-fit vs. human-decision boundaries,
  guardrails, and a Java insurance demo grounded in the real baseline (Java
  17 / Spring Boot 3.2.4, five real smells: field injection, hard-coded
  pricing config, Map responses, manual validation, weak error handling),
  the checkpointed 35-minute flow (5 / 5 / 12 / 8 / 5 min: Assess, Plan,
  Apply, Verify, Review & rollback), a verify loop with a rehearsed
  checkpoint fallback, checkpoint evidence (diff review + 11/11 `mvn test` +
  open human gates — no PR, no merge), and a Track B recap.
- **Slide 32** — Closing / Q&A (shared, bookends slide 1).

Each track is visually distinguished by **state**, not a new color: Track A
uses a filled dot + solid edge accent bar; Track B uses a hollow dot + dashed
edge accent bar. Section label, slide index, and track indicator appear on
every slide.

## Design system — "Electric Studio"

- **Palette**: white, near-black (`#0a0a0a`), and a single electric blue
  (`#4361ee`) accent — no other hues.
- **Type**: Noto Sans TC + Manrope (display/body) and JetBrains Mono (code, watermarks),
  loaded from Google Fonts.
- **Motifs**: abstract CSS-only shapes — a hollow shield (insurance coverage),
  oversized `{ }` bracket watermark (developer/code), grid texture, and ring
  motifs. No raster images or icon fonts.
- **Components**: split-hero, section dividers, bullet/content slides, card
  grids (≤6 cards), compare panels, code windows (≤10 lines), and custom
  diagrams (pyramid, stepper, flow/loop, worker lanes, bar-compare, mock
  report/PR cards, folder tree, engine dots, check-ring list).

## Viewport & responsiveness

Every slide is `height: 100vh/100dvh; overflow: hidden;` — no in-slide
scrolling. All type/spacing use `clamp()`; the mandatory `viewport-base.css`
breakpoints (700 / 600 / 500px height) are embedded verbatim. Reveal
animations use `IntersectionObserver` and respect `prefers-reduced-motion`.

## Validation performed

- **Structure**: exactly 32 `<section class="slide ...">` blocks, balanced
  HTML tags (verified with `HTMLParser`), no leftover template markers, no
  negated `clamp()/min()/max()`, no inline-editing code, `viewport-base.css`
  present verbatim, Google Fonts link present.
- **Overflow**: checked with Playwright/Chromium across six viewports —
  1280×720, 1280×700, 1280×600, 1280×500, 375×667 (mobile), 1920×1080 — **0
  slides overflow** at any size, 0 console/page errors.
- **Content accuracy**: agenda times cross-checked against `docs/agenda.md`
  (all 10 rows match); Lab acceptance criteria checked against the starter and
  executable solution; Azure Pipeline behavior checked against
  `azure-pipelines.yml`; Workspaces claims checked against Microsoft Learn and
  the reliable-spec allowlist in `playwright.service.config.ts`; Java demo content cross-checked against
  `docs/app-modernization-demo.md` and
  `app-modernization-demo/workshop/{assessment,plan}.md`.
- **Visual QA**: sampled screenshots across representative slides in both
  tracks to confirm layout, contrast, and motif rendering.
- No PDF export was produced (not requested for this deliverable).
