# Asset provenance

- `nunito-latin.woff2`: self-hosted Nunito Latin font from Google Fonts. See `Nunito-OFL.txt`.
- `lucide.min.js`: a tree-shaken bundle of Lucide 0.468.0 containing the interface icons. Source: `../tools/icons-entry.js`. Regenerate with `npm run build:icons`. See `Lucide-LICENSE.txt`.
- The original school wordmark and favicon are preserved.

The characters are original code-native illustrations in `../characters.js`, animated in `../characters.css`. They use separately articulated faces, limbs and accessories: a bouncing ball for the sporty character, goggles and swimming strokes for the swimmer, a beret and moving brush for the artist, and a chef's hat and spoon for the menu character. The user's reference video informed the geometric, expressive direction; no frames from it are embedded.

Characters live inside the cards, with a reserved text column, and appear in miniature in the week view. Activity keywords choose the personality. The menu uses the foodie. All are decorative, hidden from screen readers, and non-interactive. A persistent pause control and system reduced-motion preference disable their animations. No promotional hero, tagline or generic checklist suggestions are included.
