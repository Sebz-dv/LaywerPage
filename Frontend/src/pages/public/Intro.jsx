// pages/IntroPage.jsx
import React, { useRef } from "react";
import FeaturesGrid from "../../components/intro/FeaturesGrid.jsx";
import Backdrop from "../../components/intro/Backdrop.jsx";
import TeamFinder from "../../components/team/TeamFinder.jsx";
import TeamHero from "../../components/team/TeamHero.jsx";
import TeamKpis from "../../components/team/TeamKpis.jsx";
import CarouselViewer from "../../components/ui/CarouselViewer.jsx";
import InfoBlocksSection from "../../components/info/InfoBlocksSection.jsx";
import { motion, useScroll, useTransform } from "framer-motion";

/** tiny util */
function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

/* ===== Animations ===== */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};

const staggerWrap = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

/** Section animada con viewport */
function Section({
  id,
  className,
  children,
  fullBleed = false,
  variants = fadeUp,
  amount = 0.18,
}) {
  return (
    <motion.section
      id={id}
      className={cx("relative py-12 sm:py-16", className)}
      aria-label={id?.replace(/-/g, " ")}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={variants}
    >
      {fullBleed ? (
        <>{children}</>
      ) : (
        <div className="mx-auto max-w-7xl">{children}</div>
      )}
    </motion.section>
  );
}
export default function IntroPage() {
  // Parallax suave del Backdrop cuando scroll: “porque podemos”
  const rootRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start start", "end start"],
  });
  const backdropY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "-4%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.92]);
  const MotionDiv = motion.div;
  return (
    <div ref={rootRef}>
      {/* Fondo con parallax */}

      <motion.div style={{ y: backdropY }}>
        <Backdrop />
      </motion.div>

      {/* Hero visual: carrusel full-bleed */}
      <Section
        id="hero"
        className="mt-[-90px]"
        fullBleed
        variants={fadeUp}
        amount={0.12}
      >
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          variants={fadeUp}
        >
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
        </motion.div>
      </Section>

      {/* Nuestra organización */}
      <Section id="org">
        <motion.div className="mt-[-90px]" variants={staggerWrap}>
          <motion.div className="mt-8" variants={fadeUp}>
            <InfoBlocksSection
              title=""
              subtitle=""
              order={["mision", "vision"]}
              layout="stack"
              showAnchors
              titleClassName="hidden"
            />
          </motion.div>
        </motion.div>
      </Section>

      {/* Equipo: hero + KPIs */}
      <Section id="team" className="mt-[-90px]">
        <motion.div
          className="px-[2px] grid gap-8 md:gap-10"
          variants={staggerWrap}
        >
          {/* Sugerencia: si TeamKpis ya cuenta números, este reveal da entrada limpia */}
          <motion.div variants={fadeUp}>
            <TeamKpis className="mt-2" />
          </motion.div>

          <motion.div
            variants={fadeIn}
            className="border-t border-[hsl(var(--border))]"
          />

          <motion.div variants={fadeUp}>
            <TeamHero />
          </motion.div>
        </motion.div>
      </Section>

      {/* Buscador del equipo */}
      <Section id="team-finder" className="mt-[-90px]">
        <motion.div className="px-[2px]" variants={staggerWrap}>
          {/* Entrada “slide-up” suave */}
          <motion.div variants={fadeUp} className="mt-6">
            <TeamFinder />
          </motion.div>
        </motion.div>
      </Section>

      {/* Features / cierre */}
      <Section id="features" className="mt-[-90px]">
        <motion.div className="px-[2px]" variants={staggerWrap}>
          <motion.div
            variants={fadeIn}
            className="border-t border-[hsl(var(--border))] mb-10"
          />
          <motion.div variants={fadeUp} className="mt-8 sm:mt-10">
            <FeaturesGrid />
          </motion.div>
        </motion.div>
      </Section>
    </div>
  );
}
