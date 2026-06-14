# Architecture

KickLink is an npm-workspace monorepo.

- `apps/mobile`: Expo React Native with Expo Router. Phase 1 uses shared mock data only.
- `apps/web`: Next.js dashboard shell for organizer and platform-admin workflows.
- `packages/shared`: status arrays, Zod enums, inferred TypeScript types, schemas, mock data, and mock payment provider.
- `supabase`: database schema draft and seed sketch.
- `design-reference`: unchanged Claude Design package used only as reference.

The database/server is the future source of truth. Phase 1 UI screens display mock data and must not
be mistaken for authoritative capacity, payment, or permission enforcement.
