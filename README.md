# World at War — Server

The authoritative backend for **World at War**, a persistent, full-world grand-strategy game.

## Current status

This repository contains the first server scaffold:

- Node.js + TypeScript.
- HTTP health endpoint at `GET /health`.
- WebSocket endpoint at `/ws`.
- Versioned client/server message definitions.
- Strict TypeScript configuration.

The server currently does **not** implement the world simulation, accounts, persistence, AI, combat, or province data. Those systems will be added on top of this foundation.

## Requirements

- Node.js 22 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Check the health endpoint at `http://localhost:3000/health`. The WebSocket endpoint is `ws://localhost:3000/ws`.

Production hosting must use TLS/WSS through a secure reverse proxy or tunnel, plus authentication, origin checks, rate limiting, and other security controls before being exposed to the public internet.

## Architecture

See [docs/architecture.md](docs/architecture.md). The server is authoritative: client requests are validated and the server resolves the actual game state.

## Initial target

The first scenario is the modern world in 2026. A later 1942 scenario should reuse the same simulation engine with separate historical scenario data.
