import Particle from "./Particle";

interface ParticleEffectOptions {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  fontSize?: number;
  gap?: number;
}

class Effect {
  canvas: HTMLCanvasElement;
  c: CanvasRenderingContext2D;
  width: number;
  height: number;
  wordMaxWidth: number;
  textX: number;
  textY: number;
  fontSize: number;
  lineHeight: number;
  particles: Particle[];
  gap: number;
  mouse: {
    radius: number;
    x: undefined | number;
    y: undefined | number;
  };

  constructor({ canvas, context, width, height, fontSize = 50, gap = 1 }: ParticleEffectOptions) {
    this.canvas = canvas;
    this.c = context;
    this.width = width;
    this.height = height;
    this.wordMaxWidth = this.width * 0.8;
    this.textX = this.width / 2;
    this.textY = this.height / 2;
    this.fontSize = fontSize;
    this.lineHeight = this.fontSize * 1;
    this.particles = [];
    this.gap = gap;
    this.mouse = {
      radius: 100,
      x: undefined,
      y: undefined,
    };
    this.initEventListeners();
  }

  private initEventListeners() {
    const handlePointerMove = (e: PointerEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      e.preventDefault();
    };

    const handlePointerUp = () => {
      this.mouse.x = undefined;
      this.mouse.y = undefined;
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerdown", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointerleave", handlePointerUp);
  }

  wrapText(text: string) {
    // Canvas settings
    this.c.fillStyle = "#FFFFFF";
    this.c.textAlign = "center";
    this.c.textBaseline = "middle";
    this.c.lineWidth = 10;
    this.c.font = `600 ${this.fontSize}px ${
      getComputedStyle(document.body).getPropertyValue("--font-geist-sans").split(",")[0]
    }`;
    const lines = [];
    let lineCount = 0;
    let line = "";
    const words = text.split(" ");

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";

      if (this.c.measureText(testLine).width > this.wordMaxWidth) {
        line = words[i] + " ";
        lineCount++;
      } else {
        line = testLine;
      }

      lines[lineCount] = line;
    }

    const textHeight = this.lineHeight * lineCount;
    this.textY = this.height / 2 - textHeight / 2;

    lines.forEach((line, index) => {
      this.c.fillText(line, this.textX, this.textY + index * this.lineHeight);
    });

    this.toPatricles();
  }

  toPatricles() {
    this.particles = [];
    const pixels = this.c.getImageData(0, 0, this.width, this.height).data;
    this.c.clearRect(0, 0, this.width, this.height);

    for (let y = 0; y < this.height; y = y + this.gap) {
      for (let x = 0; x < this.width; x = x + this.gap) {
        const index = (y * this.width + x) * 4;
        const alpha = pixels[index + 3];
        if (alpha > 0) {
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          const color = `rgba(${red}, ${green}, ${blue})`;

          this.particles.push(new Particle(this, x, y, color));
        }
      }
    }

    this.render();
  }

  render() {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].update();
      this.particles[i].draw();
    }
  }
}

export default Effect;
