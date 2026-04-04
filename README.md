# MindMate

Student mental wellness app: AI supportive chat (with sentiment labels), sleep tracking with a weekly bar chart, a simple dashboard “mental state” estimate, and anonymous peer matching with mutual consent.

**Not professional therapy or medical advice.** See in-app disclaimers.

## Requirements

- [Node.js](https://nodejs.org/) 18+
- [MongoDB](https://www.mongodb.com/) (local or [Atlas](https://www.mongodb.com/cloud/atlas) connection string)

## Quick start

From the project root:

```bash
npm run dev
```

This starts both the backend and frontend together.

- Frontend: `http://127.0.0.1:5173`
- Backend health check: `http://127.0.0.1:5000/api/health`

If MongoDB is not running, the backend now falls back automatically to a local file store at `server/data/dev-store.json` so you can still use the full app locally.

## Setup

1. **MongoDB** — start local `mongod` or create an Atlas cluster and copy the connection string.

2. **Backend** (`server/`):

   ```bash
   cd server
   copy .env.example .env
   ```

   Edit `.env`: set `MONGODB_URI`, a strong `JWT_SECRET`, and optionally `OPENAI_API_KEY` for richer AI replies (otherwise built-in supportive messages are used).

   ```bash
   npm install
   npm run dev
   ```

   API default: `http://localhost:5000` (see `PORT` in `.env`).

3. **Frontend** (`client/`):

   ```bash
   cd client
   npm install
   npm run dev
   ```

   Open `http://localhost:5173`. The Vite dev server proxies `/api` to the backend.

## No MongoDB?

If you do not have MongoDB installed yet, you can still run the project locally. The backend will detect the failed MongoDB connection and switch to a local development data file automatically. This is useful for demos, UI testing, and end-to-end local setup.

## API (base path `/api`)

| Method | Path | Auth |
|--------|------|------|
| POST | `/signup`, `/login` | No |
| GET/PATCH | `/me` | Yes |
| POST | `/chat` | Yes |
| GET | `/chat/history` | Yes |
| POST | `/sleep` | Yes |
| GET | `/sleep/:userId` | Yes (own id) |
| GET | `/mental-state/:userId` | Yes (own id) |
| POST | `/find-peer`, `/accept-peer`, `/send-message`, `/peer/end` | Yes |
| GET | `/peer/status`, `/peer/messages/:sessionId` | Yes |

## Peer matching (testing)

Use two browsers (or incognito + normal) with two accounts. Both click **Find support**; when a pair is found, both **Accept**, then chat. Messages poll every ~2 seconds (no WebSocket required).
