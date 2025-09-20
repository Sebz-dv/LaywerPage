import { useEffect, useMemo, useRef, useState } from "react";
import { teamService } from "../services/teamService";

export function useDebounce(value, delay = 250) {
  const [v, setV] = useState(value);
  const t = useRef();
  useEffect(() => {
    clearTimeout(t.current);
    t.current = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t.current);
  }, [value, delay]);
  return v;
}

export function useTeamSearch({ initialTab = "todos", pageSize = 9 } = {}) {
  const [tab, setTab] = useState(initialTab);
  const [nombre, setNombre] = useState("");
  const [cargo, setCargo] = useState("");
  const [area, setArea] = useState("");
  const [ciudad, setCiudad] = useState("");

  const debouncedNombre = useDebounce(nombre, 250);

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [facets, setFacets] = useState({ cargos: [], areas: [], ciudades: [] });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const queryInput = useMemo(
    () => ({
      tab,
      nombre: debouncedNombre,
      cargo,
      area,
      ciudad,
      page,
      perPage: pageSize,
    }),
    [tab, debouncedNombre, cargo, area, ciudad, page, pageSize]
  );

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError("");

    (async () => {
      try {
        const { data, meta } = await teamService.search({
          ...queryInput,
          signal: ac.signal,
        });
        setLastPage(meta?.last_page ?? 1);
        setFacets({
          cargos: meta?.facets?.cargos ?? [],
          areas: meta?.facets?.areas ?? [],
          ciudades: meta?.facets?.ciudades ?? [],
        });
        setItems((prev) => (page === 1 ? data : [...prev, ...data]));
      } catch (e) {
        // Axios v1 usa e.code === 'ERR_CANCELED' ó e.name === 'CanceledError'
        if (e.code === "ERR_CANCELED" || e.name === "CanceledError") return;
        setError(e.message || "Error");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [queryInput, page]);

  useEffect(() => {
    setPage(1);
  }, [tab, debouncedNombre, cargo, area, ciudad]);

  const canLoadMore = page < lastPage;

  return {
    items,
    loading,
    error,
    facets,
    page,
    lastPage,
    canLoadMore,
    tab,
    setTab,
    nombre,
    setNombre,
    cargo,
    setCargo,
    area,
    setArea,
    ciudad,
    setCiudad,
    loadMore: () => setPage((p) => p + 1),
    reset: () => {
      setTab(initialTab);
      setNombre("");
      setCargo("");
      setArea("");
      setCiudad("");
      setPage(1);
    },
  };
}
