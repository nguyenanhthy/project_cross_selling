"use client";

import { motion } from "framer-motion";
import StrengthBadge from "./StrengthBadge";

export default function RecommendCard({ rank, categories, confidence, lift, strength }) {
  const confidencePercent = Math.round((confidence || 0) * 100);
  const liftText = `${lift.toFixed(2)}× more likely`;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(59, 130, 246, 0.25)" }}
      className="card relative overflow-hidden px-5 py-5 transition"
    >
      <div className="absolute left-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-200">
        {rank}
      </div>
      <div className="absolute right-4 top-4">
        <StrengthBadge strength={strength} />
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold text-white">
          {(categories || []).join(", ")}
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Confidence</span>
            <span className="mono text-white">{confidencePercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidencePercent}%` }}
              transition={{ duration: 0.6 }}
              className="h-2 rounded-full bg-blue-500"
            />
          </div>
        </div>

        <p className="text-sm text-[var(--text-secondary)]">
          <span className="mono text-white">{liftText}</span>
        </p>
      </div>
    </motion.div>
  );
}
