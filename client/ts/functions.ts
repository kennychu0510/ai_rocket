const { floor, random, round, sqrt, sin, cos } = Math;
import { blockSize } from './force.js';
import { Game } from './game.js';

export function getDOMElement(element: string) {
  const _element = document.querySelector(element);
  if (!_element) throw new Error(`${_element} not found`);
  return _element;
}

export function degreeToRadian(degree: number) {
  return (degree * Math.PI) / 180;
}

export function genTeleportMap(n: number): Array<number> {
  if (n < 2) return [0];
  const map: number[] = [];
  // shuffle available mapping
  const sources = new Array(n).fill(0).map((_, i) => i);

  random: for (;;) {
    for (let i = 0; i < n; i++) {
      const a = floor(random() * n);
      const b = floor(random() * n);
      const t = sources[a];
      sources[a] = sources[b];
      sources[b] = t;
    }
    for (let i = 0; i < n; i++) {
      if (sources[i] === i) {
        continue random;
      }
    }
    break random;
  }

  for (let i = 0; i < n; i++) {
    map[i] = sources[i];
  }
  return map;
}

// If prob is greater, chance of true is greater
export function randomBool(prob: number): boolean {
  return random() < prob;
}

export function sigmoid(n: number) {
  return 1 / (1 + Math.exp(-n));
}

function directionToRow(degree: number) {
  const radians = degreeToRadian(degree);
  return round(cos(radians) * sqrt(2) * -2);
}

function directionToCol(degree: number) {
  const radians = degreeToRadian(degree);
  return round(sin(radians) * sqrt(2) * 2);
}

export function directionToRowCol(degree: number) {
  return [directionToRow(degree), directionToCol(degree)];
}

export function directionToNeighborCells(degree: number) {
  const neighborCells = [];
  for (let i = 0; i < 8; i++) {
    neighborCells.push(directionToRowCol(degree + 45 * i));
  }
  return neighborCells;
}

export function validRow(n: number, sign: number, boundary: number) {
  n += sign;
  if (n < 0) {
    return boundary - sign;
  } else if (n >= boundary) {
    return 0;
  } else {
    return n;
  }
}

export function validCol(n: number, sign: number, boundary: number) {
  n += sign;
  if (n < 0) {
    return boundary - sign;
  } else if (n >= boundary) {
    return 0;
  } else {
    return n;
  }
}


export function drawBlock(
  i: number,
  j: number,
  ctx: CanvasRenderingContext2D,
  c: number
) {
  ctx.fillStyle = `rgb${16 + c * 20}, ${16 + c * 20}, ${16 + c * 20}`;
  ctx.fillRect(i * blockSize, j * blockSize, blockSize, blockSize);
}
