'use client';

import { useEffect } from 'react';

const ROOT_ATTRIBUTE = 'data-ambient';

export function usePointerAmbience(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;
    let frame = 0;
    let settled = false;

    root.style.setProperty('--pointer-x', `${targetX}px`);
    root.style.setProperty('--pointer-y', `${targetY}px`);
    root.style.setProperty('--cursor-x', `${x}px`);
    root.style.setProperty('--cursor-y', `${y}px`);

    const tick = () => {
      x += (targetX - x) * 0.16;
      y += (targetY - y) * 0.16;

      root.style.setProperty('--cursor-x', `${x.toFixed(1)}px`);
      root.style.setProperty('--cursor-y', `${y.toFixed(1)}px`);

      if (Math.abs(targetX - x) < 0.5 && Math.abs(targetY - y) < 0.5) {
        frame = 0;
        settled = true;
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;

      targetX = event.clientX;
      targetY = event.clientY;
      root.style.setProperty('--pointer-x', `${targetX}px`);
      root.style.setProperty('--pointer-y', `${targetY}px`);
      root.setAttribute(ROOT_ATTRIBUTE, 'on');

      if (settled || frame === 0) {
        settled = false;
        frame = requestAnimationFrame(tick);
      }
    };

    const onLeave = () => root.removeAttribute(ROOT_ATTRIBUTE);

    const onOver = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const labelled = target.closest<HTMLElement>('[data-cursor-label]');
      if (labelled?.dataset.cursorLabel) {
        root.dataset.cursorState = 'label';
        root.style.setProperty('--cursor-label', `"${labelled.dataset.cursorLabel}"`);
        return;
      }

      root.style.removeProperty('--cursor-label');
      root.dataset.cursorState = target.closest('a, button, [role="button"]')
        ? 'active'
        : 'idle';
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
      root.removeAttribute(ROOT_ATTRIBUTE);
      delete root.dataset.cursorState;
      root.style.removeProperty('--cursor-label');
    };
  }, [enabled]);
}
