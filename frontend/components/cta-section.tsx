"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function CTASection() {
    return (
        <section id="cta-section" className="relative bg-[#1a1f1a] py-16 px-6 md:px-12 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-[#1a1f1a] to-[#1a1f1a]" />

            {/* Decorative elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-[#D1FF1C] to-transparent" />

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-6">
                        <span className="text-white block">Ready to</span>
                        <span className="text-[#D1FF1C] font-brier block">Transform</span>
                        <span className="text-white block">Your Farm?</span>
                    </h2>
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
                            className="group flex items-center gap-3 bg-[#D1FF1C] text-[#1a1f1a] font-black uppercase px-10 py-5 rounded-full text-xl tracking-wide hover:bg-white transition-colors duration-300"
                        >
                            Start Now
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Bottom branding */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="mt-16 pt-8 border-t border-white/10 text-center"
                >
                    <p className="text-white/40 text-sm font-mono uppercase tracking-widest mb-2">Powered by</p>
                    <h3 className="text-[#D1FF1C] text-3xl md:text-4xl font-brier">KrishiBot</h3>
                    <p className="text-white/30 text-xs mt-4">© 2025 KrishiBot. Empowering Nepal's Agricultural Future.</p>
                </motion.div>
            </div>
        </section>
    )
}
