"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HOLI, SPLASH_COLORS } from "./holi-colors";

type Droplet = { id: number; x: number; delay: number; duration: number; size: number };
type Balloon = { id: number; x: number; color: string; delay: number; size: number };
type Splash = { id: number; x: number; y: number; color: string; scale: number; rotation: number };

function ColorSplash({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <path
        d="M60 8 C85 20 108 42 108 68 C108 92 86 112 60 112 C34 112 12 92 12 68 C12 38 35 18 60 8 Z"
        fill={color}
        opacity={0.85}
      />
      <circle cx="38" cy="42" r="14" fill={color} opacity={0.6} />
      <circle cx="82" cy="55" r="10" fill={color} opacity={0.5} />
      <circle cx="55" cy="78" r="12" fill={color} opacity={0.55} />
    </svg>
  );
}

function WaterBalloon({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 48 64" className={className} aria-hidden>
      <ellipse cx="24" cy="28" rx="20" ry="24" fill={color} opacity={0.9} />
      <path d="M24 50 Q22 58 24 62 Q26 58 24 50" fill={color} opacity={0.7} />
      <ellipse cx="18" cy="22" rx="6" ry="4" fill="white" opacity={0.25} />
    </svg>
  );
}

export function HoliLoginScene() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [droplets, setDroplets] = useState<Droplet[]>([]);
  const [splashes, setSplashes] = useState<Splash[]>([]);
  const [balloons, setBalloons] = useState<Balloon[]>([]);

  useEffect(() => {
    setMounted(true);
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    setDroplets(
      Array.from({ length: 14 }, (_, id) => ({
        id,
        x: 5 + Math.random() * 90,
        delay: Math.random() * 6,
        duration: 4 + Math.random() * 4,
        size: 4 + Math.random() * 6,
      })),
    );

    setSplashes(
      Array.from({ length: 6 }, (_, id) => ({
        id,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: SPLASH_COLORS[id % SPLASH_COLORS.length]!,
        scale: 0.5 + Math.random() * 0.8,
        rotation: Math.random() * 360,
      })),
    );

    setBalloons(
      Array.from({ length: 7 }, (_, id) => ({
        id,
        x: 10 + id * 12 + Math.random() * 10,
        color: SPLASH_COLORS[(id + 2) % SPLASH_COLORS.length]!,
        delay: id * 0.9,
        size: 26 + (id % 4) * 6,
      })),
    );
  }, [mounted]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {/* warm sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 10%, ${HOLI.peach} 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 85% 15%, ${HOLI.pink}22 0%, transparent 50%),
            radial-gradient(ellipse 60% 45% at 50% 90%, ${HOLI.yellow}33 0%, transparent 55%),
            linear-gradient(165deg, ${HOLI.cream} 0%, #fff5f5 35%, #fffde7 70%, ${HOLI.cream} 100%)
          `,
        }}
      />

      {/* floor color puddle */}
      <div
        className="absolute -bottom-8 left-1/2 h-32 w-[120%] -translate-x-1/2 rounded-[100%] blur-2xl"
        style={{
          background: `linear-gradient(90deg, ${HOLI.pink}44, ${HOLI.yellow}55, ${HOLI.green}44, ${HOLI.orange}55)`,
        }}
      />

      {/* ambient gulal splashes */}
      {mounted &&
        splashes.map((splash) => (
        <motion.div
          key={splash.id}
          className="absolute"
          style={{
            left: `${splash.x}%`,
            top: `${splash.y}%`,
            width: 80 * splash.scale,
            height: 80 * splash.scale,
          }}
          initial={{ opacity: 0, scale: 0.3, rotate: splash.rotation }}
          animate={
            reducedMotion
              ? { opacity: 0.35, scale: splash.scale, rotate: splash.rotation }
              : {
                  opacity: [0.25, 0.5, 0.35],
                  scale: [splash.scale * 0.9, splash.scale * 1.05, splash.scale],
                  rotate: splash.rotation,
                }
          }
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 5 + splash.id * 0.4, repeat: Infinity, repeatType: "reverse" }
          }
        >
          <ColorSplash color={splash.color} className="h-full w-full drop-shadow-sm" />
        </motion.div>
      ))}

      {/* ambient falling droplets */}
      {mounted &&
        droplets.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute rounded-full"
          style={{
            left: `${drop.x}%`,
            width: drop.size,
            height: drop.size * 1.4,
            background: `linear-gradient(180deg, ${HOLI.blue}cc, ${HOLI.blue}66)`,
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          }}
          initial={{ top: "-5%", opacity: 0 }}
          animate={
            reducedMotion
              ? { top: "40%", opacity: 0.4 }
              : { top: "105%", opacity: [0, 0.7, 0.7, 0] }
          }
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: drop.duration, delay: drop.delay, repeat: Infinity, ease: "linear" }
          }
        />
      ))}

      {/* floating balloons (subtle, eye-pleasing) */}
      {mounted &&
        balloons.map((balloon) => (
        <motion.div
          key={balloon.id}
          className="absolute bottom-[10%]"
          style={{ left: `${balloon.x}%`, width: balloon.size }}
          animate={reducedMotion ? { y: 0 } : { y: [0, -16, 0, -8, 0], rotate: [-2, 2, -1, 1, 0] }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 5.8 + balloon.id * 0.25, delay: balloon.delay, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <WaterBalloon color={balloon.color} className="h-auto w-full drop-shadow-md" />
        </motion.div>
      ))}

      {/* powder cloud wisps */}
      <motion.div
        className="absolute left-[30%] top-[6%] h-24 w-24 rounded-full blur-3xl sm:h-32 sm:w-32"
        style={{ backgroundColor: `${HOLI.purple}55` }}
        animate={reducedMotion ? {} : { x: [0, 30, 0], y: [0, 15, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[25%] bottom-[35%] h-20 w-20 rounded-full blur-3xl sm:h-28 sm:w-28"
        style={{ backgroundColor: `${HOLI.orange}44` }}
        animate={reducedMotion ? {} : { x: [0, -20, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
}
