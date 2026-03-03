---
description: Cómo desplegar Analliz en Cloudflare Pages mediante GitHub Sync
---

# Despliegue en Cloudflare Pages (GitHub Sync)

Como ya tienes tu repositorio sincronizado con Cloudflare, el proceso es mucho más sencillo.

## 1. Configuración del Build en Cloudflare
Ve al panel de Cloudflare Pages y en la configuración de Build de tu proyecto, asegúrate de tener estos valores:

- **Build command:** `npm run cf-build`
- **Build output directory:** `.vercel/output`
- **Root directory:** `/` (o donde esté tu `package.json`)

## 2. Variables de Entorno
Debes configurar estas variables en **Settings > Variables and Secrets**:

- `AUTH0_SECRET`
- `AUTH0_BASE_URL` (Debe ser tu URL de `.pages.dev`)
- `AUTH0_ISSUER_BASE_URL`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `DATABASE_URL` (Tu URL de Neon DB)

## 3. Despliegue
Para desplegar nuevos cambios, solo tienes que hacer:

```bash
git add .
git commit -m "Configure Cloudflare Pages deployment"
git push origin main
```

Cloudflare detectará el push y ejecutará el build automáticamente.
