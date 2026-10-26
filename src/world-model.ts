/**
 * Stable data contracts shared by scenario loaders and the simulation.
 * Geometry is deliberately stored separately from mutable runtime state.
 */

export type ScenarioId = "modern-2026" | "historical-1942";

export type TerritoryKind =
  | "sovereign-state"
  | "dependent-territory"
  | "disputed-territory"
  | "uninhabited-territory";

export type NationController =
  | {
      kind: "ai";
      profileId: string;
    }
  | {
      kind: "player";
      playerId: string;
      /**
       * When true, the rules-based AI may make strategic decisions while
       * this player is offline. Existing orders continue either way.
       */
      offlineAiEnabled: boolean;
    };

export interface NationDefinition {
  id: string;
  displayName: string;
  territoryKind: TerritoryKind;
  capitalProvinceId: string | null;
  tags: string[];
}

export interface ProvinceDefinition {
  id: string;
  displayName: string;
  geometryId: string;
  initialOwnerNationId: string | null;
  terrain: string;
  isCoastal: boolean;
  strategicTags: string[];
}

export interface ScenarioDefinition {
  id: ScenarioId;
  displayName: string;
  startDate: string;
  mapDataVersion: string;
  nations: NationDefinition[];
  provinces: ProvinceDefinition[];
}

export function validateScenarioDefinition(
  scenario: ScenarioDefinition
): string[] {
  const errors: string[] = [];
  const nationIds = new Set<string>();
  const provinceIds = new Set<string>();

  if (!scenario.id || !scenario.displayName || !scenario.mapDataVersion) {
    errors.push("Scenario id, displayName, and mapDataVersion are required.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(scenario.startDate)) {
    errors.push("startDate must use YYYY-MM-DD format.");
  } else if (Number.isNaN(Date.parse(`${scenario.startDate}T00:00:00Z`))) {
    errors.push("startDate must be a valid calendar date.");
  }

  for (const nation of scenario.nations) {
    if (!nation.id.trim()) errors.push("Nation IDs cannot be empty.");
    if (nationIds.has(nation.id)) errors.push(`Duplicate nation ID: ${nation.id}`);
    nationIds.add(nation.id);
  }

  for (const province of scenario.provinces) {
    if (!province.id.trim()) errors.push("Province IDs cannot be empty.");
    if (provinceIds.has(province.id)) {
      errors.push(`Duplicate province ID: ${province.id}`);
    }
    provinceIds.add(province.id);
  }

  for (const province of scenario.provinces) {
    if (
      province.initialOwnerNationId !== null &&
      !nationIds.has(province.initialOwnerNationId)
    ) {
      errors.push(
        `Province ${province.id} refers to unknown nation ${province.initialOwnerNationId}.`
      );
    }
    if (!province.geometryId.trim()) {
      errors.push(`Province ${province.id} is missing geometryId.`);
    }
  }

  for (const nation of scenario.nations) {
    if (
      nation.capitalProvinceId !== null &&
      !provinceIds.has(nation.capitalProvinceId)
    ) {
      errors.push(
        `Nation ${nation.id} refers to unknown capital province ${nation.capitalProvinceId}.`
      );
    }
  }

  return errors;
}
