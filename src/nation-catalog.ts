import type { NationDefinition } from "./world-model.js";

/** Minimal feature shape supplied by Natural Earth Admin 0 – Countries. */
export interface Admin0CountryFeature {
  id?: string | number;
  properties: { name?: string; [key: string]: unknown };
}

const normalizeName = (value: string): string =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const PARENT_NAME_BY_COUNTRY = new Map<string, string>(
  [
    ["American Samoa", "United States of America"],
    ["Anguilla", "United Kingdom"],
    ["Aruba", "Netherlands"],
    ["Ashmore and Cartier Islands", "Australia"],
    ["Bermuda", "United Kingdom"],
    ["British Indian Ocean Territory", "United Kingdom"],
    ["British Virgin Islands", "United Kingdom"],
    ["Cayman Islands", "United Kingdom"],
    ["Christmas Island", "Australia"],
    ["Clipperton Island", "France"],
    ["Cocos (Keeling) Islands", "Australia"],
    ["Cook Islands", "New Zealand"],
    ["Curaçao", "Netherlands"],
    ["Falkland Islands", "United Kingdom"],
    ["Faroe Islands", "Denmark"],
    ["French Guiana", "France"],
    ["French Polynesia", "France"],
    ["French Southern and Antarctic Lands", "France"],
    ["Gibraltar", "United Kingdom"],
    ["Greenland", "Denmark"],
    ["Guadeloupe", "France"],
    ["Guam", "United States of America"],
    ["Guernsey", "United Kingdom"],
    ["Heard Island and McDonald Islands", "Australia"],
    ["Hong Kong", "China"],
    ["Isle of Man", "United Kingdom"],
    ["Jersey", "United Kingdom"],
    ["Macau", "China"],
    ["Martinique", "France"],
    ["Mayotte", "France"],
    ["Montserrat", "United Kingdom"],
    ["New Caledonia", "France"],
    ["Niue", "New Zealand"],
    ["Norfolk Island", "Australia"],
    ["Northern Mariana Islands", "United States of America"],
    ["Pitcairn Islands", "United Kingdom"],
    ["Puerto Rico", "United States of America"],
    ["Réunion", "France"],
    ["Saint Barthélemy", "France"],
    ["Saint Helena", "United Kingdom"],
    ["Saint Martin", "France"],
    ["Saint Pierre and Miquelon", "France"],
    ["Sint Maarten", "Netherlands"],
    ["South Georgia and the South Sandwich Islands", "United Kingdom"],
    ["Svalbard and Jan Mayen", "Norway"],
    ["Tokelau", "New Zealand"],
    ["Turks and Caicos Islands", "United Kingdom"],
    ["United States Virgin Islands", "United States of America"],
    ["Wallis and Futuna", "France"],
  ].map(([country, parent]) => [normalizeName(country ?? ""), parent ?? ""] as [string, string]),
);

const PARENT_ALIASES = new Map<string, string>([
  ["united states", "united states of america"],
  ["usa", "united states of america"],
  ["us", "united states of america"],
  ["uk", "united kingdom"],
  ["the netherlands", "netherlands"],
]);

function resolveParentName(name: string): string {
  const normalized = normalizeName(name);
  return PARENT_ALIASES.get(normalized) ?? normalized;
}

/**
 * Creates a playable nation record for every Admin 0 country feature.
 *
 * Parent relationships are explicit metadata, not inferred from geography.
 * All records remain playable regardless of politicalStatus; this function
 * does not apply gameplay restrictions to puppet states.
 */
export function buildAdmin0NationCatalog(
  features: readonly Admin0CountryFeature[],
): NationDefinition[] {
  if (features.length !== 258) {
    throw new Error(
      `Expected Natural Earth Admin 0 – Countries to contain 258 features; received ${features.length}.`,
    );
  }

  const records = features.map((feature) => {
    const displayName = feature.properties.name?.trim();
    if (!displayName) {
      throw new Error("Every Admin 0 feature must have a country name.");
    }
    const id = String(feature.id ?? normalizeName(displayName).replace(/\s+/g, "-"));
    if (!id.trim()) throw new Error(`Country ${displayName} has an empty ID.`);
    return { id, displayName, feature };
  });

  const byName = new Map<string, (typeof records)[number]>();
  const ids = new Set<string>();
  for (const record of records) {
    if (ids.has(record.id)) throw new Error(`Duplicate Admin 0 feature ID: ${record.id}`);
    ids.add(record.id);
    const normalizedName = resolveParentName(record.displayName);
    if (byName.has(normalizedName)) {
      throw new Error(`Duplicate Admin 0 country name: ${record.displayName}`);
    }
    byName.set(normalizedName, record);
  }

  return records.map(({ id, displayName }) => {
    const parentName = PARENT_NAME_BY_COUNTRY.get(normalizeName(displayName));
    const resolvedParentName = parentName ? resolveParentName(parentName) : null;
    const parent = resolvedParentName ? byName.get(resolvedParentName) : null;

    if (parentName && !parent) {
      throw new Error(
        `Parent country "${parentName}" for "${displayName}" is absent from Admin 0 geometry.`,
      );
    }
    if (parent?.id === id) {
      throw new Error(`Country "${displayName}" cannot be its own parent.`);
    }

    const isPuppet = parent !== null;
    return {
      id,
      displayName,
      territoryKind: isPuppet ? "dependent-territory" : "sovereign-state",
      parentNationId: parent?.id ?? null,
      politicalStatus: isPuppet ? "puppet" : "independent",
      isPlayable: true,
      capitalProvinceId: null,
      tags: ["admin-0-country", "playable", ...(isPuppet ? ["puppet"] : [])],
    };
  });
}


type CountryProperties = { name?: string; [key: string]: unknown };

const ADMIN0_GEOJSON_URL =
  "https://raw.githubusercontent.com/datasets/geo-countries/ca3b7150caa5d3cc3fb108a87fc6e3d57bd97d99/data/countries.geojson";

function stableCountryId(name: string, properties: CountryProperties): string {
  const iso3 = properties["ISO3166-1-Alpha-3"];
  if (typeof iso3 === "string" && iso3.trim() && iso3 !== "-99") return iso3;
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `NE-${slug || "unknown"}`;
}

/** Load the pinned Natural Earth Admin 0 – Countries snapshot and build all 258 playable nation records. */
export async function loadAdmin0NationCatalog(): Promise<NationDefinition[]> {
  const response = await fetch(ADMIN0_GEOJSON_URL, {
    headers: { accept: "application/geo+json, application/json" },
  });
  if (!response.ok) {
    throw new Error(`Unable to load Natural Earth country data: HTTP ${response.status}`);
  }
  const dataset = (await response.json()) as {
    type?: string;
    features?: Array<{ id?: string | number; properties?: CountryProperties }>;
  };
  if (dataset.type !== "FeatureCollection" || !Array.isArray(dataset.features)) {
    throw new Error("Natural Earth country data is not a GeoJSON FeatureCollection.");
  }
  const features: Admin0CountryFeature[] = dataset.features.map((feature) => {
    const properties = feature.properties ?? {};
    const name = typeof properties.name === "string" ? properties.name.trim() : "";
    return {
      id: stableCountryId(name, properties),
      properties: { ...properties, name },
    };
  });
  return buildAdmin0NationCatalog(features);
}
