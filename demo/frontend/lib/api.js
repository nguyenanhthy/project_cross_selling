const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const handleResponse = async (response) => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }
  return response.json();
};

export const getCategories = async () =>
  handleResponse(await fetch(`${API_BASE}/categories`));

export const getRecommendations = async (category, topK = 5) =>
  handleResponse(
    await fetch(
      `${API_BASE}/recommend?category=${encodeURIComponent(category)}&top_k=${topK}`
    )
  );

export const getRules = async (sortBy = "lift", order = "desc", limit = 100) =>
  handleResponse(
    await fetch(
      `${API_BASE}/rules?sort_by=${sortBy}&order=${order}&limit=${limit}`
    )
  );

export const getStats = async () =>
  handleResponse(await fetch(`${API_BASE}/stats`));

export const getNetwork = async () =>
  handleResponse(await fetch(`${API_BASE}/network`));

export const getNeighbors = async (category) =>
  handleResponse(
    await fetch(`${API_BASE}/network/neighbors?category=${encodeURIComponent(category)}`)
  );

export const getTopNodes = async (metric = "degree", limit = 10) =>
  handleResponse(
    await fetch(`${API_BASE}/network/top?metric=${metric}&limit=${limit}`)
  );

export const getMultipleRecommendations = async (categories, topK = 3) => {
  const results = await Promise.all(
    categories.map((cat) => getRecommendations(cat, topK).catch(() => null))
  );
  const seen = new Set();
  return results
    .filter(Boolean)
    .flatMap((r) => r.recommendations || [])
    .filter((rec) => {
      const key = rec.suggested_categories.join(",");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.lift - a.lift);
};