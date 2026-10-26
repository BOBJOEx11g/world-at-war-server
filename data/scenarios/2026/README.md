# Modern world scenario (2026)

This directory is reserved for versioned starting-state data for the modern scenario. Do not place unverified or unlicensed geography here.

## Coverage requirements

- Include every sovereign state represented by the selected authoritative source.
- Track dependent territories, disputed territories, and uninhabited territories as separate entity types where appropriate.
- Include remote islands and microstates; never filter features by area alone.
- Keep stable IDs across revisions wherever practical.
- Store source attribution, source version/date, licence, and transformation steps for each dataset.
- Record uncertainty rather than silently guessing political status or ownership.

## Separation of concerns

- Geographic geometry describes shape and location.
- Scenario definitions describe political status and starting ownership.
- Runtime state describes changes during a match (ownership, units, economy, orders).
- Player/AI control is runtime state and must not be baked into the geography files.

The initial client map uses provisional Natural Earth 1:50m country geometry. The final scenario dataset must be more detailed, audited, and appropriate for game-scale province boundaries before it is called complete.
