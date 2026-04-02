# Our Memory Diary

A private shared diary for couples, built with Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth/Postgres/Storage, and PWA support.

## 1. Full Project Folder Structure

```text
.
|-- app
|   |-- (app)
|   |   |-- calendar/page.tsx
|   |   |-- dashboard/page.tsx
|   |   |-- gallery/page.tsx
|   |   |-- layout.tsx
|   |   |-- letters/page.tsx
|   |   |-- memories
|   |   |   |-- [memoryId]/page.tsx
|   |   |   |-- new/page.tsx
|   |   |   `-- page.tsx
|   |   |-- settings/page.tsx
|   |   `-- special-moments/page.tsx
|   |-- (auth)
|   |   |-- login/page.tsx
|   |   `-- signup/page.tsx
|   |-- (marketing)/page.tsx
|   |-- api
|   |   |-- letters/route.ts
|   |   |-- memories
|   |   |   |-- [memoryId]/route.ts
|   |   |   `-- route.ts
|   |   |-- profile/route.ts
|   |   |-- relationship
|   |   |   |-- invite/route.ts
|   |   |   `-- join/route.ts
|   |   `-- reminders/route.ts
|   |-- auth/callback/route.ts
|   |-- apple-icon.tsx
|   |-- globals.css
|   |-- icon.tsx
|   |-- layout.tsx
|   |-- manifest.ts
|   `-- offline/page.tsx
|-- components
|   |-- auth/auth-panel.tsx
|   |-- calendar/monthly-calendar.tsx
|   |-- gallery/gallery-grid.tsx
|   |-- layout
|   |   |-- app-shell.tsx
|   |   `-- main-nav.tsx
|   |-- letters/letter-composer.tsx
|   |-- memory
|   |   |-- memory-card.tsx
|   |   |-- memory-filters.tsx
|   |   `-- memory-form.tsx
|   |-- providers.tsx
|   |-- pwa/install-prompt.tsx
|   |-- relationship/relationship-panel.tsx
|   |-- settings/settings-form.tsx
|   |-- theme/theme-toggle.tsx
|   `-- ui
|       |-- button.tsx
|       |-- empty-state.tsx
|       |-- input.tsx
|       |-- rich-text-editor.tsx
|       `-- textarea.tsx
|-- lib
|   |-- constants.ts
|   |-- data
|   |   |-- memory-service.ts
|   |   `-- queries.ts
|   |-- moods.ts
|   |-- supabase
|   |   |-- browser.ts
|   |   |-- middleware.ts
|   |   `-- server.ts
|   |-- types.ts
|   |-- utils.ts
|   `-- validations
|       |-- auth.ts
|       |-- letters.ts
|       |-- memory.ts
|       |-- relationship.ts
|       `-- settings.ts
|-- supabase/schema.sql
|-- .env.example
|-- middleware.ts
|-- next.config.mjs
|-- package.json
|-- postcss.config.js
|-- tailwind.config.ts
`-- tsconfig.json
```

## 2. Database Schema (SQL)

The full schema lives in [`supabase/schema.sql`](./supabase/schema.sql).

Core tables:

- `profiles`: one row per auth user, including theme and relationship link
- `relationships`: one shared diary space, invite code, and anniversary date
- `relationship_members`: join table that enforces one diary per user and max two members per relationship
- `memories`: title, date, mood, rich text story, tags, location, special-moment metadata
- `memory_photos`: Supabase Storage paths tied to a memory
- `letters`: private letters between the two linked users
- `reminder_preferences`: anniversary and weekly memory reminder settings
- `push_subscriptions`: scaffolding for browser push subscriptions

Important database guarantees:

- A trigger blocks a third user from joining the same relationship.
- `create_relationship_space()` and `join_relationship_space()` keep the couple-link flow atomic.
- RLS policies restrict reads/writes to relationship members only.
- The `memory-images` bucket is private and uses storage policies keyed by relationship id in the file path.

## 3. Authentication Flow

1. A user signs up with email/password or requests a magic link.
2. Supabase Auth creates the auth account.
3. A database trigger inserts a matching `profiles` row.
4. The `/auth/callback` route exchanges the auth code for a cookie-backed session.
5. Protected routes use the App Router layout plus server-side Supabase session reads.
6. On the dashboard, the user either:
   - creates a relationship space and gets an invite code
   - joins an existing relationship with the invite code
7. After pairing, both users share the same memories, letters, calendar, gallery, and reminders.

## 4. API / Data Handling Logic

Read path:

- Server components call helpers in `lib/data/queries.ts`.
- Those helpers load the current viewer, relationship, partner, reminders, and feature-specific data.
- Photo paths are converted to signed URLs on the server before rendering.

Write path:

- Client forms submit to route handlers in `app/api/*`.
- Route handlers validate with `zod`, read the authenticated Supabase session, and rely on RLS for access control.
- Memory uploads store photo files in Supabase Storage and create `memory_photos` rows.

Implemented route handlers:

- `POST /api/relationship/invite`
- `POST /api/relationship/join`
- `POST /api/memories`
- `PATCH /api/memories/[memoryId]`
- `DELETE /api/memories/[memoryId]`
- `POST /api/letters`
- `PATCH /api/profile`
- `PATCH /api/reminders`

## 5. UI / UX Wireframe Descriptions

Landing page:

- Full-bleed romantic hero
- One dominant message and two clear auth CTAs
- A soft "diary page" mockup on the right

Dashboard:

- Emotional summary hero
- Relationship linking panel
- Three stat cards: days together, total memories, special moments
- Recent memories column
- Recent letters column

Timeline:

- Top intro panel
- Filter/search strip
- Large memory cards with story preview and hero image

Memory editor:

- Meta panel for title/date/mood/location/tags
- Rich-text story editor
- Special-moment and photo upload panel

Calendar:

- Month controls at top
- Highlighted days with memory chips
- Direct links back to memory detail

Gallery:

- Masonry-style photo grid
- Click-to-open lightbox
- Memory title and date under each image

Letters:

- Composer on the left
- Delivered letters archive on the right

Settings:

- Profile/theme management
- Reminder preferences
- Sign-out action

## 6. Component Breakdown

App shell:

- `AppShell`
- `MainNav`
- `ThemeToggle`
- `InstallPrompt`

Auth:

- `AuthPanel`

Relationship:

- `RelationshipPanel`

Memory system:

- `MemoryCard`
- `MemoryFilters`
- `MemoryForm`
- `RichTextEditor`

Views:

- `MonthlyCalendar`
- `GalleryGrid`
- `LetterComposer`
- `SettingsForm`
- `EmptyState`

## 7. State Management Approach

The app uses a lightweight hybrid approach:

- Server Components for initial page data
- Supabase session cookies for auth state
- Local React state for form editing and UI-only interactions
- Client route handlers for mutations
- `router.refresh()` after writes to re-sync the server-rendered data

This keeps global client state small while still feeling responsive.

## 8. PWA Setup

PWA files and setup:

- `app/manifest.ts`
- `app/icon.tsx`
- `app/apple-icon.tsx`
- `app/offline/page.tsx`
- `next.config.mjs`

Implementation notes:

- `next-pwa` is configured in `next.config.mjs`
- the service worker is generated into `public/` at build time
- the app is installable with a standalone display mode
- there is an offline fallback route
- cached pages plus signed image caching make previously visited content more resilient offline

## 9. Starter Code Included

Included starter implementation:

- Root layout and typography setup
- Auth pages
- Protected app layout
- Dashboard
- Timeline
- Memory create/edit/delete flow
- Calendar view
- Gallery view
- Special moments page
- Letters page
- Settings page
- Supabase browser/server clients
- SQL schema and RLS policies
- PWA manifest/icon/offline setup

## 10. Styling System

Visual direction:

- Soft romantic palette
- Cream, blush pink, powder blue, lavender, peach accents
- Rounded panels and generous spacing
- High-contrast serif display type with clean sans body text

Where it lives:

- CSS variables in `app/globals.css`
- Tailwind tokens in `tailwind.config.ts`

Core tokens:

- Background: warm cream/paper
- Accent: blush pink
- Secondary accents: lavender, powder blue, peach
- Large rounded radii: `1.5rem` to `2.5rem`
- Shadows: subtle bloom and paper depth

## Local Setup

1. Install dependencies.
2. Copy `.env.example` to `.env.local`.
3. Create a Supabase project.
4. Run `supabase/schema.sql`.
5. Configure auth email templates and redirect URLs.
6. Start the app with `npm run dev`.

## Extension Ideas

- Replace the lightweight rich-text editor with TipTap for collaborative formatting plugins
- Add Supabase Edge Functions or cron jobs for real email/push delivery
- Add map previews for memory locations
- Add optimistic updates and drafts/autosave
- Add background music with a user-uploaded ambient track
