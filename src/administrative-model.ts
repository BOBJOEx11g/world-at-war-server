/**
 * Geographic administrative units and game provinces.
 *
 * Administrative areas describe real-world political geography. Provinces are
 * the game's selectable simulation territories and may be derived from one or
 * more administrative areas. Keep these records separate from mutable game
 * state and keep geometry in versioned GeoJSON files.
 */

export type AdministrativeLevel =
  | "country"
  | "state-province"
  | "county-district"
  | "municipality"
  | "local"
  | "historical-region";

export interface DataProvenance {
  /** Dataset publisher or archival collection. */
  source: string;
  /** Exact dataset release, snapshot, or version. */
  version: string;
  /** Original feature ID/code, preserved for auditing. */
  sourceFeatureId: string;
  /** License identifier or human-readable license name. */
  license: string;
  /** Optional source URL for the exact release or feature collection. */
  sourceUrl?: string;
}

export interface AdministrativeAreaDefinition {
  /** Stable internal ID; never use a display name as the primary key. */
  id: string;
  name: string;
  level: AdministrativeLevel;
  /** Parent administrative unit, if one exists in this dataset. */
  parentId: string | null;
  /** ISO 3166 code or other source authority code, when available. */
  authorityCode: string | null;
  /** Geometry is stored separately, keyed by this ID. */
  geometryId: string;
  /** Inclusive start date for which this unit is historically valid. */
  validFrom: string | null;
  /** Exclusive end date; null means no recorded end date. */
  validTo: string | null;
  provenance: DataProvenance;
  tags: string[];
}

export interface ProvinceAdjacency {
  /** IDs of adjacent game provinces; sea connections are explicit. */
  provinceId: string;
  kind: "land" | "strait" | "sea";
  /** Optional movement cost modifier, not a geographic distance. */
  movementCost: number;
}

export interface ProvinceMapRecord {
  /** Stable scenario-specific province ID. */
  id: string;
  name: string;
  /** Geometry ID resolves to an exact polygon/multipolygon in map data. */
  geometryId: string;
  /** Administrative area this province was derived from, if applicable. */
  administrativeAreaId: string | null;
  /** Country/nation owning the province at scenario start. */
  initialOwnerNationId: string | null;
  /** Historical date used to determine ownership and boundaries. */
  referenceDate: string;
  terrain: string;
  isCoastal: boolean;
  strategicTags: string[];
  neighbors: ProvinceAdjacency[];
  provenance: DataProvenance;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value: string): boolean {
  return ISO_DATE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

/** Validate hierarchy, date ranges, stable IDs, and adjacency references. */
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
    if (area.parentId === area.id) {
      errors.push(`Administrative area ${area.id} cannot be its own parent.`);
    }
  }

  for (const province of provinces) {
    if (!province.id.trim()) errors.push("Province IDs cannot be empty.");
    if (provinceById.has(province.id)) errors.push(`Duplicate province ID: ${province.id}`);
    provinceById.set(province.id, province);
    if (!province.geometryId.trim()) errors.push(`Province ${province.id} has no geometryId.`);
    if (!isValidDate(province.referenceDate)) {
      errors.push(`Province ${province.id} has invalid referenceDate.`);
    }
    if (province.administrativeAreaId !== null && !areaById.has(province.administrativeAreaId)) {
      errors.push(`Province ${province.id} references unknown administrative area ${province.administrativeAreaId}.`);
    }
    if (!province.provenance.source.trim() || !province.provenance.version.trim() ||
        !province.provenance.sourceFeatureId.trim() || !province.provenance.license.trim()) {
      errors.push(`Province ${province.id} is missing data provenance.`);
    }
    for (const neighbor of province.neighbors) {
      if (neighbor.provinceId === province.id) {
        errors.push(`Province ${province.id} cannot neighbor itself.`);
      }
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
