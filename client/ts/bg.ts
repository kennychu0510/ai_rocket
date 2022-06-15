import { getDOMElement } from "./functions.js";

console.log('123')
const canvas = getDOMElement('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

export class BgStar {
  x = 0;
  y = 0;
  z = 0;
  offsetX = 0;
  offsetY = 0;
  scalesZ = 0;
  timer = 0;
  ctx: CanvasRenderingContext2D;
  constructor(ctx: CanvasRenderingContext2D,){
    this.reset()
    this.ctx = ctx;
  }
  update() {
    this.z -= 50;
    if (this.z <= 0) this.reset()
  }
  reset(){
    this.x = (Math.random() * 10000) - 5000;
    this.y = (Math.random() * 10000) - 5000;
    this.z = Math.random() * 2000;
  }
  draw(){
    this.offsetX = 100 * (this.x / this.z);
    this.offsetY = 100 * (this.y / this.z); 
    this.scalesZ = 0.0001 * (2000 - this.z);
    this.ctx.beginPath()
    this.ctx.arc(this.offsetX, this.offsetY, 1, 0, Math.PI * 2)
    this.ctx.fillStyle = 'white'
    this.ctx.fill()
  }
}
let stars:BgStar[] = []
for(let i = 0; i <100; i++) { 
  stars.push(new BgStar(ctx))
}
function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle =  'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.translate(canvas.width/2, canvas.height/2);
  for (let star of stars) {
     star.draw();
     star.update();
  }
 
}
animate();
// console.log("hello");

// let stars = []
// for (let i=0; i<100; i++) {
//   stars.push(new Star())
// }

// function animate(){
//   requestAnimationFrame(animate);
//   ctx.clearRect(0, 0, canvas.width, canvas.height)
//   ctx.fillStyle = 'black'
//   ctx.fillRect(0, 0, canvas.width, canvas.height)
//   ctx.translate(canvas.width/2, canvas.height/2)
//   for (let star of stars) {
//     // star.drawShadow()
//     star.draw() 
//     star.update()
//   }
//   ctx.translate(-canvas.width/2, -canvas.height/2)
// }
// animate()