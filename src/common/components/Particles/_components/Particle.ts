class Particle {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  effect: any;
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
  distance: number;
  friction: number;
  ease: number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(effect: any, x: number, y: number, color: string) {
    this.effect = effect;
    this.x = Math.random() * effect.width; // Initial random position
    this.y = Math.random() * effect.height;
    this.color = color;
    this.originX = x;
    this.originY = y;
    this.size = this.effect.gap;
    this.dx = 0;
    this.dy = 0;
    this.vx = 0;
    this.vy = 0;
    this.force = 1000; // Increased repulsion force
    this.angle = 0;
    this.distance = 0;
    this.friction = Math.random() * 0.6 + 0.15;
    this.ease = Math.random() * 0.2 + 0.1; // Stronger return-to-origin ease
  }

  draw() {
    this.effect.c.fillStyle = this.color;
    this.effect.c.fillRect(this.x, this.y, this.size, this.size);
  }

  update() {
    // Calculate distance between particle and mouse
    this.dx = this.effect.mouse.x - this.x;
    this.dy = this.effect.mouse.y - this.y;
    this.distance = Math.sqrt(this.dx * this.dx + this.dy * this.dy);

    // If within the force field
    if (this.distance < this.force) {
      // Calculate angle and apply repulsion
      this.angle = Math.atan2(this.dy, this.dx);
      const repulsion = (this.force - this.distance) / this.force; // Stronger effect
      this.vx += Math.cos(this.angle) * repulsion * 10; // Boost velocity
      this.vy += Math.sin(this.angle) * repulsion * 10;
    }

    // Apply velocity and friction
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;

    // Ease the particle back to its origin
    this.x += (this.originX - this.x) * this.ease;
    this.y += (this.originY - this.y) * this.ease;
  }
}

export default Particle;
