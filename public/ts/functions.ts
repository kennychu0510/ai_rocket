export function getDOMElement(element: string) {
  const _element = document.querySelector(element);
  if (!_element) throw new Error(`${_element} not found`);
  return _element;
}

export function degreeToRadian(degree: number) {
  return degree * Math.PI / 180;
}
