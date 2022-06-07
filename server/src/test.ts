type Position = {
  x: number;
  y: number;
};

const coordinates: Position[] = [
  { x: 123, y: 456 },
  { x: 521, y: 12 },
  { x: 323, y: 425 },
];

const canvasWidth = 1296;
const canvasHeight = 562;

console.log(coordinates);

const coordinatesPercentage = coordinates.map((coor) => {
  coor.x = coor.x / canvasWidth;
  coor.y = coor.y / canvasHeight;
  return coor;
});

console.log(coordinatesPercentage);
