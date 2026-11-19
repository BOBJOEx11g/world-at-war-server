# World at War — Server

The authoritative backend for **World at War**, a persistent, full-world grand-strategy game. This repository is also the home of an isolated research/compatibility layer for an independently operated Call of War client experiment.

## Current status

The World at War server scaffold includes:

- Node.js + TypeScript.
- HTTP health endpoint at `GET /health`.
- WebSocket endpoint at `/ws`.
- Versioned World at War client/server message definitions.
- Natural Earth country and administrative geography models.
- Strict TypeScript configuration and CI typecheck/build validation.

The World at War simulation, accounts, persistence, AI, and combat are not yet implemented.

**Call of War compatibility is not implemented.** The existing `/ws` protocol is World at War's own protocol, not a verified Call of War protocol. The new `src/compat/call-of-war/` module is an evidence-first boundary for recording sanitized observations. No Bytro backend or SUP-Engine source is included.

## Requirements

- Node.js 22 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Check the health endpoint at `http://localhost:3000/health`. The World at War WebSocket endpoint is `ws://localhost:3000/ws`.

Production hosting must use TLS/WSS through a secure reverse proxy or tunnel, plus authentication, origin checks, rate limiting, and other security controls before being exposed to the public internet.

## Architecture

See [docs/architecture.md](docs/architecture.md) for the World at War server and [docs/call-of-war-compatibility.md](docs/call-of-war-compatibility.md) for the separate Call of War investigation.

The World at War server is authoritative: client requests are validated and the server resolves the actual game state.

## Initial World at War target

The first scenario is the modern world in 2026. A later 1942 scenario should reuse the same simulation engine with separate historical scenario data.

## Call of War compatibility first milestone

Capture and document a sanitized, repeatable protocol profile before implementing any compatibility handlers. Never commit raw HAR exports, cookies, authorization headers, access tokens, passwords, or personal data. Do not invent endpoints or message schemas.
