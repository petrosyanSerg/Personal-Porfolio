'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

type BoundaryProps = {
  readonly onFail: () => void;
  readonly children: ReactNode;
};

type BoundaryState = { readonly failed: boolean };

/**
 * WebGL is an enhancement and is treated like one. A driver crash, a lost
 * context or a broken scene takes the canvas down and leaves the portfolio —
 * copy, links, exploration rail and all — completely intact.
 */
export class WorldBoundary extends Component<BoundaryProps, BoundaryState> {
  override state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.warn('[world] the 3D layer failed and was dropped', error, info);
    this.props.onFail();
  }

  override render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}
