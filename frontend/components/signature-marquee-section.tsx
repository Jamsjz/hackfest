"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

// Floating particles component for wind effect
function FloatingParticles() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 15,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
    }));
    setParticles(newParticles);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle: any) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-[#D1FF1C]/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.startX}%`,
            top: `${particle.startY}%`,
          }}
          animate={{
            x: [0, 100, 200, 300],
            y: [0, -30, 10, -20],
            opacity: [0, 0.6, 0.4, 0],
            scale: [0.5, 1, 0.8, 0.3],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}

// Animated wind lines
function WindLines() {
  const [lines, setLines] = useState<any[]>([]);

  useEffect(() => {
    const newLines = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      y: 20 + i * 12,
      delay: i * 0.4,
      width: 100 + Math.random() * 150,
    }));
    setLines(newLines);
  }, []);

  if (lines.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {lines.map((line: any) => (
        <motion.div
          key={line.id}
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-[#D1FF1C] to-transparent"
          style={{
            top: `${line.y}%`,
            width: line.width,
          }}
          animate={{
            x: ["-100%", "200vw"],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            delay: line.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}

export default function SignatureMarqueeSection() {
  return (
    <div className="relative w-full min-h-[60vh] flex flex-col items-center justify-center z-0 overflow-hidden">
      {/* Dynamic wind effects */}
      <FloatingParticles />
      <WindLines />

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a1f1a]/10 to-transparent pointer-events-none" />

      <div className="w-full flex flex-col items-center justify-center select-none pointer-events-none relative z-10 px-6 py-12">
        {/* Nepali Agricultural Quote - 2 lines, larger font */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-[1.15]">
            {/* Line 1 */}
            <span className="block mb-4">
              <span className="text-[#D1FF1C] font-brier">माटोको</span>
              <span className="text-white"> काखमा, सुन </span>
              <span className="text-[#D1FF1C] font-brier">फुलाउँछौँ</span>
            </span>
            {/* Line 2 */}
            <span className="block">
              <span className="text-white">पसिनाको बलमा </span>
              <motion.span
                className="text-[#D1FF1C] font-brier"
                animate={{ opacity: [0.85, 1, 0.85] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                भविष्य कोर्छौँ।
              </motion.span>
            </span>
          </h2>
          <div className="mt-10 mx-auto w-24 h-1 bg-gradient-to-r from-transparent via-[#D1FF1C] to-transparent opacity-50" />
        </motion.div>
      </div>
    </div>
  )
}
