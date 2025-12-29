import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  active: boolean;
  display_order: number;
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(0);

  // Fetch banners from Supabase
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .eq('active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setBanners(data || []);
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('banners-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'banners'
        },
        () => {
          fetchBanners();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 🌀 Auto-scroll effect
  useEffect(() => {
    if (!isHovered && banners.length > 1) {
      const timer = setInterval(() => {
        nextBanner();
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [currentIndex, isHovered, banners.length]);

  const nextBanner = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleBannerClick = (banner: Banner) => {
    if (banner.link_url) window.open(banner.link_url, "_blank");
  };

  // 🧱 Skeleton Loading State
  if (loading) {
    return (
      <div className="w-full px-4 py-8">
        <div className="relative w-full max-w-7xl mx-auto h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] rounded-3xl overflow-hidden bg-[#0B090A]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#161A1D] to-[#0B090A] animate-pulse" />
          <div className="absolute inset-0 flex flex-col justify-end p-10">
            <div className="w-24 h-1 bg-[#B1A7A6]/30 mb-6 rounded-full animate-pulse" />
            <div className="w-2/3 h-12 bg-[#B1A7A6]/20 mb-4 rounded-lg animate-pulse" />
            <div className="w-1/3 h-12 bg-[#B1A7A6]/10 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <div className="w-full px-4 py-8 transition-all duration-1000">
      <div
        className="relative w-full max-w-8xl mx-auto overflow-hidden rounded-3xl group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: "linear-gradient(135deg, #0B090A 0%, #161A1D 100%)",
          boxShadow:
            "0 25px 50px -12px rgba(229, 56, 59, 0.25), 0 0 0 1px rgba(186, 24, 27, 0.1)",
        }}
      >
        {/* Background Glow */}
        <div
          className="absolute inset-0 opacity-30 transition-opacity duration-700"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(229, 56, 59, 0.15), transparent 70%)",
            animation: "pulse 4s ease-in-out infinite",
          }}
        />

        {/* Banner Image */}
        <div
          key={currentBanner.id}
          className={`relative w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] cursor-pointer overflow-hidden transition-all duration-[1500ms] ease-in-out transform ${
            direction === 1
              ? "translate-x-0 opacity-100"
              : "translate-x-0 opacity-100"
          }`}
          onClick={() => handleBannerClick(currentBanner)}
        >
          <img
            src={currentBanner.image_url}
            alt={currentBanner.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[8000ms] ease-out group-hover:scale-110"
            style={{
              filter: "brightness(0.75) contrast(1.1) saturate(1.15)",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0B090A] via-[#0B090A]/60 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 lg:p-16">
            <div className="max-w-3xl transition-transform duration-700 group-hover:-translate-y-2">
              <div
                className="w-24 h-1 mb-6 rounded-full transition-all duration-700 group-hover:w-32"
                style={{
                  background: "linear-gradient(90deg, #E5383B, #BA181B)",
                  boxShadow: "0 0 20px rgba(229, 56, 59, 0.6)",
                }}
              />
              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight tracking-tight"
                style={{
                  background:
                    "linear-gradient(135deg, #F5F3F4 0%, #D3D3D3 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
                }}
              >
                {currentBanner.title}
              </h2>
              {currentBanner.link_url && (
                <div className="flex items-center gap-3 mt-6 group/cta">
                  <span className="text-[#F5F3F4] text-lg font-semibold tracking-wide transition-all duration-300 group-hover/cta:text-[#E5383B]">
                    Explore Now
                  </span>
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300"
                    style={{
                      background: "linear-gradient(135deg, #E5383B, #BA181B)",
                      boxShadow: "0 4px 15px rgba(229, 56, 59, 0.4)",
                    }}
                  >
                    <ExternalLink className="w-5 h-5 text-[#F5F3F4] transition-transform duration-300 group-hover/cta:rotate-45" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prevBanner}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-full backdrop-blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 z-10"
              style={{
                background:
                  "linear-gradient(135deg, rgba(22, 26, 29, 0.9), rgba(11, 9, 10, 0.95))",
                border: "1px solid rgba(229, 56, 59, 0.3)",
              }}
            >
              <ChevronLeft
                className="w-7 h-7 text-[#F5F3F4]"
                strokeWidth={2.5}
              />
            </button>
            <button
              onClick={nextBanner}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-full backdrop-blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 z-10"
              style={{
                background:
                  "linear-gradient(135deg, rgba(22, 26, 29, 0.9), rgba(11, 9, 10, 0.95))",
                border: "1px solid rgba(229, 56, 59, 0.3)",
              }}
            >
              <ChevronRight
                className="w-7 h-7 text-[#F5F3F4]"
                strokeWidth={2.5}
              />
            </button>
          </>
        )}

        {/* Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className="relative group/dot transition-all duration-300 hover:scale-125"
              >
                <div
                  className={`relative rounded-full transition-all duration-500 ${
                    index === currentIndex ? "w-12 h-3" : "w-3 h-3"
                  }`}
                  style={{
                    background:
                      index === currentIndex
                        ? "linear-gradient(90deg, #E5383B, #BA181B)"
                        : "rgba(177, 167, 166, 0.4)",
                  }}
                />
                {index === currentIndex && !isHovered && (
                  <div
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #F5F3F4, #E5383B)",
                      animation: "progress 6s linear",
                      transformOrigin: "left",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        )}

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.5; }
          }
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    </div>
  );
}
