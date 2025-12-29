import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BlogHero({ onExploreClick, onLatestClick }) {
  const blogTypes = [
    { text: "Tech Blog", color: "#E5383B" },
    { text: "Industry Insights", color: "#BA181B" },
    { text: "Creative Stories", color: "#A4161A" },
    { text: "Business Hub", color: "#660708" },
    { text: "Lifestyle Guide", color: "#E5383B" },
    { text: "Innovation Lab", color: "#BA181B" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate words
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % blogTypes.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-6 relative py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-4xl mx-auto relative"
      >
        {/* Floating Circles */}
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-40 h-40 border-4 border-[#E5383B]/20 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.3, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-10 -right-10 w-32 h-32 border-4 border-[#BA181B]/20 rounded-full"
        />

        {/* Animated Badge */}
        <motion.span
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block px-6 py-2 mb-8 text-sm font-bold tracking-widest text-[#E5383B] bg-gradient-to-r from-[#E5383B]/10 to-[#BA181B]/10 rounded-full border-2 border-[#E5383B]/30 shadow-lg relative overflow-hidden"
        >
          <motion.span
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
          <span className="relative z-10">✨ INSIGHTS & UPDATES</span>
        </motion.span>

        {/* Heading */}
        <h1 className="text-5xl md:text-6xl lg:text-5xl font-black mb-8 leading-tight flex flex-wrap justify-center items-center gap-3">
          <motion.span
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-[#0B090A] to-[#161A1D]"
          >
            Dive into Our
          </motion.span>
          {/* Rolling Text */}
          <span className="relative inline-block min-w-[200px] text-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentIndex}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="inline-block font-black whitespace-nowrap"
                style={{
                  background: `linear-gradient(135deg, ${blogTypes[currentIndex].color} 0%, #BA181B 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: `drop-shadow(0 0 16px ${blogTypes[currentIndex].color}40)`,
                }}
              >
                {blogTypes[currentIndex].text}
              </motion.span>
            </AnimatePresence>
          </span>
        </h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg md:text-xl text-[#161A1D]/70 mb-10 leading-relaxed max-w-2xl mx-auto font-medium"
        >
          Discover the latest{" "}
          <motion.span
            animate={{ color: ["#E5383B", "#BA181B", "#A4161A", "#E5383B"] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="font-bold"
          >
            industry trends
          </motion.span>
          , in-depth interviews, emerging technologies, and expert resources — all in one place.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-5 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.08, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExploreClick}
            className="group relative px-10 py-4 bg-gradient-to-r from-[#E5383B] to-[#BA181B] text-white font-bold rounded-full overflow-hidden shadow-xl transition-all duration-300"
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-[#BA181B] to-[#660708]"
              initial={{ x: "100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
            <span className="relative z-10 flex items-center gap-2">
              Explore All Blogs
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLatestClick}
            className="px-10 py-4 bg-transparent border-3 border-[#E5383B] text-[#E5383B] font-bold rounded-full hover:bg-[#E5383B] hover:text-white transition-all duration-300 shadow-lg"
          >
            Latest Articles
          </motion.button>
        </motion.div>

        {/* Progress Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-14 flex gap-3 justify-center items-center"
        >
          {blogTypes.map((type, idx) => (
            <motion.div key={idx} className="relative" whileHover={{ scale: 1.5 }}>
              <motion.div
                className="rounded-full transition-all duration-500 cursor-pointer"
                animate={{
                  width: idx === currentIndex ? 32 : 8,
                  height: 8,
                  backgroundColor: idx === currentIndex ? type.color : "#D3D3D3",
                }}
              />
              {idx === currentIndex && (
                <motion.div
                  layoutId="activeDot"
                  className="absolute inset-0 rounded-full"
                  style={{ boxShadow: `0 0 20px ${type.color}` }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#E5383B] rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </motion.div>
    </div>
  );
}
