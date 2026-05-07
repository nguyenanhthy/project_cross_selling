"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MOCK_PRODUCTS } from "../../lib/mockProducts";
import { useCart } from "../../lib/cartContext";

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.05, duration: 0.4 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  return Array.from({ length: 5 }).map((_, index) => {
    if (index < fullStars) return "★";
    if (index === fullStars && hasHalf) return "☆";
    return "☆";
  });
};

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState("all");
  const [pulseKey, setPulseKey] = useState(0);

  const categories = useMemo(
    () => Array.from(new Set(MOCK_PRODUCTS.map((product) => product.category))),
    []
  );

  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter && categories.includes(filter)) {
      setActiveCategory(filter);
    }
  }, [searchParams, categories]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return MOCK_PRODUCTS;
    return MOCK_PRODUCTS.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleAdd = (product) => {
    addItem({
      category: product.category,
      name: product.name,
      price: product.price,
      emoji: product.emoji,
    });
    setPulseKey((prev) => prev + 1);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Shop</h1>
        <p className="text-[var(--text-secondary)]">Browse our product catalog</p>
      </header>

      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            activeCategory === "all"
              ? "bg-blue-500 text-white"
              : "card text-[var(--text-secondary)]"
          }`}
        >
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeCategory === category
                ? "bg-blue-500 text-white"
                : "card text-[var(--text-secondary)]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        {filteredProducts.map((product) => {
          const inCart = items.some((item) => item.category === product.category);
          return (
            <motion.div key={product.id} variants={itemVariants}>
              <div className="card h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(59,130,246,0.25)]">
                <div className="flex h-[120px] items-center justify-center bg-[#1a2235] text-4xl">
                  {product.emoji}
                </div>
                <div className="space-y-3 px-5 py-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {product.name}
                    </h3>
                    <span className="mt-2 inline-flex rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200">
                      {product.category}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-1">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-yellow-400">
                    <span>{renderStars(product.rating).join("")}</span>
                    <span className="text-[var(--text-secondary)]">
                      ({product.reviews})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="mono text-lg font-semibold text-white">
                      {priceFormatter.format(product.price)}
                    </span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAdd(product)}
                    className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      inCart
                        ? "bg-emerald-500/20 text-emerald-200"
                        : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    }`}
                  >
                    {inCart ? "✓ In Cart" : "Add to Cart"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {totalItems > 0 && (
          <motion.button
            key={pulseKey}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={() => router.push("/cart")}
            className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg"
          >
            🛒
            <motion.span
              key={totalItems}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold"
            >
              {totalItems}
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
