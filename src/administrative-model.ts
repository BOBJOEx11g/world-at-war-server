/**
 * Lightweight geography metadata for World at War.
 * Terrain tags describe the ground; they do not apply gameplay effects yet.
 */

export type AdministrativeLevel =
  | "country"
  | "state-province"
  | "county-district"
  | "municipality"
  | "local"
  | "historical-region";

/**
 * Eight broad biome categories, plus independent physical/strategic overlays.
 * Biome and overlay tags can coexist (for example, forest + mountains).
 */
export const BIOME_TAGS = [
  "forest",
  "rainforest",
  "grassland",
  "savanna",
  "desert",
  "shrubland",
  "tundra",
  "wetland",
] as const;

export const TERRAIN_OVERLAY_TAGS = [
  "mountains",
  "hills",
  "coastal",
  "urban",
  "riverine",
  "ice-snow",
] as const;

export const TERRAIN_TAGS = [
  ...BIOME_TAGS,
  ...TERRAIN_OVERLAY_TAGS,
] as const;

export type BiomeTag = (typeof BIOME_TAGS)[number];
export type TerrainOverlayTag = (typeof TERRAIN_OVERLAY_TAGS)[number];
export type TerrainTag = (typeof TERRAIN_TAGS)[number];

export interface DataProvenance {
  source: string;
  version: string;
  sourceFeatureId: string;
  license: string;
  sourceUrl?: string;
}

export interface AdministrativeAreaDefinition {
  id: string;
  name: string;
  level: AdministrativeLevel;
  parentId: string | null;
  authorityCode: string | null;
  geometryId: string;
  validFrom: string | null;
  validTo: string | null;
  provenance: DataProvenance;
  /** Physical terrain labels for this administrative area's geography. */
  terrainTags: TerrainTag[];
  tags: string[];
}

export interface ProvinceAdjacency {
  provinceId: string;
  kind: "land" | "strait" | "sea";
  movementCost: number;
}

export interface ProvinceMapRecord {
  id: string;
  name: string;
  geometryId: string;
  administrativeAreaId: string | null;
  initialOwnerNationId: string | null;
  referenceDate: string;
  /** A province can have one main biome plus independent terrain overlays. */
  terrainTags: TerrainTag[];
  isCoastal: boolean;
  strategicTags: string[];
  neighbors: ProvinceAdjacency[];
  provenance: DataProvenance;
}

const ISO_DATE = /^\\d{4}-\\d{2}-\\d{2}$/;
const VALID_TERRAIN_TAGS = new Set<string>(TERRAIN_TAGS);

function isValidDate(value: string): boolean {
  return ISO_DATE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function validateTerrainTags(tags: readonly string[], label: string): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const tag of tags) {
    if (!VALID_TERRAIN_TAGS.has(tag)) errors.push(`${label} has unknown terrain tag "${tag}".`);
    if (seen.has(tag)) errors.push(`${label} has duplicate terrain tag "${tag}".`);
    seen.add(tag);
  }
  return errors;
}

/** Validate hierarchy, dates, terrain labels, stable IDs, and adjacency references. */
export function validateAdministrativeMap(
  areas: readonly AdministrativeAreaDefinition[],
  provinces: readonly ProvinceMapRecord[],
): string[] {
  const errors: string[] = [];
  const areaById = new Map<string, AdministrativeAreaDefinition>();
  const provinceById = new Map<string, ProvinceMapRecord>();

  for (const area of areas) {
    if (!area.id.trim()) errors.push("Administrative area IDs cannot be empty.");
    if (areaById.has(area.id)) errors.push(`Duplicate administrative area ID: ${area.id}`);
    areaById.set(area.id, area);
    if (!area.name.trim()) errors.push(`Administrative area ${area.id} has no name.`);
    if (!area.geometryId.trim()) errors.push(`Administrative area ${area.id} has no geometryId.`);
    if (!area.provenance.source.trim() || !area.provenance.version.trim() ||
        !area.provenance.sourceFeatureId.trim() || !area.provenance.license.trim()) {
      errors.push(`Administrative area ${area.id} is missing data provenance.`);
    }
    errors.push(...validateTerrainTags(area.terrainTags, `Administrative area ${area.id}`));
    if (area.validFrom !== null && !isValidDate(area.validFrom)) {
      errors.push(`Administrative area ${area.id} has invalid validFrom date.`);
    }
    if (area.validTo !== null && !isValidDate(area.validTo)) {
      errors.push(`Administrative area ${area.id} has invalid validTo date.`);
    }
    if (area.validFrom && area.validTo && isValidDate(area.validFrom) &&
        isValidDate(area.validTo) && area.validFrom >= area.validTo) {
      errors.push(`Administrative area ${area.id} has an empty or reversed validity range.`);
    }
  }

  for (const area of areas) {
    if (area.parentId !== null && !areaById.has(area.parentId)) {
      errors.push(`Administrative area ${area.id} references unknown parent ${area.parentId}.`);
    }
    if (area.parentId === area.id) errors.push(`Administrative area ${area.id} cannot be its own parent.`);
  }

  for (const province of provinces) {
    if (!province.id.trim()) errors.push("Province IDs cannot be empty.");
    if (provinceById.has(province.id)) errors.push(`Duplicate province ID: ${province.id}`);
    provinceById.set(province.id, province);
    if (!province.geometryId.trim()) errors.push(`Province ${province.id} has no geometryId.`);
    if (!isValidDate(province.referenceDate)) errors.push(`Province ${province.id} has invalid referenceDate.`);
    if (province.administrativeAreaId !== null && !areaById.has(province.administrativeAreaId)) {
      errors.push(`Province ${province.id} references unknown administrative area ${province.administrativeAreaId}.`);
    }
    if (!province.provenance.source.trim() || !province.provenance.version.trim() ||
        !province.provenance.sourceFeatureId.trim() || !province.provenance.license.trim()) {
      errors.push(`Province ${province.id} is missing data provenance.`);
    }
    errors.push(...validateTerrainTags(province.terrainTags, `Province ${province.id}`));
    for (const neighbor of province.neighbors) {
      if (neighbor.provinceId === province.id) errors.push(`Province ${province.id} cannot neighbor itself.`);
      if (!Number.isFinite(neighbor.movementCost) || neighbor.movementCost < 0) {
        errors.push(`Province ${province.id} has an invalid neighbor movement cost.`);
      }
    }
  }

  for (const province of provinces) {
    for (const neighbor of province.neighbors) {
      if (!provinceById.has(neighbor.provinceId)) {
        errors.push(`Province ${province.id} references unknown neighbor ${neighbor.provinceId}.`);
      }
    }
  }

  return errors;
}
