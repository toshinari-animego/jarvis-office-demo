# JARVIS OFFICE v0.4 — WebGL 3D comparison (draft)

## Purpose and status
The 3D renderer is an **optional, procedural 3D proof of concept** inside the existing read-only office simulator. It creates actual triangle meshes and joint-driven poses in WebGL, but does **not** reproduce the approved concept-art illustrations as production-ready 3D character assets.

**Do not merge or publish to the existing Pages deployment until personally approved.**

## Access
- Open the review branch’s `index.html` on a static preview hosting site.
- The initial display selects **立体3D** when the device supports WebGL.
- Tap **原画2D** to see approved cutouts and the existing 2D motion.
- In 2D mode, **関節アニメ：ON/OFF** compares the original cutout rigs.
- `?view=2d` forces the original view. If WebGL fails, the UI automatically returns to 2D.
- Choosing an **old** character skin also returns to 2D. Returning to 3D displays the three currently approved character designs.

## Character behaviour
- BOLT: navy rounded full-face helmet, luminous golden lightning, blue/gold scarf, articulated arms and legs; the existing teleportation timing still comes from `Simulation`.
- TITAN: large scarred bare rocklike muscular figure with brown eyes, heavy fists, stomping leg motion, slow weight transfer.
- SCOUT: silver hair, glowing white eyes, purple/black bodysuit, independent cape lobes, levitating movement.
- Character handoff routes, file ownership and speech bubbles are unchanged: the original deterministic simulation is the sole source of work state.

## Safety
- No external APIs, no real JARVIS connections, no production data.
- No npm or CDN dependency; uses native WebGL and local JavaScript.
- Transparent WebGL overlay on the existing SVG command-room background; this is not yet a full 3D environment.
- Mobile pixel ratio capped at 1.25 and WebGL draws capped at 30fps.
- WebGL context loss, startup failure, or draw failure triggers a 2D fallback.
- Supports `prefers-reduced-motion` to disable secondary character movements.

## Test notes
- `npm test` covers the existing simulator and adds mock-WebGL tests for draw calls, six routes, clock rewind and 2D fallback.
- Browser visual fidelity, practical frame-rate, WebKit compatibility and heat under sustained load remain **unverified on real iPhone / iPad**.
- The approved concept art must be separately modeled, retopologized, rigged, and skin-weighted for professional quality and consistent facial animation in 3D. That stage is not complete.
