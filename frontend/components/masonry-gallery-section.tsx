"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"

const galleryImages = [
  {
    src: "/images/crop-1.jpg",
    alt: "Agricultural Crop 1",
    title: "Eco-Friendly Farming",
    aspect: "aspect-[4/5]",
  },
  {
    src: "/images/crop-2.jpg",
    alt: "Agricultural Crop 2",
    title: "Precision Harvesting",
    aspect: "aspect-[4/5]",
  },
  {
    src: "/images/crop-3.jpg",
    alt: "Agricultural Crop 3",
    title: "Organic Yields",
    aspect: "aspect-[4/5]",
  },
]

export default function MasonryGallerySection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  // Background transition: Dark Green -> Gray -> White
  const backgroundColor = useTransform(scrollYProgress, [0, 0.6, 0.9], ["#282c20", "#ccc", "#ffffff"])

  // Y Movement: Move grid up to reveal all images
  const y = useTransform(scrollYProgress, [0, 1], ["0vh", "-50vh"])




  return (
    <section
      ref={sectionRef}
      id="masonry-gallery"
      className="relative"
      style={{
        height: "120vh",
        position: "relative",
      }}
    >
      <motion.div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center" style={{ backgroundColor }}>
        <motion.div style={{ y }} className="relative w-full max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {galleryImages.map((image, index) => (
              <MasonryCard key={index} image={image} index={index} />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

function MasonryCard({ image, index }: { image: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      className={`group relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 bg-gray-900 border border-white/10 w-full ${image.aspect}`}
    >
      <Image
        src={image.src || "/placeholder.svg"}
        alt={image.alt}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        quality={95}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-[#D1FF1C] text-xs font-mono uppercase tracking-widest mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
          Analytics
        </p>
        <h3 className="text-white text-xl md:text-2xl font-bold">
          {image.title}
        </h3>
      </div>

      {/* Border Glow */}
      <div className="absolute inset-0 border-2 border-[#D1FF1C]/0 group-hover:border-[#D1FF1C]/30 rounded-2xl transition-colors duration-500" />
    </motion.div>
  )
}
