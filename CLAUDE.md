# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 starter template designed to showcase Netlify platform features. It demonstrates serverless functions, edge functions, blob storage, image CDN, and various deployment contexts.

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Architecture

### Application Structure

This project uses Next.js 15 with the App Router pattern:

- **`app/`** - Main application routes and components using App Router
  - Each subdirectory represents a route demonstrating a Netlify feature
  - Route Handlers (`route.js`) are automatically deployed as Serverless Functions on Netlify
  - Server Actions (files with `'use server'`) run as serverless functions

- **`components/`** - Reusable React components (.jsx files)
  - Uses absolute imports via jsconfig.json `baseUrl: "."`
  - Import as: `import { Card } from 'components/card'`

- **`netlify/functions/`** - Netlify Serverless Functions
  - `proxy.js` - CORS-enabled reverse proxy function at `/.netlify/functions/proxy/`

- **`netlify/edge-functions/`** - Netlify Edge Functions
  - `rewrite.js` - Geo-based URL rewriting using `context.geo.country.code`

- **`utils.js`** - Shared utility functions (server and client)
  - `getNetlifyContext()` - Returns `process.env.CONTEXT` (server-side only)
  - `uploadDisabled` - Checks `process.env.NEXT_PUBLIC_DISABLE_UPLOADS`

### Styling

- **Tailwind CSS** with DaisyUI components
- Custom theme: "lofi" with primary color `#2bdcd2`
- Custom background grid pattern via Tailwind config
- Global styles in `styles/globals.css`

### Key Features Demonstrated

**Netlify Blobs** (`app/blobs/`)
- Uses `@netlify/blobs` store for user-generated shape data
- Server Actions in `app/blobs/actions.js`:
  - `uploadShapeAction()` - Stores JSON to blob store with strong consistency
  - `listShapesAction()` - Lists all blob keys
  - `getShapeAction()` - Retrieves blob by key
- Shape generation via `blobshape` library in `app/blobs/generator.js`

**Serverless Functions** (`app/quotes/random/route.js`)
- Next.js Route Handlers automatically become serverless functions on Netlify
- Example: Random quote API endpoint

**Edge Functions** (`netlify/edge-functions/rewrite.js`)
- Geographic routing based on country code
- Configured via `config.path` export

**Proxy Pattern** (`netlify/functions/proxy.js`)
- Full-featured CORS-enabled reverse proxy
- Handles JSON, text, and binary data with Base64 encoding
- URL format: `/.netlify/functions/proxy/domain.com/path`

**Cocos Game Hosting** (`app/games/`)
- Host multiple Cocos Creator games on the platform
- Games stored as static files in `public/games/` directory
- Server Actions in `app/games/actions.js`:
  - `listGames()` - Lists all available games
  - `getGameInfo(gameId)` - Retrieves game metadata
  - `gameExists(gameId)` - Checks if game exists
- Game list page (`app/games/page.jsx`) - Browse all games
- Game player page (`app/games/[gameId]/page.jsx`) - Play games in iframe
- Mobile-optimized with orientation detection and fullscreen support
- Games configured via `game.json` in each game folder
- See `GAMES_UPLOAD_GUIDE.md` for detailed instructions

### Environment Variables

- `CONTEXT` - Netlify build context (dev, deploy-preview, production, branch-deploy)
- `NEXT_PUBLIC_DISABLE_UPLOADS` - Set to "true" to disable blob uploads

### Import Pattern

Project uses absolute imports from root directory:
```javascript
import { Card } from 'components/card';
import { getNetlifyContext } from 'utils';
```

### Deployment

Configured for Netlify via `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `.next`
- Functions directory: `netlify/functions`
