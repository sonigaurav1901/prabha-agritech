"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const COLLAGE_PHOTOS: { src: string; alt: string; style: React.CSSProperties }[] = [
  { src: "/images/services/mushroom.jpg",      alt: "Oyster mushrooms",         style: { top: "2%",  left: "2%",  width: 200, height: 150, rotate: "-6deg", zIndex: 5  } },
  { src: "/images/background/background.jpg",  alt: "Greenhouse interior",      style: { top: "0%",  left: "22%", width: 180, height: 220, rotate: "4deg",  zIndex: 4  } },
  { src: "/images/services/hydroponics.jpg",   alt: "Hydroponic tower",         style: { top: "5%",  left: "50%", width: 160, height: 200, rotate: "-3deg", zIndex: 6  } },
  { src: "/images/background/farmer.jpg",      alt: "Farmer in greenhouse",     style: { top: "1%",  left: "68%", width: 190, height: 170, rotate: "7deg",  zIndex: 3  } },
  { src: "/images/services/honeyfarming.jpg",  alt: "Beekeeping honeycomb",     style: { top: "28%", left: "0%",  width: 170, height: 160, rotate: "5deg",  zIndex: 7  } },
  { src: "/images/services/mushroom.jpg",      alt: "Mushroom clusters",        style: { top: "25%", left: "18%", width: 195, height: 175, rotate: "-7deg", zIndex: 6  } },
  { src: "/images/services/technology.jpg",    alt: "Agri-tech tablet",         style: { top: "22%", left: "42%", width: 175, height: 195, rotate: "3deg",  zIndex: 5  } },
  { src: "/images/services/training.jpg",      alt: "Farmer training session",  style: { top: "20%", left: "63%", width: 185, height: 165, rotate: "-5deg", zIndex: 8  } },
  { src: "/images/services/hydroponics.jpg",   alt: "Vertical grow towers",     style: { top: "48%", left: "4%",  width: 165, height: 190, rotate: "-4deg", zIndex: 6  } },
  { src: "/images/background/background.jpg",  alt: "Poly-house interior",      style: { top: "46%", left: "22%", width: 200, height: 170, rotate: "6deg",  zIndex: 7  } },
  { src: "/images/services/honeyfarming.jpg",  alt: "Honey harvest",            style: { top: "45%", left: "46%", width: 170, height: 185, rotate: "-2deg", zIndex: 5  } },
  { src: "/images/services/mushroom.jpg",      alt: "Mushroom substrate bags",  style: { top: "44%", left: "65%", width: 190, height: 160, rotate: "8deg",  zIndex: 4  } },
  { src: "/images/background/farmer.jpg",      alt: "Hydroponic farmer",        style: { top: "68%", left: "6%",  width: 185, height: 175, rotate: "3deg",  zIndex: 8  } },
  { src: "/images/services/technology.jpg",    alt: "Agriculture dashboard",    style: { top: "66%", left: "27%", width: 175, height: 190, rotate: "-6deg", zIndex: 6  } },
  { src: "/images/services/training.jpg",      alt: "Training workshop",        style: { top: "65%", left: "52%", width: 195, height: 170, rotate: "5deg",  zIndex: 7  } },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const textVariants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-prabha-forest">
      {/* Mycelium texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='white' stroke-width='0.5'%3E%3Cpath d='M30 5 Q45 20 30 35 Q15 50 30 55'/%3E%3Cpath d='M10 20 Q25 25 30 35 Q35 45 50 40'/%3E%3Cpath d='M50 10 Q35 20 30 35 Q25 45 10 50'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Left — text content */}
      <div className="relative z-10 w-full max-w-screen-xl mx-auto px-8 flex items-center min-h-screen">
        <motion.div
          className="w-full md:w-[48%] flex flex-col gap-6 py-24"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={textVariants}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-prabha-sage/30 bg-prabha-sage/10">
              <span className="h-1.5 w-1.5 rounded-full bg-prabha-amber animate-pulse" />
              <span className="text-xs font-medium tracking-widest uppercase text-prabha-sage font-body">
                Agri-Tech Pioneers
              </span>
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 variants={textVariants} className="font-display leading-tight">
            <span className="block text-6xl lg:text-7xl font-black text-white">
              Rising Sun of
            </span>
            <span className="block text-6xl lg:text-7xl font-black text-prabha-amber">
              Agriculture.
            </span>
          </motion.h1>

          {/* Body */}
          <motion.p
            variants={textVariants}
            className="text-white/70 text-lg font-body font-light max-w-md leading-relaxed"
          >
            Empowering farmers with technology rooted in Indian wisdom. Mushroom
            farming, hydroponics, beekeeping — profitably, sustainably.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={textVariants} className="flex flex-wrap gap-4">
            <button className="px-7 py-3.5 rounded-full bg-prabha-amber text-prabha-forest font-body font-semibold text-sm hover:brightness-110 transition-all">
              Explore Services →
            </button>
            <button className="px-7 py-3.5 rounded-full border border-white/40 text-white font-body font-semibold text-sm hover:bg-white/10 transition-all">
              Talk to Bharat
            </button>
          </motion.div>

          {/* Stat chips */}
          <motion.div variants={textVariants} className="flex flex-wrap gap-3 mt-2">
            {["500+ Farmers Trained", "5 States", "45% Water Saved"].map((s) => (
              <span
                key={s}
                className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-xs font-body backdrop-blur-sm"
              >
                {s}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — Photo Collage */}
        <div className="hidden md:block absolute right-0 top-0 w-[55%] h-full">
          {/* Left-edge fade so collage blends into background */}
          <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-prabha-forest to-transparent z-20 pointer-events-none" />

          {/* Collage container */}
          <div className="relative w-full h-full">
            {COLLAGE_PHOTOS.map((photo, i) => (
              <motion.div
                key={i}
                className="absolute overflow-hidden rounded-lg shadow-xl"
                style={{
                  top: photo.style.top,
                  left: photo.style.left,
                  width: photo.style.width,
                  height: photo.style.height,
                  rotate: photo.style.rotate,
                  zIndex: photo.style.zIndex,
                }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.5, ease: "easeOut" }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              </motion.div>
            ))}

            {/* Shadow below the collage pile */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-24 pointer-events-none z-10"
              style={{
                background: "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, transparent 70%)",
                filter: "blur(16px)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
