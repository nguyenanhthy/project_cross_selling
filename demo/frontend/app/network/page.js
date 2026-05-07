"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import NetworkGraph from "../../components/NetworkGraph";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import { getCategories, getNetwork, getNeighbors, getTopNodes } from "../../lib/api";

export default function NetworkPage() {
  const [mode, setMode] = useState("full");
  const [graphData, setGraphData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [topNodes, setTopNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTopNodes = async () => {
      try {
        const topData = await getTopNodes("pagerank", 10);
        if (isMounted) setTopNodes(topData.top || []);
      } catch (err) {
        if (isMounted) setError(err.message);
      }
    };

    fetchTopNodes();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchGraph = async () => {
      try {
        setLoading(true);
        const data = mode === "full"
          ? await getNetwork()
          : await getNeighbors(selectedCategory);
        if (isMounted) setGraphData(data);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (mode === "full" || selectedCategory) {
      fetchGraph();
    }

    return () => {
      isMounted = false;
    };
  }, [mode, selectedCategory]);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      if (mode !== "neighbors") return;
      try {
        const data = await getCategories();
        if (isMounted) {
          setCategories(data.categories || []);
          setSelectedCategory(data.categories?.[0] || "");
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, [mode]);

  const graphPayload = useMemo(() => {
    if (!graphData) return { nodes: [], links: [] };
    return { nodes: graphData.nodes || [], links: graphData.links || [] };
  }, [graphData]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-white">Co-purchase Network</h1>
          <p className="text-[var(--text-secondary)]">
            Category relationship graph powered by association rules
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode("full")}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              mode === "full"
                ? "bg-blue-500/20 text-blue-200"
                : "bg-white/5 text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            Full Network
          </button>
          <button
            onClick={() => setMode("neighbors")}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              mode === "neighbors"
                ? "bg-blue-500/20 text-blue-200"
                : "bg-white/5 text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            Explore by Category
          </button>
        </div>
      </motion.header>

      {mode === "neighbors" && (
        <div className="card flex flex-wrap items-center gap-4 px-5 py-4">
          <p className="text-sm text-[var(--text-secondary)]">Select category:</p>
          <select
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="card border-rose-500/30 bg-rose-500/10 px-4 py-4 text-rose-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="min-h-[520px]">
          {loading && <LoadingSkeleton count={2} />}
          {!loading && graphData && <NetworkGraph data={graphPayload} />}
        </div>

        <aside className="card h-fit px-5 py-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Top 10 by PageRank</h3>
            <span className="text-xs text-[var(--text-secondary)]">Centrality</span>
          </div>
          <div className="space-y-3">
            {topNodes.map((node) => (
              <div key={node.category} className="space-y-1">
                <div className="flex items-center justify-between text-sm text-white">
                  <span className="mono">#{node.rank}</span>
                  <span className="truncate text-right text-[var(--text-secondary)]">
                    {node.category}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-purple-500"
                    style={{ width: `${Math.min(node.score * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
