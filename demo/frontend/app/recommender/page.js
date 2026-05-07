"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import RecommendCard from "../../components/RecommendCard";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import { getCategories, getRecommendations } from "../../lib/api";

const resultsVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function RecommenderPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [topK, setTopK] = useState(5);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await getCategories();
        if (isMounted) {
          setCategories(data.categories || []);
          setSelectedCategory(data.categories?.[0] || "");
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoadingCategories(false);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = async () => {
    if (!selectedCategory) return;
    setHasSearched(true);
    setLoading(true);
    setError(null);
    try {
      const data = await getRecommendations(selectedCategory, topK);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-semibold text-white">Product Recommender</h1>
        <p className="text-[var(--text-secondary)]">
          Discover what customers buy together
        </p>
      </motion.header>

      <section className="card glass mx-auto w-full max-w-3xl px-6 py-6">
        <div className="space-y-5">
          <div>
            <label className="text-sm text-[var(--text-secondary)]">
              Select a product category
            </label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={loadingCategories}
            >
              {loadingCategories && <option>Loading categories...</option>}
              {!loadingCategories && categories.length === 0 && (
                <option>No categories available</option>
              )}
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-[var(--text-secondary)]">
              Show top N results: <span className="mono text-white">{topK}</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="mt-2 w-full accent-blue-500"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={!selectedCategory || loadingCategories}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Find Recommendations →
          </button>
        </div>
        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}
      </section>

      {loading && <LoadingSkeleton count={4} />}

      {!loading && hasSearched && recommendations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card flex flex-col items-center justify-center gap-3 px-6 py-10 text-center"
        >
          <div className="text-3xl">🧠</div>
          <p className="text-[var(--text-secondary)]">
            No recommendations found for this category
          </p>
        </motion.div>
      )}

      {!loading && recommendations.length > 0 && (
        <motion.section
          variants={resultsVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-white">
            Customers who buy {selectedCategory} also tend to buy:
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.map((rec) => (
              <motion.div key={`${rec.rank}-${rec.suggested_categories}`} variants={itemVariants}>
                <RecommendCard
                  rank={rec.rank}
                  categories={rec.suggested_categories}
                  confidence={rec.confidence}
                  lift={rec.lift}
                  strength={rec.strength}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
