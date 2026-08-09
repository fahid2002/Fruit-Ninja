import type { Point } from "./geometry";

export type FruitSkin = {
  name: string;
  peel: string;
  peelDark: string;
  flesh: string;
  fleshLight: string;
  seed: string;
  juice: string;
  radiusMin: number;
  radiusMax: number;
};

export const FRUIT_SKINS: readonly FruitSkin[] = [
  {
    name: "Watermelon",
    peel: "#28b463",
    peelDark: "#0d6b38",
    flesh: "#f23b63",
    fleshLight: "#ff8ba1",
    seed: "#15231c",
    juice: "#ff4f70",
    radiusMin: 44,
    radiusMax: 58,
  },
  {
    name: "Orange",
    peel: "#f97316",
    peelDark: "#b9470d",
    flesh: "#ffc247",
    fleshLight: "#fff0a3",
    seed: "#9a4f0a",
    juice: "#ffb21f",
    radiusMin: 38,
    radiusMax: 50,
  },
  {
    name: "Lime",
    peel: "#84cc16",
    peelDark: "#3f7b0d",
    flesh: "#d9f99d",
    fleshLight: "#fbffe1",
    seed: "#64890b",
    juice: "#b8ec39",
    radiusMin: 34,
    radiusMax: 46,
  },
  {
    name: "Dragonfruit",
    peel: "#e11d48",
    peelDark: "#8f0f2f",
    flesh: "#fff1f5",
    fleshLight: "#ffffff",
    seed: "#1f1b24",
    juice: "#ff4d7d",
    radiusMin: 40,
    radiusMax: 54,
  },
  {
    name: "Blue Plum",
    peel: "#5b4bdb",
    peelDark: "#2d276f",
    flesh: "#d8b4fe",
    fleshLight: "#f7e8ff",
    seed: "#332344",
    juice: "#9d7cff",
    radiusMin: 32,
    radiusMax: 44,
  },
];

export function drawFruit(
  ctx: CanvasRenderingContext2D,
  skin: FruitSkin,
  radius: number,
  angle: number,
) {
  ctx.save();
  ctx.rotate(angle);

  const peelGradient = ctx.createRadialGradient(
    -radius * 0.35,
    -radius * 0.45,
    radius * 0.1,
    0,
    0,
    radius,
  );
  peelGradient.addColorStop(0, skin.fleshLight);
  peelGradient.addColorStop(0.38, skin.peel);
  peelGradient.addColorStop(1, skin.peelDark);

  ctx.fillStyle = peelGradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = Math.max(3, radius * 0.08);
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.32)";
  ctx.beginPath();
  ctx.ellipse(-radius * 0.28, -radius * 0.35, radius * 0.18, radius * 0.32, -0.8, 0, Math.PI * 2);
  ctx.fill();

  if (skin.name === "Watermelon") {
    ctx.strokeStyle = "rgba(7,70,36,0.42)";
    ctx.lineWidth = 4;
    for (let index = -1; index <= 1; index += 1) {
      ctx.beginPath();
      ctx.arc(index * radius * 0.28, 0, radius * 0.85, -1.15, 1.15);
      ctx.stroke();
    }
  } else if (skin.name === "Dragonfruit") {
    ctx.fillStyle = skin.seed;
    for (let index = 0; index < 9; index += 1) {
      const seedAngle = (index / 9) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(
        Math.cos(seedAngle) * radius * 0.43,
        Math.sin(seedAngle) * radius * 0.35,
        2.4,
        4,
        seedAngle,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  } else if (skin.name === "Orange" || skin.name === "Lime") {
    ctx.strokeStyle = "rgba(255,255,255,0.32)";
    ctx.lineWidth = 2;
    for (let index = 0; index < 8; index += 1) {
      const segmentAngle = (index / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(segmentAngle) * radius * 0.72, Math.sin(segmentAngle) * radius * 0.72);
      ctx.stroke();
    }
  }

  ctx.fillStyle = "#2f7d32";
  ctx.beginPath();
  ctx.ellipse(radius * 0.2, -radius * 0.92, radius * 0.12, radius * 0.28, 0.75, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawFruitHalf(
  ctx: CanvasRenderingContext2D,
  skin: FruitSkin,
  radius: number,
  side: -1 | 1,
) {
  ctx.save();
  ctx.beginPath();
  if (side === -1) {
    ctx.arc(0, 0, radius, Math.PI / 2, (Math.PI * 3) / 2);
  } else {
    ctx.arc(0, 0, radius, -Math.PI / 2, Math.PI / 2);
  }
  ctx.closePath();
  ctx.fillStyle = skin.flesh;
  ctx.fill();

  ctx.lineWidth = Math.max(5, radius * 0.16);
  ctx.strokeStyle = skin.peel;
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.85);
  ctx.lineTo(0, radius * 0.85);
  ctx.stroke();

  ctx.fillStyle = skin.seed;
  for (let index = 0; index < 5; index += 1) {
    const y = -radius * 0.45 + index * radius * 0.22;
    ctx.beginPath();
    ctx.ellipse(side * radius * 0.28, y, 2.6, 5, 0.3 * side, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawBomb(ctx: CanvasRenderingContext2D, radius: number, angle: number) {
  ctx.save();
  ctx.rotate(angle);

  const bodyGradient = ctx.createRadialGradient(
    -radius * 0.35,
    -radius * 0.45,
    radius * 0.1,
    0,
    0,
    radius,
  );
  bodyGradient.addColorStop(0, "#71717a");
  bodyGradient.addColorStop(0.45, "#18181b");
  bodyGradient.addColorStop(1, "#020202");

  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#3f3f46";
  ctx.beginPath();
  ctx.roundRect(-radius * 0.23, -radius * 1.1, radius * 0.46, radius * 0.28, 4);
  ctx.fill();

  ctx.strokeStyle = "#facc15";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(radius * 0.05, -radius * 1.12);
  ctx.bezierCurveTo(radius * 0.48, -radius * 1.46, radius * 0.52, -radius * 0.9, radius * 0.82, -radius * 1.2);
  ctx.stroke();

  ctx.fillStyle = "#fb7185";
  ctx.beginPath();
  ctx.arc(radius * 0.88, -radius * 1.22, radius * 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.beginPath();
  ctx.ellipse(-radius * 0.28, -radius * 0.32, radius * 0.18, radius * 0.28, -0.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawTrail(ctx: CanvasRenderingContext2D, trail: readonly (Point & { age: number })[]) {
  if (trail.length < 2) {
    return;
  }

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let index = 1; index < trail.length; index += 1) {
    const current = trail[index]!;
    const previous = trail[index - 1]!;
    const alpha = Math.max(0, 1 - current.age / 280);
    ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.95})`;
    ctx.shadowColor = `rgba(255,214,102,${alpha})`;
    ctx.shadowBlur = 16 * alpha;
    ctx.lineWidth = 6 + alpha * 9;
    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(255,76,41,${alpha * 0.55})`;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  ctx.restore();
}

export function drawSpark(ctx: CanvasRenderingContext2D, center: Point, size: number, alpha: number) {
  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#fff8d6";
  ctx.lineWidth = 3;
  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * size * 0.3, Math.sin(angle) * size * 0.3);
    ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
    ctx.stroke();
  }
  ctx.restore();
}
