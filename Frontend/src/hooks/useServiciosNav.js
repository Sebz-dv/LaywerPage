// /hooks/useServiciosMenu.js
import { useEffect, useState } from "react";
import { getServiciosMenu, SERVICIOS_FALLBACK } from "../data/servicios.dynamic.js";

let memo = null;
let memoAt = 0;
let inflight = null;
const TTL = 60_000;

async function getCached(limit) {
  const now = Date.now();
  if (memo && now - memoAt < TTL) return memo;
  if (inflight) return inflight;

  inflight = getServiciosMenu({ limit })
    .then((data) => {
      memo = data;
      memoAt = Date.now();
      return data;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function useServiciosMenu({ limit = 5 } = {}) {
  const [items, setItems] = useState(memo || SERVICIOS_FALLBACK);
  const [loading, setLoading] = useState(!memo);

  useEffect(() => {
    let alive = true;
    setLoading(!memo);

    getCached(limit)
      .then((data) => alive && setItems(data))
      .catch(() => alive && setItems(SERVICIOS_FALLBACK))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [limit]);

  return { items, loading };
}
