const { floor, random } = Math;
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
