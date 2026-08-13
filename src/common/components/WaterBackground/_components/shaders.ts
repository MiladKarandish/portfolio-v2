/**
 * GLSL ES 3.00 sources for the water background.
 *
 * Three passes, each at the resolution it actually needs:
 *
 *   1. SIMULATION  — a height field, ~256px on the long edge. Waves are a
 *      low-frequency phenomenon; simulating them at display resolution buys
 *      nothing you can see and costs 30x the fragments.
 *   2. SCENE       — the thing under the water, ~768px on the long edge, redrawn
 *      a few times a second. Refraction needs *something* with detail to bend,
 *      and a flat page background gives it nothing, so the pool floor is drawn
 *      procedurally: depth gradient, drifting light pools, noise.
 *   3. COMPOSITE   — full resolution, but only cheap texture reads: sample the
 *      scene three times through the surface normal (once per channel, which is
 *      the dispersion), add a specular glint and a caustic term.
 *
 * Lighting is done in linear space and encoded back to sRGB at the very end.
 * Doing it in sRGB is the usual shortcut and it is why so many WebGL water demos
 * have highlights that look like white paint rather than light.
 */

/**
 * One triangle big enough to cover the clip volume, built from `gl_VertexID`
 * with no vertex buffer at all. A quad would need two triangles that share an
 * edge, and fragments along that seam get shaded twice.
 */
export const FULLSCREEN_VERT = /* glsl */ `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

/**
 * The wave equation, discretised the way jquery.ripples does it: each texel
 * accelerates toward the average of its four neighbours, velocity is damped,
 * position integrates velocity.
 *
 *   r = height, g = velocity, ba = surface gradient
 *
 * The gradient is cached here rather than recomputed in the composite pass
 * because this pass runs at 256x144 and that one runs at 2560x1440. The
 * composite gets it for free, bilinearly interpolated, in the same fetch that
 * gives it the height.
 *
 * The texture is CLAMP_TO_EDGE, so a texel on the border reads itself as its
 * own missing neighbour. That is a reflecting boundary, and it is why ripples
 * bounce off the edges of the window instead of vanishing into them.
 */
export const SIM_FRAG = /* glsl */ `#version 300 es
precision highp float;

uniform sampler2D uSim;
uniform vec2 uTexel;
uniform float uDamping;

out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy * uTexel;
  vec4 info = texture(uSim, uv);

  float left   = texture(uSim, uv - vec2(uTexel.x, 0.0)).r;
  float right  = texture(uSim, uv + vec2(uTexel.x, 0.0)).r;
  float bottom = texture(uSim, uv - vec2(0.0, uTexel.y)).r;
  float top    = texture(uSim, uv + vec2(0.0, uTexel.y)).r;

  float average = (left + right + bottom + top) * 0.25;

  info.g += (average - info.r) * 2.0;
  info.g *= uDamping;
  info.r += info.g;

  // Central differences, kept unnormalised: the *steepness* is what drives how
  // far light bends, and a normalized normal throws exactly that away.
  info.b = (right - left) * 0.5;
  info.a = (top - bottom) * 0.5;

  fragColor = info;
}
`;

/**
 * A drop, added straight into the height channel with additive blending and a
 * write mask, over a triangle that covers only the drop's own neighbourhood.
 *
 * The obvious alternative — sample the whole field, add the drop, write it to
 * the other buffer — copies every texel of the simulation for each drop, and a
 * mouse moving across the screen asks for a lot of drops.
 */
export const DROP_VERT = /* glsl */ `#version 300 es
uniform vec2 uCenter;
uniform vec2 uRadius;

out vec2 vLocal;

void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  // (-1,-1), (3,-1), (-1,3): a triangle that covers the unit square around the
  // drop with a little waste, rather than a quad's duplicate diagonal.
  vLocal = p * 2.0 - 1.0;
  gl_Position = vec4((uCenter + vLocal * uRadius) * 2.0 - 1.0, 0.0, 1.0);
}
`;

export const DROP_FRAG = /* glsl */ `#version 300 es
precision highp float;

const float PI = 3.141592653589793;

uniform float uStrength;

in vec2 vLocal;
out vec4 fragColor;

void main() {
  // vLocal is already normalised to the drop radius, so this is a circle on
  // screen even though the texture it lands in is not square.
  float falloff = max(0.0, 1.0 - length(vLocal));
  float profile = 0.5 - cos(falloff * PI) * 0.5;

  fragColor = vec4(profile * uStrength, 0.0, 0.0, 0.0);
}
`;

/**
 * A stroke: the swept path of something moving through the water, drawn as a
 * capsule from the pointer's last position to its current one.
 *
 * This exists because stamping a row of drops along the path does not read as
 * movement. Every drop is a point source radiating its own set of concentric
 * rings, so a moving cursor produces a train of overlapping bullseyes — busy,
 * and unmistakably a sequence of separate events. A capsule is one primitive
 * with one continuous wavefront down each flank, which is what a moving object
 * actually leaves behind.
 *
 * It is also carved *downward* (see the negative depth the component passes).
 * Something moving through water displaces it; only something falling into it
 * makes a peak.
 */
export const STROKE_VERT = /* glsl */ `#version 300 es
uniform vec2 uFrom;
uniform vec2 uTo;
/** The radius in uv, x already divided by the aspect ratio. Distinct from the
    fragment shader's scalar uRadius: one name with two types across the two
    stages is a link error. */
uniform vec2 uRadiusUv;

out vec2 vUv;

void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vec2 local = p * 2.0 - 1.0;

  // The capsule's bounding box: the segment, grown by the radius on each side.
  vec2 centre = (uFrom + uTo) * 0.5;
  vec2 extent = abs(uTo - uFrom) * 0.5 + uRadiusUv;

  vUv = centre + local * extent;
  gl_Position = vec4(vUv * 2.0 - 1.0, 0.0, 1.0);
}
`;

export const STROKE_FRAG = /* glsl */ `#version 300 es
precision highp float;

const float PI = 3.141592653589793;

uniform vec2 uFrom;
uniform vec2 uTo;
uniform float uRadius;
uniform float uAspect;
uniform float uDepth;

in vec2 vUv;
out vec4 fragColor;

void main() {
  // Square units. In uv, x spans uAspect times more world than y, so distance
  // measured in uv would make the stroke an ellipse on a wide monitor.
  vec2 scale = vec2(uAspect, 1.0);
  vec2 p = vUv * scale;
  vec2 a = uFrom * scale;
  vec2 b = uTo * scale;

  // Distance to the segment, i.e. the capsule's signed distance field.
  vec2 ab = b - a;
  float lengthSquared = dot(ab, ab);
  float t = lengthSquared > 0.0 ? clamp(dot(p - a, ab) / lengthSquared, 0.0, 1.0) : 0.0;
  float distance = length(p - (a + ab * t)) / uRadius;

  // The same raised-cosine section as a drop, swept along the segment rather
  // than rotated about a point.
  float falloff = max(0.0, 1.0 - distance);
  float profile = 0.5 - cos(falloff * PI) * 0.5;

  fragColor = vec4(profile * uDepth, 0.0, 0.0, 0.0);
}
`;

/**
 * What sits under the water. Nothing here is interactive; it drifts on a very
 * long clock so the background is alive without ever asking to be looked at.
 */
export const SCENE_FRAG = /* glsl */ `#version 300 es
precision highp float;

uniform vec2 uSize;
uniform float uTime;
uniform float uAspect;
uniform float uScroll;
uniform vec3 uDeep;
uniform vec3 uMid;
uniform vec3 uShallow;
uniform vec3 uLight;

out vec4 fragColor;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * valueNoise(p);
    p *= 2.03;
    amplitude *= 0.5;
  }
  return value;
}

float blob(vec2 p, vec2 centre, float radius) {
  vec2 d = p - centre;
  return exp(-dot(d, d) / (radius * radius));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uSize;
  // Square units, so nothing below stretches on a wide monitor.
  vec2 p = (uv - 0.5) * vec2(uAspect, 1.0);
  p.y += uScroll;

  float t = uTime;

  float swell = fbm(p * 1.6 + vec2(t * 0.013, t * -0.008));
  float grain = fbm(p * 3.9 - vec2(t * 0.021, t * 0.017));

  // Deeper toward the bottom of the screen, with the boundary itself wandering.
  // The noise term is deliberately small. At 0.45 it swung far enough to leave
  // one side of a wide window in deep water and the other in shallow, which
  // stops reading as a pool and starts reading as a broken gradient.
  float depth = clamp(0.5 - p.y * 0.5 + (swell - 0.5) * 0.2, 0.0, 1.0);
  vec3 colour = mix(uShallow, uDeep, smoothstep(0.0, 1.0, depth));
  colour = mix(colour, uMid, 0.35);

  // Broad pools of light, drifting on periods of roughly two minutes.
  float pools =
      blob(p, vec2(-0.38 + sin(t * 0.043) * 0.16, 0.30 + cos(t * 0.031) * 0.10), 0.58) +
      blob(p, vec2(0.44 + cos(t * 0.037) * 0.14, -0.20 + sin(t * 0.029) * 0.11), 0.44) * 0.7;
  colour = mix(colour, uShallow, clamp(pools * 0.30, 0.0, 0.55));

  // Shafts from a light source somewhere off the top-left.
  float shafts = sin((p.x * 2.6 + p.y * 1.1) * 2.2 + t * 0.05) * 0.5 + 0.5;
  shafts *= smoothstep(1.1, 0.1, abs(p.y));
  colour += uLight * shafts * 0.018;

  // Fine detail. This is the part refraction actually bends — a pure gradient
  // refracts into a slightly different pure gradient, i.e. into nothing.
  colour *= 0.93 + 0.14 * grain;

  float vignette = smoothstep(1.3, 0.3, length(p * vec2(0.85, 1.15)));
  colour *= 0.82 + 0.18 * vignette;

  fragColor = vec4(colour, 1.0);
}
`;

/**
 * Surface shading. Everything expensive was paid for in the passes above; this
 * one is five texture reads from a tiny simulation texture, three from the
 * scene, and some arithmetic.
 */
export const COMPOSITE_FRAG = /* glsl */ `#version 300 es
precision highp float;

uniform sampler2D uSim;
uniform sampler2D uScene;
uniform vec2 uResolution;
uniform vec2 uSimTexel;
uniform float uAspect;
uniform float uRefraction;
uniform float uDispersion;
uniform float uSpecular;
uniform float uShine;
uniform float uCaustics;
uniform float uSlope;
uniform vec3 uLightDir;
uniform vec3 uLightColour;
uniform vec3 uShallow;

out vec4 fragColor;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  vec4 info = texture(uSim, uv);
  float height = info.r;
  vec2 slope = info.ba;

  // uv.x spans uAspect times more world than uv.y, so an offset that should be
  // square on screen is not square in uv.
  vec2 offset = slope * uRefraction * vec2(1.0 / uAspect, 1.0);

  // Water disperses: red bends least, blue most. One extra texture read per
  // channel, and it is most of the difference between "wobbly" and "wet".
  vec3 refracted = vec3(
    texture(uScene, uv + offset * (1.0 - uDispersion)).r,
    texture(uScene, uv + offset).g,
    texture(uScene, uv + offset * (1.0 + uDispersion)).b
  );

  // Caustics: light converges where the surface is concave. That is the
  // divergence of the slope field, which is four more reads of a 256px texture.
  float dx = texture(uSim, uv + vec2(uSimTexel.x, 0.0)).b -
             texture(uSim, uv - vec2(uSimTexel.x, 0.0)).b;
  float dy = texture(uSim, uv + vec2(0.0, uSimTexel.y)).a -
             texture(uSim, uv - vec2(0.0, uSimTexel.y)).a;
  float divergence = (dx + dy) * uCaustics;

  // Clamped, not just floored at zero. Unclamped, a drop steep enough drives
  // the shadow term past 1 and the water goes black at the centre of every
  // ripple — which is what a hard flick of the mouse used to do.
  float focus = clamp(-divergence, 0.0, 1.0);
  float shadow = clamp(divergence, 0.0, 0.6);
  vec3 colour = refracted * (1.0 + focus * 1.15 - shadow * 0.45);

  vec3 normal = normalize(vec3(-slope * uSlope, 1.0));
  vec3 light = normalize(uLightDir);
  vec3 half_ = normalize(light + vec3(0.0, 0.0, 1.0));

  float specular = pow(max(dot(normal, half_), 0.0), uShine) * uSpecular;
  colour += uLightColour * specular;

  // Glancing angles reflect the sky. Only the steep flanks of a ripple ever get
  // near this, which is exactly where you want the extra brightness.
  float fresnel = pow(1.0 - clamp(normal.z, 0.0, 1.0), 4.0);
  colour = mix(colour, uShallow, fresnel * 0.35);

  // Crests sit in shallower water.
  colour = mix(colour, uShallow, clamp(height * 0.35, 0.0, 0.22));

  colour = pow(max(colour, 0.0), vec3(1.0 / 2.2));

  // A large, smooth, dark gradient is the worst case for 8-bit output; without
  // a dither it bands into visible steps.
  colour += (hash21(gl_FragCoord.xy) - 0.5) / 255.0;

  fragColor = vec4(colour, 1.0);
}
`;
