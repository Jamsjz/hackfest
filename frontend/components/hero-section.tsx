"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import InteractivePortrait from "./interactive-portrait"
import SignatureMarqueeSection from "./signature-marquee-section"

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  // Wait for preloader (2.5s + buffer)
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 2600)
    return () => clearTimeout(timer)
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // Phase 1: Shrink Portrait (0% -> 40%)
  const scale = useTransform(smoothProgress, [0, 0.4], [1, 0])

  // Phase 2: Text Appearance (45% -> 85%)
  const textOpacity = useTransform(smoothProgress, [0.45, 0.85], [0, 1])

  return (
    <section ref={containerRef} className="relative h-[110vh] bg-[#1a1f1a]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#1a1f1a]">
        {/* Background Text Layer */}
        <motion.div
          className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none px-6"
        >
          <motion.div
            className="w-full max-w-7xl flex items-center justify-center opacity-0"
            style={{ opacity: textOpacity }}
          >
            <SignatureMarqueeSection />
          </motion.div>
        </motion.div>

        {/* Foreground Portrait Layer */}
        <motion.div
          className="relative z-10 w-full h-full flex items-center justify-center"
          style={{
            scale: scale,
          }}
        >
          {isReady && <InteractivePortrait />}
        </motion.div>
      </div>
    </section>
  )
}
