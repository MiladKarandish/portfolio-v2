import Effect from "./Effect";

class Particle {
  effect: Effect;
  x: number;
  y: number;
  color: string;
  originX: number;
  originY: number;
  size: number;
  dx: number;
  dy: number;
  vx: number;
  vy: number;
  force: number;
  angle: number;
  friction: number;
  ease: number;
  repelDistance: number;

  constructor(effect: Effect, x: number, y: number, color: string) {
    this.effect = effect;
    this.x = Math.random() * effect.width;
    this.y = Math.random() * effect.height;
    this.color = color;
    this.originX = x;
    this.originY = y;
    this.size = this.effect.gap;
    this.dx = 0;
    this.dy = 0;
    this.vx = 0;
    this.vy = 0;
    this.force = 10;
    this.angle = 0;
    this.friction = Math.random() * 0.6 + 0.15;
    this.ease = Math.random() * 0.1 + 0.05;
    this.repelDistance = 100;
  }

  draw() {
    this.effect.c.fillStyle = this.color;
    this.effect.c.fillRect(this.x, this.y, this.size, this.size);
  }

  update() {
    if (this.effect.mouse.x !== undefined && this.effect.mouse.y !== undefined) {
      this.handleMouseInteraction();
    }

    this.applyPhysics();

    // Ease back to origin
    this.applyEase();
  }

  private handleMouseInteraction() {
    const dx = this.effect.mouse.x! - this.x;
    const dy = this.effect.mouse.y! - this.y;
    const distanceSquared = dx * dx + dy * dy;
    const repelRadiusSquared = this.repelDistance ** 2;

    if (distanceSquared < repelRadiusSquared) {
      const distance = Math.sqrt(distanceSquared);
      const angle = Math.atan2(dy, dx);
      const force = ((this.repelDistance - distance) / this.repelDistance) * this.force;

      this.vx += Math.cos(angle) * force;
      this.vy += Math.sin(angle) * force;
    }
  }

  private applyPhysics() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;
  }

  private applyEase() {
    this.x += (this.originX - this.x) * this.ease;
    this.y += (this.originY - this.y) * this.ease;
  }
}

export default Particle;
