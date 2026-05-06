"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

export default function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
  decimals,
  suffix,
}) {
  const motionValue = useMotionValue(0);
  const formatted = useTransform(motionValue, (latest) => {
    if (typeof value !== "number") return value;
    const numeric = Number(latest);
    const base = Number.isFinite(decimals)
      ? numeric.toFixed(decimals)
      : Math.round(numeric).toLocaleString();
    return suffix ? `${base}${suffix}` : base;
  });

  useEffect(() => {
    if (typeof value === "number") {
      const controls = animate(motionValue, value, { duration: 0.8 });
      return controls.stop;
    }
    return undefined;
  }, [motionValue, value]);

  return (
    <motion.div
      className="card relative overflow-hidden px-5 py-4"
      style={{ borderTopColor: color, borderTopWidth: 3 }}
    >
      <div className="absolute inset-0 opacity-30" style={{ background: color }} />
      <div className="relative space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {title}
          </span>
          <span className="text-xl">{icon}</span>
        </div>
        <motion.div className="text-3xl font-semibold text-white mono">
          {typeof value === "number" ? formatted : value}
        </motion.div>
        {subtitle && <p className="text-xs text-[var(--text-secondary)]">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
