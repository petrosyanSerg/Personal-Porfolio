'use client';

/**
 * The bridge between WebGL and the DOM. The scene projects node positions once
 * per frame and writes them straight onto registered elements as custom
 * properties — the labels are real HTML (selectable, translatable, focusable)
 * without a React render per frame.
 */
export type ProjectedPoint = {
  readonly x: number;
  readonly y: number;
  readonly depth: number;
  readonly visible: boolean;
  /** The label would run off the right edge, so it hangs to the left instead. */
  readonly flip: boolean;
};

const anchors = new Map<string, HTMLElement>();

export function registerAnchor(id: string, element: HTMLElement | null): void {
  if (element) anchors.set(id, element);
  else anchors.delete(id);
}

export function publishAnchor(id: string, point: ProjectedPoint): void {
  const element = anchors.get(id);
  if (!element) return;

  element.style.setProperty('--px', `${point.x.toFixed(1)}px`);
  element.style.setProperty('--py', `${point.y.toFixed(1)}px`);
  element.style.setProperty('--depth', point.depth.toFixed(3));

  const shown = point.visible ? '1' : '0';
  if (element.dataset.projected !== shown) element.dataset.projected = shown;

  const flip = point.flip ? '1' : '0';
  if (element.dataset.flip !== flip) element.dataset.flip = flip;
}

export function clearAnchors(): void {
  anchors.forEach((element) => {
    element.dataset.projected = '0';
  });
}
