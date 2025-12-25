"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function CTASection() {
    return (
        <section id="cta-section" className="relative bg-[#0a0c0a] min-h-screen flex items-center py-24 px-6 md:px-12 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1a2e1a_0%,#0a0c0a_100%)]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#D1FF1C]/5 blur-[120px] rounded-full" />
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#D1FF1C]/3 blur-[120px] rounded-full" />
            </div>

            {/* Decorative line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-[#D1FF1C]/50 to-transparent" />

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-8 leading-none">
                        <span className="text-white block">Ready to</span>
                        <span className="text-[#D1FF1C] font-brier block">Transform</span>
                        <span className="text-white block">Your Farm?</span>
                    </h2>
                    <p className="text-white/40 max-w-2xl mx-auto text-lg md:text-xl font-medium">
                        Join the next generation of precision agriculture in Nepal.
                        Start your journey towards higher yields and sustainable growth today.
                    </p>
                </motion.div>

                {/* Start Now Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-center"
                >
                    <Link href="/dashboard">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group flex items-center gap-3 bg-[#D1FF1C] text-[#1a1f1a] font-black uppercase px-10 py-5 rounded-full text-xl tracking-wide hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-xl"
                        >
                            Start Now
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </Link>
                </motion.div>


            </div>
        </section>
    )
}
