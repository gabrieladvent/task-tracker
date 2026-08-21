/**
 * Geometry helpers for the distribution views. Kept dependency-free — every
 * chart here is plain SVG, so there is no charting library to pull in.
 */

export interface PackedCircle {
    index: number;
    x: number;
    y: number;
    r: number;
}

interface TangentInput {
    x: number;
    y: number;
    r: number;
}

/** Points where a circle of radius `r` sits tangent to both `a` and `b`. */
function tangentPoints(a: TangentInput, b: TangentInput, r: number): { x: number; y: number }[] {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const d = Math.hypot(dx, dy);

    if (d === 0) return [];

    const r1 = a.r + r;
    const r2 = b.r + r;

    if (d > r1 + r2 || d < Math.abs(r1 - r2)) return [];

    const base = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const hSq = r1 * r1 - base * base;

    if (hSq < 0) return [];

    const h = Math.sqrt(hSq);
    const mx = a.x + (dx * base) / d;
    const my = a.y + (dy * base) / d;

    return [
        { x: mx + (dy * h) / d, y: my - (dx * h) / d },
        { x: mx - (dy * h) / d, y: my + (dx * h) / d },
    ];
}

/**
 * Greedy circle packing: biggest first, each new circle dropped into the spot
 * closest to the centre that touches two placed circles without overlapping.
 * Good enough — and stable — for the handful of projects we ever render.
 */
export function packCircles(values: number[]): PackedCircle[] {
    const order = values
        .map((value, index) => ({ index, r: Math.sqrt(Math.max(value, 0)) }))
        .filter((item) => item.r > 0)
        .sort((a, b) => b.r - a.r || a.index - b.index);

    const placed: PackedCircle[] = [];

    const overlaps = (x: number, y: number, r: number) =>
        placed.some((c) => Math.hypot(c.x - x, c.y - y) < c.r + r - 1e-6);

    for (const item of order) {
        if (placed.length === 0) {
            placed.push({ ...item, x: 0, y: 0 });
            continue;
        }

        if (placed.length === 1) {
            placed.push({ ...item, x: placed[0].r + item.r, y: 0 });
            continue;
        }

        const candidates: { x: number; y: number }[] = [];

        for (let i = 0; i < placed.length; i++) {
            for (let j = i + 1; j < placed.length; j++) {
                candidates.push(...tangentPoints(placed[i], placed[j], item.r));
            }
        }

        // Fallback ring so a circle too big for any tangent gap still lands somewhere.
        for (const c of placed) {
            for (let k = 0; k < 12; k++) {
                const angle = (k / 12) * Math.PI * 2;
                candidates.push({
                    x: c.x + Math.cos(angle) * (c.r + item.r),
                    y: c.y + Math.sin(angle) * (c.r + item.r),
                });
            }
        }

        const spot = candidates
            .filter((p) => !overlaps(p.x, p.y, item.r))
            .sort((p, q) => Math.hypot(p.x, p.y) - Math.hypot(q.x, q.y))[0];

        placed.push({ ...item, x: spot?.x ?? 0, y: spot?.y ?? 0 });
    }

    return placed;
}

/** Bounding box of a packed layout, so the caller can build a tight viewBox. */
export function circleBounds(circles: PackedCircle[]) {
    if (circles.length === 0) return { x: 0, y: 0, width: 1, height: 1 };

    const minX = Math.min(...circles.map((c) => c.x - c.r));
    const maxX = Math.max(...circles.map((c) => c.x + c.r));
    const minY = Math.min(...circles.map((c) => c.y - c.r));
    const maxY = Math.max(...circles.map((c) => c.y + c.r));

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export interface TreemapRect {
    index: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

interface TreemapItem {
    index: number;
    value: number;
}

function worstRatio(row: TreemapItem[], length: number, scale: number): number {
    const areas = row.map((item) => item.value * scale);
    const sum = areas.reduce((total, area) => total + area, 0);

    if (sum === 0 || length === 0) return Infinity;

    const side = sum / length;

    return Math.max(...areas.map((area) => Math.max(side / (area / length), (area / length) / side)));
}

/**
 * Squarified treemap (Bruls et al.) — lays items out as rectangles that stay as
 * close to square as possible, so the areas remain easy to compare by eye.
 */
export function squarify(items: TreemapItem[], width: number, height: number): TreemapRect[] {
    const sorted = items.filter((item) => item.value > 0).sort((a, b) => b.value - a.value);
    const total = sorted.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) return [];

    const rects: TreemapRect[] = [];
    const remaining = [...sorted];

    let x = 0;
    let y = 0;
    let w = width;
    let h = height;
    let area = width * height;
    let value = total;

    while (remaining.length > 0) {
        const shortSide = Math.min(w, h);
        const row: TreemapItem[] = [];
        const scale = value > 0 ? area / value : 0;

        while (remaining.length > 0) {
            const next = [...row, remaining[0]];

            if (row.length > 0 && worstRatio(next, shortSide, scale) > worstRatio(row, shortSide, scale)) {
                break;
            }

            row.push(remaining.shift()!);
        }

        const rowValue = row.reduce((sum, item) => sum + item.value, 0);
        const rowThickness = shortSide > 0 ? (rowValue * scale) / shortSide : 0;

        if (rowThickness <= 0) break;

        let offset = 0;

        for (const item of row) {
            const span = (item.value * scale) / rowThickness;

            rects.push(
                w >= h
                    ? { index: item.index, x, y: y + offset, width: rowThickness, height: span }
                    : { index: item.index, x: x + offset, y, width: span, height: rowThickness }
            );

            offset += span;
        }

        if (w >= h) {
            x += rowThickness;
            w -= rowThickness;
        } else {
            y += rowThickness;
            h -= rowThickness;
        }

        value -= rowValue;
        area = w * h;
    }

    return rects;
}

/** SVG arc path for a donut slice. */
export function donutSlice(cx: number, cy: number, outer: number, inner: number, from: number, to: number): string {
    // A full circle can't be drawn as a single arc — nudge it just short of 360°.
    const end = to - from >= Math.PI * 2 ? from + Math.PI * 2 - 1e-4 : to;
    const large = end - from > Math.PI ? 1 : 0;

    const p = (radius: number, angle: number) => [
        cx + Math.cos(angle) * radius,
        cy + Math.sin(angle) * radius,
    ];

    const [x1, y1] = p(outer, from);
    const [x2, y2] = p(outer, end);
    const [x3, y3] = p(inner, end);
    const [x4, y4] = p(inner, from);

    return [
        `M ${x1} ${y1}`,
        `A ${outer} ${outer} 0 ${large} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${inner} ${inner} 0 ${large} 0 ${x4} ${y4}`,
        'Z',
    ].join(' ');
}

/** Point on a radar axis, first axis pointing up. */
export function radarPoint(cx: number, cy: number, radius: number, index: number, count: number) {
    const angle = (index / count) * Math.PI * 2 - Math.PI / 2;

    return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
}

/** Pick black or white text depending on how dark the fill is. */
export function readableTextOn(hex: string): string {
    const value = hex.replace('#', '');
    const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;

    if (full.length !== 6) return '#ffffff';

    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);

    return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#1f2937' : '#ffffff';
}

/** Short label for tight spaces — "Kraken Onboarding" becomes "KO". */
export function initials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) return '?';
    if (words.length === 1) return words[0].slice(0, 3).toUpperCase();

    return words.slice(0, 3).map((w) => w[0]).join('').toUpperCase();
}
