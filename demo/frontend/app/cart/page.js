"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../lib/cartContext";
import { CATEGORY_EMOJIS, MOCK_PRODUCTS } from "../../lib/mockProducts";
import { getRecommendations } from "../../lib/api";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import StrengthBadge from "../../components/StrengthBadge";

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: 20 },
};

export default function CartPage() {
  const router = useRouter();
  const { items, lastAdded, removeItem, updateQuantity, clearCart } = useCart();
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [error, setError] = useState(null);

  const fallbackCategory = items[0]?.category || null;
  const baseCategory = lastAdded || fallbackCategory;

  const categoryEmojiMap = useMemo(() => {
    const map = { ...CATEGORY_EMOJIS };
    MOCK_PRODUCTS.forEach((product) => {
      map[product.category] = product.emoji;
    });
    return map;
  }, []);

  useEffect(() => {
    if (!baseCategory) return;
    let isMounted = true;
    const fetchRecs = async () => {
      try {
        setLoadingRecs(true);
        const data = await getRecommendations(baseCategory, 4);
        if (isMounted) setRecommendations(data.recommendations || []);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoadingRecs(false);
      }
    };
    fetchRecs();
    return () => {
      isMounted = false;
    };
  }, [baseCategory]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    const categories = Array.from(new Set(items.map((item) => item.category)));
    clearCart();
    router.replace(`/thank-you?categories=${categories.join(",")}`);
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 text-center">
        <div className="text-5xl">🛒</div>
        <h1 className="text-2xl font-semibold text-white">Your cart is empty</h1>
        <p className="text-[var(--text-secondary)]">
          Add some items to unlock personalized recommendations.
        </p>
        <button
          onClick={() => router.push("/shop")}
          className="rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:grid lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Your Cart</h1>
          <span className="text-sm text-[var(--text-secondary)]">
            {items.length} items
          </span>
        </div>

        <AnimatePresence>
          <motion.div variants={listVariants} initial="hidden" animate="visible">
            {items.map((item) => (
              <motion.div
                key={item.category}
                variants={itemVariants}
                exit="exit"
                className="card group mb-3 flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{item.emoji}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <span className="mt-1 inline-flex rounded-full bg-blue-500/20 px-2.5 py-1 text-xs text-blue-200">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm text-white mono">
                    {priceFormatter.format(item.price)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.category, Math.max(item.quantity - 1, 0))
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-white"
                    >
                      -
                    </button>
                    <span className="mono text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.category, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-white"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.category)}
                    className="text-rose-300 opacity-0 transition group-hover:opacity-100"
                  >
                    🗑️
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="card border border-blue-500/40 px-5 py-4">
          <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
            <span>Subtotal</span>
            <span className="mono text-white">
              {priceFormatter.format(subtotal)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-[var(--text-secondary)]">
            <span>Shipping</span>
            <span className="text-emerald-300">Free</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-base font-semibold text-white">
            <span>Total</span>
            <span className="mono">{priceFormatter.format(subtotal)}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="mt-4 w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white"
          >
            Checkout
          </button>
          <button
            onClick={() => router.push("/shop")}
            className="mt-3 text-sm text-[var(--text-secondary)]"
          >
            Continue Shopping
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Customers also buy</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Based on {baseCategory} in your cart
          </p>
        </div>

        {loadingRecs && <LoadingSkeleton count={2} />}
        {!loadingRecs && recommendations.length === 0 && (
          <div className="card px-4 py-6 text-sm text-[var(--text-secondary)]">
            No recommendations available
          </div>
        )}

        <AnimatePresence mode="wait">
          {!loadingRecs && recommendations.length > 0 && (
            <motion.div
              key={baseCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              {recommendations.map((rec) => {
                const category = rec.suggested_categories?.[0];
                const emoji = categoryEmojiMap[category] || "🛍️";
                const confidence = Math.round((rec.confidence || 0) * 100);
                const borderColor =
                  rec.strength === "strong"
                    ? "border-emerald-500"
                    : rec.strength === "moderate"
                    ? "border-yellow-500"
                    : "border-rose-500";

                return (
                  <div
                    key={category}
                    className={`card border-l-4 ${borderColor} px-4 py-4`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-white">
                          <span className="text-2xl">{emoji}</span>
                          <span className="font-semibold">{category}</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Customers who buy {baseCategory} also buy this
                        </p>
                      </div>
                      <StrengthBadge strength={rec.strength} />
                    </div>
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
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-[var(--text-secondary)]">
                        {rec.lift.toFixed(2)}× lift
                      </span>
                      <button
                        onClick={() => router.push(`/shop?filter=${category}`)}
                        className="text-xs font-semibold text-blue-300"
                      >
                        Add a {category} item
                      </button>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
