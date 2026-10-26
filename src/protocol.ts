export const PROTOCOL_VERSION = 1 as const;

export type ClientMessage =
  | { type: "client.hello"; protocolVersion: number }
  | { type: "client.ping"; sentAt: number };

export type ServerMessage =
  | {
      type: "server.hello";
      protocolVersion: typeof PROTOCOL_VERSION;
      serverVersion: string;
      worldStatus: "not-loaded";
    }
  | { type: "server.pong"; sentAt: number; serverTime: number }
  | { type: "server.error"; code: string; message: string };

export function isClientMessage(value: unknown): value is ClientMessage {
  if (typeof value !== "object" || value === null || !("type" in value)) {
    return false;
  }

  const message = value as Record<string, unknown>;

  if (message.type === "client.hello") {
    return typeof message.protocolVersion === "number";
  }

  if (message.type === "client.ping") {
    return typeof message.sentAt === "number";
  }

  return false;
}
