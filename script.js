const CONFIG = {
  desktopCount: 70,
  mobileCount: 45,
  minSize: 2,
  maxSize: 6,
  minSpeed: 10,
  maxSpeed: 42,
  glowMin: 0.35,
  glowMax: 1,
  directionChangeMin: 1.5,
  directionChangeMax: 4.5,
  edgePadding: 40,
};

const scene = document.getElementById("fireflies");
const fireflies = [];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let width = window.innerWidth;
let height = window.innerHeight;
let lastTime = performance.now();
let animationFrameId = 0;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function randomAngle() {
  return random(0, Math.PI * 2);
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function getFireflyCount() {
  return window.innerWidth <= 600 ? CONFIG.mobileCount : CONFIG.desktopCount;
}

class Firefly {
  constructor() {
    this.el = document.createElement("span");
    this.el.className = "firefly";

    this.reset(true);
    scene.appendChild(this.el);
  }

  reset(randomPosition = false) {
    const size = random(CONFIG.minSize, CONFIG.maxSize);
    const angle = randomAngle();
    const speed = random(CONFIG.minSpeed, CONFIG.maxSpeed);

    this.x = randomPosition ? random(0, width) : random(-CONFIG.edgePadding, width + CONFIG.edgePadding);
    this.y = randomPosition ? random(0, height) : random(-CONFIG.edgePadding, height + CONFIG.edgePadding);

    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.targetVx = this.vx;
    this.targetVy = this.vy;

    this.size = size;
    this.baseOpacity = random(CONFIG.glowMin, CONFIG.glowMax);
    this.opacity = this.baseOpacity;
    this.scale = random(0.75, 1.35);
    this.pulseSpeed = random(1.2, 3.5);
    this.pulseOffset = random(0, Math.PI * 2);
    this.wanderTimer = 0;
    this.nextDirectionChange = random(CONFIG.directionChangeMin, CONFIG.directionChangeMax);

    this.el.style.setProperty("--size", `${this.size}px`);
    this.updateStyle();
  }

  chooseNewDirection() {
    const angle = randomAngle();
    const speed = random(CONFIG.minSpeed, CONFIG.maxSpeed);

    this.targetVx = Math.cos(angle) * speed;
    this.targetVy = Math.sin(angle) * speed;
    this.nextDirectionChange = random(CONFIG.directionChangeMin, CONFIG.directionChangeMax);
    this.wanderTimer = 0;
  }

  update(deltaTime, elapsedTime) {
    this.wanderTimer += deltaTime;

    if (this.wanderTimer >= this.nextDirectionChange) {
      this.chooseNewDirection();
    }

    this.vx = lerp(this.vx, this.targetVx, 0.015);
    this.vy = lerp(this.vy, this.targetVy, 0.015);

    const waveX = Math.sin(elapsedTime * 0.0015 + this.pulseOffset) * 8;
    const waveY = Math.cos(elapsedTime * 0.0012 + this.pulseOffset) * 8;

    this.x += (this.vx + waveX) * deltaTime;
    this.y += (this.vy + waveY) * deltaTime;

    if (this.x < -CONFIG.edgePadding) this.x = width + CONFIG.edgePadding;
    if (this.x > width + CONFIG.edgePadding) this.x = -CONFIG.edgePadding;
    if (this.y < -CONFIG.edgePadding) this.y = height + CONFIG.edgePadding;
    if (this.y > height + CONFIG.edgePadding) this.y = -CONFIG.edgePadding;

    const pulse = Math.sin(elapsedTime * 0.001 * this.pulseSpeed + this.pulseOffset);
    this.opacity = this.baseOpacity * (0.65 + pulse * 0.25 + 0.25);
    this.scale = 0.85 + pulse * 0.18;

    this.updateStyle();
  }

  updateStyle() {
    this.el.style.setProperty("--x", `${this.x}px`);
    this.el.style.setProperty("--y", `${this.y}px`);
    this.el.style.setProperty("--opacity", this.opacity.toFixed(3));
    this.el.style.setProperty("--scale", this.scale.toFixed(3));
  }
}

function createFireflies() {
  const count = getFireflyCount();

  scene.querySelectorAll(".firefly").forEach((el) => el.remove());
  fireflies.length = 0;

  for (let i = 0; i < count; i += 1) {
    fireflies.push(new Firefly());
  }
}

function animate(currentTime) {
  const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.033);
  lastTime = currentTime;

  for (const firefly of fireflies) {
    firefly.update(deltaTime, currentTime);
  }

  animationFrameId = requestAnimationFrame(animate);
}

function handleResize() {
  width = window.innerWidth;
  height = window.innerHeight;
  createFireflies();
}

if (scene) {
  createFireflies();

  if (!prefersReducedMotion) {
    animationFrameId = requestAnimationFrame(animate);
  }

  window.addEventListener("resize", handleResize);
  window.addEventListener("pagehide", () => cancelAnimationFrame(animationFrameId));
}
