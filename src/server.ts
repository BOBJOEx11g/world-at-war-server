import { createServer } from "node:http";
import { WebSocket, WebSocketServer } from "ws";
import { ADMIN0_NATION_CATALOG } from "./nation-catalog.js";
import {
  isClientMessage,
  PROTOCOL_VERSION,
  type ServerMessage,
} from "./protocol.js";

const host = process.env.HOST ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

const httpServer = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (url.pathname === "/health" && request.method === "GET") {
    response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({
      status: "ok",
      service: "world-at-war-server",
      protocolVersion: PROTOCOL_VERSION,
      worldLoaded: false,
      countryCatalogLoaded: true,
      countryCount: ADMIN0_NATION_CATALOG.length,
      playableNationCount: ADMIN0_NATION_CATALOG.filter((nation) => nation.isPlayable).length
    }));
    return;
  }

  response.writeHead(404, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify({ error: "not_found" }));
});

const webSocketServer = new WebSocketServer({ server: httpServer, path: "/ws" });

webSocketServer.on("connection", (socket) => {
  const hello: ServerMessage = {
    type: "server.hello",
    protocolVersion: PROTOCOL_VERSION,
    serverVersion: "0.1.0",
    worldStatus: "not-loaded"
  };
  socket.send(JSON.stringify(hello));

  socket.on("message", (raw) => {
    let value: unknown;

    try {
      value = JSON.parse(raw.toString());
    } catch {
      sendError(socket, "invalid_json", "Message must be valid JSON.");
      return;
    }

    if (!isClientMessage(value)) {
      sendError(socket, "invalid_message", "Message type or fields are not supported.");
      return;
    }

    if (value.type === "client.hello") {
      if (value.protocolVersion !== PROTOCOL_VERSION) {
        sendError(socket, "protocol_mismatch", `Server protocol is ${PROTOCOL_VERSION}.`);
      }
      return;
    }

    if (value.type === "client.ping") {
      const pong: ServerMessage = {
        type: "server.pong",
        sentAt: value.sentAt,
        serverTime: Date.now()
      };
      socket.send(JSON.stringify(pong));
    }
  });
});

function sendError(socket: WebSocket, code: string, message: string): void {
  if (socket.readyState !== WebSocket.OPEN) return;
  const payload: ServerMessage = { type: "server.error", code, message };
  socket.send(JSON.stringify(payload));
}

httpServer.listen(port, host, () => {
  console.log(`World at War server listening on http://${host}:${port}`);
  console.log(`Natural Earth Admin 0 catalog loaded: ${ADMIN0_NATION_CATALOG.length} playable nations`);
  console.log(`WebSocket endpoint: ws://${host}:${port}/ws`);
});

function shutdown(): void {
  webSocketServer.close();
  httpServer.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
