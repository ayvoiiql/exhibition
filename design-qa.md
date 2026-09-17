# Room A Reference Design QA

- Source visual truth: `C:/Users/bests/AppData/Local/Temp/codex-clipboard-155093d8-17bf-4ac9-884c-03e7f7aa48a1.png`
- Desktop implementation screenshot: `C:/Users/bests/OneDrive/바탕 화면/전시/artifacts/room-a-eggshell-wall-desktop.png`
- Mobile implementation screenshot: `C:/Users/bests/OneDrive/바탕 화면/전시/artifacts/room-a-eggshell-wall-mobile.png`
- Corridor molding detail screenshot: `C:/Users/bests/OneDrive/바탕 화면/전시/artifacts/room-a-corridor-molding-continuous-close.png`
- Mobile corridor molding screenshot: `C:/Users/bests/OneDrive/바탕 화면/전시/artifacts/room-a-corridor-molding-continuous-mobile.png`
- A-B corridor, Room A side: `C:/Users/bests/OneDrive/바탕 화면/전시/artifacts/gallery-molding-a-b-room-a.png`
- A-B corridor, Room B side: `C:/Users/bests/OneDrive/바탕 화면/전시/artifacts/gallery-molding-a-b-room-b.png`
- B-C corridor, Room B side: `C:/Users/bests/OneDrive/바탕 화면/전시/artifacts/gallery-molding-b-c-room-b-detail.png`
- B-C corridor, Room C side: `C:/Users/bests/OneDrive/바탕 화면/전시/artifacts/gallery-molding-b-c-room-c.png`
- Mobile corridor check: `C:/Users/bests/OneDrive/바탕 화면/전시/artifacts/gallery-molding-corridors-mobile.png`
- Room A single-face portal trim desktop: `C:/Users/bests/OneDrive/바탕 화면/전시/artifacts/room-a-portal-trim-desktop.png`
- Room A single-face portal trim final desktop: `C:/Users/bests/OneDrive/바탕 화면/전시/artifacts/room-a-portal-trim-final-desktop.png`
- Room A single-face portal trim mobile: `C:/Users/bests/OneDrive/바탕 화면/전시/artifacts/room-a-portal-trim-mobile.png`
- Room A 10% brighter walls and floor desktop: `C:/Users/bests/OneDrive/바탕 화면/전시/artifacts/room-a-brightness-plus-10-desktop.png`
- Room A 10% brighter walls and floor mobile: `C:/Users/bests/OneDrive/바탕 화면/전시/artifacts/room-a-brightness-plus-10-mobile.png`
- Room A additional 10% brighter walls and floor desktop: `C:/Users/bests/OneDrive/바탕 화면/전시/artifacts/room-a-brightness-plus-20-desktop.png`
- Room A additional 10% brighter walls and floor mobile: `C:/Users/bests/OneDrive/바탕 화면/전시/artifacts/room-a-brightness-plus-20-mobile.png`
- Viewport: 1280 × 720 CSS px, device scale factor 1
- Source pixels: 1672 × 941; implementation pixels: 1280 × 720
- Normalization: both images are 16:9; comparison used the full visible Room A scene with proportional scaling.
- State: Room A initial camera, after entry. The source includes its concept intro overlay; the implementation intro state was captured separately because intro UI was explicitly outside this change.

## Full-view comparison

The Room A environment now follows the reference's readable deep-navy wall hierarchy, darker ceiling, restrained slate-navy tiled floor, smooth matte-painted walls, continuous blue-gray baseboard, broad warm artwork pools, black ceiling track, and dark walnut frames. Existing room geometry, artworks, camera, controls, and intro UI remain intentionally unchanged.

## Focused-region comparison

Separate crops were not required because the target surfaces occupy large continuous regions in the 16:9 full view. The full-view comparison clearly exposes the ceiling/wall boundary, foreground floor and grout lines, doorway returns, baseboard profile, spotlight pools, and frame finishes.

## Required fidelity surfaces

- Fonts and typography: unchanged by scope; no regression observed in room labels or artwork titles.
- Spacing and layout rhythm: existing Room A layout, artwork spacing, doorway, and camera framing are preserved intentionally.
- Colors and visual tokens: deep navy walls, black-navy ceiling, textured slate floor, blue-gray baseboard, and walnut frames now match the reference direction without collapsing into black.
- Surface fidelity: Room A walls use a near-uniform 512 × 512 eggshell paint map at a broad 6 m repeat, combined with moderate-high roughness and minimal clearcoat. This adds soft depth without paper-like grain. The floor retains its restrained seamless slate WebP.
- Image quality and asset fidelity: original artwork images, dimensions, aspect ratios, and filtering are unchanged.
- Copy and content: unchanged by scope.

## Comparison history

1. Pass 1: walls, ceiling, and floor collapsed toward black; baseboard was uniformly bright. Fixed by raising output-oriented navy values, adding broader Room A light pools, and splitting the baseboard into three restrained tones.
2. Pass 2: walls became readable, but the ceiling underside stayed black and the baseboard remained too thick. Fixed with a subtle ceiling material lift and a Room A-only reduced baseboard profile.
3. Pass 3: ceiling and molding matched the direction, but the foreground floor remained too dark. Fixed by lifting only the slate floor and grout colors while preserving high roughness and low clearcoat.
4. Pass 4: the clean flat surfaces lacked the reference's natural material variation. Added generated seamless slate and painted-plaster color maps for Room A only.
5. Final pass: resized both maps to 512 × 512 and removed duplicate bump-map sampling to keep desktop and mobile WebGL responsive. No actionable P0/P1/P2 visual mismatch remains within the approved scope.
6. Corridor molding refinement: trimmed the back-wall and connector-wall strips at their wall edges, then added matching three-layer corner joints at both returns. The molding now follows the 90-degree passage corners continuously without changing the Room A wall or collision layout.
7. Full corridor pass: replaced extension-based overlap at all eight A-B and B-C returns with explicit corner joints, standardized the restrained 150 mm profile across rooms, and reduced wall-face projection from 108–178 mm to 43–78 mm.
6. User refinement: removed the Room A wall map entirely for a smoother painted finish and replaced the floor with the selected low-variation slate candidate. The floor image was luminance-adjusted only so it remains readable under the unchanged lighting.
7. Final wall refinement: reintroduced only a near-uniform low-frequency paint map at a large repeat and adjusted the Room A wall material to roughness 0.74 with 0.04 clearcoat. This makes the finish distinguishable from the flat draft while staying smooth.
8. Single-face portal trim trial: added a separate 140 mm black-navy casing around only the Room A face of the A-B opening. The casing sits outside the existing opening, so the passage width and collision geometry remain unchanged; the other corridor faces are intentionally untouched for comparison.
9. Brightness refinement: raised only the Room A main and secondary wall RGB values by approximately 10% and increased the slate floor texture brightness by 10%. Lighting, ceiling, molding, portal trim, artworks, and the other rooms remain unchanged.
10. Second brightness refinement: raised the already-adjusted Room A walls and slate floor by another 10%, for approximately 21% cumulative brightness over the preceding dark state. The deep-navy hierarchy and all non-surface settings remain unchanged.

## Findings

- No actionable P0/P1/P2 findings.
- The reference has stronger polished-light reflections. The implementation intentionally keeps the floor matte and restrained, per the approved material direction, while retaining fine mottled stone variation.
- Expected difference: the reference concept contains a bench, wall copy, different artwork set, and a different intro panel. These were outside scope and were not recreated.

## Interaction and runtime evidence

- Desktop: entry, horizontal drag rotation, keyboard movement, artwork selection, and modal close verified.
- Mobile 390 × 844: entry, right-side horizontal drag, joystick movement, and responsive controls verified.
- Console: no new runtime errors in the final desktop or mobile checks; the pre-existing missing `favicon.ico` request still reports one 404.
- Automated checks: `npm run validate:room-a`, `npm run typecheck`, and `npm run build` passed. The existing Vite large-chunk warning remains non-blocking.

final result: passed
