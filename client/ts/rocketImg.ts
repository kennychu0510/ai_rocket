import { RocketColor } from './type';

export class RocketImg {
  image = new Image();
  imageData: ImageData;
  canvas = document.createElement('canvas');
  ctx = this.canvas.getContext('2d')!;
  private color: RocketColor;
  constructor(private src: string) {
    this.canvas.width = 1;
    this.canvas.height = 1;
    this.imageData = this.ctx.getImageData(0, 0, 1, 1);
    this.image.onload = () => {
      this.onload();
    };
    this.image.src = src;
    this.color = {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
    };
  }

  onload() {
    const w = this.image.width;
    const h = this.image.height;
    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx.drawImage(this.image, 0, 0, w, h);
    this.imageData = this.ctx.getImageData(0, 0, w, h);
    let i = 0;
    const R = 0;
    const G = 1;
    const B = 2;
    const A = 3;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const a = this.imageData.data[i + A];
        if (a != 0) {
          this.imageData.data[i + R] = this.color.r;
          this.imageData.data[i + G] = this.color.g;
          this.imageData.data[i + B] = this.color.b;
          // imageData.data[i + A] = randomA;
        }
        i += 4;
      }
    }
    // this.ctx.putImageData(this.imageData, 0, 0);
  }
}
