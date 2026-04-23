# Humanumbers Website

This is the public-facing Humanumbers site: product story, live demo, API docs, MCP notes, and deployment-facing examples.

It is built with React + Vite and is intended to become its own standalone Vercel repository.

## Local development

```bash
cd ws
npm install
npm run dev
```

In local mode, the Vite proxy expects the API at `http://127.0.0.1:8000`.

## Production environment

The website needs to know where the public API lives.

Set:

```bash
VITE_API_BASE_URL=https://api-humanumbers.resultity.com
```

For the intended production split:

- website: `https://humanumbers.resultity.com`
- API: `https://api-humanumbers.resultity.com`

Then build:

```bash
npm run build
```

## Vercel settings

- Framework preset: `Vite`
- Root directory: repository root
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL=https://api-humanumbers.resultity.com`

The API must allow the website origin in CORS. For the current production plan, the backend allowlist should include:

```bash
HUMANUMBERS_CORS_ORIGINS=https://humanumbers.resultity.com
```

## What this site is supposed to do

- show why Humanumbers exists
- provide a live demo backed by the API
- document the HTTP and MCP surfaces without reading like internal notes
- stay deployable as a clean standalone frontend repo