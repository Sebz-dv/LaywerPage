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
import TeamFinderMini from "../../components/team/TeamFinderMini.jsx";
import DataView from "../../components/intro/dataView.jsx";
import WhyUs from "../../components/intro/WhyUs.jsx";

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
  const MotionDiv = motion.div;
  return (
    <div ref={rootRef}>
      {/* Fondo con parallax */}

      <Backdrop />

      <DataView />

      <WhyUs />

      <TeamHero />

      {/* Buscador del equipo */}
      <Section id="team-finder" className="mt-[-70px]">
        <motion.div className="px-[2px]" variants={staggerWrap}>
          <motion.div variants={fadeUp} className="mt-6">
            <TeamFinderMini />
          </motion.div>
        </motion.div>
      </Section>

      {/* Features / cierre */}
      <motion.div variants={fadeUp}>
        <FeaturesGrid />
      </motion.div>
    </div>
  );
}
