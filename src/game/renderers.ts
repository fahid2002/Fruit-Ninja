import type { Point } from "./geometry";

export type FruitShape =
  | "watermelon"
  | "orange"
  | "lemon"
  | "lime"
  | "kiwi"
  | "avocado"
  | "apple"
  | "banana"
  | "coconut"
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
    name: "Apple",
    shape: "apple",
    peel: "#c41420",
    peelDark: "#720913",
    flesh: "#fff7c8",
    fleshLight: "#fffde8",
    seed: "#5d3516",
    juice: "#d71924",
    accent: "#6dbd30",
    radiusMin: 38,
    radiusMax: 50,
  },
  {
    name: "Banana",
    shape: "banana",
    peel: "#ffd429",
    peelDark: "#b77b08",
    flesh: "#fff7cf",
    fleshLight: "#fffde8",
    seed: "#8d5b16",
    juice: "#f4c917",
    accent: "#6b3d13",
    radiusMin: 38,
    radiusMax: 48,
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
    peel: "#f6dc2f",
    peelDark: "#9f7906",
    flesh: "#fff59d",
    fleshLight: "#fffbd7",
    seed: "#92710b",
    juice: "#f5ca20",
    accent: "#fff16b",
    radiusMin: 35,
    radiusMax: 47,
  },
  {
    name: "Avocado",
    shape: "avocado",
    peel: "#243d1e",
    peelDark: "#0c1f0c",
    flesh: "#b9d85a",
    fleshLight: "#eef6a8",
    seed: "#8a4c25",
    juice: "#96bc37",
    accent: "#5d8526",
    radiusMin: 39,
    radiusMax: 50,
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
    name: "Coconut",
    shape: "coconut",
    peel: "#5a3516",
    peelDark: "#251306",
    flesh: "#ffffff",
    fleshLight: "#f7f2dc",
    seed: "#1e1208",
    juice: "#fff4da",
    accent: "#9b6a34",
    radiusMin: 38,
    radiusMax: 50,
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

function drawLemon(ctx: CanvasRenderingContext2D, skin: FruitSkin, radius: number) {
  ctx.save();
  ctx.scale(1.18, 0.78);
  const gradient = ctx.createRadialGradient(-radius * 0.42, -radius * 0.34, radius * 0.08, 0, 0, radius * 1.08);
  gradient.addColorStop(0, skin.fleshLight);
  gradient.addColorStop(0.2, "#ffe95d");
  gradient.addColorStop(0.72, skin.peel);
  gradient.addColorStop(1, skin.peelDark);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(-radius * 1.03, 0);
  ctx.bezierCurveTo(-radius * 0.72, -radius * 0.9, radius * 0.72, -radius * 0.9, radius * 1.03, 0);
  ctx.bezierCurveTo(radius * 0.72, radius * 0.9, -radius * 0.72, radius * 0.9, -radius * 1.03, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(115,79,4,0.35)";
  ctx.lineWidth = Math.max(2.4, radius * 0.055);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,210,0.22)";
  for (let index = 0; index < 26; index += 1) {
    const angle = (index / 26) * Math.PI * 2;
    const distanceFromCenter = radius * (0.18 + ((index * 37) % 58) / 100);
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * distanceFromCenter, Math.sin(angle) * distanceFromCenter * 0.78, radius * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  drawGloss(ctx, radius * 0.94);
}

function drawAvocado(ctx: CanvasRenderingContext2D, skin: FruitSkin, radius: number) {
  const peelGradient = ctx.createRadialGradient(-radius * 0.34, -radius * 0.42, radius * 0.08, 0, 0, radius * 1.12);
  peelGradient.addColorStop(0, "#456f2d");
  peelGradient.addColorStop(0.5, skin.peel);
  peelGradient.addColorStop(1, skin.peelDark);

  ctx.fillStyle = peelGradient;
  ctx.beginPath();
  ctx.moveTo(0, -radius * 1.08);
  ctx.bezierCurveTo(-radius * 0.72, -radius * 0.94, -radius * 1.02, -radius * 0.22, -radius * 0.82, radius * 0.44);
  ctx.bezierCurveTo(-radius * 0.58, radius * 1.12, radius * 0.58, radius * 1.12, radius * 0.82, radius * 0.44);
  ctx.bezierCurveTo(radius * 1.02, -radius * 0.22, radius * 0.72, -radius * 0.94, 0, -radius * 1.08);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(5,19,8,0.5)";
  ctx.lineWidth = Math.max(3.2, radius * 0.08);
  ctx.stroke();

  const fleshGradient = ctx.createRadialGradient(-radius * 0.26, -radius * 0.36, radius * 0.08, 0, radius * 0.08, radius * 0.78);
  fleshGradient.addColorStop(0, skin.fleshLight);
  fleshGradient.addColorStop(0.52, "#cde978");
  fleshGradient.addColorStop(1, skin.accent);
  ctx.fillStyle = fleshGradient;
  ctx.beginPath();
  ctx.ellipse(0, radius * 0.07, radius * 0.58, radius * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();

  const pitGradient = ctx.createRadialGradient(-radius * 0.16, radius * 0.12, radius * 0.04, radius * 0.03, radius * 0.24, radius * 0.32);
  pitGradient.addColorStop(0, "#c68645");
  pitGradient.addColorStop(0.58, skin.seed);
  pitGradient.addColorStop(1, "#4f2612");
  ctx.fillStyle = pitGradient;
  ctx.beginPath();
  ctx.ellipse(radius * 0.06, radius * 0.28, radius * 0.28, radius * 0.34, 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, radius * 0.07, radius * 0.58, radius * 0.72, 0, 0, Math.PI * 2);
  ctx.stroke();
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

function drawApple(ctx: CanvasRenderingContext2D, skin: FruitSkin, radius: number) {
  const gradient = ctx.createRadialGradient(-radius * 0.35, -radius * 0.42, radius * 0.08, 0, 0, radius);
  gradient.addColorStop(0, skin.fleshLight);
  gradient.addColorStop(0.24, skin.peel);
  gradient.addColorStop(0.72, skin.peel);
  gradient.addColorStop(1, skin.peelDark);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.88);
  ctx.bezierCurveTo(-radius * 0.92, -radius * 1.02, -radius * 1.1, radius * 0.16, -radius * 0.42, radius * 0.9);
  ctx.bezierCurveTo(-radius * 0.12, radius * 1.08, radius * 0.12, radius * 1.08, radius * 0.42, radius * 0.9);
  ctx.bezierCurveTo(radius * 1.1, radius * 0.16, radius * 0.92, -radius * 1.02, 0, -radius * 0.88);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.strokeStyle = "#56310f";
  ctx.lineWidth = Math.max(4, radius * 0.12);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(radius * 0.04, -radius * 0.82);
  ctx.quadraticCurveTo(radius * 0.12, -radius * 1.08, radius * 0.3, -radius * 1.2);
  ctx.stroke();
  drawLeaf(ctx, radius * 0.12, -radius * 1.08, radius * 0.25, -0.4, skin.accent);
  drawGloss(ctx, radius);
}

function drawBanana(ctx: CanvasRenderingContext2D, skin: FruitSkin, radius: number) {
  ctx.save();
  ctx.rotate(-0.55);
  ctx.scale(1.08, 0.94);

  const gradient = ctx.createLinearGradient(-radius * 1.14, -radius * 0.22, radius * 1.18, radius * 0.2);
  gradient.addColorStop(0, "#8f5407");
  gradient.addColorStop(0.12, skin.peelDark);
  gradient.addColorStop(0.25, skin.peel);
  gradient.addColorStop(0.55, skin.fleshLight);
  gradient.addColorStop(0.8, "#f6c319");
  gradient.addColorStop(1, "#7a4206");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(-radius * 1.12, radius * 0.12);
  ctx.bezierCurveTo(-radius * 0.66, radius * 0.78, radius * 0.52, radius * 0.8, radius * 1.16, -radius * 0.22);
  ctx.bezierCurveTo(radius * 0.78, -radius * 0.05, radius * 0.08, radius * 0.08, -radius * 0.78, -radius * 0.04);
  ctx.bezierCurveTo(-radius * 1, -radius * 0.08, -radius * 1.22, 0, -radius * 1.12, radius * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(96,55,6,0.72)";
  ctx.lineWidth = Math.max(2.5, radius * 0.07);
  ctx.stroke();

  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(120,71,5,0.42)";
  ctx.lineWidth = Math.max(2, radius * 0.055);
  ctx.beginPath();
  ctx.moveTo(-radius * 0.82, radius * 0.16);
  ctx.bezierCurveTo(-radius * 0.22, radius * 0.38, radius * 0.62, radius * 0.2, radius * 0.94, -radius * 0.19);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.38)";
  ctx.lineWidth = Math.max(2, radius * 0.048);
  ctx.beginPath();
  ctx.moveTo(-radius * 0.68, radius * 0.02);
  ctx.bezierCurveTo(-radius * 0.18, radius * 0.16, radius * 0.52, radius * 0.05, radius * 0.8, -radius * 0.17);
  ctx.stroke();

  ctx.fillStyle = "#5b3208";
  ctx.beginPath();
  ctx.ellipse(-radius * 1.09, radius * 0.1, radius * 0.12, radius * 0.08, -0.2, 0, Math.PI * 2);
  ctx.ellipse(radius * 1.11, -radius * 0.22, radius * 0.1, radius * 0.075, -0.45, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(120,68,5,0.24)";
  for (let index = 0; index < 6; index += 1) {
    ctx.beginPath();
    ctx.arc(randomSpeck(index, radius, "x"), randomSpeck(index, radius, "y"), radius * 0.018, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function randomSpeck(index: number, radius: number, axis: "x" | "y") {
  const values = [
    [-0.46, 0.04],
    [-0.24, 0.18],
    [0.02, 0.08],
    [0.26, 0.14],
    [0.48, -0.02],
    [0.64, -0.12],
  ];
  const value = values[index % values.length]!;
  return radius * (axis === "x" ? value[0] : value[1]);
}

function drawCoconut(ctx: CanvasRenderingContext2D, skin: FruitSkin, radius: number) {
  drawRoundFruit(ctx, skin, radius);
  ctx.strokeStyle = "rgba(37,19,6,0.42)";
  ctx.lineWidth = 2.2;
  for (let index = 0; index < 18; index += 1) {
    const angle = (index / 18) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * radius * 0.18, Math.sin(angle) * radius * 0.18);
    ctx.lineTo(Math.cos(angle + 0.3) * radius * 0.92, Math.sin(angle + 0.3) * radius * 0.92);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(0,0,0,0.42)";
  for (let index = 0; index < 3; index += 1) {
    const angle = -Math.PI / 2 + index * 0.45;
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * radius * 0.28, Math.sin(angle) * radius * 0.28, radius * 0.07, 0, Math.PI * 2);
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
  ctx.strokeStyle = "rgba(255,244,178,0.32)";
  ctx.lineWidth = 2.2;
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, radius * 0.08, radius * 0.78, radius * 0.9, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.strokeStyle = "rgba(95,56,8,0.45)";
  ctx.lineWidth = 2.1;
  for (let offset = -4; offset <= 4; offset += 1) {
    ctx.beginPath();
    ctx.moveTo(-radius * 0.9, offset * radius * 0.22 - radius * 0.2);
    ctx.lineTo(radius * 0.9, offset * radius * 0.22 + radius * 0.68);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-radius * 0.9, offset * radius * 0.22 + radius * 0.68);
    ctx.lineTo(radius * 0.9, offset * radius * 0.22 - radius * 0.2);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(255,238,111,0.35)";
  for (let row = -2; row <= 3; row += 1) {
    for (let col = -2; col <= 2; col += 1) {
      const x = col * radius * 0.25 + (row % 2) * radius * 0.11;
      const y = row * radius * 0.24 + radius * 0.08;
      ctx.beginPath();
      ctx.ellipse(x, y, radius * 0.045, radius * 0.032, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
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
  } else if (skin.shape === "apple") {
    drawApple(ctx, skin, radius);
  } else if (skin.shape === "banana") {
    drawBanana(ctx, skin, radius);
  } else if (skin.shape === "coconut") {
    drawCoconut(ctx, skin, radius);
  } else if (skin.shape === "lemon") {
    drawLemon(ctx, skin, radius);
  } else if (skin.shape === "avocado") {
    drawAvocado(ctx, skin, radius);
  } else if (skin.shape === "orange" || skin.shape === "lime") {
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
  ctx.fillStyle = skin.shape === "coconut" ? skin.fleshLight : skin.flesh;
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

  if (skin.shape === "avocado") {
    ctx.fillStyle = skin.fleshLight;
    ctx.beginPath();
    ctx.ellipse(side * radius * 0.22, 0, radius * 0.34, radius * 0.68, 0.08 * side, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = skin.seed;
    ctx.beginPath();
    ctx.ellipse(side * radius * 0.2, radius * 0.2, radius * 0.17, radius * 0.22, 0.12 * side, 0, Math.PI * 2);
    ctx.fill();
  } else if (skin.shape === "banana") {
    ctx.fillStyle = skin.flesh;
    ctx.beginPath();
    ctx.ellipse(side * radius * 0.24, 0, radius * 0.34, radius * 0.82, 0.12 * side, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = skin.peel;
    ctx.lineWidth = Math.max(4, radius * 0.1);
    ctx.stroke();
  } else if (skin.shape === "coconut") {
    ctx.fillStyle = "#2a1709";
    ctx.beginPath();
    ctx.arc(side * radius * 0.24, 0, radius * 0.38, 0, Math.PI * 2);
    ctx.fill();
  } else if (skin.shape === "watermelon" || skin.shape === "kiwi" || skin.shape === "strawberry" || skin.shape === "apple") {
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
  ctx.shadowColor = "rgba(0,0,0,0.62)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 10;

  const bodyGradient = ctx.createRadialGradient(
    -radius * 0.34,
    -radius * 0.4,
    radius * 0.06,
    0,
    0,
    radius * 1.16,
  );
  bodyGradient.addColorStop(0, "#9a9ba3");
  bodyGradient.addColorStop(0.2, "#3b3e45");
  bodyGradient.addColorStop(0.68, "#14171c");
  bodyGradient.addColorStop(1, "#020304");

  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = Math.max(2.5, radius * 0.06);
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.94, -2.78, 0.84);
  ctx.stroke();

  ctx.strokeStyle = "#e11d27";
  ctx.lineWidth = Math.max(6, radius * 0.16);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(255,31,31,0.35)";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(-radius * 0.42, -radius * 0.42);
  ctx.lineTo(radius * 0.42, radius * 0.42);
  ctx.moveTo(radius * 0.42, -radius * 0.42);
  ctx.lineTo(-radius * 0.42, radius * 0.42);
  ctx.stroke();
  ctx.shadowBlur = 0;

  const capGradient = ctx.createLinearGradient(0, -radius * 1.2, 0, -radius * 0.76);
  capGradient.addColorStop(0, "#9ca3af");
  capGradient.addColorStop(0.48, "#4b5563");
  capGradient.addColorStop(1, "#1f2937");
  ctx.fillStyle = capGradient;
  ctx.beginPath();
  ctx.roundRect(-radius * 0.27, -radius * 1.08, radius * 0.54, radius * 0.32, radius * 0.08);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = "#2b1a0d";
  ctx.lineWidth = Math.max(4, radius * 0.08);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(radius * 0.02, -radius * 1.05);
  ctx.bezierCurveTo(radius * 0.34, -radius * 1.34, radius * 0.62, -radius * 1.08, radius * 0.78, -radius * 1.32);
  ctx.stroke();

  ctx.strokeStyle = "#facc15";
  ctx.lineWidth = Math.max(1.8, radius * 0.035);
  ctx.beginPath();
  ctx.moveTo(radius * 0.03, -radius * 1.08);
  ctx.bezierCurveTo(radius * 0.34, -radius * 1.32, radius * 0.58, -radius * 1.12, radius * 0.74, -radius * 1.31);
  ctx.stroke();

  const flameX = radius * 0.8;
  const flameY = -radius * 1.34;
  const flameGradient = ctx.createRadialGradient(flameX, flameY, radius * 0.02, flameX, flameY, radius * 0.28);
  flameGradient.addColorStop(0, "#ffffff");
  flameGradient.addColorStop(0.3, "#fde047");
  flameGradient.addColorStop(0.72, "#fb6d18");
  flameGradient.addColorStop(1, "rgba(239,35,24,0.35)");

  ctx.shadowColor = "rgba(255,130,22,0.95)";
  ctx.shadowBlur = 16;
  ctx.fillStyle = flameGradient;
  ctx.beginPath();
  ctx.moveTo(flameX, flameY - radius * 0.3);
  ctx.bezierCurveTo(flameX + radius * 0.23, flameY - radius * 0.1, flameX + radius * 0.2, flameY + radius * 0.2, flameX, flameY + radius * 0.26);
  ctx.bezierCurveTo(flameX - radius * 0.2, flameY + radius * 0.08, flameX - radius * 0.14, flameY - radius * 0.14, flameX, flameY - radius * 0.3);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.28)";
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
