import { useEffect, useState } from "react";
import api from "../../../api/axios";

// Simple in-memory cache to avoid refetching ratings for every card repeatedly.
// (No backend changes; uses existing GET /products/:id/reviews endpoint.)
const CACHE = new Map();
const TTL_MS = 10 * 60 * 1000; // 10 minutes

function computeSummary(reviews) {
  const list = Array.isArray(reviews) ? reviews : [];
  const count = list.length;
  if (!count) return { avg: 0, count: 0 };
  const sum = list.reduce((acc, r) => acc + (Number(r?.rating) || 0), 0);
  const avg = Math.round((sum / count) * 10) / 10; // 1 decimal
  return { avg, count };
}

export function useReviewSummary(productId) {
  const [state, setState] = useState(() => {
    if (!productId) return { avg: 0, count: 0, loading: false };
    const cached = CACHE.get(String(productId));
    if (cached && Date.now() - cached.ts < TTL_MS) {
      return { ...cached.value, loading: false };
    }
    return { avg: 0, count: 0, loading: true };
  });

  useEffect(() => {
    if (!productId) return;
    const key = String(productId);
    const cached = CACHE.get(key);
    if (cached && Date.now() - cached.ts < TTL_MS) {
      setState({ ...cached.value, loading: false });
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        // share inflight promise if multiple cards mount at once
        if (cached?.promise) {
          const value = await cached.promise;
          if (!cancelled) setState({ ...value, loading: false });
          return;
        }

        const promise = (async () => {
          const res = await api.get(`/products/${key}/reviews`, { skipErrorToast: true });
          const reviews = res?.data?.reviews || [];
          return computeSummary(reviews);
        })();

        CACHE.set(key, { ts: Date.now(), value: { avg: 0, count: 0 }, promise });

        const value = await promise;
        CACHE.set(key, { ts: Date.now(), value, promise: null });
        if (!cancelled) setState({ ...value, loading: false });
      } catch {
        CACHE.set(key, { ts: Date.now(), value: { avg: 0, count: 0 }, promise: null });
        if (!cancelled) setState({ avg: 0, count: 0, loading: false });
      }
    };

    setState((s) => ({ ...s, loading: true }));
    run();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  return state; // { avg, count, loading }
}

