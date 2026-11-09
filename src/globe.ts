import { geoOrthographic, geoPath, geoGraticule10, geoDistance, geoInterpolate } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, Feature, Geometry, MultiLineString } from 'geojson';

export interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export const CITIES: City[] = [
  { name: 'São Paulo', country: 'Brazil', lat: -23.55, lon: -46.63 },
  { name: 'Brasília', country: 'Brazil', lat: -15.79, lon: -47.88 },
  { name: 'Washington, DC', country: 'United States', lat: 38.91, lon: -77.04 },
  { name: 'Vero Beach', country: 'United States', lat: 27.64, lon: -80.4 },
  { name: 'Panama City', country: 'Panama', lat: 8.98, lon: -79.52 },
  { name: 'Lisbon', country: 'Portugal', lat: 38.72, lon: -9.14 },
  { name: 'Singapore', country: 'Singapore', lat: 1.35, lon: 103.82 },
  { name: 'Guantánamo Bay', country: 'Cuba', lat: 19.9, lon: -75.15 },
  { name: 'Pittsburgh', country: 'United States', lat: 40.44, lon: -79.99 },
];

// world-atlas country names for the places lived in
const LIVED = new Set(['Brazil', 'United States of America', 'Panama', 'Portugal', 'Cuba', 'Singapore']);

type Rot = [number, number, number];

/**
 * Draws an interactive globe into `canvas`. Drag to spin; call `focus(i)`
 * to fly to a city. Returns a cleanup function plus the focus/hover hooks.
 */
export async function createGlobe(
  canvas: HTMLCanvasElement,
  onHover: (i: number | null) => void,
): Promise<{ focus: (i: number) => void; highlight: (i: number | null) => void; destroy: () => void }> {
  const topo = (await import('world-atlas/countries-110m.json')).default as unknown as Topology<{
    countries: GeometryCollection<{ name: string }>;
  }>;
  const countries = feature(topo, topo.objects.countries) as FeatureCollection<Geometry, { name: string }>;
  const borders = mesh(topo, topo.objects.countries, (a, b) => a !== b) as MultiLineString;
  const lived = countries.features.filter((f) => LIVED.has(f.properties.name));
  const others = { type: 'FeatureCollection', features: countries.features.filter((f) => !LIVED.has(f.properties.name)) } as FeatureCollection;
  const graticule = geoGraticule10();
  const sphere = { type: 'Sphere' } as const;

  const ctx = canvas.getContext('2d')!;
  const projection = geoOrthographic().clipAngle(90).precision(0.5);
  const path = geoPath(projection, ctx);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Start centred on the Americas, where most of the cities are
  let rotation: Rot = [65, -10, 0];
  let size = 0;
  let dpr = 1;
  let active: number | null = null; // city shown with a label
  let hovered: number | null = null;
  let dragging = false;
  let lastInteraction = -Infinity;
  let flight: { from: Rot; to: Rot; start: number; dur: number } | null = null;
  let raf = 0;
  let lastFrame = performance.now();

  let colors = readColors();
  function readColors() {
    const s = getComputedStyle(document.documentElement);
    const v = (n: string) => s.getPropertyValue(n).trim();
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      ocean: v('--bg-alt') || '#fff',
      land: dark ? '#2A2F3A' : '#E3E5EA',
      lived: dark ? 'rgba(129,140,248,0.35)' : 'rgba(79,70,229,0.18)',
      border: v('--bg') || '#fafaf9',
      grid: v('--border') || '#e5e7eb',
      outline: v('--border') || '#e5e7eb',
      accent: v('--accent') || '#4F46E5',
      text: v('--text') || '#111827',
      halo: v('--bg-alt') || '#fff',
    };
  }

  const themeObserver = new MutationObserver(() => {
    colors = readColors();
    draw();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  function resize() {
    const rect = canvas.getBoundingClientRect();
    size = Math.max(1, Math.round(rect.width));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    projection.translate([size / 2, size / 2]).scale(size / 2 - 2);
    draw();
  }

  function visible(c: City): boolean {
    const r = projection.rotate();
    return geoDistance([c.lon, c.lat], [-r[0], -r[1]]) < Math.PI / 2 - 0.05;
  }

  function draw() {
    if (!size) return;
    projection.rotate(rotation);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    ctx.beginPath();
    path(sphere);
    ctx.fillStyle = colors.ocean;
    ctx.fill();

    ctx.beginPath();
    path(graticule);
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    ctx.beginPath();
    path(others);
    ctx.fillStyle = colors.land;
    ctx.fill();

    for (const f of lived as Feature[]) {
      ctx.beginPath();
      path(f);
      ctx.fillStyle = colors.land;
      ctx.fill();
      ctx.fillStyle = colors.lived;
      ctx.fill();
    }

    ctx.beginPath();
    path(borders);
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 0.7;
    ctx.stroke();

    ctx.beginPath();
    path(sphere);
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 1;
    ctx.stroke();

    // City dots
    CITIES.forEach((c, i) => {
      if (!visible(c)) return;
      const p = projection([c.lon, c.lat]);
      if (!p) return;
      const on = i === active || i === hovered;
      ctx.beginPath();
      ctx.arc(p[0], p[1], on ? 5.5 : 4, 0, Math.PI * 2);
      ctx.fillStyle = colors.accent;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = colors.halo;
      ctx.stroke();
    });

    // Label for the active / hovered city
    const labelIdx = hovered ?? active;
    if (labelIdx !== null && visible(CITIES[labelIdx])) {
      const c = CITIES[labelIdx];
      const p = projection([c.lon, c.lat])!;
      ctx.font = '500 13px "Space Grotesk", -apple-system, sans-serif';
      const w = ctx.measureText(c.name).width;
      let x = p[0] + 10;
      if (x + w > size - 4) x = p[0] - 10 - w;
      const y = p[1] - 9;
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = colors.halo;
      ctx.strokeText(c.name, x, y);
      ctx.fillStyle = colors.text;
      ctx.fillText(c.name, x, y);
    }
  }

  function tick(now: number) {
    const dt = Math.min(now - lastFrame, 50);
    lastFrame = now;
    if (flight) {
      const t = Math.min((now - flight.start) / flight.dur, 1);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const interp = geoInterpolate([-flight.from[0], -flight.from[1]], [-flight.to[0], -flight.to[1]]);
      const [lon, lat] = interp(e);
      rotation = [-lon, -lat, 0];
      if (t >= 1) flight = null;
      draw();
    } else if (!dragging && !reduceMotion && now - lastInteraction > 4000 && active === null && hovered === null) {
      rotation = [rotation[0] + dt * 0.006, rotation[1], 0];
      draw();
    }
    raf = requestAnimationFrame(tick);
  }

  function focus(i: number) {
    const c = CITIES[i];
    active = i;
    lastInteraction = performance.now();
    const to: Rot = [-c.lon, -Math.max(-60, Math.min(60, c.lat)), 0];
    if (reduceMotion) {
      rotation = to;
      draw();
      return;
    }
    const dist = geoDistance([-rotation[0], -rotation[1]], [-to[0], -to[1]]);
    flight = { from: [...rotation] as Rot, to, start: performance.now(), dur: 500 + dist * 450 };
  }

  function highlight(i: number | null) {
    hovered = i;
    draw();
  }

  // Pointer: drag to rotate, hover to label
  let start: { x: number; y: number; rot: Rot } | null = null;
  function cityAt(x: number, y: number): number | null {
    let best: number | null = null;
    let bestD = 14;
    CITIES.forEach((c, i) => {
      if (!visible(c)) return;
      const p = projection([c.lon, c.lat]);
      if (!p) return;
      const d = Math.hypot(p[0] - x, p[1] - y);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  }
  function local(e: PointerEvent) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function onDown(e: PointerEvent) {
    const { x, y } = local(e);
    start = { x, y, rot: [...rotation] as Rot };
    dragging = false;
    flight = null;
    canvas.setPointerCapture(e.pointerId);
  }
  function onMove(e: PointerEvent) {
    const { x, y } = local(e);
    if (start) {
      const dx = x - start.x;
      const dy = y - start.y;
      if (!dragging && Math.hypot(dx, dy) > 3) {
        dragging = true;
        canvas.classList.add('is-dragging');
      }
      if (dragging) {
        const k = 180 / (Math.PI * projection.scale());
        rotation = [start.rot[0] + dx * k * 1.2, Math.max(-75, Math.min(75, start.rot[1] - dy * k * 1.2)), 0];
        lastInteraction = performance.now();
        draw();
      }
      return;
    }
    const i = cityAt(x, y);
    if (i !== hovered) {
      hovered = i;
      canvas.style.cursor = i === null ? '' : 'pointer';
      onHover(i);
      draw();
    }
  }
  function onUp(e: PointerEvent) {
    if (start && !dragging) {
      const { x, y } = local(e);
      const i = cityAt(x, y);
      if (i !== null) {
        focus(i);
        onHover(i);
      } else {
        active = null;
        onHover(null);
        draw();
      }
    }
    start = null;
    dragging = false;
    canvas.classList.remove('is-dragging');
    lastInteraction = performance.now();
  }
  function onLeave() {
    if (start) return;
    if (hovered !== null) {
      hovered = null;
      canvas.style.cursor = '';
      onHover(active);
      draw();
    }
  }

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('pointerleave', onLeave);

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  raf = requestAnimationFrame(tick);

  return {
    focus,
    highlight,
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      themeObserver.disconnect();
    },
  };
}
