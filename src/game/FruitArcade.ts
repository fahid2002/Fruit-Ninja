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
  private trail: TrailPoint[] = [];
  private width = 1;
  private height = 1;
  private score = 0;
  private lives = 3;
  private nextSpawnAt = 0;
  private startedAt = performance.now();
  private lastTick = performance.now();
  private animationId: number | null = null;
  private objectId = 0;
  private gameOver = false;
  private pointerDown = false;
  private bombFlash = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: ArcadeCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas rendering is not supported.");
    }
    this.ctx = context;
    this.callbacks = callbacks;
    this.engine.gravity.y = 1;
    this.engine.gravity.scale = 0.00145;
    this.resize();
    this.bindEvents();
  }

  start() {
    if (this.animationId !== null) {
      return;
    }

    this.lastTick = performance.now();
    this.startedAt = this.lastTick;
    this.nextSpawnAt = this.lastTick + 450;
    this.animationId = requestAnimationFrame(this.tick);
  }

  reset() {
    Composite.clear(this.engine.world, false);
    this.objects = [];
    this.particles = [];
    this.halves = [];
    this.trail = [];
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.bombFlash = 0;
    this.startedAt = performance.now();
    this.nextSpawnAt = this.startedAt + 500;
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
    if (!point.visible) {
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
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  private tick = (time: number) => {
    const delta = Math.min(time - this.lastTick, 34);
    this.lastTick = time;

    this.spawnIfNeeded(time);
    Engine.update(this.engine, delta);
    this.removeExpiredObjects(time);
    this.updateEffects(delta);
    this.draw(time);

    this.animationId = requestAnimationFrame(this.tick);
  };

  private spawnIfNeeded(time: number) {
    if (this.gameOver || time < this.nextSpawnAt || this.objects.length > 8) {
      return;
    }

    const seconds = (time - this.startedAt) / 1000;
    const waveSize = Math.min(4, 1 + Math.floor(seconds / 18) + Math.floor(Math.random() * 2));
    for (let index = 0; index < waveSize; index += 1) {
      const bombChance = Math.min(0.25, 0.11 + seconds * 0.003);
      this.spawnObject(Math.random() < bombChance ? "bomb" : "fruit", index, waveSize);
    }

    this.nextSpawnAt = time + randomBetween(720, Math.max(430, 980 - seconds * 9));
  }

  private spawnObject(kind: GameKind, index: number, waveSize: number) {
    const skin = randomItem(FRUIT_SKINS);
    const radius =
      kind === "bomb" ? randomBetween(34, 45) : randomBetween(skin.radiusMin, skin.radiusMax);
    const laneWidth = this.width / (waveSize + 1);
    const laneX = laneWidth * (index + 1);
    const startX = clamp(laneX + randomBetween(-laneWidth * 0.35, laneWidth * 0.35), radius, this.width - radius);
    const startY = this.height + radius + randomBetween(10, 85);
    const body = Bodies.circle(startX, startY, radius, {
      frictionAir: 0.008,
      restitution: 0.65,
      label: kind,
    });
    const horizontalBias = (this.width * 0.5 - startX) / this.width;
    Body.setVelocity(body, {
      x: horizontalBias * randomBetween(8, 13) + randomBetween(-2.8, 2.8),
      y: -randomBetween(15, 22),
    });
    Body.setAngularVelocity(body, randomBetween(-0.16, 0.16));
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

  private removeExpiredObjects(time: number) {
    const remaining: GameObject[] = [];
    for (const object of this.objects) {
      const tooLow = object.body.position.y > this.height + object.radius * 3;
      const tooOld = time - object.bornAt > 9000;
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
    this.trail = this.trail.filter((entry) => point.t - entry.t < 280);

    if (!previous || point.t - previous.t > 150 || this.gameOver) {
      return;
    }

    const segmentLength = distance(previous, point);
    const speed = segmentLength / Math.max(point.t - previous.t, 1);
    if (segmentLength < 7 || speed < 0.11) {
      return;
    }

    for (const object of [...this.objects]) {
      if (object.sliced) {
        continue;
      }
      const center = object.body.position;
      const hitDistance = distanceToSegment(center, previous, point);
      if (hitDistance <= object.radius * 0.95) {
        this.sliceObject(object, point, speed);
      }
    }
  }

  private sliceObject(object: GameObject, point: Point, speed: number) {
    object.sliced = true;
    Composite.remove(this.engine.world, object.body);
    this.objects = this.objects.filter((entry) => entry.id !== object.id);

    if (object.kind === "bomb") {
      this.lives = Math.max(0, this.lives - 1);
      this.callbacks.onLivesChange(this.lives);
      this.bombFlash = 360;
      this.addExplosion(object.body.position.x, object.body.position.y);
      if (this.lives === 0) {
        this.gameOver = true;
        this.callbacks.onGameOver(this.score);
      }
      return;
    }

    this.score += 1;
    this.callbacks.onScoreChange(this.score);
    this.addFruitBurst(object, point, speed);
  }

  private addFruitBurst(object: GameObject, point: Point, speed: number) {
    const center = object.body.position;
    const burstVelocity = clamp(speed * 18, 4, 12);
    for (const side of [-1, 1] as const) {
      this.halves.push({
        x: center.x + side * object.radius * 0.18,
        y: center.y,
        vx: side * randomBetween(3.6, 6.4) + object.body.velocity.x * 0.4,
        vy: randomBetween(-5.8, -2.4),
        angle: object.body.angle,
        angularVelocity: side * randomBetween(0.08, 0.18),
        radius: object.radius,
        side,
        skin: object.skin,
        life: 760,
        maxLife: 760,
      });
    }

    for (let index = 0; index < 24; index += 1) {
      const angle = randomBetween(0, Math.PI * 2);
      const force = randomBetween(1.5, burstVelocity);
      this.particles.push({
        x: point.x + randomBetween(-6, 6),
        y: point.y + randomBetween(-6, 6),
        vx: Math.cos(angle) * force,
        vy: Math.sin(angle) * force - randomBetween(0, 3),
        color: index % 4 === 0 ? object.skin.fleshLight : object.skin.juice,
        life: randomBetween(360, 650),
        maxLife: 650,
        size: randomBetween(3, 8),
      });
    }
  }

  private addExplosion(x: number, y: number) {
    for (let index = 0; index < 42; index += 1) {
      const angle = randomBetween(0, Math.PI * 2);
      const force = randomBetween(3, 13);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * force,
        vy: Math.sin(angle) * force,
        color: randomItem(["#f97316", "#fde047", "#fb7185", "#ffffff"]),
        life: randomBetween(420, 900),
        maxLife: 900,
        size: randomBetween(4, 11),
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
  }

  private draw(time: number) {
    this.ctx.clearRect(0, 0, this.width, this.height);

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
      this.ctx.globalAlpha = Math.min(0.32, this.bombFlash / 900);
      this.ctx.fillStyle = "#ff2f2f";
      this.ctx.fillRect(0, 0, this.width, this.height);
      drawSpark(this.ctx, { x: this.width * 0.5, y: this.height * 0.42 }, 130, this.bombFlash / 360);
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
