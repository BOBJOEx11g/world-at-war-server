# Province biomes and terrain tags

The goal is to assign a small, consistent set of geographic tags to every game province. Tags are descriptive data only; they do not change troop movement or survivability until those mechanics are implemented.

## Eight main biomes

- `forest`
- `rainforest`
- `grassland`
- `savanna`
- `desert`
- `shrubland`
- `tundra`
- `wetland`

These are intentionally broad gameplay categories, not a full scientific biome taxonomy.

## Independent terrain overlays

These may be combined with any biome: `mountains`, `hills`, `coastal`, `urban`, `riverine`, and `ice-snow`.

For example, a province may have `forest` and `mountains` tags. Biome describes the broad ecological zone; overlays describe other features that can matter to movement or visibility.

## Source dataset

Use **RESOLVE Ecoregions 2017**, which provides global terrestrial ecoregions grouped into 14 biomes and is licensed CC BY 4.0.

- Dataset information and official downloads: https://ecoregions.world/
- Dataset metadata and licence: https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017
- Citation: Dinerstein et al. (2017), *An Ecoregion-Based Approach to Protecting Half the Terrestrial Realm*, BioScience 67(6), 534–545, https://doi.org/10.1093/biosci/bix014

## Simplification rules

Map source biome names into our eight gameplay biomes:

| RESOLVE biome family | World at War tag |
|---|---|
| Tropical & Subtropical Moist Broadleaf Forests | `rainforest` |
| Other forest biomes | `forest` |
| Temperate Grasslands, Savannas & Shrublands | `grassland` |
| Tropical & Subtropical Grasslands, Savannas & Shrublands | `savanna` |
| Deserts & Xeric Shrublands | `desert` |
| Mediterranean Forests, Woodlands & Scrub | `shrubland` |
| Montane Grasslands & Shrublands | `shrubland` |
| Flooded Grasslands & Savannas; Mangroves | `wetland` |
| Tundra | `tundra` |
| Rock and Ice / unclassified ice areas | `tundra` plus `ice-snow` overlay where supported by the source |

This is a gameplay-oriented reduction. It intentionally merges source categories rather than preserving every scientific distinction.

## Assignment method

1. Obtain province polygons and the chosen biome polygons in WGS84.
2. Intersect the polygons and calculate area shares using an appropriate equal-area projection.
3. Assign the biome covering the largest share of each province.
4. Add a second biome only if it covers a meaningful share (initial threshold: 20% of the province's land area).
5. Apply separate overlays such as mountains only from suitable supporting geographic data; do not infer them from country or province names.
6. Store the generated tags in versioned game data, with dataset version, source feature ID, attribution and licence.

**Current limitation:** the repositories have country-level map geometry, but do not yet contain game-province polygons. The schema and classification rules are ready; province tags cannot be generated honestly until those province geometries exist. No province-level terrain assignments have been fabricated.

No movement-time or troop-survivability modifiers are applied yet.
