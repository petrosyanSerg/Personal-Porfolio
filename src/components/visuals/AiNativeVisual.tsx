import styles from './AiNativeVisual.module.scss';

/*
 * The visual identity for the AI-native section.
 *
 * Not a brain and not a glowing circuit board. What is actually being described
 * is a *workflow*: repository context feeds a model, the model proposes, the
 * proposal has to survive the same gates a human change does, and anything that
 * fails goes back round. So the drawing is a spine with a return path — the loop
 * is the point.
 *
 * Decorative: every station is labelled in the cards underneath, so this is
 * hidden from assistive technology rather than duplicating them.
 */

const STATIONS = [140, 380, 620, 860, 1100];

export function AiNativeVisual() {
  return (
    <div className={styles.band}>
      <svg
        className={styles.svg}
        viewBox="0 0 1240 240"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="ai-spine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="var(--color-accent)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--color-teal)" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id="ai-context" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-text)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--color-text)" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* the repository context that every stage reads from */}
        <g className={styles.context}>
          {Array.from({ length: 42 }, (_, i) => {
            const x = 60 + i * 27;
            const h = 12 + ((i * 37) % 5) * 8;
            return <path key={i} d={`M${x} ${58 - h}v${h}`} />;
          })}
        </g>

        <path className={styles.contextRule} d="M48 62h1150" />

        {/* the spine */}
        <path className={styles.spine} d="M140 130h960" />

        {STATIONS.map((x, i) => (
          <g key={x}>
            <path className={styles.feed} d={`M${x} 66v44`} />
            <circle cx={x} cy={130} r="19" className={styles.stationRing} />
            <circle cx={x} cy={130} r="6.5" className={styles.stationCore} />
            {i === 2 ? (
              <g className={styles.stationMark}>
                <path d={`M${x - 7} ${123}l7 7-7 7`} />
                <path d={`M${x + 3} ${137}h5`} />
              </g>
            ) : null}
          </g>
        ))}

        {/* the gate that sends work back round */}
        <path className={styles.returnPath} d="M1100 156v46H380v-46" />
        <g className={styles.returnHead}>
          <path d="M373 190l7 12 7-12" />
        </g>

        <g className={styles.gate}>
          <path d="M700 196h140" />
          <path d="M712 190l8 8-8 8" />
        </g>

        {/* signal travelling the spine */}
        <circle className={styles.pulse} cx="140" cy="130" r="4.5" />
        <circle className={styles.pulseLate} cx="140" cy="130" r="3.5" />
      </svg>
    </div>
  );
}
