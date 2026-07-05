# Tavas Frontend (Vite + React)

## Local development

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
npm run preview
```

## Deploy to Vercel

This project is configured for Vercel with SPA route fallback in `vercel.json`.

### 1) Import the repository into Vercel

- Framework preset: `Vite`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

### 2) Set environment variables in Vercel

Set this variable in Project Settings -> Environment Variables:

- `VITE_API_URL`: Base URL of your backend API in production.

Example:

```env
VITE_API_URL=https://api.yourdomain.com
```

If `VITE_API_URL` is not set, the app falls back to `/api`.

### 3) Redeploy

After adding env vars, trigger a new deployment so Vite can inject the values at build time.

## Notes

- Client-side routes are handled by a rewrite to `index.html`.
- The development proxy in `vite.config.js` is only for local development.
