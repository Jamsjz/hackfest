"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [logoColor, setLogoColor] = useState<"white" | "dark">("dark")

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY
      setScrolled(currentScroll >= 300)

      let newColor: "white" | "dark" = "dark"

      if (currentScroll > 2) {
        newColor = "white"
      }

      const headerOffset = 100 // Approximate header height

      const masonry = document.getElementById("masonry-gallery")
      if (masonry) {
        const rect = masonry.getBoundingClientRect()
        if (rect.top <= headerOffset && rect.bottom > headerOffset) {
          const progress = (headerOffset - rect.top) / rect.height
          if (progress > 0.65) {
            newColor = "dark"
          }
        }
      }

      const helmets = document.getElementById("helmets")
      if (helmets) {
        const rect = helmets.getBoundingClientRect()
        if (rect.top <= headerOffset && rect.bottom > headerOffset) {
          newColor = "white"
        }
      }

      const social = document.getElementById("social-section")
      if (social) {
        const rect = social.getBoundingClientRect()
        if (rect.top <= headerOffset && rect.bottom > headerOffset) {
          newColor = "dark"
        }
      }

      const techSpecs = document.getElementById("tech-specs")
      if (techSpecs) {
        const rect = techSpecs.getBoundingClientRect()
        if (rect.top <= headerOffset && rect.bottom > headerOffset) {
          newColor = "dark"
        }
      }

      setLogoColor(newColor)
    }

    handleScroll()

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
  }, [menuOpen])

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-md" : "bg-transparent"
          }`}
      >
        <div className="w-full px-4 md:px-6 flex items-center justify-between h-32">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col justify-center items-start"
          >
            <Link href="/" className="flex items-center gap-1 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="relative w-28 h-28 md:w-36 md:h-36"
              >
                <Image
                  src="/images/krishibot-main-logo.png"
                  alt="KrishiBot Logo"
                  fill
                  className="object-contain drop-shadow-2xl font-black"
                  priority
                />
              </motion.div>
              <div className="flex flex-col ml-[-8px]">
                <span className="text-white font-black text-3xl md:text-5xl tracking-tighter uppercase group-hover:text-[#D1FF1C] transition-colors duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                  Krishi<span className="text-[#D1FF1C] group-hover:text-white transition-colors">Bot</span>
                </span>
                <span className="text-[10px] md:text-xs text-white/40 font-mono tracking-[0.4em] uppercase -mt-1 ml-1">
                  Nepal's AG Future
                </span>
              </div>
            </Link>
          </motion.div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-lorenzo-dark/95 backdrop-blur-xl z-40 flex items-center justify-center"
            onClick={() => setMenuOpen(false)}
          >
            <motion.nav
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
                closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
              }}
              className="text-center"
            >
              <motion.ul className="space-y-6 text-4xl md:text-6xl font-black uppercase text-white">
                {["HOME", "ABOUT", "FEATURES", "CROPS", "AI CHAT", "CONTACT"].map((item, index) => (
                  <motion.li
                    key={item}
                    variants={{
                      open: { opacity: 1, y: 0, rotate: 0 },
                      closed: { opacity: 0, y: 20, rotate: -5 },
                    }}
                  >
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="inline-block hover:text-lorenzo-accent transition-colors duration-300 hover:scale-110 transform"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item}
                    </a>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div
                variants={{
                  open: { opacity: 1, y: 0 },
                  closed: { opacity: 0, y: 20 },
                }}
                className="mt-12 flex justify-center gap-6"
              >
                {["MORDERNIZING", "AGRICULTURE", "IN NEPAL"].map((social) => (
                  <motion.a
                    key={social}
                    whileHover={{ scale: 1.1, color: "#c8f550" }}
                    href="#"
                    className="text-sm font-bold text-white/60 hover:text-lorenzo-accent transition-colors"
                  >
                    {social}
                  </motion.a>
                ))}
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
