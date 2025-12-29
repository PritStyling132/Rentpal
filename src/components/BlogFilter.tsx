import React, { useState, useRef, useEffect } from "react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

export default function BlogFilter({ categories, selectedCategory, setSelectedCategory }) {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [categories]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative overflow-hidden py-20 bg-[#F5F3F4]">
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#E5383B]/10 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#BA181B]/10 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-[#A4161A]/5 to-[#660708]/5 rounded-full blur-2xl" />
      
      <div className="relative container font-serif font-bold mx-auto px-4 md:px-6 text-center">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-5 p-1 bg-gradient-to-r from-[#0B090A] via-[#660708] to-[#BA181B] bg-clip-text text-transparent">
            Discover Amazing Content
          </h1>
          <p className="text-lg text-[#161A1D] opacity-70 max-w-2xl mx-auto font-sans">
            Filter through curated collections and find exactly what you're looking for
          </p>
        </div>

        <div className="relative font-sans">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-gradient-to-r from-[#BA181B] to-[#E5383B] text-white rounded-full shadow-xl hover:scale-110 transition-transform duration-300 flex items-center justify-center"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-gradient-to-r from-[#BA181B] to-[#E5383B] text-white rounded-full shadow-xl hover:scale-110 transition-transform duration-300 flex items-center justify-center"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Gradient Fades */}
          {showLeftArrow && (
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#F5F3F4] to-transparent z-10 pointer-events-none" />
          )}
          {showRightArrow && (
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#F5F3F4] to-transparent z-10 pointer-events-none" />
          )}

          <div className="relative bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/40 mb-12 overflow-hidden">
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {categories.map((cat, index) => {
                const isSelected = selectedCategory === cat;
                const delay = Math.min(index * 30, 1000);
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{ animationDelay: `${delay}ms` }}
                    className={`group relative px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-500 transform hover:scale-105 animate-fadeIn whitespace-nowrap flex-shrink-0 ${
                      isSelected
                        ? "bg-gradient-to-r from-[#BA181B] to-[#E5383B] text-white shadow-lg shadow-[#E5383B]/30"
                        : "bg-gradient-to-r from-[#D3D3D3]/50 to-[#B1A7A6]/50 text-[#161A1D] hover:from-[#B1A7A6]/70 hover:to-[#D3D3D3]/70"
                    }`}
                  >
                    {!isSelected && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#BA181B]/0 to-[#E5383B]/0 group-hover:from-[#BA181B]/10 group-hover:to-[#E5383B]/10 transition-all duration-500" />
                    )}
                    {isSelected && (
                      <>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#F5F3F4] rounded-full animate-ping" />
                        <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-[#F5F3F4] rounded-full animate-pulse" />
                      </>
                    )}
                    <span className="relative z-10">{cat}</span>
                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                      <div
                        className={`absolute inset-0 translate-x-[-100%] ${
                          isSelected
                            ? "bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            : "bg-gradient-to-r from-transparent via-[#660708]/10 to-transparent"
                        } group-hover:translate-x-[100%] transition-transform duration-1000`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}