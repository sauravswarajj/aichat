# Multi-AI Orchestrator — Backend

Node.js + Express + TypeScript backend for the personal multi-AI collaboration
workspace. Runs a task through a chain of configurable AI agents (Creator →
Reviewer → Critic → Finalizer, etc.), each backed by a provider you choose
(Gemini / NVIDIA NIM / Qwen / OpenRouter / DeepSeek / Grok / Groq), streams progress
to the frontend in real time over SSE, and saves every conversation as a
thread — just like Claude's own chat sidebar — backed by MongoDB Atlas so
nothing is lost on restart or redeploy.

## Quick start

```bash
npm install
cp .env.example .env
# open .env and fill in:
#  - MONGODB_URI          (MongoDB Atlas connection string — see below)
#  - AUTH_EMAIL / AUTH_PASSWORD   (your login credentials)
#  - whichever provider API keys you already have
npm run dev
```

Server starts on `http://localhost:4000` by default. It will refuse to start
if `MONGODB_URI` isn't set or isn't reachable — everything persistent (login
sessions AND chat threads) lives in MongoDB now, so the app genuinely can't
work without it.

### Getting a MongoDB Atlas connection string

1. [mongodb.com/cloud/atlas/register](https://mongodb.com/cloud/atlas/register) → free account
2. Create a free (M0) cluster
3. **Database Access** → add a database user with a password
4. **Network Access** → allow access from anywhere (`0.0.0.0/0`) for now, or your specific IP
5. **Connect** → **Drivers** → copy the connection string, paste it into `MONGODB_URI` in `.env`

## Folder structure — what's where and why

```
src/
├── server.ts                 Entry point. Connects to MongoDB, THEN starts the HTTP listener.
├── app.ts                    Builds the Express app: middleware + routes wired together.
│
├── config/
│   ├── env.ts                 Loads and VALIDATES all environment variables in one place.
│   │                           Every other file reads config from here, never process.env directly.
│   └── db.ts                  Connects to MongoDB via mongoose. Called once at startup.
│
├── models/                    Mongoose schemas — the only files that know about MongoDB's document shape.
│   ├── session.model.ts       One document per logged-in device.
│   └── thread.model.ts        One document per chat thread, with its turns embedded inside it.
│
├── types/                     Shared TypeScript contracts — no logic, just shapes.
│   ├── provider.types.ts      ChatMessage, ProviderRequest/Response, the AIProvider interface.
│   ├── agent.types.ts         AgentConfig (role + provider + model), WorkflowRequest.
│   ├── workflow.types.ts      WorkflowState, AgentMessage, the SSE WorkflowEvent contract.
│   ├── thread.types.ts        Thread, ThreadTurn, ThreadSummary (the sidebar shape).
│   └── express.d.ts           Augments Express's Request with req.sessionToken.
│
├── providers/                 One file per AI provider. Each converts OUR universal
│   │                          request/response shape to/from that provider's own API format.
│   ├── base.provider.ts       Shared axios instance + error normalization helper.
│   ├── gemini.provider.ts     Google Gemini adapter.
│   ├── nvidia.provider.ts     NVIDIA NIM adapter (OpenAI-compatible).
│   ├── qwen.provider.ts       Alibaba DashScope/Qwen adapter (OpenAI-compatible, INTL endpoint).
│   ├── openrouter.provider.ts OpenRouter adapter.
│   ├── deepseek.provider.ts   DeepSeek adapter (OpenAI-compatible). One-time 5M free tokens on sign-up.
│   ├── grok.provider.ts       xAI Grok adapter (OpenAI-compatible). Currently has no real free tier.
│   ├── groq.provider.ts       Groq (GroqCloud) adapter — NOT xAI's Grok. Hosts Llama/Qwen/Mixtral/Kimi
│   │                          at very high speed. Generous free tier, no card needed.
│   └── provider.factory.ts    Maps a provider name string -> the matching adapter.
│                               ADD NEW PROVIDERS HERE — this is the one file to edit.
│
├── orchestrator/
│   └── orchestrator.ts        THE CORE LOGIC. Runs the agent chain sequentially, passes each
│                               agent's output forward as context, emits real-time events.
│                               Also accepts optional thread history so agents can see earlier
│                               turns of the conversation. Knows nothing about Express or HTTP.
│
├── validators/
│   ├── chat.validator.ts      Zod schema for the incoming workflow request body (now includes threadId).
│   ├── auth.validator.ts      Zod schema for the login request body.
│   └── thread.validator.ts    Zod schemas for create-thread and rename-thread request bodies.
│
├── middleware/
│   ├── validate.middleware.ts     Generic "validate req.body against a zod schema" factory.
│   ├── errorHandler.middleware.ts Turns any thrown error into a clean HTTP response. LAST in the chain.
│   ├── requestLogger.middleware.ts Logs method/path/status/duration for every request.
│   ├── auth.middleware.ts          Protects a route — requires a valid session token.
│   └── loginRateLimit.middleware.ts Slows down password brute-forcing on /auth/login.
│
├── controllers/
│   ├── chat.controller.ts     Express-facing layer. Two handlers, both thread-aware:
│   │                          - runWorkflowJSON  -> plain request/response
│   │                          - runWorkflowSSE   -> real-time streaming response
│   ├── auth.controller.ts     login / logout / logout-all-devices / me.
│   └── thread.controller.ts   list / get / create / rename / delete (the sidebar's backend).
│
├── routes/
│   ├── index.ts                Mounts every router under /api; applies requireAuth to /chat and /threads.
│   ├── chat.routes.ts           POST /api/chat  and  POST /api/chat/stream  (protected)
│   ├── auth.routes.ts           POST /api/auth/login, /logout, /logout-all, GET /api/auth/me
│   ├── thread.routes.ts         GET/POST /api/threads, GET/PATCH/DELETE /api/threads/:id (protected)
│   └── health.routes.ts         GET  /api/health (public)
│
└── utils/
    ├── logger.ts                Tiny structured console logger.
    ├── AppError.ts               Custom error class carrying an HTTP status code.
    ├── retry.ts                  Exponential-backoff retry wrapper, used by every provider adapter.
    ├── sse.ts                    Server-Sent Events helper (used by the streaming controller).
    ├── asyncHandler.ts           Wraps async route handlers so thrown errors reach errorHandler.
    ├── sessionStore.ts           MongoDB-backed login sessions (multi-device + logout-all).
    ├── threadStore.ts            MongoDB-backed chat threads — create/list/get/append/rename/delete.
    └── safeCompare.ts            Timing-safe string comparison, used for password checking.
```

**Request flow, end to end:**
`routes` → `validate.middleware` (zod) → `controller` → `orchestrator` (+ `threadStore` for context/saving) → `provider.factory` → concrete `provider adapter` → external AI API, and errors from anywhere in that chain land in `errorHandler.middleware`.

## API

### `GET /api/health` (also aliased at `GET /health`, no `/api` prefix)
Liveness check. Public — no auth needed. Point an uptime bot (UptimeRobot,
cron-job.org, etc.) at either URL to keep a Render free-tier instance from
spinning down on inactivity. Returns:
```json
{
  "status": "ok",
  "uptimeSeconds": 1234,
  "database": "connected",
  "databaseConnected": true,
  "timestamp": "2026-08-26T09:59:07.821Z"
}
```
Always responds `200` as long as the process itself is up (so a keep-alive
ping never fails just because Mongo hiccuped) — but `database`/
`databaseConnected` tell you if MongoDB itself is actually reachable, so you
can tell "server sleeping" apart from "server up but DB down" at a glance. Public.

### `POST /api/chat` / `POST /api/chat/stream`  *(requires auth)*
Runs a workflow. `/stream` sends real-time SSE progress instead of waiting
for one final JSON response. Both are thread-aware — see **Threads** below.

Event types on `/stream`: `thread_info` (sent first), `workflow_started`,
`agent_started`, `agent_response`, `agent_completed`, `agent_error`,
`final_result`, `workflow_completed`, `workflow_error`.

**Request body:**
```json
{
  "task": "Write a function that reverses a linked list",
  "taskType": "coding",
  "threadId": "optional — omit to start a new thread",
  "agents": [
    { "role": "creator", "provider": "gemini", "model": "gemini-2.5-flash", "systemPrompt": "..." },
    { "role": "reviewer", "provider": "nvidia", "model": "meta/llama-3.1-70b-instruct", "systemPrompt": "..." },
    { "role": "finalizer", "provider": "gemini", "model": "gemini-2.5-flash", "systemPrompt": "..." }
  ]
}
```

## Threads — chat history, like Claude's sidebar

Every workflow run belongs to a **thread**. A thread is one conversation:
an ordered list of turns, where each turn is one task you sent plus the full
agent-chain output it produced. This is what powers a sidebar of past chats
and the ability to reopen one and keep going.

- **`POST /api/threads`** — "New Chat" button. Creates an empty thread
  (titled `"New Chat"` until its first message), returns it immediately so
  it can appear in the sidebar right away. Body: `{ title? }` (optional).
- **`GET /api/threads`** — sidebar list. Returns lightweight summaries
  (`id`, `title`, `createdAt`, `updatedAt`, `turnCount`, `preview`), sorted
  most-recently-updated first.
- **`GET /api/threads/:id`** — full thread, including every turn's messages.
  Use this to reopen an old chat and render its history.
- **`PATCH /api/threads/:id`** — rename. Body: `{ title }`.
- **`DELETE /api/threads/:id`** — delete a thread and everything in it.

**How continuing a thread works:** send `threadId` in your `/api/chat` (or
`/api/chat/stream`) request. The backend loads that thread's prior turns,
converts each one into a `(user: task) -> (assistant: finalResult)` message
pair, and feeds all of that to every agent as context before your new task —
capped to the most recent `THREAD_HISTORY_LIMIT` turns (default 10, set in
`.env`) so a long-running thread's prompt doesn't grow forever. This is
exactly what makes "check the earlier data in this thread" actually work —
the agents genuinely see it.

**If you omit `threadId`**, a brand-new thread is auto-created for that run,
and its id comes back in the response (`threadId` field in the JSON
response, or a `thread_info` SSE event sent first on the streaming endpoint)
— use that id for every follow-up message in the same conversation.

Once a run completes successfully, the turn (task, every agent's message,
the final result) is saved onto the thread automatically — you don't need a
separate "save" call.

## Auth — single-owner login

There is no signup and no forgot-password flow. The only valid credentials
are `AUTH_EMAIL` / `AUTH_PASSWORD` in `.env` — to change your password, edit
`.env` and restart the server.

- **`POST /api/auth/login`** — body `{ email, password, label? }` (label is
  an optional device name, purely cosmetic). Returns `{ token }`. Rate-limited
  to 10 attempts per IP per 15 minutes to slow down brute-forcing.
- **`GET /api/auth/me`** — send `Authorization: Bearer <token>`. Returns
  `{ authenticated: true }` if the session is still valid — use this on
  frontend app load to check "am I still logged in?".
- **`POST /api/auth/logout`** — revokes only the token used to call it (logs
  out just that one device/browser).
- **`POST /api/auth/logout-all`** — revokes every session on every device at
  once, immediately.
- **`/api/chat`**, **`/api/chat/stream`**, and every **`/api/threads`** route
  all require a valid `Authorization: Bearer <token>` header.

**Sessions never expire on their own** — they stay valid until you call
`/logout` or `/logout-all`, and they're stored in MongoDB so a server
restart or redeploy doesn't log you out. You can be logged in on as many
devices as you want simultaneously; `/logout-all` is the only thing that
clears all of them at once.

**Frontend integration:** store the token from `/login` (e.g. in
`localStorage`), send it as `Authorization: Bearer <token>` on every request
to `/api/chat`, `/api/chat/stream`, `/api/threads*`, `/api/auth/logout`,
`/api/auth/logout-all`, and `/api/auth/me`. On app load, call `/api/auth/me`
— if it returns 401, show the login screen; if 200, go straight to the app
and load `/api/threads` for the sidebar.

## Switching providers from a frontend dropdown

Every route already accepts `provider` as plain data in the request body — the
factory in `provider.factory.ts` looks it up at runtime. So a frontend
dropdown just needs to send the matching string per agent, no backend changes
needed:

```json
{ "role": "creator", "provider": "groq", "model": "llama-3.3-70b-versatile", "systemPrompt": "..." }
```

Valid `provider` values right now: `"gemini"`, `"nvidia"`, `"qwen"`,
`"openrouter"`, `"deepseek"`, `"grok"`, `"groq"`. Note: `"grok"` is xAI's
Grok (currently no free tier — needs a paid key to actually work) and
`"groq"` is the separate GroqCloud service (free, and likely what you
actually want unless you're specifically paying for xAI). Each agent in the `agents` array can
use a different provider — that's the whole point of the per-agent config.
The only requirement is that the matching API key is set in `.env` on the
backend; if it's missing, that agent's step fails with a clear
`"<KEY_NAME> is not set in .env"` error instead of a silent failure.

## Adding a 7th provider

1. Copy `providers/nvidia.provider.ts` (simplest one, OpenAI-compatible) as a template.
2. Point it at the new provider's endpoint and auth header.
3. Add the provider's name to `ProviderName` in `types/provider.types.ts`.
4. Register it in `providers/provider.factory.ts`.
5. Add its API key variable to `config/env.ts` and `.env.example`.

No other file needs to change — routes, orchestrator, and validators are all
already generic over `ProviderName`.

## Notes

- **Everything persistent lives in MongoDB** — login sessions and chat
  threads. There's no file-based or in-memory fallback; if `MONGODB_URI` is
  missing or unreachable, the server refuses to start rather than run in a
  half-working state.
- All provider API keys and your login password stay server-side in `.env` —
  the frontend never sees them.
- `MAX_WORKFLOW_ROUNDS`, `PROVIDER_TIMEOUT_MS`, `PROVIDER_MAX_RETRIES`, and
  `THREAD_HISTORY_LIMIT` in `.env` are your safety/cost limits — tune them as
  you add more agents or your threads get longer.
- **A note on testing:** this code was written, type-checked, and
  build-verified, but not run against a live MongoDB Atlas cluster (no
  MongoDB instance was reachable in the environment it was built in). Test
  `/api/auth/login` and `/api/threads` first thing after you plug in your
  real `MONGODB_URI` — if anything doesn't behave as documented here, that's
  the first place to look.
