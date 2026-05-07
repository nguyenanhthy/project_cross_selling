"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import StrengthBadge from "../../components/StrengthBadge";
import { CATEGORY_EMOJIS } from "../../lib/mockProducts";
import { getMultipleRecommendations } from "../../lib/api";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.8 + i * 0.08, duration: 0.4 },
  }),
};

export default function ThankYouPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = useMemo(() => {
    const raw = searchParams.get("categories") || "";
    return raw.split(",").filter(Boolean);
  }, [searchParams]);

  const orderNumber = useMemo(() => {
    return Math.floor(10000000 + Math.random() * 90000000);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchRecs = async () => {
      if (categories.length === 0) {
        setLoading(false);
        return;
      }
      const results = await getMultipleRecommendations(categories, 3);
      if (isMounted) {
        setRecommendations(results.slice(0, 6));
        setLoading(false);
      }
    };
    fetchRecs();
    return () => {
      isMounted = false;
    };
  }, [categories]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <section className="card px-6 py-8 text-center">
        <motion.svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          className="mx-auto"
        >
          <motion.circle
            cx="60"
            cy="60"
            r="50"
            stroke="#10b981"
            strokeWidth="6"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1 }}
          />
          <motion.path
            d="M40 60 L55 75 L82 48"
            stroke="#10b981"
            strokeWidth="6"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          />
        </motion.svg>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-4 text-3xl font-semibold text-white"
        >
          Order Confirmed! 🎉
        </motion.h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          Your order has been placed successfully. You'll receive a confirmation email shortly.
        </p>

        <div className="card mt-6 border border-slate-800 px-5 py-4 text-left">
          <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
            <span>Order Number</span>
            <span className="mono text-white">#{orderNumber}</span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-[var(--text-secondary)]">Items purchased</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-200"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span>📦</span>
            <span>Estimated delivery: 3-5 business days</span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Complete your purchase</h2>
          <p className="text-[var(--text-secondary)]">
            Other customers who bought these items also loved:
          </p>
        </div>

        {loading && <LoadingSkeleton count={6} />}

        {!loading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec, index) => {
              const category = rec.suggested_categories?.[0];
              const emoji = CATEGORY_EMOJIS[category] || "🛍️";
              const confidence = Math.round((rec.confidence || 0) * 100);
              return (
                <motion.div
                  key={category}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  className="card px-5 py-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{emoji}</span>
                    <StrengthBadge strength={rec.strength} />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">
                    {category}
                  </h3>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                      <span>Confidence</span>
                      <span className="mono text-white">{confidence}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${confidence}%` }}
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-[var(--text-secondary)]">
                    Lift: <span className="mono text-white">{rec.lift.toFixed(2)}×</span>
                  </p>
                  <button
                    onClick={() => router.push(`/shop?filter=${category}`)}
                    className="mt-4 w-full rounded-lg bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-200"
                  >
                    Shop Now →
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4 md:flex-row">
        <button
          onClick={() => router.push("/shop")}
          className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white"
        >
          Continue Shopping
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex-1 rounded-lg border border-slate-700 bg-transparent px-4 py-3 text-sm font-semibold text-white"
        >
          View Dashboard
        </button>
      </section>

      <p className="text-center text-xs text-[var(--text-secondary)]">
        Recommendations powered by FP-Growth Association Rules
      </p>
    </div>
  );
}
