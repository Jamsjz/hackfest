"use client"

import type React from "react"

import { useEffect } from "react"
import Lenis from "lenis"

// Extend Window interface to include lenis
declare global {
  interface Window {
    lenis?: Lenis
  }
}

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 2,
    })

    // Store Lenis globally for use in other components
    if (typeof window !== "undefined") {
      window.lenis = lenis
    }

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      if (typeof window !== "undefined") {
        window.lenis = undefined
      }
    }
  }, [])

  return <>{children}</>
}
