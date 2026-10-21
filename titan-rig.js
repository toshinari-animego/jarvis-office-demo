// Six source-derived PNG layers. Same class hooks as the original SVG puppet.
// The original TITAN remains in sprites.js, unchanged.
import { TITAN_IMAGES } from './titan-image-data.js';

export const TITAN_PARTS = ['leg-l','leg-r','torso','arm-l','arm-r','head'];
const pivots = { 'leg-l':'52.2 118', 'leg-r':'90.1 118', torso:'70 88.4', 'arm-l':'34.5 54.1', 'arm-r':'106.7 54.1', head:'70 56.4' };
export function titanSprite() {
  return `<svg viewBox="0 0 140 150" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true"><g class="scan" opacity="0"></g><g class="energy" opacity="0"></g><g class="hero">${TITAN_PARTS.map(part=>`<g class="${part}" data-pivot="${pivots[part]}"><image href="${TITAN_IMAGES[part]}" xlink:href="${TITAN_IMAGES[part]}" x="-12.88" y="-7.5" width="165.76" height="152" preserveAspectRatio="none"/></g>`).join('')}<g class="eyes"></g><path class="mouth" fill="none" stroke="none"/></g></svg>`;
}
