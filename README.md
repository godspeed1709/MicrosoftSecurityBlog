# MicrosoftSecurityBlog

Docs/blog site scaffold using Next.js (App Router), TypeScript, and Tailwind. Sanity Studio, Clerk auth, and content models will be added next; Vercel is the initial test host with Azure/Savella as deployment targets after validation.

## Getting started

```bash
npm install
npm run dev
```

## Environment
- Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` (defaults to `production`).
- For now, no tokens are required; Clerk variables will be added when auth is wired.

## Studio
- Sanity Studio is embedded at `/studio` (App Router catchall) using `sanity.config.ts`.
- Schemas: doc pages (`path` + `order`), blog posts (`slug` + `publishedAt`), and nav groups (`key` + `order`).

## Available scripts
- `npm run dev` – start the local dev server
- `npm run build` – production build
- `npm run start` – run the built app
- `npm run lint` – lint with eslint-config-next
- `npm run type-check` – TypeScript type checking

## Next steps (planned)
- Add Clerk auth to protect Studio and preview routes
- Wire doc/blog rendering from Sanity content
- Configure deployment (Vercel for testing; Azure/Savella for production)
