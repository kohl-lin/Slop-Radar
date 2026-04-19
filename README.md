# 🪲 AI Slop Radar

**Fight GIGO. Trace AI news to the source.**

A Chrome extension + web app that scores AI content on three dimensions:
- **Signal** — Is there real information here?
- **Novelty** — Is this new, or a rehash?
- **Slop** — How much is AI-repackaged fluff?

## Quick Start

### 1. Backend

```bash
cd backend
cp ../.env.example .env   # fill in your API keys
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Required API keys in `.env`:
- `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com)
- `EXA_API_KEY` — from [exa.ai](https://exa.ai)
- `UPSTASH_REDIS_URL` — (optional) from [upstash.com](https://upstash.com), for caching

### 2. Web Frontend

```bash
cd web
npm install
npm run dev
```

Opens at http://localhost:3000

### 3. Chrome Extension

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension/` folder
5. Navigate to x.com — you'll see a 🪲 beetle button on each tweet

Or install from zip:
```bash
cd extension && zip -r ../slop-radar-extension.zip . -x "generate-icons.html"
```

## Architecture

```
├── backend/           FastAPI backend
│   ├── app/api/       /analyze, /result, /event, /stats endpoints
│   ├── app/services/  LLM (Claude), Exa search, Redis cache
│   └── app/middleware/ Rate limiting
├── extension/         Chrome MV3 extension
│   ├── content.js     Injects beetle button into x.com tweets
│   ├── background.js  Service worker for API calls
│   └── popup/         Extension popup with paste box
├── web/               Next.js frontend
│   ├── src/app/       Home page + /r/[hash] share page
│   └── src/components/ ScoreCard, PixelBeetle
└── scripts/           Icon generation utilities
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/analyze` | Analyze text, return 3 scores + sources |
| GET | `/api/result/{hash}` | Fetch cached result by hash |
| POST | `/api/event` | Track analytics events |
| GET | `/api/stats` | Basic analytics dashboard |
| GET | `/health` | Health check |

## Tech Stack

- **Backend**: Python, FastAPI, Anthropic Claude, Exa.ai, Upstash Redis
- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Extension**: Chrome MV3, vanilla JS
- **Design**: Pixel art theme with Press Start 2P font

## License

MIT
