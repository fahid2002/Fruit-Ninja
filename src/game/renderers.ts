import type { Point } from "./geometry";

export type FruitShape =
  | "watermelon"
  | "orange"
  | "lemon"
  | "lime"
  | "kiwi"
  | "strawberry"
  | "pineapple";

export type FruitSkin = {
  name: string;
  shape: FruitShape;
  peel: string;
  peelDark: string;
  flesh: string;
  fleshLight: string;
  seed: string;
  juice: string;
  accent: string;
  radiusMin: number;
  radiusMax: number;
};

export type TrailPoint = Point & {
  age: number;
};

export const FRUIT_SKINS: readonly FruitSkin[] = [
  {
    name: "Watermelon",
    shape: "watermelon",
    peel: "#46bd2c",
    peelDark: "#155c27",
    flesh: "#e91e3f",
    fleshLight: "#ff8d9f",
    seed: "#111414",
    juice: "#dd151f",
    accent: "#b7ef37",
    radiusMin: 46,
    radiusMax: 58,
  },
  {
    name: "Orange",
    shape: "orange",
    peel: "#f97818",
    peelDark: "#b44408",
    flesh: "#ffb133",
    fleshLight: "#fff2a6",
    seed: "#8c4b06",
    juice: "#ff8f18",
    accent: "#ffd15d",
    radiusMin: 36,
    radiusMax: 46,
  },
  {
    name: "Lemon",
    shape: "lemon",
    peel: "#f7d61d",
    peelDark: "#bb8e05",
    flesh: "#fff29b",
    fleshLight: "#fffbd1",
    seed: "#9a7b0a",
    juice: "#f4c917",
    accent: "#ffe94b",
    radiusMin: 35,
    radiusMax: 47,
  },
  {
    name: "Lime",
    shape: "lime",
    peel: "#5ac832",
    peelDark: "#1f7a22",
    flesh: "#cfff7b",
    fleshLight: "#fbffe2",
    seed: "#507d12",
    juice: "#60cf29",
    accent: "#a8ef3c",
    radiusMin: 33,
    radiusMax: 43,
  },
  {
    name: "Kiwi",
    shape: "kiwi",
    peel: "#8a5c28",
    peelDark: "#4b2f12",
    flesh: "#8ddd32",
    fleshLight: "#e8ffb0",
    seed: "#171714",
    juice: "#74c928",
    accent: "#d9fb78",
    radiusMin: 34,
    radiusMax: 44,
  },
  {
    name: "Strawberry",
    shape: "strawberry",
    peel: "#e32034",
    peelDark: "#8c101c",
    flesh: "#fb455d",
    fleshLight: "#ff9cab",
    seed: "#ffe082",
    juice: "#d71924",
    accent: "#7fcc38",
    radiusMin: 33,
    radiusMax: 42,
  },
  {
    name: "Pineapple",
    shape: "pineapple",
    peel: "#d5941f",
    peelDark: "#8f5c0e",
    flesh: "#ffd24d",
    fleshLight: "#fff29b",
    seed: "#6a4210",
    juice: "#d8a30e",
    accent: "#61a72f",
    radiusMin: 40,
    radiusMax: 52,
  },
];

function drawGloss(ctx: CanvasRenderingContext2D, radius: number) {
  ctx.fillStyle = "rgba(255,255,255,0.34)";
  ctx.beginPath();
  ctx.ellipse(-radius * 0.28, -radius * 0.37, radius * 0.18, radius * 0.34, -0.78, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.beginPath();
  ctx.ellipse(radius * 0.2, -radius * 0.18, radius * 0.11, radius * 0.18, 0.45, 0, Math.PI * 2);
  ctx.fill();
}

function drawLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, angle: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.strokeStyle = "rgba(16,76,20,0.42)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.08);
  ctx.quadraticCurveTo(radius * 0.5, -radius * 0.42, radius * 0.88, 0);
  ctx.quadraticCurveTo(radius * 0.38, radius * 0.22, 0, radius * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawRoundFruit(ctx: CanvasRenderingContext2D, skin: FruitSkin, radius: number) {
  const gradient = ctx.createRadialGradient(-radius * 0.4, -radius * 0.42, radius * 0.06, 0, 0, radius * 1.08);
  gradient.addColorStop(0, skin.fleshLight);
  gradient.addColorStop(0.22, skin.peel);
  gradient.addColorStop(0.72, skin.peel);
  gradient.addColorStop(1, skin.peelDark);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(3, radius * 0.075);
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.stroke();
}

function drawWatermelon(ctx: CanvasRenderingContext2D, skin: FruitSkin, radius: number) {
  drawRoundFruit(ctx, skin, radius);
  ctx.lineCap = "round";
  for (let index = -3; index <= 3; index += 1) {
    ctx.strokeStyle = index % 2 === 0 ? "rgba(8,80,34,0.54)" : "rgba(165,238,49,0.42)";
    ctx.lineWidth = Math.max(4, radius * 0.11);
    ctx.beginPath();
    ctx.moveTo(index * radius * 0.21, -radius * 0.88);
    ctx.bezierCurveTo(
      index * radius * 0.1 - radius * 0.1,
      -radius * 0.28,
      index * radius * 0.1 + radius * 0.22,
      radius * 0.24,
      index * radius * 0.26,
      radius * 0.9,
    );
    ctx.stroke();
  }
  drawGloss(ctx, radius);
}

function drawCitrus(ctx: CanvasRenderingContext2D, skin: FruitSkin, radius: number) {
  drawRoundFruit(ctx, skin, radius);
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 2;
  for (let index = 0; index < 10; index += 1) {
    const angle = (index / 10) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * radius * 0.78, Math.sin(angle) * radius * 0.78);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  for (let index = 0; index < 18; index += 1) {
    const angle = (index / 18) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * radius * 0.48, Math.sin(angle) * radius * 0.48, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  drawGloss(ctx, radius);
}

function drawKiwi(ctx: CanvasRenderingContext2D, skin: FruitSkin, radius: number) {
  drawRoundFruit(ctx, skin, radius);
  ctx.fillStyle = skin.flesh;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = skin.fleshLight;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = skin.seed;
  for (let index = 0; index < 24; index += 1) {
    const angle = (index / 24) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(Math.cos(angle) * radius * 0.48, Math.sin(angle) * radius * 0.48, 1.7, 3.5, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  drawGloss(ctx, radius);
}

function drawStrawberry(ctx: CanvasRenderingContext2D, skin: FruitSkin, radius: number) {
  const gradient = ctx.createRadialGradient(-radius * 0.35, -radius * 0.4, radius * 0.1, 0, 0, radius);
  gradient.addColorStop(0, skin.fleshLight);
  gradient.addColorStop(0.44, skin.peel);
  gradient.addColorStop(1, skin.peelDark);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, radius * 0.98);
  ctx.bezierCurveTo(-radius * 0.88, radius * 0.22, -radius * 0.76, -radius * 0.74, -radius * 0.1, -radius * 0.72);
  ctx.bezierCurveTo(radius * 0.72, -radius * 0.78, radius * 0.86, radius * 0.18, 0, radius * 0.98);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = skin.seed;
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const x = (col - 1) * radius * 0.28 + (row % 2) * radius * 0.11;
      const y = -radius * 0.35 + row * radius * 0.25;
      ctx.beginPath();
      ctx.ellipse(x, y, 2, 4, 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let index = -2; index <= 2; index += 1) {
    drawLeaf(ctx, index * radius * 0.13, -radius * 0.72, radius * 0.28, -Math.PI / 2 + index * 0.42, skin.accent);
  }
  drawGloss(ctx, radius);
}

function drawPineapple(ctx: CanvasRenderingContext2D, skin: FruitSkin, radius: number) {
  ctx.save();
  ctx.scale(0.82, 1.12);
  const gradient = ctx.createRadialGradient(-radius * 0.3, -radius * 0.35, radius * 0.08, 0, 0, radius);
  gradient.addColorStop(0, skin.fleshLight);
  gradient.addColorStop(0.46, skin.peel);
  gradient.addColorStop(1, skin.peelDark);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(0, radius * 0.08, radius * 0.78, radius * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(95,56,8,0.45)";
  ctx.lineWidth = 2.4;
  for (let offset = -3; offset <= 3; offset += 1) {
    ctx.beginPath();
    ctx.moveTo(-radius, offset * radius * 0.24);
    ctx.lineTo(radius, offset * radius * 0.24 + radius * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-radius, offset * radius * 0.24 + radius * 0.8);
    ctx.lineTo(radius, offset * radius * 0.24);
    ctx.stroke();
  }
  ctx.restore();

  for (let index = -2; index <= 2; index += 1) {
    drawLeaf(ctx, index * radius * 0.08, -radius * 0.98, radius * 0.42, -Math.PI / 2 + index * 0.3, skin.accent);
  }
  drawGloss(ctx, radius * 0.92);
}

export function drawFruit(
  ctx: CanvasRenderingContext2D,
  skin: FruitSkin,
  radius: number,
  angle: number,
) {
  ctx.save();
  ctx.rotate(angle);
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 8;

  if (skin.shape === "watermelon") {
    drawWatermelon(ctx, skin, radius);
  } else if (skin.shape === "orange" || skin.shape === "lemon" || skin.shape === "lime") {
    drawCitrus(ctx, skin, radius);
  } else if (skin.shape === "kiwi") {
    drawKiwi(ctx, skin, radius);
  } else if (skin.shape === "strawberry") {
    drawStrawberry(ctx, skin, radius);
  } else {
    drawPineapple(ctx, skin, radius);
  }

  ctx.restore();
}

export function drawFruitHalf(
  ctx: CanvasRenderingContext2D,
  skin: FruitSkin,
  radius: number,
  side: -1 | 1,
) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.36)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;

  ctx.beginPath();
  if (side === -1) {
    ctx.arc(0, 0, radius, Math.PI / 2, (Math.PI * 3) / 2);
  } else {
    ctx.arc(0, 0, radius, -Math.PI / 2, Math.PI / 2);
  }
  ctx.closePath();
  ctx.fillStyle = skin.flesh;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.lineWidth = Math.max(5, radius * 0.14);
  ctx.strokeStyle = skin.peel;
  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255,255,255,0.68)";
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.88);
  ctx.lineTo(0, radius * 0.88);
  ctx.stroke();

  if (skin.shape === "watermelon" || skin.shape === "kiwi" || skin.shape === "strawberry") {
    ctx.fillStyle = skin.seed;
    for (let index = 0; index < 7; index += 1) {
      const y = -radius * 0.5 + index * radius * 0.17;
      ctx.beginPath();
      ctx.ellipse(side * radius * 0.28, y, 2.4, 5, 0.34 * side, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.strokeStyle = "rgba(255,255,255,0.36)";
    ctx.lineWidth = 1.8;
    for (let index = -2; index <= 2; index += 1) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(side * radius * 0.72, index * radius * 0.18);
      ctx.stroke();
    }
  }

  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.beginPath();
  ctx.ellipse(side * radius * 0.26, -radius * 0.28, radius * 0.13, radius * 0.23, -0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawBomb(ctx: CanvasRenderingContext2D, radius: number, angle: number) {
  ctx.save();
  ctx.rotate(angle);
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 8;

  const bodyGradient = ctx.createRadialGradient(
    -radius * 0.38,
    -radius * 0.42,
    radius * 0.08,
    0,
    0,
    radius,
  );
  bodyGradient.addColorStop(0, "#74747d");
  bodyGradient.addColorStop(0.42, "#17191d");
  bodyGradient.addColorStop(1, "#030303");

  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#d92027";
  ctx.lineWidth = Math.max(4, radius * 0.1);
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.86, -0.9, Math.PI * 1.36);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.24)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#3f3f46";
  ctx.beginPath();
  ctx.roundRect(-radius * 0.22, -radius * 1.12, radius * 0.44, radius * 0.3, 4);
  ctx.fill();

  ctx.strokeStyle = "#ffd33d";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(radius * 0.05, -radius * 1.12);
  ctx.bezierCurveTo(radius * 0.5, -radius * 1.5, radius * 0.55, -radius * 0.88, radius * 0.86, -radius * 1.22);
  ctx.stroke();

  ctx.fillStyle = "#ff3d50";
  ctx.beginPath();
  ctx.arc(radius * 0.9, -radius * 1.24, radius * 0.13, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.32)";
  ctx.beginPath();
  ctx.ellipse(-radius * 0.28, -radius * 0.3, radius * 0.16, radius * 0.28, -0.65, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawTrail(ctx: CanvasRenderingContext2D, trail: readonly TrailPoint[]) {
  if (trail.length < 2) {
    return;
  }

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let index = 1; index < trail.length; index += 1) {
    const current = trail[index]!;
    const previous = trail[index - 1]!;
    const alpha = Math.max(0, 1 - current.age / 170);
    if (alpha <= 0) {
      continue;
    }

    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "rgba(70,9,9,0.72)";
    ctx.lineWidth = 18;
    ctx.shadowColor = "rgba(255,44,44,0.8)";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 9;
    ctx.shadowColor = "rgba(255,255,255,0.9)";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();

    ctx.strokeStyle = "rgba(160,214,255,0.92)";
    ctx.lineWidth = 3.5;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y - 2);
    ctx.lineTo(current.x, current.y - 2);
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
  for (let index = 0; index < 10; index += 1) {
    const angle = (index / 10) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * size * 0.24, Math.sin(angle) * size * 0.24);
    ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
    ctx.stroke();
  }
  ctx.restore();
}
