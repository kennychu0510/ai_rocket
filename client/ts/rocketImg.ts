import { RocketColor } from './type';

const R = 0;
const G = 1;
const B = 2;
const A = 3;

export class UserRocketImg {
  image = new Image();
  constructor() {
    // Do Nothing
  }
  setSrc(src: string, size: { width: number; height: number }) {
    this.image.src = src;
  }
  updateImgData() {
    // Do Nothing
  }
}
export class RocketImg extends UserRocketImg {
  imageData: ImageData;
  canvas = document.createElement('canvas');
  ctx = this.canvas.getContext('2d')!;
  image = new Image();
  constructor(private color: RocketColor) {
    super();
    this.canvas.width = 1;
    this.canvas.height = 1;
    this.imageData = this.ctx.getImageData(0, 0, 1, 1);
  }

  setSrc(src: string, size: { width: number; height: number }) {
    this.canvas.width = size.width;
    this.canvas.height = size.height;
    const image = new Image();
    image.onload = () => {
      this.onload(image);
    };

    image.src = src;
  }

  onload(image: HTMLImageElement) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);
    this.ctx.drawImage(image, 0, 0, w, h);
    this.imageData = this.ctx.getImageData(0, 0, w, h);
    this.updateImgData();
    // this.ctx.putImageData(this.imageData, 0, 0);
  }

  updateImgData() {
    for (let i = 0; i < this.imageData.data.length; i += 4) {
      const a = this.imageData.data[i + A];
      if (a != 0) {
        this.imageData.data[i + R] = this.color[0];
        this.imageData.data[i + G] = this.color[1];
        this.imageData.data[i + B] = this.color[2];
        // imageData.data[i + A] = randomA;
      }
    }
    this.ctx.putImageData(this.imageData, 0, 0);
    const src = this.canvas.toDataURL();
    this.image.src = src;
  }
}
