import "./RiskGauge.css";

/**
 * Signature element: a semicircular dial from 0-100 with a needle,
 * colored across the risk spectrum (green -> amber -> red).
 * This is the visual anchor for every risk score in the app.
 */
function RiskGauge({ score = 0, label = "Risk Score", size = 200 }) {
  const clamped = Math.max(0, Math.min(100, score));
  const angle = -90 + (clamped / 100) * 180; // -90deg (left) to +90deg (right)

  const level =
    clamped >= 60 ? "high" : clamped >= 35 ? "moderate" : "low";

  const levelLabel = { low: "Low Risk", moderate: "Moderate Risk", high: "High Risk" }[level];

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 18;

  // Needle endpoint
  const rad = (angle * Math.PI) / 180;
  const needleX = cx + r * 0.78 * Math.sin(rad);
  const needleY = cy - r * 0.78 * Math.cos(rad);

  return (
    <div className="risk-gauge" style={{ width: size }}>
      <svg viewBox={`0 0 ${size} ${size * 0.62}`} width={size} height={size * 0.62}>
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--risk-low)" />
            <stop offset="50%" stopColor="var(--risk-mod)" />
            <stop offset="100%" stopColor="var(--risk-high)" />
          </linearGradient>
        </defs>

        {/* Track */}
        <path
          d={describeArc(cx, cy, r, -90, 90)}
          fill="none"
          stroke="var(--line)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d={describeArc(cx, cy, r, -90, 90)}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="var(--ink)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="6" fill="var(--ink)" />
      </svg>

      <div className="risk-gauge-readout">
        <span className="risk-gauge-score mono">{Math.round(clamped)}</span>
        <span className={`risk-gauge-level risk-level-${level}`}>{levelLabel}</span>
        <span className="risk-gauge-label">{label}</span>
      </div>
    </div>
  );
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

export default RiskGauge;
