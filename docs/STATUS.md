# Inbait – project status and handoff

Last updated: 2026-11-08

## What Inbait is
A public, static security-awareness website styled as a mail client. People learn to spot
phishing and related scams by "playing the target" in safe, fictional simulations.
The site name is **Inbait** (same as the repository). It was originally briefed as "HookBox";
every reference to HookBox should read Inbait (e.g. `team@inbait.example`, storage key `inbait:v1`).

The owner's full project brief (sections 0–18) is not stored in the repo. Ask the owner to paste it
or save it as `docs/BRIEF.md`.

## Where things live
- Repo: `indocanadian416/Inbait` (public)
- Working branch: `claude/hookbox-phishing-site-7u05ec`
- Live site: https://indocanadian416.github.io/Inbait/ – currently served from the `gh-pages` branch
  (Settings → Pages → Deploy from a branch → `gh-pages` / root). `gh-pages` is a `git subtree split`
  of the `site/` folder. Update it with:
  `git subtree split --prefix site -b gh-pages && git push origin gh-pages` (normal push, no force).

## Done (first version)
- Design tokens (light/dark/system), base, layout, components, modules and print CSS
  - Contrast fixes: light `--warning` is `#975A00`; dark theme uses `--on-brand`/`--on-danger` dark text on filled buttons
- Icon sprite, logo, favicons, PWA icons, og-image, QR code (`scripts/make_qr.py`)
- `index.html` shell with CSP, `404.html`, `manifest.webmanifest`, `.nojekyll`
- Core JS: `theme-init.js`, `app.js` (shell, nav, drawer, bottom nav, theme, Hook Score, SW registration),
  `router.js`, `store.js`, `util.js`, `ui/` (toast, modal, popover, ring, confetti)
- Practice framework: `modules/scenes.js` (renderers for email, call, chat, text, browser + reveal),
  `modules/practice.js` (list + reading pane + feedback loop), `inbox.js` (welcome email + result emails),
  `calls.js`, `chat.js`, `browser.js`, `texts.js`
- Content files exist but are empty arrays (`site/content/*.json`, `site/data/*.json`)
- About page (privacy, disclaimer, theme, reset progress, license) and Got Hooked? checklist (6 situations, ticks saved locally)
- `sw.js` (cache `inbait-v2`), `robots.txt`, `sitemap.xml`
- Placeholder "coming soon" modules: challenge, radar, learn

## Not done yet
- Scenario content: calls (`calls.json` still empty)
- Hook Radar auto-refresh: `scripts/fetch_feed.py`, `sources.json`, `keywords.json` (feed is
  currently a hand-curated, static `data/feed.json` + `feed-meta.json`, no live fetch yet)
- Learn page (slugs exist in `learn.json`; the Learn *page* is still a "coming soon" placeholder,
  so "Learn more" / Radar "Learn" links land on the placeholder for now)
- About page: add Hook Radar source credits
- `scripts/validate_content.py`, `.github/workflows/pages.yml`
- README, `docs/CONTENT_GUIDE.md`, SECURITY.md, CONTRIBUTING.md
- Section 16 acceptance tests, PR into `main`

## Done since first version (content + three sections)
- Scenario content from `docs/SCENARIOS.md`: 6 emails, 2 texts, 2 chats, 4 browser pages; 16 Learn
  topic slugs. All fictional/compliant (.example domains, fictional brands, 555-01xx numbers);
  genuine internal mail aligned to `brightlinecorp.example`.
- Challenge engine (`modules/challenge.js`): random mixed draw across folders, no hints until the end,
  scoring + verdict tiers, results page with score ring, per-item review, share-card copy, retry, and
  history. Result shape matches the fields `inbox.js` already reads (`score`, `verdict`, `date`, `missed`).
- Hook Radar (`modules/radar.js`): curated trends feed with severity + category chips, category
  filters, "new since last visit" markers (`store.radarLastVisit`), search, and Learn/Practice links.
- SW cache bumped to `inbait-v3` because JS/CSS changed. New CSS lives at the end of `css/modules.css`.
- Owner decided to keep the Browser folder (not remove it) and fill it; browser-delivered phishing
  (fake login, ClickFix, OAuth consent, fake update) is a core modern vector gateway vendors can't rehearse.

## Decisions made by the owner
- Switch publishing to GitHub Actions later, in this order: confirm gh-pages == site/, check workflow
  permissions are "write", merge `pages.yml` via PR, switch Pages source to GitHub Actions, check the
  `github-pages` environment allows `main`, bump SW cache version, run the workflow, verify.
- Keep `gh-pages` for one week after Actions deploy works, as rollback. Then delete it.
- Work goes to `main` via a PR from the working branch, with a summary, PASS/FAIL test results and open issues.
- Keep the ★ checkpoints from the brief.

## Notes
- Action versions checked (latest majors): checkout v7, setup-python v7, configure-pages v6,
  upload-pages-artifact v5, deploy-pages v5.
- Feed sources: only the Microsoft Security Blog feed was reachable from the cloud sandbox; the others
  were blocked by the sandbox proxy, not confirmed broken. Verify them from GitHub Actions.
- In the previous session, an automated safety check stopped the assistant twice: while writing
  scenario content and while writing the Challenge module. Work in small, separate requests.
