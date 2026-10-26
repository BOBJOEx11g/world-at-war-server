# Administrative areas and province-map pipeline

## Goal

Build a complete global map for the game's historical 1942 scenario, including small islands, colonies, ports, and territories. Administrative boundaries must be real geographic polygons—not generated circles or hand-drawn approximations. Every game province receives a unique, stable ID and historical metadata.

## Three separate layers

1. **Nation / political entity** — the country, colony, occupied territory, or other entity represented in the scenario.
2. **Administrative area** — a real-world division such as a state, province, county, district, or historical region. Areas form a parent-child hierarchy when source data supports it.
3. **Game province** — the selectable unit used for movement, ownership, combat, and economy. A province may correspond to an administrative area, part of one, or a custom strategic region where historical gameplay needs it.

Geometry is a separate, versioned dataset. The exact polygon used to draw a province must also be its selection geometry.

## Historical dates matter

Do not use today's Admin 1 boundaries as if they were accurate in 1942. The modern 2026 map and the 1942 scenario need date-specific ownership and, where available, date-specific administrative boundaries. Changes such as annexations, colonial administration, occupation, and renamed entities must be represented as scenario history rather than overwriting stable IDs.

## Data import rules

- Prefer authoritative, openly licensed vector datasets (GeoJSON, GeoPackage, or Shapefile); preserve the publisher's attribution and license.
- Store the exact source release, source feature ID, license, and source URL for every imported record.
- Preserve multipart polygons, islands, enclaves, and small features. Never silently discard a feature because it is small.
- Normalize geometry for display, but do not replace a country's or province's exact polygon with a centroid or oversized hitbox.
- Generate stable internal IDs from durable source identifiers plus scenario/version context; display names are not IDs.
- Build adjacency from polygon topology and audit it. Strait/sea links are explicit movement edges, not fake land adjacency.
- Validate parent references, date ranges, duplicate IDs, missing geometry references, province neighbors, and map coverage in CI.
- Keep source data and generated runtime data separate so the same geography can support different scenarios.

## Current implementation step

`src/administrative-model.ts` defines the typed records and validator for administrative areas, scenario provinces, adjacency, historical validity, and dataset provenance. It intentionally does not invent province polygons or claim that modern boundaries are historical ones. The next import step should add a pinned Admin 1 dataset and a separate historical-boundary/ownership layer, then generate and audit the first playable province map.
