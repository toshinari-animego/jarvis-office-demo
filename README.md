# JARVIS OFFICE · 3 Agents (independent simulation)

This repository contains a **standalone, zero-dependency static HTML demo**. It does not connect to the production JARVIS project, GitHub automation, Cloudflare, external APIs, or any payment service. Everything shown is simulated.

## Preview

Once GitHub Pages is enabled for this repository, open its GitHub Pages site in Safari on an iPad or iPhone (or any modern browser). Do **not** open the HTML through the ChatGPT attachment preview, which may not execute JavaScript.

## Free setup (GitHub Pages)

1. Create a **new public repository** for the demo alone; do not use `jarvis-core` or another existing business repository.
2. Upload **index.html** and this README.md to its main branch (repository root).
3. Open repository **Settings → Pages**. Under **Build and deployment**, set **Source = Deploy from a branch**, select **main** and **/(root)**, then save.
4. Wait for GitHub's deployment status to succeed. Use only the URL GitHub provides in Settings → Pages. Do not assume the site is live before success.

Note: On GitHub Free, GitHub Pages uses a public repository. Source code and the deployed demo will be publicly visible. Never add secrets, authentic production data, or credentials. GitHub's terms and free-plan limits may change.

## Demo interactions

- Simulation starts automatically when the page opens.
- BOLT vanishes as a lightning effect, then reappears near the receiving agent.
- TITAN waddles and works at the desk; SCOUT hovers.
- The receiver takes the deliverable, and completed handoffs are logged only after the simulated handoff succeeds.
- Use restart / pause / choose sender and receiver for arbitrary directed transfers among the three agents.

## Safety

Read-only visual simulation, no analytics, no cookies, no external dependencies, no external fetch or network calls. This demonstration contains no production data and should remain separate from all production systems.