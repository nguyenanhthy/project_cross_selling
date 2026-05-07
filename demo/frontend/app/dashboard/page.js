"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import StatCard from "../../components/StatCard";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import { getStats, getTopNodes } from "../../lib/api";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [topNodes, setTopNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, topNodesData] = await Promise.all([
          getStats(),
          getTopNodes("degree", 10),
        ]);
        if (isMounted) {
          setStats(statsData);
          setTopNodes(topNodesData.top || []);
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

  const chartData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Strong", value: stats.strong_rules || 0, color: "#10b981" },
      { name: "Moderate", value: stats.moderate_rules || 0, color: "#f59e0b" },
      { name: "Weak", value: stats.weak_rules || 0, color: "#ef4444" },
    ];
  }, [stats]);

  const barData = topNodes.map((node) => ({
    name: node.category,
    value: node.score,
  }));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-semibold text-white">Overview Dashboard</h1>
        <p className="text-[var(--text-secondary)]">
          Real-time health of the FP-Growth recommendation engine
        </p>
      </motion.header>

      {loading && <LoadingSkeleton count={4} />}
      {error && (
        <div className="card border-rose-500/30 bg-rose-500/10 px-4 py-4 text-rose-200">
          {error}
        </div>
      )}

      {!loading && !error && stats && (
        <section className="grid gap-4 md:grid-cols-4">
          {[
            {
              title: "Total Rules",
              value: stats.total_rules,
              icon: "🔗",
              color: "#3b82f6",
              subtitle: "Association rules loaded",
            },
            {
              title: "Total Categories",
              value: stats.total_categories,
              icon: "📦",
              color: "#8b5cf6",
              subtitle: "Unique product categories",
            },
            {
              title: "Avg Confidence",
              value: stats.avg_confidence * 100,
              icon: "📈",
              color: "#10b981",
              subtitle: "% average confidence",
              decimals: 1,
              suffix: "%",
            },
            {
              title: "Avg Lift",
              value: stats.avg_lift,
              icon: "✨",
              color: "#f59e0b",
              subtitle: "Mean lift ratio",
              decimals: 2,
              suffix: "×",
            },
          ].map((card, index) => (
            <motion.div
              key={card.title}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <StatCard {...card} />
            </motion.div>
          ))}
        </section>
      )}

      {!loading && !error && stats && (
        <section className="grid gap-6 lg:grid-cols-2">
          <motion.div
            className="card px-6 py-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Rule Strength Distribution
              </h2>
              <span className="text-xs text-[var(--text-secondary)]">
                Strong vs Moderate vs Weak
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" innerRadius={70} outerRadius={100}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "1px solid #1f2937",
                      color: "#f9fafb",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            className="card px-6 py-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Top Categories by Degree
              </h2>
              <span className="text-xs text-[var(--text-secondary)]">
                Network centrality signals
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 32 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "1px solid #1f2937",
                      color: "#f9fafb",
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 8, 8]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
}
