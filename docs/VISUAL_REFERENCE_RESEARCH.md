# Visual reference research — v2 rebuild

This document records the repositories inspected before the second visual rebuild.
The goal was not to clone a site, but to identify reusable visual systems: lighting,
camera motion, post-processing, reflection, transmission, performance fallback and UI/canvas composition.

## Strong references inspected

### 1. pmndrs/examples — MIT
https://github.com/pmndrs/examples

Specific examples inspected in source:

- `examples/spline-glass-shapes` — Lightformer studio rigs + MeshTransmissionMaterial.
- `examples/monitors` — blurred MeshReflectorMaterial floor, pointer camera rig, baked/static shadows and restrained bloom.
- `examples/bubbles` — Bloom + DepthOfField + Noise + Vignette as a coherent finishing chain.
- `examples/scrollcontrols-gltf` — camera choreography driven by normalized interaction progress.
- Search passes also covered aquarium, caustics, night-train, image-gallery and router-transitions.

What was adopted:
studio lightformers, transmission language, blurred floor reflections, subtle pointer camera response,
and a post-processing finishing pass.

### 2. pmndrs/react-three-fiber — MIT
https://github.com/pmndrs/react-three-fiber

Inspected the performance documentation around render-loop choice, invalidation, resource reuse and instancing.
The v2 scene keeps draw complexity bounded and uses a capped DPR.

### 3. pmndrs/drei — MIT
https://github.com/pmndrs/drei

Inspected helpers and examples around:
Environment, Lightformer, MeshTransmissionMaterial, MeshReflectorMaterial,
PerformanceMonitor, Float, Sparkles, Edges and resource reuse.

### 4. pmndrs/react-postprocessing — MIT
https://github.com/pmndrs/react-postprocessing

Inspected the effect-chain approach and the project's performance rationale.
The rebuild uses a short chain rather than stacking many expensive fullscreen passes.

### 5. niccolofanton/codrops-singularity-demo — MIT source
https://github.com/niccolofanton/codrops-singularity-demo

Inspected `src/components/CustomScene.tsx`.
Useful patterns:
PerformanceMonitor quality fallback, N8AO, restrained Bloom, Noise,
high-performance renderer settings and graceful degradation.

Important:
the repository documents third-party model/image licenses separately.
No third-party model or image from that project is reused here.

### 6. theatre-js/theatre — Apache-2.0 core; Studio has separate AGPL terms
https://github.com/theatre-js/theatre

Studied for motion-design thinking: deliberate camera/object choreography rather than
random ambient animation. No Theatre.js code or Studio package is vendored into this project.

### 7. craftzdog/ghibli-style-shader — README declares MIT
https://github.com/craftzdog/ghibli-style-shader

Studied for the principle that a coherent material/shader language matters more than adding more geometry.
No source was copied.

### 8. dgreenheck/nextjs-3d-scroll-animations — no repository LICENSE found during review
https://github.com/dgreenheck/nextjs-3d-scroll-animations

Studied only as visual/interaction research for product-story camera choreography and GSAP/R3F composition.
No source was copied.

### 9. J0SUKE/vortex-gallery — no repository LICENSE found during review
https://github.com/J0SUKE/vortex-gallery

Studied only as visual research for WebGL-first composition and shader-led image presentation.
No source was copied.

### 10. J0SUKE/gsap-threejs-codrops — README declares MIT
https://github.com/J0SUKE/gsap-threejs-codrops

Studied for transition grammar and the idea that the WebGL layer should participate in the editorial layout.
No source was copied.

### 11. ektogamat/camera-webgi — no repository LICENSE found during review
https://github.com/ektogamat/camera-webgi

Studied only as product-landing research. No source was copied.

### 12. react-three-next — MIT
https://github.com/pmndrs/react-three-next

Studied for keeping DOM typography/layout separate from the 3D renderer while maintaining one coherent experience.

## Resulting art direction

The rebuilt experience intentionally avoids the previous "debug showroom" language.

- Dark editorial gallery rather than a generic grid hall.
- Warm ivory/brass Atlas pavilion vs cyan/graphite PackLab pavilion.
- Translucent architectural backdrops with crisp structural frames.
- Reflective blurred floor for depth and product-stage polish.
- Sculptural paper ribbons / suspended ring elements for silhouette and motion.
- Physical paper stacks, fanned samples, rolls and cartons instead of abstract cubes.
- Lightformer environment so glass and glossy materials have something meaningful to reflect.
- AO + Bloom + grain + vignette as a restrained finishing stack.
- Pointer-reactive cinematic camera instead of a static frontal view.
- UI reduced to an exhibition masthead, booth story, material card and bottom pavilion rail.

## Licensing rule used

Repos with clear permissive licenses were eligible as implementation references.
Repos without a clear license were treated as visual research only.
No third-party 3D models, textures or generated images have been copied into this repository.
The current pavilion geometry and materials are authored in this project.


## Digital-twin / scan research added for v3

### pmndrs/drei Splat renderer — MIT project
https://github.com/pmndrs/drei/blob/master/src/core/Splat.tsx

Drei includes a streamed Gaussian Splat renderer. This is the preferred drop-in path when a real
venue capture becomes available, because the surrounding React Three Fiber interaction layer can stay
in place while the authored hall shell is replaced by captured radiance-field data.

### Luma Web examples
https://github.com/lumalabs/luma-web-examples

Reviewed specifically for embedding captured splats inside React Three Fiber. This establishes the
future migration path from the current authored "scan-like" hall to a literal capture-backed digital twin.

### Gaussian splat streaming viewer — MIT
https://github.com/tztechno/gaussian-splat-streaming-viewer

Reviewed for the data organization pattern around segmented .splat assets and replacement with real
capture data. No capture asset from this project is used here.

### Poly Haven — CC0 material reference
https://polyhaven.com/a/hangar_concrete_floor

Reviewed the Hangar Concrete Floor material as a realism benchmark: worn, chipped, cracked and scuffed
indoor concrete with diffuse/normal/roughness/displacement maps. Current production keeps a generated
local texture so the scene has no runtime CDN dependency, but the material language is intentionally
moving toward this physically imperfect reference.

## v3 design rule

A hand-authored scene must not be called a literal scan. The current version is a **scan-like digital twin
prototype**: human scale, real hall circulation, first-person navigation, surface wear, utilities and subtle
point residue. A literal digital twin requires an actual capture source (Gaussian Splat, photogrammetry mesh
or point cloud). The code now isolates the hall shell so a capture can replace it later without rewriting
the booth/product interaction layer.
