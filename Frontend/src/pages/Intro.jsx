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

/** Sección con paddings coherentes y container interno */
function Section({ id, className, children }) {
  return (
    <section
      id={id}
      className={cx("relative py-12 sm:py-16", className)}
      aria-label={id?.replace(/-/g, " ")}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
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
    <div className="relative">
      {/* Fondo existente */}
      <Backdrop />

      {/* Halo/gradiente suave detrás del carrusel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] overflow-hidden"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="mx-auto h-64 w-full rounded-[3rem] blur-3xl opacity-60
            bg-[radial-gradient(80%_80%_at_50%_0%,hsl(var(--brand)/0.20),hsl(var(--cta)/0.08)_50%,transparent_80%)]"
          />
        </div>
      </div>

      {/* Hero visual: carrusel */}
      <Section id="hero" className="pt-16 sm:pt-20">
        <CarouselViewer
          className="ring-1 ring-[hsl(var(--border))]/60 bg-[hsl(var(--card))] shadow-sm mt-2"
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
        <SectionHeader
          eyebrow="Nuestra organización"
          title="Propósito, horizonte y valores"
          subtitle="Lo que nos guía hoy y nos exige ser mejores mañana."
        />
        <div className="mt-8">
          <InfoBlocksSection
            title="" // ya lo gestiona SectionHeader
            subtitle=""
            order={["mision", "vision"]}
            layout="stack" // grid | columns | stack
            showAnchors
            titleClassName="hidden" // ocultamos el H2 interno para no duplicar jerarquía
          />
        </div>
      </Section>

      {/* Equipo: hero + KPIs */}
      <Section id="team" className="pt-4">
        <div className="grid gap-8 md:gap-10">
          <TeamHero />
          <div className="border-t border-[hsl(var(--border))]" />
          <TeamKpis className="mt-2" />
        </div>
      </Section>

      {/* Buscador del equipo */}
      <Section id="team-finder" className="pt-4">
        <SectionHeader
          eyebrow="Conoce a las personas"
          title="Encuentra al experto indicado"
          subtitle="Filtra por especialidad, ciudad o área."
        />
        <TeamFinder className="mt-6" />
      </Section>

      {/* Features / cierre */}
      <Section id="features" className="pb-20 sm:pb-24">
        <div className="border-t border-[hsl(var(--border))] mb-10" />
        <SectionHeader
          align="left"
          eyebrow="¿Por qué nosotros?"
          title="Capacidades y diferenciales"
          subtitle="Una arquitectura pensada para escalar procesos y resultados."
        />
        <FeaturesGrid className="mt-8 sm:mt-10" />
      </Section>
    </div>
  );
}
