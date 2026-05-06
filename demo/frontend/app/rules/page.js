"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import StrengthBadge from "../../components/StrengthBadge";
import { getRules, getStats } from "../../lib/api";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, staggerChildren: 0.03 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState("lift");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rulesData, statsData] = await Promise.all([
          getRules("lift", "desc", 150),
          getStats(),
        ]);
        if (isMounted) {
          setRules(rulesData.rules || []);
          setStats(statsData);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const sortedRules = useMemo(() => {
    const sorted = [...rules];
    sorted.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (Array.isArray(aVal) && Array.isArray(bVal)) {
        const aText = aVal.join(", ");
        const bText = bVal.join(", ");
        return sortDir === "asc"
          ? aText.localeCompare(bText)
          : bText.localeCompare(aText);
      }
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [rules, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-semibold text-white">Association Rules</h1>
        <p className="text-[var(--text-secondary)]">
          All rules discovered by FP-Growth algorithm
        </p>
      </motion.header>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: "Total Rules",
            value: stats?.total_rules ?? 0,
            color: "text-blue-300",
          },
          {
            label: "Strong",
            value: stats?.strong_rules ?? 0,
            color: "text-emerald-300",
          },
          {
            label: "Moderate",
            value: stats?.moderate_rules ?? 0,
            color: "text-yellow-300",
          },
          {
            label: "Weak",
            value: stats?.weak_rules ?? 0,
            color: "text-rose-300",
          },
        ].map((item) => (
          <div key={item.label} className="card px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              {item.label}
            </p>
            <p className={`mt-3 text-2xl font-semibold mono ${item.color}`}>
              {item.value.toLocaleString()}
            </p>
          </div>
        ))}
      </section>

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[#0d1426] text-left text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              <tr>
                <th className="px-4 py-4">#</th>
                <th className="px-4 py-4 cursor-pointer" onClick={() => handleSort("antecedent")}>
                  IF (antecedent)
                </th>
                <th className="px-4 py-4 cursor-pointer" onClick={() => handleSort("consequent")}>
                  THEN (consequent)
                </th>
                <th className="px-4 py-4 cursor-pointer" onClick={() => handleSort("confidence")}>
                  Confidence
                </th>
                <th className="px-4 py-4 cursor-pointer" onClick={() => handleSort("lift")}>
                  Lift
                </th>
                <th className="px-4 py-4">Strength</th>
              </tr>
            </thead>
            <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
              {loading && (
                <tr>
                  <td className="px-4 py-6 text-center text-[var(--text-secondary)]" colSpan={6}>
                    Loading rules...
                  </td>
                </tr>
              )}
              {error && !loading && (
                <tr>
                  <td className="px-4 py-6 text-center text-rose-300" colSpan={6}>
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && sortedRules.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-[var(--text-secondary)]" colSpan={6}>
                    No rules available
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                sortedRules.map((rule, index) => {
                  const lift = rule.lift || 0;
                  const confidence = rule.confidence || 0;
                  const liftColor =
                    lift > 2 ? "text-emerald-300" : lift >= 1 ? "text-yellow-300" : "text-rose-300";

                  return (
                    <motion.tr
                      key={`${rule.antecedent}-${rule.consequent}-${index}`}
                      variants={rowVariants}
                      className="border-t border-slate-800/60 transition hover:bg-white/5"
                    >
                      <td className="px-4 py-4 text-[var(--text-secondary)]">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 text-white">
                        {(rule.antecedent || []).join(", ")}
                      </td>
                      <td className="px-4 py-4 text-[var(--text-secondary)]">
                        {(rule.consequent || []).join(", ")}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-20 rounded-full bg-slate-800">
                            <div
                              className="h-2 rounded-full bg-blue-500"
                              style={{ width: `${Math.round(confidence * 100)}%` }}
                            />
                          </div>
                          <span className="mono text-white">
                            {(confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className={`px-4 py-4 mono ${liftColor}`}>
                        {lift.toFixed(2)}×
                      </td>
                      <td className="px-4 py-4">
                        <StrengthBadge strength={rule.strength} />
                      </td>
                    </motion.tr>
                  );
                })}
            </motion.tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
