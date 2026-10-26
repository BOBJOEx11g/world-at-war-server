# Server architecture

## Responsibilities

The server is the authority for game state. The browser may request actions, but the server validates and resolves them. Clients must never be trusted to decide ownership, combat outcomes, resources, or AI decisions.

## Initial implementation

- Node.js + TypeScript.
- HTTP health endpoint: `GET /health`.
- WebSocket endpoint: `/ws`.
- Versioned JSON protocol in `src/protocol.ts`.
- Strict TypeScript settings.
- No persistent world state yet; the current server is a connectivity scaffold.

## Planned systems

1. Versioned world-data schema and validation.
2. Geographic-data import and audit pipeline.
3. Scenario definitions, beginning with the modern 2026 scenario.
4. Nation controller state: AI or player.
5. Deterministic simulation tick and rules-based AI.
6. Persistent storage and account/session security.
7. Server-authoritative orders, combat, diplomacy, and economy.

## World-data principles

- Give every province, nation, and territory a stable ID.
- Keep geometry separate from mutable game state.
- Keep scenario-specific starting conditions separate from shared simulation rules.
- Track provenance and licensing for every imported dataset.
- Preserve small islands and validate map coverage instead of silently filtering small features.

## Hosting and security

The development server binds to `0.0.0.0` by default. Do not expose it directly to the public internet until authentication, rate limiting, TLS/WSS termination, origin checks, and operational safeguards have been implemented. For production, place it behind a properly configured TLS reverse proxy or secure tunnel.
