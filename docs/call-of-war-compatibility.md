# Call of War client compatibility

## Goal

Investigate whether the original, browser-delivered Call of War client can communicate with an independently operated local backend.

This is an interoperability project. The repository contains no Bytro server code, SUP-Engine source, private keys, credentials, or copied proprietary backend implementation.

## Current state

**Not compatible yet.** The existing `/ws` endpoint and `src/protocol.ts` implement the World at War protocol. They are not claimed to match Call of War.

The Call of War protocol is currently **unknown**. Do not invent endpoint paths, message names, authentication flows, identifiers, or payload schemas. Implement only behavior supported by sanitized observations of the client.

## Architecture boundary

Keep the projects separate:

- `src/server.ts` remains the World at War server entry point.
- `src/protocol.ts` remains the World at War client/server protocol.
- `src/compat/call-of-war/` contains Call of War-specific observations and compatibility code.
- Call of War compatibility must not change World at War message semantics.

The compatibility layer should be introduced behind an explicit configuration switch only after its first real protocol behavior is understood and tested.

## Investigation workflow

1. Run the browser client normally and inspect DevTools Network activity.
2. Record request method, URL path, transport, content type, status, message direction, and payload *shape*.
3. Record WebSocket handshake and frame metadata if WebSockets are actually used. Do not assume they are.
4. Repeat a small number of ordinary actions (for example, initial page load and opening a match) and compare the resulting exchanges.
5. Build a protocol profile from repeatable observations.
6. Implement one harmless read-only exchange at a time, then test with a local browser profile.
7. Add state-changing operations only after their request/response contracts and server-side validation are understood.

## Capture hygiene

Never commit or share raw HAR files, full DevTools exports, session cookies, authorization headers, access tokens, passwords, account identifiers, or personal data.

Before adding a fixture, remove sensitive values and retain only the minimum structural information needed to understand the protocol. Do not replay requests against Bytro services or attempt to bypass authentication, anti-cheat, access controls, or service protections. Use a local test environment for compatibility experiments.

Do not copy proprietary game assets or server code into this repository. Keep any client files obtained through normal browser delivery in a local, untracked research directory unless their licence clearly permits redistribution.

## First technical milestone

Produce a sanitized, evidence-backed protocol profile. Until that exists, the compatibility module is deliberately only a schema and documentation boundary; it does not pretend to accept Call of War traffic.
