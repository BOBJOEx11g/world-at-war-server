# Terrain tags for the world map

The goal is simple: attach one or more terrain labels to each administrative area and game province. Tags are descriptive map data only; they do not change troop movement or survivability until troop mechanics are implemented.

## Available tags

- **Forest types:** `rainforest`, `tropical-forest`, `temperate-forest`, `boreal-forest`, `woodland`
- **Open land:** `plains`, `grassland`, `savanna`
- **Dry land:** `desert`, `semi-arid`, `scrubland`
- **Wet land:** `wetlands`, `swamp`, `riverine`
- **Relief:** `mountains`, `highlands`, `hills`
- **Cold land:** `tundra`, `ice-snow`
- **Other useful modifiers:** `coastal`, `urban`

Areas may have multiple terrain tags because real geography is mixed. Tags should describe actual land rather than be guessed from a province or country name.

## Implementation

`src/administrative-model.ts` defines the allowed `TerrainTag` values and supports `terrainTags` on both administrative areas and game provinces. CI checks core tags and rejects unknown tags. No movement-time or troop-survivability modifiers are applied yet.
