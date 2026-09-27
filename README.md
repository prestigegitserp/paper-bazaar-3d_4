# Paper Bazaar 3D — Investor Demo

A from-scratch, two-booth 3D B2B marketplace prototype focused on first-impression quality and a small rendering budget.

> This repository is intentionally **not** a revision of `paper-bazaar-3d_2`. The implementation starts from a clean Vite/R3F app and uses only product intent as context.

## What is different

- Two curated booths instead of a large market map.
- Zero external GLB/texture assets in the first render path.
- Procedural geometry with reusable instanced paper stacks.
- `frameloop="demand"` so the canvas can idle when the scene is static.
- Baked static shadows through Drei.
- Guided camera transitions instead of a heavy first-person controller.
- Investor-facing product/SKU panel, booth metrics and sample-bag interaction.
- Responsive HUD for desktop and mobile.
- GitHub Actions build check.

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Controls

- Click a booth to focus it.
- Click a 3D product prop or a SKU row to inspect a product.
- `1` focuses Atlas Paper House.
- `2` focuses PackLab Supply.
- `Esc` returns to the wide view.

## Open-source references reviewed before implementation

The implementation was written from scratch. The following projects/docs were reviewed for architectural and performance patterns, not copied wholesale:

- [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) — MIT. On-demand rendering, invalidation, resource reuse and instancing guidance.
- [pmndrs/drei](https://github.com/pmndrs/drei) — MIT. Reusable helpers including Instances and static-shadow utilities.
- [pmndrs/react-three-next](https://github.com/pmndrs/react-three-next) — MIT. Separation patterns between DOM UI and the R3F canvas.

Projects found during discovery without a clear repository license were treated as visual research only and no source code was reused from them.

## Performance choices

1. No network-loaded 3D assets on boot.
2. No continuous ambient animation.
3. Demand rendering with explicit invalidation during camera travel.
4. Static/baked shadow maps.
5. Small light count and one shadow-casting directional light.
6. Repeated paper sheets rendered through instancing.
7. CSS/DOM handles typography and product UI instead of expensive 3D text.
8. DPR is capped at 1.5 to keep retina devices under control.

## Notes

All prices and operational metrics shown in the UI are demo placeholders for the investor prototype and should be connected to live catalog data in a later product phase.
