import React from "react";
import FeaturesGrid from "../components/intro/FeaturesGrid.jsx";
import Backdrop from "../components/intro/Backdrop.jsx";
import TeamFinder from "../components/team/TeamFinder.jsx";
import TeamHero from "../components/team/TeamHero.jsx";
import TeamKpis from "../components/team/TeamKpis.jsx";
import CarouselViewer from "../components/ui/CarouselViewer.jsx";
import InfoBlocksSection from "../components/info/InfoBlocksSection.jsx";
export default function IntroPage() {
  return (
    <div className="relative">
      <Backdrop />
      <div className="mx-auto max-w-7xl ">
        <CarouselViewer
          className="mt-6"
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
        <InfoBlocksSection
          title="Nuestra organización"
          subtitle="Propósito, horizonte y valores que nos guían."
          order={["mision", "vision"]} // lo que no esté aquí se ordena por 'position'
          layout="stack" // "grid" | "columns" | "stack"
          showAnchors
          titleClassName="md:text-5xl leading-tight font-semibold flex justify-center"
        />
        <TeamHero />
        <TeamKpis className="mt-10" />
        <TeamFinder className="mt-2" />
        <FeaturesGrid className="mt-16 sm:mt-20" />
      </div>
    </div>
  );
}
