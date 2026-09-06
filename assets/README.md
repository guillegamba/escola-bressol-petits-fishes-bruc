# Asset provenance

- `companions.webp`: original character illustration created for this redesign with the built-in image-generation tool. The user's supplied character video was used as visual inspiration, not embedded or redistributed. Converted to a 1000px WebP for the app. The original school wordmark and favicon are preserved.
- `nunito-latin.woff2`: self-hosted Nunito Latin font from Google Fonts. See `Nunito-OFL.txt`.
- `lucide.min.js`: a tree-shaken bundle of Lucide 0.468.0 containing only the icons used here. Source: `../tools/icons-entry.js`. Regenerate with `npm run build:icons`. See `Lucide-LICENSE.txt`.

## Illustration prompt

Tool: built-in imagegen (not the fallback CLI).

> Use case: illustration-story. Create one wide illustration asset for a Catalan nursery-school family diary app. Original simple round geometric mascot companions inspired by the described style: flat paper-cut circles, tiny expressive white eyes with dark forest-green pupils, playful asymmetrical faces, minimal little arms. Three friendly round characters clustered together in the RIGHT TWO THIRDS of a wide 1536x1024 composition, with lots of empty pale cream (#FFF9F0) space on the left. A larger sunshine-yellow circle smiling in back, a grassy green circle peeking up front left, and a smaller dusty pink circle leaning on the right, each different pose. They are joyful, cute, graphic, sophisticated children's publishing style. Very flat solid fills with subtly imperfect organic silhouettes. Plain pale cream #FFF9F0 background, no shadows, no gradients, no texture, no typography, no letters, no numbers, no watermark. All three complete characters visible with ample surrounding negative space. This is decorative companion artwork, not a logo and not a UI screenshot.

## Design decisions

A playful family companion, keeping the existing Catalan voice and native web stack. Design variance 7, motion intensity 3, visual density 5. Cream and green carry the existing identity; yellow marks selection and celebrations, pink distinguishes activities. These colors serve the user's expressive character brief. Panels use 24px corners, buttons are pills, inputs use 12px corners. Motion only acknowledges content changes and respects reduced motion. The diary uses practical product layouts, not marketing-page composition rules.
