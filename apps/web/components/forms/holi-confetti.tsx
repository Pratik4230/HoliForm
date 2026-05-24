"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const COLORS = ["#db2777", "#06b6d4", "#eab308", "#22c55e", "#a855f7", "#f97316"];

type Particle = {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
};

export function HoliConfetti({ active = true }: { active?: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      return;
    }
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    setParticles(
      Array.from({ length: 28 }, (_, id) => ({
        id,
        x: Math.random() * 100,
        y: Math.random() * 40,
        color: COLORS[id % COLORS.length]!,
        size: 6 + Math.random() * 8,
      })),
    );
  }, [active]);

  if (!active || particles.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden
    >
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full opacity-90"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
          }}
          initial={{ y: -20, opacity: 0, scale: 0.5 }}
          animate={{ y: "100vh", opacity: [0, 1, 1, 0], scale: 1, rotate: 360 }}
          transition={{ duration: 2.8 + Math.random(), ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
