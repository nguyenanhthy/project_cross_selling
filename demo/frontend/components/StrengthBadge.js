"use client";

const styles = {
  strong: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
  moderate: "bg-yellow-500/20 text-yellow-200 border-yellow-500/40",
  weak: "bg-rose-500/20 text-rose-200 border-rose-500/40",
};

const labels = {
  strong: "💪 Strong",
  moderate: "📈 Moderate",
  weak: "⚠️ Weak",
};

export default function StrengthBadge({ strength }) {
  const style = styles[strength] || styles.moderate;
  const label = labels[strength] || labels.moderate;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {label}
    </span>
  );
}
