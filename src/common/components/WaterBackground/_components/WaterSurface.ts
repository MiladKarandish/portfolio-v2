import {
  COMPOSITE_FRAG,
  DROP_FRAG,
  DROP_VERT,
  FULLSCREEN_VERT,
  SCENE_FRAG,
  SIM_FRAG,
  STROKE_FRAG,
  STROKE_VERT,
} from "./shaders";

/**
 * A WebGL2 water surface, drawn behind the page.
 *
 * This is a renderer and nothing else: it knows how to hold a height field, put
 * drops in it and shade the result. It has no opinion about when a drop should
 * happen — that is policy, and it lives in the component that owns the pointer
 * events.
 *
 * ── Why not three.js ──────────────────────────────────────────────────────────
 * Everything here is three full-screen triangles and four small programs. A
 * scene graph, a camera, a material system and a mesh abstraction would add
 * ~150KB of JavaScript to the critical path of a portfolio and would not remove
 * a single line of the code below, because none of the code below is about
 * scenes, cameras, materials or meshes.
 *
 * ── Why not a canvas2d ripple ─────────────────────────────────────────────────
 * The effect is a per-pixel refraction of a background through a normal field.
 * On the CPU that is a per-frame image loop over a million pixels. It is the one
 * kind of work a GPU is unambiguously for.
 */

/** Colours in *linear* space, 0..1. See `toLinear` in the component. */
export interface WaterPalette {
  deep: readonly [number, number, number];
  mid: readonly [number, number, number];
  shallow: readonly [number, number, number];
  light: readonly [number, number, number];
}

export interface WaterSurfaceOptions {
  /**
   * Height-field texels on the long edge. 256 is not a compromise: a ripple is
   * tens of pixels across, the field is read back with bilinear filtering, and
   * doubling this doubles nothing anyone can see.
   */
  resolution?: number;
  /** Long edge of the procedural backdrop. It is smooth by construction. */
  sceneResolution?: number;
  /**
   * Device-pixel-ratio ceiling for the visible pass. The content is soft and
   * mostly hidden behind the page card; rendering a 4K backing store for it is
   * paying twice the fragments for a difference nobody can point at.
   */
  maxDpr?: number;
  /** Velocity retained per step. Lower settles the water sooner. */
  damping?: number;
  /** Frames per second once the water is still and only the backdrop drifts. */
  idleFps?: number;
  /** How far light bends, in fractions of viewport height. */
  refraction?: number;
  /** Split between the red and blue refraction offsets. */
  dispersion?: number;
  specular?: number;
  /** Specular exponent. Higher is a tighter, harder glint. */
  shine?: number;
  caustics?: number;
  /** Multiplier on the surface slope before it becomes a normal. */
  slope?: number;
  /** Backdrop drift, in fractions of viewport height per viewport scrolled. */
  parallax?: number;
  onContextLost?: () => void;
}

interface Target {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
  width: number;
  height: number;
}

interface PendingDrop {
  x: number;
  y: number;
  radius: number;
  strength: number;
}

interface PendingStroke {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  radius: number;
  depth: number;
}

const DEFAULTS = {
  resolution: 256,
  sceneResolution: 768,
  maxDpr: 1.5,
  damping: 0.992,
  idleFps: 12,
  refraction: 0.38,
  dispersion: 0.28,
  specular: 0.5,
  shine: 70,
  caustics: 14,
  slope: 3.2,
  parallax: 0.07,
} as const;

/**
 * Below this, the tallest wave left in the field is a fraction of a percent of a
 * fresh drop — far under one 8-bit step once it has been through refraction —
 * so the simulation stops and the loop drops to its idle rate.
 */
const STILL_THRESHOLD = 0.0004;

/** Seconds for a theme change to cross-fade. */
const PALETTE_FADE = 0.55;

export default class WaterSurface {
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGL2RenderingContext;
  private readonly options: Required<Omit<WaterSurfaceOptions, "onContextLost">> &
    Pick<WaterSurfaceOptions, "onContextLost">;

  private simPrograms!: {
    sim: WebGLProgram;
    drop: WebGLProgram;
    stroke: WebGLProgram;
    scene: WebGLProgram;
    composite: WebGLProgram;
  };
  private uniforms = new Map<WebGLProgram, Map<string, WebGLUniformLocation | null>>();

  private simTargets: [Target, Target] | null = null;
  private simIndex = 0;
  private sceneTarget: Target | null = null;

  private pending: PendingDrop[] = [];
  private pendingStrokes: PendingStroke[] = [];
  /** Rough estimate of the tallest wave in the field; drives the idle switch. */
  private activity = 0;

  private palette: WaterPalette;
  private targetPalette: WaterPalette;
  private paletteBlend = 1;

  private scroll = 0;
  private time = 0;
  private lastFrame = 0;
  private lastScene = 0;

  private raf: number | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private running = false;
  private destroyed = false;
  private contextLost = false;

  private width = 0;
  private height = 0;

  static isSupported(): boolean {
    try {
      const probe = document.createElement("canvas");
      const gl = probe.getContext("webgl2");
      if (!gl) return false;
      // Half-float render targets. Without them the height field would have to
      // live in 8-bit, where a wave amplitude of 0.004 quantises to zero.
      const supported = gl.getExtension("EXT_color_buffer_float") !== null;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return supported;
    } catch {
      return false;
    }
  }

  constructor(canvas: HTMLCanvasElement, palette: WaterPalette, options: WaterSurfaceOptions = {}) {
    this.canvas = canvas;
    this.options = { ...DEFAULTS, ...options };
    this.palette = palette;
    this.targetPalette = palette;

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: false,
      // Nothing here is depth-sorted or edge-heavy, and a background has no
      // business waking a laptop's discrete GPU.
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });

    if (!gl) throw new Error("WebGL2 unavailable");
    if (!gl.getExtension("EXT_color_buffer_float")) throw new Error("EXT_color_buffer_float unavailable");

    this.gl = gl;

    canvas.addEventListener("webglcontextlost", this.onContextLost);
    canvas.addEventListener("webglcontextrestored", this.onContextRestored);

    this.createResources();
    this.resize();
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * @param x  CSS pixels from the left of the canvas.
   * @param y  CSS pixels from the top of the canvas.
   * @param radius  Fraction of viewport height.
   * @param strength  Height added at the centre. Negative dents the surface.
   */
  drop(x: number, y: number, radius: number, strength: number) {
    if (this.destroyed || this.width === 0 || this.height === 0) return;

    this.pending.push({
      x: x / this.width,
      // GL's origin is the bottom-left; the DOM's is the top-left.
      y: 1 - y / this.height,
      radius,
      strength,
    });

    this.activity = Math.max(this.activity, Math.abs(strength));
    this.wake();
  }

  /**
   * Displace the water along a segment — the path something took between two
   * frames. Coordinates in CSS pixels, radius as a fraction of viewport height,
   * `depth` negative to push the surface down.
   */
  stroke(fromX: number, fromY: number, toX: number, toY: number, radius: number, depth: number) {
    if (this.destroyed || this.width === 0 || this.height === 0) return;

    this.pendingStrokes.push({
      fromX: fromX / this.width,
      fromY: 1 - fromY / this.height,
      toX: toX / this.width,
      toY: 1 - toY / this.height,
      radius,
      depth,
    });

    this.activity = Math.max(this.activity, Math.abs(depth));
    this.wake();
  }

  setPalette(palette: WaterPalette) {
    // Start from whatever is actually on screen, not from the last target: a
    // theme picked while an earlier fade is still running would otherwise snap
    // back to that fade's starting colour before setting off again.
    this.palette = this.blendedPalette();
    this.targetPalette = palette;
    this.paletteBlend = 0;
    this.wake();
  }

  setScroll(pixels: number) {
    const next = (pixels / Math.max(this.height, 1)) * this.options.parallax;
    if (next === this.scroll) return;
    this.scroll = next;
    // The backdrop moved, so the frame is stale even if the water is still.
    this.lastScene = 0;
    this.wake();
  }

  resize() {
    if (this.destroyed || this.contextLost) return;

    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    if (width === 0 || height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, this.options.maxDpr);
    const bufferWidth = Math.max(1, Math.round(width * dpr));
    const bufferHeight = Math.max(1, Math.round(height * dpr));

    const unchanged =
      this.width === width &&
      this.height === height &&
      this.canvas.width === bufferWidth &&
      this.canvas.height === bufferHeight;
    if (unchanged) return;

    this.width = width;
    this.height = height;
    this.canvas.width = bufferWidth;
    this.canvas.height = bufferHeight;

    const aspect = width / height;

    // Both offscreen targets keep the viewport's aspect ratio. A square
    // simulation texture stretched over a 16:9 window has non-square texels,
    // and waves then travel faster horizontally than vertically.
    const [simWidth, simHeight] = fitAspect(this.options.resolution, aspect, 48);
    const sceneLong = Math.min(this.options.sceneResolution, Math.max(bufferWidth, bufferHeight));
    const [sceneWidth, sceneHeight] = fitAspect(sceneLong, aspect, 64);

    this.releaseTargets();
    this.simTargets = [this.createTarget(simWidth, simHeight), this.createTarget(simWidth, simHeight)];
    this.simIndex = 0;
    this.sceneTarget = this.createTarget(sceneWidth, sceneHeight);

    // The height field was just reallocated, so whatever was in it is gone.
    this.activity = 0;
    this.lastScene = 0;
    this.wake();
  }

  start() {
    if (this.running || this.destroyed) return;
    this.running = true;
    this.lastFrame = 0;
    this.schedule(0);
  }

  stop() {
    this.running = false;
    if (this.raf !== null) cancelAnimationFrame(this.raf);
    if (this.timer !== null) clearTimeout(this.timer);
    this.raf = null;
    this.timer = null;
  }

  destroy() {
    this.stop();
    this.destroyed = true;

    this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.canvas.removeEventListener("webglcontextrestored", this.onContextRestored);

    if (!this.contextLost) {
      this.releaseTargets();
      this.releasePrograms();
      // Hand the GPU memory back now rather than at the next GC.
      this.gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  }

  // ── Loop ───────────────────────────────────────────────────────────────────

  /** Whether this frame needs the simulation and the next one needs to be soon. */
  private get isBusy(): boolean {
    return (
      this.pending.length > 0 ||
      this.pendingStrokes.length > 0 ||
      this.activity > STILL_THRESHOLD ||
      this.paletteBlend < 1
    );
  }

  private wake() {
    if (!this.running || this.destroyed) return;
    // Only matters when a timer is pending: the loop is idling on a long delay
    // and something just happened that should be on screen now.
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
      this.schedule(0);
    }
  }

  private schedule(delay: number) {
    if (!this.running || this.destroyed) return;

    if (delay <= 0) {
      this.raf = requestAnimationFrame(this.frame);
      return;
    }

    // A skipped rAF callback is cheap but it still keeps the page on the
    // compositor's 60Hz heartbeat. Sleeping on a timer lets the whole thing
    // idle, which is the point of the idle mode.
    this.timer = setTimeout(() => {
      this.timer = null;
      this.raf = requestAnimationFrame(this.frame);
    }, delay);
  }

  private frame = (now: number) => {
    this.raf = null;
    if (!this.running || this.destroyed || this.contextLost) return;

    const dt = this.lastFrame === 0 ? 1 / 60 : Math.min((now - this.lastFrame) / 1000, 1 / 15);
    this.lastFrame = now;
    this.time += dt;

    if (this.paletteBlend < 1) {
      this.paletteBlend = Math.min(1, this.paletteBlend + dt / PALETTE_FADE);
      // The backdrop bakes the palette in, so it has to be redrawn.
      this.lastScene = 0;
      // Commit on arrival. Without this the fade start stays pinned to the
      // palette the page first loaded with, and the second theme change of a
      // session crossfades from a colour that has not been on screen for
      // minutes rather than from the one that is.
      if (this.paletteBlend >= 1) this.palette = this.targetPalette;
    }

    const busy = this.isBusy;

    this.applyDisturbances();

    if (busy) {
      // At 30fps one step per frame would halve the wave speed. Two steps keeps
      // the physics on wall-clock time; more than two is a runaway on a stall.
      const steps = dt > 1 / 40 ? 2 : 1;
      for (let i = 0; i < steps; i++) this.stepSimulation();
      this.activity *= Math.pow(this.options.damping, steps);
    }

    // The backdrop drifts on a scale of minutes. Redrawing it every frame is
    // work nobody can see; a few times a second is already generous.
    if (now - this.lastScene > 60) {
      this.renderScene();
      this.lastScene = now;
    }

    this.composite();

    this.schedule(this.isBusy ? 0 : 1000 / this.options.idleFps);
  };

  // ── Passes ─────────────────────────────────────────────────────────────────

  /**
   * Strokes and drops both add into the height channel of the *current* target,
   * leaving velocity and the cached slope alone. That write mask is what makes
   * this a blend rather than a full-field copy, so a disturbance costs one small
   * triangle instead of a pass over every texel.
   */
  private applyDisturbances() {
    if (!this.simTargets) return;
    if (this.pending.length === 0 && this.pendingStrokes.length === 0) return;

    const gl = this.gl;
    const target = this.simTargets[this.simIndex];
    const aspect = target.width / target.height;

    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
    gl.viewport(0, 0, target.width, target.height);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.colorMask(true, false, false, false);

    if (this.pendingStrokes.length > 0) {
      const program = this.simPrograms.stroke;
      gl.useProgram(program);
      gl.uniform1f(this.uniform(program, "uAspect"), aspect);

      for (const stroke of this.pendingStrokes) {
        gl.uniform2f(this.uniform(program, "uFrom"), stroke.fromX, stroke.fromY);
        gl.uniform2f(this.uniform(program, "uTo"), stroke.toX, stroke.toY);
        gl.uniform2f(this.uniform(program, "uRadiusUv"), stroke.radius / aspect, stroke.radius);
        gl.uniform1f(this.uniform(program, "uRadius"), stroke.radius);
        gl.uniform1f(this.uniform(program, "uDepth"), stroke.depth);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    }

    if (this.pending.length > 0) {
      const program = this.simPrograms.drop;
      gl.useProgram(program);

      for (const drop of this.pending) {
        gl.uniform2f(this.uniform(program, "uCenter"), drop.x, drop.y);
        gl.uniform2f(this.uniform(program, "uRadius"), drop.radius / aspect, drop.radius);
        gl.uniform1f(this.uniform(program, "uStrength"), drop.strength);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    }

    gl.colorMask(true, true, true, true);
    gl.disable(gl.BLEND);

    this.pending.length = 0;
    this.pendingStrokes.length = 0;
  }

  private stepSimulation() {
    if (!this.simTargets) return;

    const gl = this.gl;
    const source = this.simTargets[this.simIndex];
    const destination = this.simTargets[this.simIndex ^ 1];
    const program = this.simPrograms.sim;

    gl.bindFramebuffer(gl.FRAMEBUFFER, destination.framebuffer);
    gl.viewport(0, 0, destination.width, destination.height);
    gl.useProgram(program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, source.texture);
    gl.uniform1i(this.uniform(program, "uSim"), 0);
    gl.uniform2f(this.uniform(program, "uTexel"), 1 / destination.width, 1 / destination.height);
    gl.uniform1f(this.uniform(program, "uDamping"), this.options.damping);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    this.simIndex ^= 1;
  }

  private renderScene() {
    if (!this.sceneTarget) return;

    const gl = this.gl;
    const target = this.sceneTarget;
    const program = this.simPrograms.scene;
    const palette = this.blendedPalette();

    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
    gl.viewport(0, 0, target.width, target.height);
    gl.useProgram(program);

    gl.uniform2f(this.uniform(program, "uSize"), target.width, target.height);
    gl.uniform1f(this.uniform(program, "uTime"), this.time);
    gl.uniform1f(this.uniform(program, "uAspect"), target.width / target.height);
    gl.uniform1f(this.uniform(program, "uScroll"), this.scroll);
    this.uniformColour(program, "uDeep", palette.deep);
    this.uniformColour(program, "uMid", palette.mid);
    this.uniformColour(program, "uShallow", palette.shallow);
    this.uniformColour(program, "uLight", palette.light);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  private composite() {
    if (!this.simTargets || !this.sceneTarget) return;

    const gl = this.gl;
    const program = this.simPrograms.composite;
    const sim = this.simTargets[this.simIndex];
    const palette = this.blendedPalette();

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sim.texture);
    gl.uniform1i(this.uniform(program, "uSim"), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneTarget.texture);
    gl.uniform1i(this.uniform(program, "uScene"), 1);

    gl.uniform2f(this.uniform(program, "uResolution"), this.canvas.width, this.canvas.height);
    gl.uniform2f(this.uniform(program, "uSimTexel"), 1 / sim.width, 1 / sim.height);
    gl.uniform1f(this.uniform(program, "uAspect"), this.width / this.height);
    gl.uniform1f(this.uniform(program, "uRefraction"), this.options.refraction);
    gl.uniform1f(this.uniform(program, "uDispersion"), this.options.dispersion);
    gl.uniform1f(this.uniform(program, "uSpecular"), this.options.specular);
    gl.uniform1f(this.uniform(program, "uShine"), this.options.shine);
    gl.uniform1f(this.uniform(program, "uCaustics"), this.options.caustics);
    gl.uniform1f(this.uniform(program, "uSlope"), this.options.slope);
    gl.uniform3f(this.uniform(program, "uLightDir"), -0.55, 0.72, 0.62);
    this.uniformColour(program, "uLightColour", palette.light);
    this.uniformColour(program, "uShallow", palette.shallow);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // ── Resources ──────────────────────────────────────────────────────────────

  private createResources() {
    this.simPrograms = {
      sim: this.createProgram(FULLSCREEN_VERT, SIM_FRAG),
      drop: this.createProgram(DROP_VERT, DROP_FRAG),
      stroke: this.createProgram(STROKE_VERT, STROKE_FRAG),
      scene: this.createProgram(FULLSCREEN_VERT, SCENE_FRAG),
      composite: this.createProgram(FULLSCREEN_VERT, COMPOSITE_FRAG),
    };

    // Every pass is a triangle generated from gl_VertexID, so there are no
    // buffers or attributes at all. WebGL2 still wants *a* vertex array bound.
    this.gl.bindVertexArray(this.gl.createVertexArray());
  }

  private createTarget(width: number, height: number): Target {
    const gl = this.gl;

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);
    // LINEAR is what lets a 256px height field read back as a smooth ripple at
    // display resolution. RGBA16F is filterable in core WebGL2; RGBA32F is not.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // CLAMP_TO_EDGE doubles as the simulation's reflecting wall — see SIM_FRAG.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    // texImage2D with a null source zero-fills, so the field starts flat.
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return { texture, framebuffer, width, height };
  }

  private releaseTargets() {
    const gl = this.gl;
    const targets = [...(this.simTargets ?? []), this.sceneTarget];

    for (const target of targets) {
      if (!target) continue;
      gl.deleteFramebuffer(target.framebuffer);
      gl.deleteTexture(target.texture);
    }

    this.simTargets = null;
    this.sceneTarget = null;
  }

  private releasePrograms() {
    for (const program of Object.values(this.simPrograms ?? {})) {
      this.gl.deleteProgram(program);
    }
    this.uniforms.clear();
  }

  private createProgram(vertexSource: string, fragmentSource: string): WebGLProgram {
    const gl = this.gl;
    const vertex = this.compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = this.compile(gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    // Deleted, not detached-then-deleted: the program holds its own reference
    // until it is itself deleted.
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Link failed: ${log}`);
    }

    return program;
  }

  private compile(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) throw new Error("createShader failed");

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Compile failed: ${log}`);
    }

    return shader;
  }

  private uniformColour(program: WebGLProgram, name: string, colour: readonly [number, number, number]) {
    this.gl.uniform3f(this.uniform(program, name), colour[0], colour[1], colour[2]);
  }

  /** `getUniformLocation` is a string lookup into the driver; cache it. */
  private uniform(program: WebGLProgram, name: string): WebGLUniformLocation | null {
    let cache = this.uniforms.get(program);
    if (!cache) {
      cache = new Map();
      this.uniforms.set(program, cache);
    }
    if (!cache.has(name)) {
      cache.set(name, this.gl.getUniformLocation(program, name));
    }
    return cache.get(name) ?? null;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private blendedPalette(): WaterPalette {
    if (this.paletteBlend >= 1) return this.targetPalette;

    // Smoothstep, so a theme change eases rather than starting and stopping at
    // full speed.
    const t = this.paletteBlend * this.paletteBlend * (3 - 2 * this.paletteBlend);
    const mix = (a: readonly [number, number, number], b: readonly [number, number, number]) =>
      [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t] as const;

    return {
      deep: mix(this.palette.deep, this.targetPalette.deep),
      mid: mix(this.palette.mid, this.targetPalette.mid),
      shallow: mix(this.palette.shallow, this.targetPalette.shallow),
      light: mix(this.palette.light, this.targetPalette.light),
    };
  }

  private onContextLost = (event: Event) => {
    // Without preventDefault the browser will not attempt a restore at all.
    event.preventDefault();
    this.contextLost = true;
    this.stop();
    this.simTargets = null;
    this.sceneTarget = null;
    this.uniforms.clear();
    this.options.onContextLost?.();
  };

  private onContextRestored = () => {
    if (this.destroyed) return;
    this.contextLost = false;
    // Every object the old context owned went with it; rebuild from scratch.
    this.createResources();
    this.resize();
    this.start();
  };
}

/** Long edge fixed, short edge derived, both at least `min` texels. */
function fitAspect(long: number, aspect: number, min: number): [number, number] {
  const width = aspect >= 1 ? long : Math.round(long * aspect);
  const height = aspect >= 1 ? Math.round(long / aspect) : long;
  return [Math.max(min, width), Math.max(min, height)];
}
