/**
 * Call of War compatibility boundary.
 *
 * No live protocol handlers are exported yet. Add them only after the
 * corresponding behavior has been observed, sanitized, and documented.
 */
export {
  initialCallOfWarProfile,
  type CallOfWarProtocolProfile,
  type ObservationConfidence,
  type ProtocolObservation,
  type Transport,
} from "./profile.js";
