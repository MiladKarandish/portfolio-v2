import Particle from "./Particle";

class Effect {
  c: CanvasRenderingContext2D;
  width: number;
  height: number;
  wordMaxWidth: number;
  textX: number;
  textY: number;
  fontSize: number;
  lineHeight: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  particles: any[];
  gap: number;
  mouse: {
    radius: number;
    x: undefined | number;
    y: undefined | number;
  };

  constructor(c: CanvasRenderingContext2D, width: number, height: number) {
    this.c = c;
    this.width = width;
    this.height = height;
    this.wordMaxWidth = this.width * 0.8;
    this.textX = this.width / 2;
    this.textY = this.height / 2;
    this.fontSize = 100;
    this.lineHeight = this.fontSize * 1;
    this.particles = [];
    this.gap = 1;
    this.mouse = {
      radius: 50,
      x: undefined,
      y: undefined,
    };
    document.addEventListener("mousemove", (e) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      (this.mouse.x = e.x), (this.mouse.y = e.y);
    });
  }

  wrapText(text: string) {
    // Canvas settings
    this.c.fillStyle = "#FFFFFF";
    this.c.textAlign = "center";
    this.c.textBaseline = "middle";
    this.c.lineWidth = 10;
    this.c.font = 'bold 100px "Caveat"';
    // this.c.font = `${this.fontSize}px ${getComputedStyle(document.body).getPropertyValue("--font-caveat")}`;
    // Break
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
    this.particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });
  }
}

export default Effect;
