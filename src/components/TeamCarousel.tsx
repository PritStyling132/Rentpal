import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  platform: string;
  followers_count: number;
  avatar_url: string;
  profile_url?: string;
}

interface TeamCarouselProps {
  members: TeamMember[];
}

const TeamCarousel = ({ members }: TeamCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  if (!members || members.length === 0) {
    return null;
  }

  const updateCarousel = (newIndex: number) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const normalizedIndex = (newIndex + members.length) % members.length;
    setCurrentIndex(normalizedIndex);

    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  };

  const handlePrevious = () => {
    updateCarousel(currentIndex - 1);
  };

  const handleNext = () => {
    updateCarousel(currentIndex + 1);
  };

  const getCardClass = (index: number) => {
    const offset = (index - currentIndex + members.length) % members.length;

    if (offset === 0) return "center";
    if (offset === 1) return "down-1";
    if (offset === 2) return "down-2";
    if (offset === members.length - 1) return "up-1";
    if (offset === members.length - 2) return "up-2";
    return "hidden";
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        handlePrevious();
      } else if (e.key === "ArrowDown") {
        handleNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  return (
    <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 py-12 px-4">
      {/* Carousel Section */}
      <div className="relative w-full max-w-[500px] h-[60vh] lg:h-[70vh] flex flex-col items-center justify-center">
        {/* Mobile Top Arrow */}
        <button
          onClick={handlePrevious}
          className="lg:hidden absolute top-5 left-1/2 -translate-x-1/2 z-20 w-[70px] h-[70px] flex items-center justify-center bg-transparent hover:scale-110 transition-transform duration-300"
          aria-label="Previous"
        >
          <img
            src="https://ik.imagekit.io/gopichakradhar/icons/top.png?updatedAt=1754290522765"
            alt="Up"
            className="w-[50px] h-[50px] object-contain -rotate-90"
          />
        </button>

        {/* Carousel Track */}
        <div className="relative w-full max-w-[350px] lg:max-w-[450px] h-full flex items-center justify-center perspective-1000">
          {members.map((member, index) => (
            <div
              key={member.id}
              onClick={() => updateCarousel(index)}
              className={`carousel-card ${getCardClass(index)}`}
            >
              <img
                src={member.avatar_url}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Mobile Bottom Arrow */}
        <button
          onClick={handleNext}
          className="lg:hidden absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[70px] h-[70px] flex items-center justify-center bg-transparent hover:scale-110 transition-transform duration-300"
          aria-label="Next"
        >
          <img
            src="https://ik.imagekit.io/gopichakradhar/icons/down.png?updatedAt=1754290523249"
            alt="Down"
            className="w-[50px] h-[50px] object-contain rotate-90"
          />
        </button>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col items-center gap-8 lg:gap-10 w-full max-w-md">
        {/* Desktop Navigation Arrows */}
        <div className="hidden lg:flex flex-row gap-8">
          <button
            onClick={handlePrevious}
            className="w-[80px] h-[80px] flex items-center justify-center bg-transparent hover:scale-110 transition-transform duration-300"
            aria-label="Previous"
          >
            <img
              src="https://ik.imagekit.io/gopichakradhar/icons/top.png?updatedAt=1754290522765"
              alt="Up"
              className="w-[60px] h-[60px] object-contain"
            />
          </button>
          <button
            onClick={handleNext}
            className="w-[80px] h-[80px] flex items-center justify-center bg-transparent hover:scale-110 transition-transform duration-300"
            aria-label="Next"
          >
            <img
              src="https://ik.imagekit.io/gopichakradhar/icons/down.png?updatedAt=1754290523249"
              alt="Down"
              className="w-[60px] h-[60px] object-contain"
            />
          </button>
        </div>

        {/* Member Info */}
        <div className="text-center space-y-4 transition-opacity duration-500">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary relative inline-block">
            {members[currentIndex].name}
            <div className="absolute -left-24 top-1/2 w-20 h-0.5 bg-primary hidden lg:block" />
            <div className="absolute -right-24 top-1/2 w-20 h-0.5 bg-primary hidden lg:block" />
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground font-semibold">
            {formatFollowers(members[currentIndex].followers_count)} Followers
          </p>
          {members[currentIndex].profile_url && (
            <Button
              onClick={() => window.open(members[currentIndex].profile_url, "_blank")}
              className="bg-gradient-to-r from-primary to-primary/80 text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              View Profile
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Dots Navigation */}
        <div className="flex gap-3">
          {members.map((_, index) => (
            <button
              key={index}
              onClick={() => updateCarousel(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-primary scale-125"
                  : "bg-primary/20 hover:bg-primary/40"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }

        .carousel-card {
          position: absolute;
          width: 320px;
          height: 180px;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          cursor: pointer;
        }

        @media (min-width: 1024px) {
          .carousel-card {
            width: 400px;
            height: 225px;
          }
        }

        .carousel-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .carousel-card.center {
          z-index: 10;
          transform: scale(1.1) translateZ(0);
        }

        .carousel-card.center img {
          filter: none;
        }

        .carousel-card.up-2 {
          z-index: 1;
          transform: translateY(-160px) scale(0.8) translateZ(-300px);
          opacity: 0.7;
        }

        @media (min-width: 1024px) {
          .carousel-card.up-2 {
            transform: translateY(-300px) scale(0.8) translateZ(-300px);
          }
        }

        .carousel-card.up-2 img {
          filter: grayscale(100%);
        }

        .carousel-card.up-1 {
          z-index: 5;
          transform: translateY(-80px) scale(0.9) translateZ(-100px);
          opacity: 0.9;
        }

        @media (min-width: 1024px) {
          .carousel-card.up-1 {
            transform: translateY(-150px) scale(0.9) translateZ(-100px);
          }
        }

        .carousel-card.up-1 img {
          filter: grayscale(100%);
        }

        .carousel-card.down-1 {
          z-index: 5;
          transform: translateY(80px) scale(0.9) translateZ(-100px);
          opacity: 0.9;
        }

        @media (min-width: 1024px) {
          .carousel-card.down-1 {
            transform: translateY(150px) scale(0.9) translateZ(-100px);
          }
        }

        .carousel-card.down-1 img {
          filter: grayscale(100%);
        }

        .carousel-card.down-2 {
          z-index: 1;
          transform: translateY(160px) scale(0.8) translateZ(-300px);
          opacity: 0.7;
        }

        @media (min-width: 1024px) {
          .carousel-card.down-2 {
            transform: translateY(300px) scale(0.8) translateZ(-300px);
          }
        }

        .carousel-card.down-2 img {
          filter: grayscale(100%);
        }

        .carousel-card.hidden {
          opacity: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default TeamCarousel;
