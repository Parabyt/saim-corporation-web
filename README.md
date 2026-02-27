# Saim Corporation Web (Angular)

Modular Angular 17 storefront for an import-export business, designed to replicate a Kumas-style ecommerce flow while remaining customizable and admin-panel ready.

## What is implemented

- Kumas-inspired storefront structure and theming
  - Announcement bar
  - Centered-logo header
  - Mega-menu style navigation
  - Hero + marquee + collection/product sections
  - Ecommerce-style footer
- Scalable modular architecture (`core`, `shared`, `features`)
- Slug-based catalog routing
  - `/catalog`
  - `/collections/:slug`
  - `/products/:slug`
- Local persistence (browser storage) for editable content
  - Categories
  - Subcategories
  - Products
  - Homepage block content
- Admin-ready customization console (`/customize`)
  - `Catalog` tab: add categories/subcategories/products
  - `Homepage` tab: edit hero/marquee/newsletter/3 homepage blocks
  - `Theme` tab: apply theme color/radius tokens
  - `Load Kumas Sitemap Seed` action for rapid dataset loading
- Product card interactions similar to ecommerce behavior
  - Wishlist icon
  - Hover quick-view CTA
  - Inquiry CTA
- Firebase-ready integration for Firestore + Storage + Auth
  - File uploads supported from customization forms
  - `/customize` protected with admin guard

## Pixel-Match and Animation Passes

### Pass 1

- Route/page transition animation added at app shell level.
- Header interactions refined:
  - Animated announcement ticker
  - Underline hover on menu links
  - Animated mega-menu reveal (fade + slide)
- Homepage interactions refined:
  - Section/card reveal animations
  - Button hover motion and shadows
  - Interactive collection chip hover effects
- Product card micro-interactions refined:
  - Hover lift + shadow
  - Image zoom/saturation transition
  - Quick-view slide/fade reveal
  - Wishlist and inquiry hover feedback

### Pass 2

- Mobile navigation behavior improved:
  - Animated slide-in drawer menu
  - Overlay open/close behavior
  - Desktop nav/icons hidden on mobile for cleaner parity
- Catalog page visual structure updated:
  - Ecommerce-like two-column layout (sidebar + product grid)
  - Sticky collection filter sidebar
  - Compact subcategory media list
  - Product count header and denser product listing rhythm
- Product detail page visual structure updated:
  - Breadcrumb refinement
  - Gallery + thumbnail strip
  - Card-style detail panel
  - Multi-CTA area (`Add to Inquiry`, `Buy Sample`)
  - Shipping info block
  - Refined related products block and hover behavior

### Pass 3

- Global design token normalization added:
  - Shared container width (`--container-max`)
  - Typographic scale tokens (`--text-xs` to `--text-lg`)
  - Section spacing tokens (`--section-space-md`, `--section-space-lg`)
  - Reusable soft radius and shadow tokens
- Typography and spacing rhythm calibrated across pages:
  - Hero headline/body/button proportions refined
  - Homepage section spacing made consistent
  - Catalog filter/sidebar/product spacing and font-size alignment refined
  - Product detail text hierarchy and related section scale tightened
- Header text sizing and nav spacing aligned to global tokens for better desktop/mobile parity.

### Pass 4

- Header/nav exact dimensions tightened for parity:
  - Announcement bar height and type reduced to closer visual weight
  - Header row/nav row heights and paddings tuned
  - Nav label font-size/line-height tuned for compact desktop rhythm
- Homepage hero typography calibrated:
  - Hero min-height increased and desktop/mobile adjusted by breakpoint
  - Headline size/line-height/weight tuned for closer visual match
  - Subtitle width, line-height, and CTA button dimensions tightened
- Catalog filter panel and grid spacing tightened:
  - Sidebar width/padding/font sizes made denser
  - Sticky top offsets tuned by breakpoint
  - Product grid gutters and heading metrics refined

### Pass 5

- Top navigation coordinate tuning by breakpoint:
  - Header row horizontal padding adjusted for desktop/tablet
  - Nav gap and label font size calibrated at `1200px` and `1024px` breakpoints
  - Logo size and mobile row height tuned for cleaner line-up
- Hero line-break and content width control:
  - `h1` switched to `ch`-based max width for consistent wrapping
  - Subtitle max-width adjusted for stable paragraph breaks
  - Desktop/tablet/mobile content widths tuned at `1280px`, `980px`, `640px`
- Catalog sticky/filter precision tuning:
  - Sidebar sticky top offset made more accurate for compact header stack
  - Large-desktop to tablet sidebar width/gutter interpolation tuned (`1320px`, `1200px`, `1080px`)

### Pass 6 (latest)

- Announcement bar parity tuning:
  - Height reduced to match denser top-strip feel
  - Ticker speed slowed for closer readability cadence
  - Loop distance adjusted for smoother repetition
- Hero vertical coordinate tuning by viewport:
  - Hero content shifted slightly upward on large screens
  - Per-breakpoint vertical reset/tuning (`1280px`, `980px`, `640px`) for consistent focal placement
- Catalog sidebar card visual precision:
  - Border color softened, radius tightened, shadow reduced for closer target treatment
  - Sticky offset further refined for compact header stack alignment
  - Grid gutter slightly reduced for denser listing rhythm

### Pass 7 (header + hero rebuild)

- Screenshot-inspired header redesign:
  - Fixed transparent top bar with left-aligned brand lockup
  - Compact desktop nav (`Home`, `About Us`, `Our Business`, `Contact`) with underline hover/active treatment
  - Mobile drawer retained for small screens
- Scroll-state sticky header behavior:
  - Header remains visible while scrolling
  - Background shifts to stronger frosted blur + darker tint for readability
- Homepage hero converted to slider:
  - 3-slide auto-rotating hero with image + title + subtitle + tags
  - Manual bottom indicators to jump slides
  - Cinematic overlay/grid treatment and transition timing tuned for smoothness
- App-shell layout cleanup:
  - Route-aware top spacing so home can be full-bleed under overlay header
  - Inner pages keep safe top offset under fixed header

### Pass 8 (slider smoothness + header consistency)

- Header size stabilization:
  - Header now uses fixed CSS height tokens (`--header-height`, `--header-height-mobile`)
  - App-shell top offset now references the same tokens for consistent alignment
- Hero slider transition quality:
  - Replaced direct `background-image` swaps with layered slide elements
  - Added smooth crossfade + subtle zoom effect on active slide
- Indicator progress timing:
  - Slide indicators now include an animated fill bar on the active item
  - Fill animation duration is synced with auto-slide interval so users can predict next transition
  - Manual indicator click resets auto-slide timing for a predictable cycle

### Pass 9 (motion refinement)

- Slider cadence tuned for premium pacing:
  - Auto-advance increased to `6200ms`
  - Crossfade timing adjusted with smoother easing curve
- Motion synchronization improvements:
  - Hero section now exposes a shared CSS timing variable for slide lifecycle
  - Background zoom and indicator fill are aligned to the same duration token
- Indicator polish:
  - Slightly larger progress bars with softer inactive contrast
  - Refined active-state scaling and gradient fill for clearer time-to-next-slide feedback

### Pass 10 (header expansion + sliding controls)

- Header behavior updated for larger visual band at top:
  - Increased default header height to occupy the full top rectangular area
  - On scroll, header now shrinks to a compact height while retaining blur + sticky behavior
- Hero image transition updated:
  - Switched from layered hide/show behavior to true horizontal slide animation
  - Slide-track translation now drives image replacement motion
- Manual navigation controls added:
  - Fancy circular left/right arrow buttons placed at extreme ends and vertically centered
  - Manual clicks reset auto-slide timing to keep indicator progress and transition cadence consistent

### Pass 11 (export-niche hero content + admin-ready slide model)

- Homepage hero content model upgraded:
  - Added `heroSlides` schema in home content state (id, title, subtitle, imageUrl, tags)
  - Homepage now reads all slide data from the central content store instead of hardcoded component values
- Added 6 niche-specific default export slides:
  - Leather goods
  - Sportswear
  - Gym wear
  - Uniforms
  - Workwear/protective apparel
  - Private-label manufacturing
- Customization console extended for future admin integration:
  - Homepage tab now exposes editable fields for each hero slide (headline, subheadline, image URL, tags)
  - Firebase image upload binding added per hero slide
  - Persisted in existing home content storage flow for smooth migration to future backend/admin panel

### Pass 12 (full-screen landing fold alignment)

- First viewport alignment updated to screenshot behavior:
  - Hero section now fills the full initial viewport (`100svh`) on desktop and mobile
  - Hero content vertical offset now references header height tokens for consistent top spacing
- Navigation bar proportion tuned:
  - Reduced default/scrolled header heights to match compact screenshot-like top strip proportions

### Pass 13 (niche-aligned hero imagery)

- Updated all default hero slides with export-specific niches and messaging:
  - Leather jackets, belts, and bags
  - Sports uniforms and football-oriented products
  - Gym wear, boxing gloves, and gym belts
  - Uniform supply programs
  - Performance sports apparel
  - Private-label leather/activewear manufacturing
- Kept the same admin-ready `heroSlides` content model so image/headline/tag updates remain configurable from the customization panel and future admin backend.

### Pass 14 (hero text readability hardening)

- Improved headline/subheadline readability across bright and high-contrast hero images:
  - Added a directional dark overlay layer over hero media
  - Added a subtle gradient backing panel behind hero text content
  - Added text-shadow on eyebrow, headline, and subheadline for contrast stability
- Responsive tuning included so readability treatment remains balanced on tablet/mobile.

### Pass 15 (readability rollback to color-only)

- Reverted Pass 14 overlay/backing/shadow readability layers per design preference.
- Kept readability adjustment strictly to text color for hero copy and tags.

### Pass 16 (marquee loop and speed fix)

- Reworked homepage running-line into a seamless duplicated marquee track.
- Motion now performs a full continuous right-to-left loop without visible reset jump.
- Increased marquee speed for quicker rotation cadence.

### Pass 17 (reference-inspired header visual redesign)

- Header redesigned to match rounded capsule reference style:
  - Floating top navigation bar with glass/blue gradient treatment
  - Pill-style nav links with active white state and dot marker
  - Right-side utility menu button and `Inquiry Now` CTA
- Brand zone refined for niche positioning:
  - Updated identity text to export-focused wording
  - Compact lockup proportions aligned with premium logistics aesthetic
- Existing hero tags and action buttons were kept unchanged as requested.

### Pass 18 (company overview section)

- Added a new homepage section directly below the marquee to present core company information:
  - Company intro and positioning
  - What we offer
  - What we manufacture
  - Achievements
  - Network strength
- Visual direction chosen to be elegant and editorial (inspired by the second reference style):
  - Clean light canvas with balanced typography
  - Structured highlight cards for key points
  - Premium dark metric panel with experience/network stats

### Pass 19 (style budget calibration)

- Increased Angular `anyComponentStyle` budget thresholds to support visual-rich homepage/header styling:
  - warning: `6kb`
  - error: `10kb`

### Pass 20 (categories two-row carousel)

- Added a new `Categories` section below the company overview section.
- Replaced static homepage block cards with a horizontal two-row category carousel:
  - Displays all categories from content store
  - Stylized category tiles with image, title, description, and `Explore` action
  - Left/right arrow controls for smooth horizontal navigation
  - Snap-scrolling layout for cleaner visual rhythm across desktop/mobile

### Pass 21 (style budget calibration v2)

- Adjusted Angular `anyComponentStyle` budgets to accommodate expanded homepage design system:
  - warning: `8kb`
  - error: `12kb`

### Pass 22 (niche catalog curation + price toggle)

- Replaced default catalog seeds with curated niche structure for export business:
  - Categories: Sports Goods & Equipment, Leather Products, Apparel & Textile (Sportswear), Martial Arts & Boxing Gear, Uniforms & Workwear, Bags & Travel Accessories
  - Curated subcategories across each category
  - Expanded product seed list aligned to subcategories
- Added high-quality web image URLs for categories, subcategories, and products to improve visual quality.
- Added catalog seed versioning to force one-time migration from old local browser seed data to the new niche dataset.
- Implemented optional product price visibility via centralized app config:
  - `DEFAULT_APP_CONFIG.catalog.showPrice = false` (disabled by default for now)
  - Product card and product detail views now respect this toggle.
- Customization form still supports entering price data (optional), so admin panel integration can enable/show it later without data model changes.

### Pass 23 (category image refinement)

- Replaced category cover images with more niche-sensitive visuals:
  - Sports Goods & Equipment: sports field/equipment context
  - Leather Products: leather apparel/accessory context
  - Apparel & Textile (Sportswear): team sportswear context
  - Martial Arts & Boxing Gear: boxing training gear context
  - Uniforms & Workwear: workforce uniform context
  - Bags & Travel Accessories: travel/backpack context
- Bumped catalog seed version to trigger one-time local reseed so updated category images appear immediately without manual storage cleanup.

### Pass 24 (image preview fix for broken seed URLs)

- Ran URL health checks across seeded category/subcategory/product image links.
- Fixed broken Pexels image IDs returning `404` by replacing them with verified working sources.
- Bumped catalog seed version again (`niche-v3-2026-02-24`) to ensure existing local browsers refresh with corrected images automatically.

### Pass 25 (our process section)

- Added a new `Our Process` section directly below `Featured Products`.
- Implemented a single-row horizontal auto-scrolling stage list with duplicated track for seamless infinite motion.
- Each process stage includes a niche-relevant image and stage title reflecting export-manufacturing workflow:
  - Material sourcing
  - Pattern/tech pack development
  - Cutting/component preparation
  - Stitching/assembly
  - Quality inspection
  - Packing/export logistics

### Pass 26 (process card scale-up)

- Increased `Our Process` item size to match large visual storytelling style:
  - Wider stage cards
  - Taller process images
  - Larger, stronger stage titles
- Kept continuous horizontal auto-scroll behavior with tuned timing for bigger card footprints.

### Pass 27 (global network band)

- Added a new no-title section below `Our Process`, inspired by export-destination map storytelling:
  - Dark navy band aligned with brand theme
  - Dotted world visual with animated location pins
  - Right-side export destination narrative and `Get In Touch` CTA
  - Subtle oversized `world` watermark for visual depth
- Implemented as a distinct creative block (not a direct copy), with responsive behavior for tablet/mobile.

### Pass 28 (style budget calibration v3)

- Adjusted Angular `anyComponentStyle` budget thresholds to support additional homepage visual modules:
  - warning: `10kb`
  - error: `14kb`

### Pass 29 (network section recreation)

- Recreated the no-title network block with a cleaner creative direction:
  - Removed previous dotted world map treatment
  - Added a custom route-canvas visual with elegant dashed arcs and animated nodes
  - Reduced typography scale for better visual balance
  - Added destination chips for scannable market coverage
- Kept dark export-theme language and CTA while improving overall refinement.

### Pass 30 (about us page redesign)

- Rebuilt `/about` page using Kummas About-page section logic as inspiration while keeping a distinct Saim visual identity.
- Implemented a multi-section premium layout:
  - Hero brand statement
  - Company intro split panel
  - CEO message block (with placeholder portrait image)
  - Key metrics band
  - Growth philosophy and team-effort dual cards
  - Corporate responsibility grid
  - Journey timeline
  - Compliance and assurance badges
- Maintained modular standalone component structure for future admin/CMS integration.

### Pass 31 (CEO section alignment update)

- Reworked CEO block to match reference intent:
  - Large centered CEO portrait treatment
  - Transparent-background placeholder asset for easy future replacement
  - Removed side-card image framing and switched to center-stage composition
- Kept CEO message content in a clean supporting panel beneath portrait.

### Pass 32 (subcategory selection and routing support)

- Catalog flow now supports clickable/selectable subcategory filtering in the sidebar.
- Products list now filters by:
  - selected category
  - selected subcategory (within selected category)
- Added active subcategory indicator in products heading for context clarity.
- Added subcategory route support for future dedicated subcategory pages:
  - `/subcategories/:slug`
- Added content-store helper for subcategory slug lookup to support route-driven state.

### Pass 33 (product card height consistency)

- Standardized product card height and content rhythm to prevent variable card heights from long titles.
- Implemented:
  - fixed minimum card height with flex column layout
  - two-line clamp for product titles
  - two-line clamp for descriptions
  - bottom action row anchored to card bottom

### Pass 34 (sticky bottom info section)

- Implemented global sticky-bottom behavior for footer/info section:
  - Footer fixed to viewport bottom
  - Main content scrolls above footer and reveals sticky bottom at end of page
- Added dynamic footer height synchronization via `ResizeObserver`:
  - Footer height is measured and written to CSS variable (`--site-footer-height`)
  - Main layout margin updates automatically to prevent overlap/clipping across breakpoints

### Pass 35 (post-collections section alignment)

- Replaced the generic post-collections "newsletter" meaning with an import/export-specific trade inquiry strip:
  - New export-focused messaging and CTAs (`Send Requirements`, `Browse Catalog`)
  - Added quick operational highlights (MOQ flexibility, quality checks, shipping modes)
- Preserved admin/customization compatibility:
  - Existing editable fields (`newsletterTitle`, `newsletterText`) now drive the trade inquiry strip content
  - Homepage editor label updated from `Newsletter` to `Trade Inquiry Strip`
- Added migration logic to replace legacy default textile/fabric copy with the new trade-oriented defaults for existing saved home content.

### Pass 36 (trade strip layout/readability fix)

- Fixed the post-collections trade strip visual breakage:
  - Corrected heading contrast on dark background (`h2` now forced white in this section)
  - Rebalanced desktop grid columns to prevent extreme text squeezing
  - Reformatted quick-fact items so label text no longer merges with bold titles
- Kept style-budget compliance by tightening declarations while preserving the intended layout.

### Pass 37 (trade CTA spacing + inquiry flow)

- Added explicit spacing between `Send Requirements` and `Browse Catalog` CTAs in the post-collections trade strip.
- Implemented a real `Send Requirements` flow:
  - New public route: `/inquiry`
  - New inquiry form page with validation and optional reference image upload
  - Submission persistence service with local storage fallback and Firebase write support (`requirements` collection) when configured
- Updated Firebase catalog service to support:
  - `addRequirement(...)`
  - `uploadImage(..., 'requirements')`

### Pass 38 (blank screen fix on inquiry route)

- Fixed runtime crash on `/inquiry` when Firebase providers are not configured.
- Root cause:
  - `RequirementInquiryService` attempted eager DI of `FirebaseCatalogService`, which could trigger provider resolution errors in non-Firebase setups.
- Fix:
  - Switched to safe lazy resolution via `Injector.get(...)` wrapped in `try/catch`.
  - Inquiry submit/upload now gracefully fall back to local-only persistence when Firebase is unavailable.

### Pass 39 (contact us page + messaging workflow)

- Added a full public `Contact Us` page at `/contact` with:
  - contact channels (email, phone, WhatsApp, office details, social links)
  - polished two-column layout and responsive behavior
  - validated message form fields (user/company/contact/subject/message)
  - captcha checkbox (`I am not a robot`)
  - mandatory terms & conditions acceptance
  - `Send Message` submit workflow with user status feedback
- Implemented message persistence service:
  - new `ContactMessageService` writes to local storage by default
  - Firebase-enabled fallback to `contactMessages` collection when providers are configured
- Updated `FirebaseCatalogService` with `addContactMessage(...)`.
- Updated public navigation targets:
  - Header and mobile drawer `Contact` now point to `/contact`
  - Header inquiry CTA now points to `/inquiry`
  - Home “Get In Touch” CTAs now point to `/contact`
  - Footer corporate links updated for `/about` and `/contact`

### Pass 40 (reCAPTCHA-style UX gating on contact form)

- Reworked contact form verification block to match a reCAPTCHA checkbox card visual style (`I'm not a robot` + branding area).
- Added interaction gating:
  - reCAPTCHA checkbox remains disabled until all required contact fields are valid and Terms are accepted.
  - if prerequisites become invalid again, the captcha checkbox is automatically reset.
- Updated submit button behavior:
  - `Send Message` stays disabled until full form validity is met (including terms + captcha).

### Pass 41 (real Google reCAPTCHA checkbox integration)

- Replaced simulated captcha UI with real Google reCAPTCHA v2 checkbox widget on `/contact`.
- Added script lifecycle + widget callbacks in contact page logic:
  - loads `https://www.google.com/recaptcha/api.js?render=explicit`
  - renders widget into form container
  - syncs `captchaConfirmed` and `captchaToken` into reactive form state
  - resets widget automatically when prerequisites become invalid
- Preserved gating rule:
  - reCAPTCHA interaction stays blocked until required fields are valid and terms are accepted
  - send button remains disabled until full form validity (including real captcha completion)
- Added environment key support:
  - `recaptchaSiteKey` in `src/environments/environment.ts`
  - `recaptchaSiteKey` in `src/environments/environment.prod.ts`
  - defaults use Google official test key; replace with your real site key for production.

### Pass 42 (reCAPTCHA load reliability fallback)

- Improved reCAPTCHA loader resilience on restricted networks:
  - primary script source: `google.com`
  - automatic fallback source: `recaptcha.net`
- Added readiness wait loop to ensure `window.grecaptcha.render` is available before widget render.
- Result: fewer false "Unable to load reCAPTCHA" states where the primary domain is blocked but fallback domain is reachable.

### Pass 43 (reCAPTCHA faded-state visual fix)

- Kept reCAPTCHA interaction disabled logic, but removed artificial visual dimming.
- Updated disabled-state presentation:
  - removed reduced opacity on disabled captcha shell
  - changed blocking overlay from semi-white to transparent
- Result: captcha now appears crisp/normal while still non-interactive until prerequisites are satisfied.

### Pass 44 (finite catalog window + inherited view-all filters)

- Reduced extreme side padding for catalog/product content containers:
  - catalog page container width adjusted from `92vw` to `95vw`
  - product detail page container width adjusted from `92vw` to `95vw`
- Added finite product window on catalog page:
  - catalog now shows first 12 filtered products
  - if more items exist, shows `View All Products` CTA
- Added dedicated all-products screen:
  - new route: `/catalog/all`
  - includes search input + explicit `Search` action
  - includes subcategory filter controls
  - shows products constrained to inherited category/subcategory context from previous screen via query params
  - auto-selects inherited subcategory when opening from catalog view
- Catalog `View All Products` now passes selected category/subcategory to the new screen.

## Build budget adjustments

To keep iterative pixel-matching stable without blocking builds:

- `angular.json` `anyComponentStyle` budget updated to:
  - warning: `4kb`
  - error: `8kb`

## Kumas import and Firestore seeding

### 1) Pull Kumas sitemap data

```bash
npm run import:kumas
```

This generates:

- `data/kumas-seed.json`
- `src/assets/seeds/kumas-seed.json`

### 2) Seed Firestore (optional)

Add Firebase service account JSON at project root as `service-account.json`, then run:

```bash
npm run seed:firestore
```

It writes to:

- `categories`
- `products`

## Auth guard behavior

- Route `/customize` uses an admin-only guard.
- Admin check is email-based via `adminEmails` in:
  - `src/environments/environment.ts`
  - `src/environments/environment.prod.ts`
- In development, `allowCustomizeWithoutAuth: true` allows access without Firebase Auth configured.
- In production, set `allowCustomizeWithoutAuth: false`.

## Firebase setup

1. Create Firebase project.
2. Enable Firestore, Storage, and Authentication (Google provider).
3. Fill keys in:
   - `src/environments/environment.ts`
   - `src/environments/environment.prod.ts`
4. Add real admin emails to `adminEmails`.

## Commands

```bash
npm install
npm start
npm run build
npm run import:kumas
npm run seed:firestore
```

## Notes

- Current app mirrors Kumas-style structure and interaction patterns. Exact pixel-perfect parity for every page still requires complete 1:1 component-by-component reconstruction against all live page templates.
- The current codebase is prepared for future admin panel integration by exposing centralized content/theme state and route-level guards.
