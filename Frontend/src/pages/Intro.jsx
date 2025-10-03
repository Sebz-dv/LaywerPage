import React from "react";
import FeaturesGrid from "../components/intro/FeaturesGrid.jsx";
import Backdrop from "../components/intro/Backdrop.jsx";
import TeamFinder from "../components/team/TeamFinder.jsx";
import TeamHero from "../components/team/TeamHero.jsx";
import TeamKpis from "../components/team/TeamKpis.jsx";
import CarouselViewer from "../components/ui/CarouselViewer.jsx";
import InfoBlocksSection from "../components/info/InfoBlocksSection.jsx";

/** tiny util */
function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

/** Sección con opción full-bleed (sin container) */
function Section({ id, className, children, fullBleed = false }) {
  return (
    <section
      id={id}
      className={cx("relative py-12 sm:py-16", className)}
      aria-label={id?.replace(/-/g, " ")}
    >
      {fullBleed ? (
        children
      ) : (
        <div className="mx-auto max-w-7xl">{children}</div>
      )}
    </section>
  );
}

/** Encabezado reutilizable */
function SectionHeader({ eyebrow, title, subtitle, align = "center" }) {
  const alignment =
    align === "left" ? "text-left items-start" : "text-center items-center";
  return (
    <div className={cx("flex flex-col gap-2", alignment)}>
      {eyebrow && (
        <span className="inline-flex rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1 text-xs font-medium tracking-wide text-[hsl(var(--fg)/0.7)]">
          {eyebrow}
        </span>
      )}
      {title && (
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="max-w-2xl text-sm sm:text-base text-[hsl(var(--fg)/0.72)]">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function IntroPage() {
  return (
    // 👉 2px laterales en TODA la página
    <div className="px-[2px]">
      {/* Fondo */}
      <Section id="backdrop" className="pt-16 sm:pt-20" fullBleed>
        <Backdrop />
      </Section>
      {/* Hero visual: carrusel full-bleed (usa el padding de 2px del wrapper) */}
      <Section id="hero" className="mt-[-90px]" fullBleed>
        <CarouselViewer
          className="w-full ring-1 ring-[hsl(var(--border))]/60 bg-[hsl(var(--card))] shadow-sm"
          aspect="16/9"
          rounded="rounded-2xl"
          autoplay
          interval={4500}
          loop
          showDots
          showArrows
          showThumbs
          slideFit="cover"
        />
      </Section>

      {/* Nuestra organización */}
      <Section id="org">
        <div className="mt-[-90px]">
          <SectionHeader
            eyebrow="Nuestra organización"
            title="Propósito, horizonte y valores"
            subtitle="Lo que nos guía hoy y nos exige ser mejores mañana."
          />
          <div className="mt-8">
            <InfoBlocksSection
              title=""
              subtitle=""
              order={["mision", "vision"]}
              layout="stack"
              showAnchors
              titleClassName="hidden"
            />
          </div>
        </div>
      </Section>

      {/* Equipo: hero + KPIs */}
      <Section id="team" className="mt-[-90px]">
        <div className="px-[2px]">
          <div className="grid gap-8 md:gap-10">
            <TeamKpis className="mt-2" />
            <div className="border-t border-[hsl(var(--border))]" />
            <TeamHero />
          </div>
        </div>
      </Section>

      {/* Buscador del equipo */}
      <Section id="team-finder" className="mt-[-90px]">
        <div className="px-[2px]">
          <SectionHeader
            eyebrow="Conoce a las personas"
            title="Encuentra al experto indicado"
            subtitle="Filtra por especialidad, ciudad o área."
          />
          <TeamFinder className="mt-6" />
        </div>
      </Section>

      {/* Features / cierre */}
      <Section id="features" className="mt-[-90px]">
        <div className="px-[2px]">
          <div className="border-t border-[hsl(var(--border))] mb-10" />
           
          <FeaturesGrid className="mt-8 sm:mt-10" />
        </div>
      </Section>
    </div>
  );
}
