/**
 * Evidence-backed description of observed Call of War client traffic.
 *
 * This is intentionally not a guessed protocol implementation. Populate it
 * only from sanitized, repeatable observations made in an authorized local
 * research workflow.
 */

export type Transport = "http" | "websocket" | "other";

export type ObservationConfidence = "unverified" | "repeated" | "confirmed";

export interface ProtocolObservation {
  /** Stable local label, not a server-issued identifier. */
  id: string;
  /** HTTP method when applicable (GET, POST, etc.). */
  method?: string;
  /** URL pathname only. Never store query strings containing secrets. */
  path: string;
  transport: Transport;
  /** Content type or WebSocket subprotocol, if observed. */
  contentType?: string;
  /** Direction relative to the browser client. */
  direction: "client-to-server" | "server-to-client" | "handshake";
  /** Sanitized structural description; no raw credentials or personal data. */
  payloadShape?: string;
  confidence: ObservationConfidence;
  notes?: string;
}

export interface CallOfWarProtocolProfile {
  /** Always local research metadata; not a claimed Bytro protocol version. */
  profileVersion: 1;
  status: "unobserved" | "observing" | "partially-understood";
  observations: ProtocolObservation[];
}

/**
 * Empty by design. Do not add guessed routes or message formats.
 */
export const initialCallOfWarProfile: CallOfWarProtocolProfile = {
  profileVersion: 1,
  status: "unobserved",
  observations: [],
};
