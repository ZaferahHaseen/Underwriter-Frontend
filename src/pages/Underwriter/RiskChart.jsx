import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import "./RiskChart.css";

function formatFeatureName(name) {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function RiskChart({ riskFactors, positiveFactors }) {
  // Combine both lists into one dataset. Risk = negative bar direction,
  // positive = positive bar direction, so underwriter reads "which way it pulls" at a glance.
  const data = [
    ...riskFactors.map((f) => ({
      name: formatFeatureName(f.feature),
      value: Math.round(f.weight * 100),
      type: "risk",
    })),
    ...positiveFactors.map((f) => ({
      name: formatFeatureName(f.feature),
      value: -Math.round(f.weight * 100), // negative = bar goes left, visually "offsetting"
      type: "positive",
    })),
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  if (data.length === 0) return null;

  return (
    <div className="risk-chart-wrap">
      <ResponsiveContainer width="100%" height={Math.max(220, data.length * 44)}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
            tick={{ fontSize: 13 }}
          />
          <Tooltip
            formatter={(val, _name, props) => [
              `${Math.abs(val)}% influence`,
              props.payload.type === "risk" ? "Increases risk" : "Reduces risk",
            ]}
          />
          <Bar dataKey="value" radius={[4, 4, 4, 4]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.type === "risk" ? "#dc2626" : "#16a34a"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="chart-legend">
        <span className="legend-dot risk-dot" /> Increases risk &nbsp;&nbsp;
        <span className="legend-dot positive-dot" /> Reduces risk
      </p>
    </div>
  );
}

export default RiskChart;