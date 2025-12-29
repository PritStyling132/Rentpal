import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, Eye, Star, TrendingUp } from 'lucide-react';

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function StatCard({ children, className, ...props }: StatCardProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

interface StatsCardsOnProfileProps {
  totalListings: number;
  totalViews: number;
  avgRating: number;
  approvedListings: number;
  pendingListings?: number;
}

type AnimatedNumberProps = { value: number; duration?: number };

const AnimatedNumber = ({ value, duration = 2000 }: AnimatedNumberProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{count}</span>;
};

export default function StatsCardsOnProfile({ totalListings, totalViews, avgRating, approvedListings, pendingListings = 0 } : StatsCardsOnProfileProps) {
 const stats = [
    {
      icon: Package,
      value: totalListings,
      label: "Total Listings",
      gradient: "from-[#BA181B] to-[#E5383B]",
      bgAccent: "bg-[#E5383B]/5",
      delay: 0,
    },
    {
      icon: CheckCircle,
      value: approvedListings,
      label: "Approved & Live",
      gradient: "from-[#A4161A] to-[#BA181B]",
      bgAccent: "bg-[#BA181B]/5",
      delay: 0.1,
    },
    {
      icon: Eye,
      value: totalViews,
      label: "Total Views",
      gradient: "from-[#660708] to-[#A4161A]",
      bgAccent: "bg-[#660708]/5",
      delay: 0.2,
    },
    {
      icon: Star,
      value: Number(avgRating.toFixed(1)),
      label: "Average Rating",
      gradient: "from-[#E5383B] to-[#BA181B]",
      bgAccent: "bg-[#E5383B]/5",
      delay: 0.3,
      isDecimal: true,
    },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <StatCard
                key={index}
                className="group relative bg-white rounded-2xl overflow-hidden border-2 border-[#D3D3D3] hover:border-[#E5383B] transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                style={{
                  animation: `slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${stat.delay}s both`
                }}
              >
                {/* Top accent line */}
                <div className={`h-1 bg-gradient-to-r ${stat.gradient}`}></div>

                {/* Background decoration */}
                <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bgAccent} rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`}></div>
                
                {/* Floating particles on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className={`absolute top-1/4 right-1/4 w-1.5 h-1.5 bg-gradient-to-r ${stat.gradient} rounded-full animate-float`}></div>
                  <div className={`absolute bottom-1/3 left-1/4 w-1 h-1 bg-gradient-to-r ${stat.gradient} rounded-full animate-float-delayed`}></div>
                </div>

                <div className="relative p-6">
                  {/* Icon */}
                  <div className="relative mb-5">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Value */}
                  <div className="mb-2 flex items-baseline gap-2">
                    <div className="text-4xl font-black text-[#0B090A]">
                      {stat.isDecimal ? (
                        (() => {
                          const integerPart = Math.floor(stat.value);
                          const decimalPart = Math.round((stat.value - integerPart) * 10);
                          return (
                            <>
                              <AnimatedNumber value={integerPart} duration={2000} />
                              <span className="text-2xl">.{decimalPart}</span>
                            </>
                          );
                        })()
                      ) : (
                        <AnimatedNumber value={stat.value} duration={2000} />
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </div>
                  </div>

                  {/* Label */}
                  <p className="text-xs font-bold text-[#660708]/70 uppercase tracking-wide">
                    {stat.label}
                  </p>
                </div>

                {/* Bottom accent bar that grows on hover */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left`}></div>
              </StatCard>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-15px) translateX(8px);
            opacity: 1;
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-12px) translateX(-8px);
            opacity: 1;
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 3.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
}