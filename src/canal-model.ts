/**
 * Strategic maritime passages are map-independent game data.
 *
 * The endpoints name the bodies of water connected by each passage. Naval
 * pathfinding can treat each canal as a directed-independent graph edge when
 * that system is added; control and closure are runtime state, not geometry.
 */
export type CanalId = "suez-canal" | "panama-canal";

export interface CanalDefinition {
  id: CanalId;
  displayName: string;
  countryId: string;
  connects: readonly [string, string];
  /** Approximate WGS84 coordinates for map rendering: [longitude, latitude]. */
  mapLine: readonly (readonly [number, number])[];
  /** Stable graph-edge key used by future naval route calculations. */
  passageEdgeId: string;
  initiallyOpen: boolean;
  strategicTags: readonly string[];
}

export const STRATEGIC_CANALS: readonly CanalDefinition[] = [
  {
    id: "suez-canal",
    displayName: "Suez Canal",
    countryId: "EGY",
    connects: ["mediterranean-sea", "red-sea"],
    mapLine: [
      [32.34, 30.70],
      [32.38, 30.95],
      [32.43, 31.20],
      [32.55, 31.35],
    ],
    passageEdgeId: "sea:mediterranean-sea<->sea:red-sea",
    initiallyOpen: true,
    strategicTags: ["canal", "chokepoint", "naval-transit", "trade-route"],
  },
  {
    id: "panama-canal",
    displayName: "Panama Canal",
    countryId: "PAN",
    connects: ["caribbean-sea", "pacific-ocean"],
    mapLine: [
      [-79.92, 9.38],
      [-79.72, 9.10],
      [-79.55, 8.90],
      [-79.45, 8.60],
    ],
    passageEdgeId: "sea:caribbean-sea<->sea:pacific-ocean",
    initiallyOpen: true,
    strategicTags: ["canal", "chokepoint", "naval-transit", "trade-route"],
  },
] as const;

export interface CanalRuntimeState {
  canalId: CanalId;
  isOpen: boolean;
  controllerNationId: string | null;
}

/** Return whether this canal can currently be used for naval transit. */
export function canTransitCanal(
  canal: CanalDefinition,
  state: CanalRuntimeState | undefined,
): boolean {
  return state ? state.isOpen : canal.initiallyOpen;
}

/**
 * Check that canal definitions have unique IDs/edges and connect two distinct
 * named water bodies. Intended for scenario/data-pipeline validation.
 */
export function validateCanalDefinitions(
  canals: readonly CanalDefinition[] = STRATEGIC_CANALS,
): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const edges = new Set<string>();

  for (const canal of canals) {
    if (ids.has(canal.id)) errors.push(`Duplicate canal ID: ${canal.id}`);
    ids.add(canal.id);

    if (!canal.displayName.trim() || !canal.countryId.trim()) {
      errors.push(`Canal ${canal.id} needs a display name and country ID.`);
    }
    if (
      canal.connects.length !== 2 ||
      !canal.connects[0].trim() ||
      !canal.connects[1].trim() ||
      canal.connects[0] === canal.connects[1]
    ) {
      errors.push(`Canal ${canal.id} must connect two distinct water bodies.`);
    }
    if (edges.has(canal.passageEdgeId)) {
      errors.push(`Duplicate canal passage edge: ${canal.passageEdgeId}`);
    }
    edges.add(canal.passageEdgeId);
    if (canal.mapLine.length < 2) {
      errors.push(`Canal ${canal.id} needs at least two map coordinates.`);
    }
    for (const [longitude, latitude] of canal.mapLine) {
      if (
        !Number.isFinite(longitude) ||
        !Number.isFinite(latitude) ||
        longitude < -180 ||
        longitude > 180 ||
        latitude < -90 ||
        latitude > 90
      ) {
        errors.push(`Canal ${canal.id} contains an invalid WGS84 coordinate.`);
        break;
      }
    }
  }
  return errors;
}
