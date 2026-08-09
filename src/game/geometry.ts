export type Point = {
  x: number;
  y: number;
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function distanceToSegment(point: Point, a: Point, b: Point) {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = point.x - a.x;
  const apy = point.y - a.y;
  const lengthSquared = abx * abx + aby * aby;

  if (lengthSquared === 0) {
    return distance(point, a);
  }

  const t = clamp((apx * abx + apy * aby) / lengthSquared, 0, 1);
  return distance(point, {
    x: a.x + abx * t,
    y: a.y + aby * t,
  });
}

export function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function randomItem<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)]!;
}
