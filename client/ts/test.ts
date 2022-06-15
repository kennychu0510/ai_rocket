function degreeToRadian(degree: number) {
  return (degree * Math.PI) / 180;
}

export const name = 1;

const { sin, cos, sqrt, round } = Math;

function directionToRow(degree: number) {
  const radians = degreeToRadian(degree);
  return round(cos(radians) * sqrt(2) * -2);
}

function directionToCol(degree: number) {
  const radians = degreeToRadian(degree);
  return round(sin(radians) * sqrt(2) * 2);
}

function directionToRowCol(degree: number) {
  return [directionToRow(degree), directionToCol(degree)];
}

// console.log(directionToRow(0));
// console.log(directionToRow(45));
// console.log(directionToRow(90));
// console.log(directionToRow(135));
// console.log(directionToRow(180));
// console.log(directionToRow(225));
// console.log(directionToRow(270));
// console.log(directionToRow(315));
// console.log('............');
// console.log(directionToCol(0));
// console.log(directionToCol(45));
// console.log(directionToCol(90));
// console.log(directionToCol(135));
// console.log(directionToCol(180));
// console.log(directionToCol(225));
// console.log(directionToCol(270));
// console.log(directionToCol(315));
// console.log('............');
// console.log(directionToRowCol(45));
// console.log(directionToRowCol(360+45));

// RETURNS NEIGHBOR CELLS IN CLOCKWISE DIRECTION STARTING FROM FORWARD
function directionToNeighborCells(degree: number) {
  const neighborForces = [];
  for (let i = 0; i < 8; i++) {
    neighborForces.push(directionToRowCol(degree + 45 * i));
  }
  return neighborForces;
}

console.log(directionToNeighborCells(45));
