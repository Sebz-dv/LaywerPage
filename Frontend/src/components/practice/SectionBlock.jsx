import React from "react";
import RevealOnScroll from "./RevealOnScroll.jsx";
import PracticeAreaCard from "./PracticeAreaCard.jsx";

export default function SectionBlock({ section, loading, GridSkeleton }) {
  return (
    <section>
      <RevealOnScroll as="header" className="mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">{section.title}</h2>
        {section.subtitle && (
          <p className="text-muted-foreground mt-1 max-w-3xl">{section.subtitle}</p>
        )}
      </RevealOnScroll>

      {loading ? (
        GridSkeleton ? <GridSkeleton /> : null
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-stretch">
          {(section.items ?? []).length === 0 && (
            <li className="col-span-full text-sm text-muted-foreground">No hay áreas para mostrar.</li>
          )}
          {(section.items ?? []).map((it, i) => (
            <RevealOnScroll key={it.slug} as="li" index={i} className="h-full will-change-transform">
              <PracticeAreaCard item={it} />
            </RevealOnScroll>
          ))}
        </ul>
      )}
    </section>
  );
}
