import Matter from "matter-js";
import type { HandPoint } from "../hooks/useHandTracker";
import { clamp, distance, distanceToSegment, randomBetween, randomItem, type Point } from "./geometry";
import {
  FRUIT_SKINS,
  drawBomb,
  drawFruit,
  drawFruitHalf,
  drawSpark,
  drawTrail,
  type FruitSkin,
} from "./renderers";

const { Body, Bodies, Composite, Engine } = Matter;
const NO_COLLISION_CATEGORY = 0x0002;

type GameKind = "fruit" | "bomb";

type GameObject = {
  id: number;
  kind: GameKind;
  body: Matter.Body;
  radius: number;
  skin: FruitSkin;
  sliced: boolean;
  bornAt: number;
};

type QueuedSpawn = {
  kind: GameKind;
  laneIndex: number;
  laneCount: number;
};

type TrailPoint = Point & {
  t: number;
};

type Particle = Point & {
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
};

type FruitHalf = Point & {
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  radius: number;
  side: -1 | 1;
  skin: FruitSkin;
  life: number;
  maxLife: number;
};

type SplatBlobPoint = {
  angle: number;
  radius: number;
};

type SplatDrop = {
  x: number;
  y: number;
  rx: number;
  ry: number;
  angle: number;
  accent: boolean;
};

type SplatStreak = {
  x: number;
  y: number;
  length: number;
  width: number;
  angle: number;
};

type JuiceSplat = Point & {
  color: string;
  accent: string;
  angle: number;
  scale: number;
  life: number;
  maxLife: number;
  blob: SplatBlobPoint[];
  drops: SplatDrop[];
  streaks: SplatStreak[];
};

type ArcadeCallbacks = {
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  onGameOver: (score: number) => void;
};

export class FruitArcade {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly engine = Engine.create();
  private readonly callbacks: ArcadeCallbacks;
  private objects: GameObject[] = [];
  private particles: Particle[] = [];
  private halves: FruitHalf[] = [];
  private splats: JuiceSplat[] = [];
  private trail: TrailPoint[] = [];
  private spawnQueue: QueuedSpawn[] = [];
  private width = 1;
  private height = 1;
  private score = 0;
  private lives = 3;
  private nextSpawnAt = 0;
  private nextWaveAt = 0;
  private startedAt = performance.now();
  private lastTick = performance.now();
  private animationId: number | null = null;
  private objectId = 0;
  private nextBombScore = 10;
  private gameOver = false;
  private playing = false;
  private pointerDown = false;
  private bombFlash = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: ArcadeCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      throw new Error("Canvas rendering is not supported.");
    }
    this.ctx = context;
    this.callbacks = callbacks;
    this.engine.gravity.y = 1;
    this.engine.gravity.scale = 0.00124;
    this.resize();
    this.bindEvents();
  }

  start() {
    if (this.animationId !== null) {
      return;
    }

    this.lastTick = performance.now();
    this.startedAt = this.lastTick;
    this.nextSpawnAt = this.lastTick + 420;
    this.nextWaveAt = this.lastTick + 420;
    this.animationId = requestAnimationFrame(this.tick);
  }

  startRound() {
    this.reset();
    this.playing = true;
  }

  reset() {
    Composite.clear(this.engine.world, false);
    this.objects = [];
    this.particles = [];
    this.halves = [];
    this.splats = [];
    this.trail = [];
    this.spawnQueue = [];
    this.score = 0;
    this.lives = 3;
    this.nextBombScore = 10;
    this.gameOver = false;
    this.playing = false;
    this.bombFlash = 0;
    this.startedAt = performance.now();
    this.nextSpawnAt = this.startedAt + 720;
    this.nextWaveAt = this.startedAt + 720;
    this.callbacks.onScoreChange(this.score);
    this.callbacks.onLivesChange(this.lives);
  }

  destroy() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    window.removeEventListener("resize", this.resize);
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    this.canvas.removeEventListener("pointermove", this.handlePointerMove);
    this.canvas.removeEventListener("pointerup", this.handlePointerUp);
    this.canvas.removeEventListener("pointercancel", this.handlePointerUp);
    Composite.clear(this.engine.world, false);
  }

  setHandPoint(point: HandPoint) {
    if (!this.playing || !point.visible || point.confidence < 0.42) {
      return;
    }

    this.addSlicePoint({
      x: clamp(point.x, 0, this.width),
      y: clamp(point.y, 0, this.height),
      t: point.time,
    });
  }

  private bindEvents() {
    window.addEventListener("resize", this.resize);
    this.canvas.addEventListener("pointerdown", this.handlePointerDown);
    this.canvas.addEventListener("pointermove", this.handlePointerMove);
    this.canvas.addEventListener("pointerup", this.handlePointerUp);
    this.canvas.addEventListener("pointercancel", this.handlePointerUp);
  }

  private resize = () => {
    const bounds = this.canvas.getBoundingClientRect();
    this.width = Math.max(320, bounds.width || window.innerWidth);
    this.height = Math.max(420, bounds.height || window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  private tick = (time: number) => {
    const delta = Math.min(time - this.lastTick, 16.66);
    this.lastTick = time;

    this.spawnIfNeeded(time);
    Engine.update(this.engine, delta);
    this.keepObjectsInView();
    this.removeExpiredObjects(time);
    this.updateEffects(delta);
    this.draw(time);

    this.animationId = requestAnimationFrame(this.tick);
  };

  private spawnIfNeeded(time: number) {
    if (!this.playing || this.gameOver) {
      return;
    }

    if (this.spawnQueue.length > 0) {
      if (time < this.nextSpawnAt) {
        return;
      }
      const nextSpawn = this.spawnQueue.shift()!;
      this.spawnObject(nextSpawn.kind, nextSpawn.laneIndex, nextSpawn.laneCount);
      this.nextSpawnAt = time + randomBetween(170, 285);
      return;
    }

    const maxObjects = Math.min(this.width < 620 ? 5 : 7, 3 + Math.floor(this.score / 12));
    if (time < this.nextWaveAt || this.objects.length >= maxObjects) {
      return;
    }

    const level = Math.floor(this.score / 10);
    const maxWaveSize = this.width < 620 ? 3 : 5;
    const baseWaveSize = 1 + Math.floor(level / 2);
    const waveSize = clamp(baseWaveSize + (Math.random() < 0.35 + level * 0.025 ? 1 : 0), 1, maxWaveSize);
    const bombDue = this.score >= this.nextBombScore && !this.hasPendingBomb();
    const extraBombChance = this.score >= 15 ? Math.min(0.3, 0.055 + level * 0.026) : 0;
    const includeBomb = bombDue || (!this.hasPendingBomb() && Math.random() < extraBombChance);
    const bombSlot = includeBomb ? Math.floor(randomBetween(0, waveSize)) : -1;

    if (bombDue) {
      this.nextBombScore += 10;
    }

    this.spawnQueue = Array.from({ length: waveSize }, (_, index) => {
      return {
        kind: index === bombSlot ? "bomb" : "fruit",
        laneIndex: index,
        laneCount: waveSize,
      };
    });
    this.nextSpawnAt = time;
    this.nextWaveAt = time + randomBetween(Math.max(720, 1500 - level * 80), Math.max(1000, 2200 - level * 95));
  }

  private spawnObject(kind: GameKind, index: number, waveSize: number) {
    const skin = randomItem(FRUIT_SKINS);
    const scale = clamp(this.width / 980, 0.72, 1.05);
    const radius =
      (kind === "bomb" ? randomBetween(40, 48) : randomBetween(skin.radiusMin, skin.radiusMax) * 1.1) *
      scale;
    const laneWidth = this.width / (waveSize + 1);
    const mirroredIndex = Math.random() < 0.5 ? index : waveSize - index - 1;
    const laneX = laneWidth * (mirroredIndex + 1);
    const startX = clamp(laneX + randomBetween(-laneWidth * 0.1, laneWidth * 0.1), radius, this.width - radius);
    const startY = this.height + radius + randomBetween(0, 30);
    const body = Bodies.circle(startX, startY, radius, {
      collisionFilter: {
        category: NO_COLLISION_CATEGORY,
        mask: 0,
      },
      frictionAir: 0.0065,
      isSensor: true,
      label: kind,
      restitution: 0,
    });

    const level = Math.floor(this.score / 10);
    const highArc = kind === "fruit" && Math.random() < Math.min(0.7, 0.38 + level * 0.03);
    const launchAngle = (randomBetween(highArc ? 80 : 70, highArc ? 100 : 110) * Math.PI) / 180;
    const speed =
      (kind === "bomb"
        ? randomBetween(19.2, 22.4)
        : randomBetween(highArc ? 23.4 : 20.4, highArc ? 27.8 : 24.1)) *
      clamp(this.height / 760, 0.94, 1.08);
    const horizontalDirection = startX < this.width * 0.5 ? 1 : -1;
    Body.setVelocity(body, {
      x: Math.cos(launchAngle) * speed * horizontalDirection + randomBetween(-1.2, 1.2),
      y: -Math.sin(launchAngle) * speed,
    });
    Body.setAngularVelocity(body, randomBetween(-0.15, 0.15));
    Composite.add(this.engine.world, body);
    this.objects.push({
      id: this.objectId,
      kind,
      body,
      radius,
      skin,
      sliced: false,
      bornAt: performance.now(),
    });
    this.objectId += 1;
  }

  private keepObjectsInView() {
    for (const object of this.objects) {
      const { x, y } = object.body.position;
      const minimumY = object.radius * 1.04;
      if (y < minimumY && object.body.velocity.y < 0) {
        Body.setPosition(object.body, { x, y: minimumY });
        Body.setVelocity(object.body, {
          x: object.body.velocity.x,
          y: Math.abs(object.body.velocity.y) * 0.34 + 0.7,
        });
      }
    }
  }

  private hasPendingBomb() {
    return (
      this.objects.some((object) => object.kind === "bomb" && !object.sliced) ||
      this.spawnQueue.some((spawn) => spawn.kind === "bomb")
    );
  }

  private removeExpiredObjects(time: number) {
    const remaining: GameObject[] = [];
    for (const object of this.objects) {
      const tooLow = object.body.position.y > this.height + object.radius * 3;
      const tooOld = time - object.bornAt > 8200;
      if (object.sliced || tooLow || tooOld) {
        Composite.remove(this.engine.world, object.body);
      } else {
        remaining.push(object);
      }
    }
    this.objects = remaining;
  }

  private addSlicePoint(point: TrailPoint) {
    const previous = this.trail[this.trail.length - 1];
    this.trail.push(point);
    this.trail = this.trail.filter((entry) => point.t - entry.t < 190);

    if (!this.playing || !previous || point.t - previous.t > 120 || this.gameOver) {
      return;
    }

    const segmentLength = distance(previous, point);
    const speed = segmentLength / Math.max(point.t - previous.t, 1);
    if (segmentLength < 4 || speed < 0.045) {
      return;
    }

    for (const object of [...this.objects]) {
      if (object.sliced) {
        continue;
      }
      const center = object.body.position;
      const hitDistance = distanceToSegment(center, previous, point);
      if (hitDistance <= object.radius * 1.04) {
        this.sliceObject(object, point, speed, previous);
      }
    }
  }

  private sliceObject(object: GameObject, point: Point, speed: number, previous: Point) {
    object.sliced = true;
    Composite.remove(this.engine.world, object.body);
    this.objects = this.objects.filter((entry) => entry.id !== object.id);

    if (object.kind === "bomb") {
      this.lives = Math.max(0, this.lives - 1);
      this.callbacks.onLivesChange(this.lives);
      this.bombFlash = 380;
      this.addExplosion(object.body.position.x, object.body.position.y);
      if (this.lives === 0) {
        this.gameOver = true;
        this.playing = false;
        this.callbacks.onGameOver(this.score);
      }
      return;
    }

    this.score += 1;
    this.callbacks.onScoreChange(this.score);
    this.addFruitBurst(object, point, previous, speed);
  }

  private addFruitBurst(object: GameObject, point: Point, previous: Point, speed: number) {
    const center = object.body.position;
    const cutAngle = Math.atan2(point.y - previous.y, point.x - previous.x);
    const normalAngle = cutAngle + Math.PI / 2;
    const burstVelocity = clamp(speed * 18, 4.5, 13);

    for (const side of [-1, 1] as const) {
      this.halves.push({
        x: center.x + Math.cos(normalAngle) * side * object.radius * 0.24,
        y: center.y + Math.sin(normalAngle) * side * object.radius * 0.24,
        vx: object.body.velocity.x * 0.35 + Math.cos(normalAngle) * side * randomBetween(3.6, 6.6),
        vy: object.body.velocity.y * 0.1 + Math.sin(normalAngle) * side * randomBetween(1.6, 4.8) - randomBetween(2.2, 4.7),
        angle: cutAngle - Math.PI / 2 + side * 0.08,
        angularVelocity: side * randomBetween(0.1, 0.2),
        radius: object.radius,
        side,
        skin: object.skin,
        life: 980,
        maxLife: 980,
      });
    }

    this.addJuiceSplat(point.x, point.y, object.skin, cutAngle, burstVelocity);
    this.addJuiceSplat(
      center.x + Math.cos(cutAngle) * object.radius * 0.18,
      center.y + Math.sin(cutAngle) * object.radius * 0.18,
      object.skin,
      cutAngle + randomBetween(-0.35, 0.35),
      burstVelocity * 0.8,
    );

    for (let index = 0; index < 42; index += 1) {
      const angle = cutAngle + randomBetween(-1.45, 1.45);
      const force = randomBetween(1.4, burstVelocity);
      this.particles.push({
        x: point.x + randomBetween(-10, 10),
        y: point.y + randomBetween(-10, 10),
        vx: Math.cos(angle) * force + randomBetween(-2, 2),
        vy: Math.sin(angle) * force - randomBetween(0, 4),
        color: index % 5 === 0 ? object.skin.fleshLight : object.skin.juice,
        life: randomBetween(420, 820),
        maxLife: 820,
        size: randomBetween(3, 9),
      });
    }
  }

  private addJuiceSplat(x: number, y: number, skin: FruitSkin, angle: number, burst: number) {
    const blob: SplatBlobPoint[] = [];
    const blobPoints = Math.floor(randomBetween(9, 14));
    for (let index = 0; index < blobPoints; index += 1) {
      blob.push({
        angle: (index / blobPoints) * Math.PI * 2,
        radius: randomBetween(13, 34) * clamp(burst / 9, 0.72, 1.35),
      });
    }

    const drops: SplatDrop[] = [];
    const dropCount = Math.floor(randomBetween(9, 17));
    for (let index = 0; index < dropCount; index += 1) {
      const dropAngle = randomBetween(0, Math.PI * 2);
      const distanceFromCenter = randomBetween(14, 82) * clamp(burst / 9, 0.72, 1.32);
      drops.push({
        x: Math.cos(dropAngle) * distanceFromCenter,
        y: Math.sin(dropAngle) * distanceFromCenter,
        rx: randomBetween(2.5, 9),
        ry: randomBetween(4, 17),
        angle: dropAngle + randomBetween(-0.6, 0.6),
        accent: Math.random() > 0.82,
      });
    }

    const streaks: SplatStreak[] = [];
    for (let index = 0; index < 6; index += 1) {
      const streakAngle = angle + randomBetween(-0.62, 0.62) + (index % 2 === 0 ? 0 : Math.PI);
      streaks.push({
        x: randomBetween(-8, 8),
        y: randomBetween(-8, 8),
        length: randomBetween(34, 104) * clamp(burst / 9, 0.78, 1.42),
        width: randomBetween(3, 8),
        angle: streakAngle,
      });
    }

    this.splats.push({
      x,
      y,
      color: skin.juice,
      accent: skin.fleshLight,
      angle,
      scale: randomBetween(0.82, 1.18),
      life: 2000,
      maxLife: 2000,
      blob,
      drops,
      streaks,
    });

    if (this.splats.length > 28) {
      this.splats.splice(0, this.splats.length - 28);
    }
  }

  private addExplosion(x: number, y: number) {
    for (let index = 0; index < 48; index += 1) {
      const angle = randomBetween(0, Math.PI * 2);
      const force = randomBetween(3, 14);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * force,
        vy: Math.sin(angle) * force,
        color: randomItem(["#f97316", "#fde047", "#fb7185", "#ffffff"]),
        life: randomBetween(420, 900),
        maxLife: 900,
        size: randomBetween(4, 12),
      });
    }
  }

  private updateEffects(delta: number) {
    const step = delta / 16.67;
    this.bombFlash = Math.max(0, this.bombFlash - delta);
    this.particles = this.particles
      .map((particle) => ({
        ...particle,
        x: particle.x + particle.vx * step,
        y: particle.y + particle.vy * step,
        vy: particle.vy + 0.28 * step,
        life: particle.life - delta,
      }))
      .filter((particle) => particle.life > 0);
    if (this.particles.length > 440) {
      this.particles.splice(0, this.particles.length - 440);
    }

    this.halves = this.halves
      .map((half) => ({
        ...half,
        x: half.x + half.vx * step,
        y: half.y + half.vy * step,
        vy: half.vy + 0.34 * step,
        angle: half.angle + half.angularVelocity * step,
        life: half.life - delta,
      }))
      .filter((half) => half.life > 0);

    this.splats = this.splats
      .map((splat) => ({
        ...splat,
        life: splat.life - delta,
      }))
      .filter((splat) => splat.life > 0);
  }

  private draw(time: number) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.drawSplatters();
    this.drawObjects();
    this.drawHalves();
    this.drawParticles();
    drawTrail(
      this.ctx,
      this.trail.map((point) => ({
        x: point.x,
        y: point.y,
        age: time - point.t,
      })),
    );

    if (this.bombFlash > 0) {
      this.ctx.save();
      this.ctx.globalAlpha = Math.min(0.36, this.bombFlash / 920);
      this.ctx.fillStyle = "#ff2f2f";
      this.ctx.fillRect(0, 0, this.width, this.height);
      drawSpark(this.ctx, { x: this.width * 0.5, y: this.height * 0.42 }, 130, this.bombFlash / 380);
      this.ctx.restore();
    }
  }

  private drawSplatters() {
    for (const splat of this.splats) {
      const fadeProgress = clamp(splat.life / splat.maxLife, 0, 1);
      const alpha = 0.84 * Math.pow(fadeProgress, 0.78);
      this.ctx.save();
      this.ctx.translate(splat.x, splat.y);
      this.ctx.rotate(splat.angle);
      this.ctx.scale(splat.scale, splat.scale);
      this.ctx.globalAlpha = alpha;

      this.ctx.fillStyle = splat.color;
      this.ctx.beginPath();
      splat.blob.forEach((point, index) => {
        const x = Math.cos(point.angle) * point.radius;
        const y = Math.sin(point.angle) * point.radius;
        if (index === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      });
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.lineCap = "round";
      this.ctx.strokeStyle = splat.color;
      for (const streak of splat.streaks) {
        this.ctx.lineWidth = streak.width;
        this.ctx.beginPath();
        this.ctx.moveTo(streak.x, streak.y);
        this.ctx.lineTo(
          streak.x + Math.cos(streak.angle) * streak.length,
          streak.y + Math.sin(streak.angle) * streak.length,
        );
        this.ctx.stroke();
      }

      for (const drop of splat.drops) {
        this.ctx.fillStyle = drop.accent ? splat.accent : splat.color;
        this.ctx.beginPath();
        this.ctx.ellipse(drop.x, drop.y, drop.rx, drop.ry, drop.angle, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }
  }

  private drawObjects() {
    for (const object of this.objects) {
      const { x, y } = object.body.position;
      this.ctx.save();
      this.ctx.translate(x, y);
      if (object.kind === "bomb") {
        drawBomb(this.ctx, object.radius, object.body.angle);
      } else {
        drawFruit(this.ctx, object.skin, object.radius, object.body.angle);
      }
      this.ctx.restore();
    }
  }

  private drawHalves() {
    for (const half of this.halves) {
      this.ctx.save();
      this.ctx.globalAlpha = clamp(half.life / half.maxLife, 0, 1);
      this.ctx.translate(half.x, half.y);
      this.ctx.rotate(half.angle);
      drawFruitHalf(this.ctx, half.skin, half.radius, half.side);
      this.ctx.restore();
    }
  }

  private drawParticles() {
    for (const particle of this.particles) {
      const alpha = clamp(particle.life / particle.maxLife, 0, 1);
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  private handlePointerDown = (event: PointerEvent) => {
    this.pointerDown = true;
    this.canvas.setPointerCapture(event.pointerId);
    this.addPointerPoint(event);
  };

  private handlePointerMove = (event: PointerEvent) => {
    if (this.pointerDown) {
      this.addPointerPoint(event);
    }
  };

  private handlePointerUp = (event: PointerEvent) => {
    this.pointerDown = false;
    if (this.canvas.hasPointerCapture(event.pointerId)) {
      this.canvas.releasePointerCapture(event.pointerId);
    }
  };

  private addPointerPoint(event: PointerEvent) {
    const bounds = this.canvas.getBoundingClientRect();
    this.addSlicePoint({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      t: performance.now(),
    });
  }
}
