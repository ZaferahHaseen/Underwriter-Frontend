// src/utils/format.js

export function formatName(name) {
  if (!name || typeof name !== "string") return "—";
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function formatField(value, fallback = "Not provided") {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
}

export function formatCurrency(value, { treatZeroAsMissing = false, fallback = "Not disclosed" } = {}) {
  const n = Number(value);
  if (value === null || value === undefined || value === "" || Number.isNaN(n)) return fallback;
  if (treatZeroAsMissing && n === 0) return fallback;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function formatNumber(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
}