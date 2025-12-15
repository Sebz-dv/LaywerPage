// /data/servicios.dynamic.js
import { practiceAreasService as svc } from "../services/practiceAreasService.js";

export const SERVICIOS_FALLBACK = Object.freeze([
  { title: "Derecho Constitucional", to: "/servicios/derecho-constitucional?id=1" },
  { title: "Derecho Administrativo", to: "/servicios/derecho-administrativo?id=2" },
  { title: "Derecho Ambiental", to: "/servicios/derecho-ambiental?id=3" },
  { title: "Derecho Disciplinario", to: "/servicios/derecho-disciplinario?id=5" },
  { title: "Contratación Estatal", to: "/servicios/contratacion-estatal?id=7" },
  { title: "Más Servicios", to: "/servicios" },
]);

const asArray = (res) =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

function mapFeaturedToMenu(it) {
  const id = it?.id ?? "";
  const slug = it?.slug ?? String(id);
  const title = it?.title ?? "";
  const desc = it?.excerpt ?? it?.subtitle ?? ""; // opcional
  const to = slug ? `/servicios/${slug}?id=${id}` : "/servicios";
  return { title, to, desc };
}

function uniqueByTo(items) {
  const seen = new Set();
  return items.filter((x) => {
    const k = x?.to || "";
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ✅ esto devuelve el array con formato {title,to,desc?}
export async function getServiciosMenu({ limit = 5 } = {}) {
  try {
    const res = await svc.list({
      featured: 1,
      active: 1,
      sort: "order,title",
      per_page: 60,
    });

    const featured = uniqueByTo(asArray(res).map(mapFeaturedToMenu))
      .filter((x) => x.title && x.to)
      .slice(0, limit);

    const finalList = [...featured, { title: "Más Servicios", to: "/servicios" }];
    return featured.length ? finalList : SERVICIOS_FALLBACK;
  } catch {
    return SERVICIOS_FALLBACK;
  }
}
