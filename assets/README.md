# Asset provenance

- `nunito-latin.woff2`: self-hosted Nunito Latin font from Google Fonts. See `Nunito-OFL.txt`.
- `lucide.min.js`: a tree-shaken bundle of Lucide 0.468.0 containing the interface icons. Source: `../tools/icons-entry.js`. Regenerate with `npm run build:icons`. See `Lucide-LICENSE.txt`.
- The original school wordmark and favicon are preserved.

The characters are original code-native illustrations in `../characters.js`, animated in `../characters.css`. The supplied video informed their organic round silhouettes, tiny expressive faces, and oversized cropping at card boundaries. No video frames are embedded.

Each character uses exactly two colors: a muted body fill and a darker facial ink. There are no limbs, accessories, outlines around the body, shadows or textures. Personality is conveyed by expression and subtle movement: a small spring for sporty, a relaxed drift for swimmer, a curious tilt for artist, and a contented smile for the menu.

The artwork extends beyond the right and bottom bounds of each card and is clipped there. A separate text column reserves readable space. Smaller versions appear in the week view. The entry greeting finishes within 4.8 seconds; hover/focus invites a brief further movement. All motion respects reduced-motion preferences. These decorative illustrations are hidden from screen readers and are not interactive controls.
