# JARVIS OFFICE v0.4 — Hero Headquarters

Three original, two-head-tall heroes cooperate in a standalone simulated headquarters. This branch is a review candidate. **Do not merge or change GitHub Pages until the owner approves.**

- BOLT: lightning armor, charge → vanish → reappear directly in front of the recipient → handover → proud reaction → teleport home.
- TITAN: broad armor and power core, anticipation, short heavy steps, two-handed receiving, return to desk.
- SCOUT: radar antenna, large observational eyes, hover unit, gaze scanning, floating travel and discovery reaction.

## Run locally

Use Node.js and run `npm run dev`, then open `http://localhost:4173`. No install is needed. Or serve this directory with any static HTTP server. Modules must be served over HTTP; opening `index.html` as a `file://` attachment may not work.

`npm test` runs the deterministic tests using Node's built-in test runner, with no packages or external calls. `/docs/review.html` provides width presets and a six-direction UI test harness. The archived original v0.3 is `/docs/baseline-v0.3.html`.

## Controls

- Auto starts on page load. Every shuffled group of six includes all six directed pairs; there is no fixed handoff chain.
- **自動再生中** toggles automatic scheduling off, allowing the current transaction to finish. **自動再生** enables it again.
- **一時停止 / 再開** freezes / resumes the common simulation clock, including facial expressions, effects, hovering and deliverables.
- **リセット** cancels the transaction and restores all three heroes, the counter and history to standby. Then choose a manual pair or press auto.
- A manual transfer is available when idle and unpaused, with different sender and recipient. Busy / paused requests are rejected in the model as well as disabled in the UI.
- The handoff counter changes at receipt. History is added after return and the next work begins. Only one hero can own a deliverable.
- Hidden tabs do not advance; returning does not fast-forward through hidden time. Reduced-motion preference suppresses idle movement, scanning and limb motion, with shorter staged handovers.

## Structure

`index.html` / `styles.css`: responsive headquarters and UI. `sprites.js`: original SVG heroes. `simulation.js`: deterministic timeline and state. `app.js`: DOM rendering and the sole animation clock. `scripts/serve.mjs`: local preview server only.

Runtime consists of five small text files and requires no dependency install or build. GitHub Pages continues to serve the repository root. No hosting settings or workflows are changed.

## Safety and review

This is DEMO / SIMULATION throughout. No real business data, storage, cookies, analytics, external assets, AI, paid APIs, keys or production integration. `connect-src 'none'` blocks browser fetch, WebSocket and similar connections. Only same-origin static assets load. No changes to `jarvis-core`, Cloudflare, Stripe or any external service.

The base is v0.3 commit `92ad2b3b41e14236fe50462920d7152064dbb58d`; main is preserved. See [validation report](docs/validation-v0.4.md) for actual results and limitations. Cloud Chrome width checks are not iPhone/iPad Safari or WebKit simulator checks. Actual Safari performance and subjective animation approval remain owner review items.
