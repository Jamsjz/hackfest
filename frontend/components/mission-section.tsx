"use client"

import { useRef } from "react"
import { useScroll, useTransform } from "framer-motion"
import { Leaf } from "lucide-react"

export default function MissionSection() {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const imageScale = useTransform(scrollYProgress, [0, 0.3, 0.6], [1.2, 1, 0.2])
  const imageY = useTransform(scrollYProgress, [0, 0.3, 0.6], [0, 0, -200])
  const imageOpacity = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6], [0, 1, 1, 0])

  return (
    <section
      id="mission"
      ref={sectionRef}
      className="relative bg-lorenzo-dark text-lorenzo-text-light py-16 flex items-center justify-center"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Leaf Icon */}
        <div className="relative h-24 flex items-center justify-center">
          <Leaf className="h-12 w-12 text-lorenzo-accent" />
        </div>

        {/* Simple tagline instead of duplicate quote */}
        <div className="text-center">
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
            Empowering Nepali farmers with AI-driven insights for sustainable agriculture and better yields.
          </p>
        </div>
      </div>
    </section>
  )
}
