# JARVIS OFFICE — Revenue v0.6 (standalone static demo)

**Status:** Revenue v0.6 is the default demonstration page. No live JARVIS integration, AI, outbound API requests, automation, payment, or production connection. The five-role workflow, HELD handling and exceptional third design revision are scripted illustrations, **not test evidence**.

## Open the pages

- `/` / `index.html`: Revenue v0.6 — BOLT, SCOUT, ATLAS, PULSE, TITAN; scenario selector and visual handoff/HELD timeline.
- `/office-v0.3.html`: Original v0.3 animated BOLT/TITAN/SCOUT demo. Preserved for comparison and rollback.
- `/docs/revenue-v0.6.html`: Same Revenue design-only storyboard as a standalone subpage.

The pre-existing v0.4 3D / articulated character trial remains independently on branch `feature/office-v0.4`, Draft PR #1. It is **not claimed to be merged, released, or formally accepted**.

## Safety and review

- This public website uses only static scripts and existing character art; no secrets, user data, production integrations, local storage, real payments, emails, or network APIs are involved by design. The Revenue HTML declares `connect-src 'none'`.
- Revenue remains **NO-GO**. `DESIGN_RESUMED` in the demonstration is not permission to restart Revenue. C19 certification and C58 F01–F22 formal acceptance are separate, pending procedures.
- Mobile/Safari/Chrome rendering and animation were **not executed or formally verified** as part of the v0.6 promotion. See `docs/revenue-v0.6-review.md`.
- The original v0.3 default site commit is `92ad2b3b41e14236fe50462920d7152064dbb58d`. It is preserved on `archive/office-v0.3-before-revenue-v0.6` and in Git history.
- No changes to `jarvis-core`, Worker, D1, Queue, Stripe, GitHub Pages settings or the separate v0.4 Draft PR are intended.

## Source structure

- `index.html`: Published Revenue v0.6 entrypoint
- `office-v0.3.html`: Original animated three-agent page
- `docs/revenue-v0.6.css`, `docs/revenue-v0.6.js`: Presentation logic and styles
- `approved-image-data.js`: Locally embedded previews of approved BOLT, SCOUT and TITAN art; ATLAS and PULSE remain explicitly provisional display placeholders

**Publishing/URL verification:** A Git commit does not prove that GitHub Pages has deployed successfully. Confirm the published URL in GitHub Settings → Pages and on a real device before treating deployment as confirmed.
