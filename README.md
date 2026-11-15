# Alihoo

Portfolio implemented from the Alihoo Figma design with Next.js, Sanity, and the supplied PP Neue Montreal Medium font.

## Run locally

```sh
pnpm install
pnpm dev
```

Website: http://localhost:3000 · Content editor: http://localhost:3000/studio

## Edit content in Sanity

Sign in to the Studio with the account that owns the Alihoo Sanity project.

- **Projects:** choose a cover image, edit descriptions, and upload image or video slides. Drag slides to reorder them. Video slides accept MP4/WebM and a poster image.
- **Project order:** add project references and drag to reorder the Projects page. Published projects omitted from this list appear afterward; unpublish a project to hide it.
- **Bio:** edit paragraphs and add, remove, or reorder links. Each link has a label, optional caption, destination (https/http/mailto/tel), and a new-tab option.
- **Site Settings:** edit the homepage loader image sequence. Its ordering remains independent of the Projects page.
- Click **Publish** to make changes available to the website. Draft edits are not shown publicly. Published content uses a 30-second revalidation interval; reload the website after publishing. A stale request can trigger background refresh, so a further reload may be needed. No site rebuild is required.

Your existing project is `yqmj6h2h`, dataset `production`. The five original placeholder projects and their images have been imported. The public dataset is read on the server; editing requires Sanity authentication.

## Configuration

Copy `.env.example` to `.env.local` and set the project ID and dataset. Only private datasets need `SANITY_API_READ_TOKEN` (Viewer role, server-only). Never use a write token in public environment variables.

For deployment, configure the same environment variables at the hosting provider and add the deployed Studio origin to Sanity's API CORS origins with credentials enabled. Local `http://localhost:3000` is already configured. The embedded Studio ships with the site at `/studio`; the website has not been deployed.

Site routes use `app/(site)`; Studio uses `app/(studio)`. Separate root layouts keep portfolio CSS out of the editor. Content queries and mapping are in `sanity/lib/content.ts`; editor fields are in `sanity/schemaTypes/index.ts`.

Without a configured project, the site uses the original fixtures in `app/content.ts`. With Sanity connected, project content comes from the published dataset; an empty project list is respected. Fetch errors are not silently replaced with old placeholder projects.

## Validation and maintenance

```sh
pnpm lint
pnpm exec next typegen
pnpm exec tsc --noEmit
pnpm exec sanity schema validate
pnpm build
```

The initial import is reproducible with `pnpm exec sanity exec scripts/seed-sanity.ts --with-user-token`. It skips a dataset that already contains site settings or projects, protecting edits. It uses your CLI login and does not require a stored write token.

## Media and design behavior

All carousel media uses a 5:4 frame. Videos play muted and loop while visible, pause offscreen, and provide a play/pause control. Reduced-motion users start with paused video. Current placeholder content contains images only.

Below-fold images load lazily. The pixel reveal uses five density steps, 100ms each. Each image reveals once per page session and stays sharp when revisited, including across client-side navigation. A full reload resets the history. Reduced-motion users see sharp images immediately. Timing and steps are in `app/project-image.tsx`.

The homepage loader uses 100ms frame changes and repeats every five seconds; adjust `motion` in `app/content.ts`. Text appears immediately.

Theme values and responsive composition are in `app/globals.css`. Homepage bio text has a 448px maximum at every breakpoint. Project descriptions have a 448px limit at widths of 1100px and above; below that, they fill their grid column. Desktop details use the same three-column structure as mobile, with descriptions aligned right. Mono applies luminosity blending to media.

Source design: https://www.figma.com/design/l4sQOEy5fm4PlSK2ZcZbYY/Alihoo

Project covers are independent of carousel order and appear as project thumbnails in Studio. Existing projects start with their first image as the cover. Run `pnpm exec sanity exec scripts/backfill-project-covers.ts --with-user-token` to fill missing covers safely; existing covers are preserved.

To initialize Bio and Project order for an older dataset, run `pnpm exec sanity exec scripts/migrate-content-pages.ts --with-user-token`. It copies published and draft bio content separately and does not overwrite existing destination documents. Legacy fields remain hidden for compatibility.

Content ordering and link-safety checks: `node --experimental-strip-types --test tests/content-presentation.test.mjs`.
