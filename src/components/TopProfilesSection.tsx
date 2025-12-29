import { useEffect, useState, useRef } from "react";
import { useTopProfiles, useSectionVisibility } from "@/hooks/useTopProfiles";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Flame, Trophy, Crown } from "lucide-react";

const TopProfilesSection = () => {
  const { data: profiles, isLoading } = useTopProfiles();
  const { data: visibility } = useSectionVisibility("top_profiles");
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Fade-in when section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => sectionRef.current && observer.unobserve(sectionRef.current);
  }, []);

  if (!visibility?.is_visible || isLoading || !profiles?.length) return null;

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-[#F5F3F4]" />;
    if (index === 1) return <Trophy className="w-5 h-5 text-[#F5F3F4]" />;
    if (index === 2) return <Flame className="w-5 h-5 text-[#F5F3F4]" />;
    return null;
  };

  const getRankGradient = (index: number) => {
    if (index === 0) return "from-[#E5383B] to-[#BA181B]";
    if (index === 1) return "from-[#660708] to-[#A4161A]";
    if (index === 2) return "from-[#BA181B] to-[#E5383B]";
    return "from-[#B1A7A6] to-[#D3D3D3]";
  };

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden min-h-[120vh] py-32 transition-all duration-1000 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
      } bg-gradient-to-b from-[#0B090A] via-[#161A1D] to-[#0B090A]`}
    >
      {/* ---- Animated Background Glow ---- */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-40 left-10 w-[500px] h-[500px] bg-[#E5383B]/25 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-32 w-[600px] h-[600px] bg-[#BA181B]/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-[900px] h-[900px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_center,rgba(229,56,59,0.1),transparent_70%)] blur-3xl animate-pulse-slow" />
      </div>

      {/* ---- Floating Twinkle Dots ---- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[3px] h-[3px] bg-[#E5383B]/70 rounded-full animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 5}s`,
              transform: `scale(${0.5 + Math.random()})`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* ---- Header ---- */}
        <div
          className={`text-center mb-20 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#E5383B]/15 to-[#BA181B]/15 rounded-full backdrop-blur-md shadow-inner mb-5">
            <span className="text-sm tracking-widest font-semibold text-[#E5383B]">
              🏆 HALL OF FAME
            </span>
          </div>
          <h2 className="text-6xl md:text-7xl font-extrabold tracking-tight text-[#F5F3F4] mb-3">
            Top 10{" "}
            <span className="bg-gradient-to-r from-[#E5383B] to-[#BA181B] bg-clip-text text-transparent">
              Profiles
            </span>
          </h2>
          <p className="text-lg text-[#D3D3D3]/80 max-w-xl mx-auto">
            Celebrating our most active and inspiring members with a glowing
            tribute ✨
          </p>
        </div>

        {/* ---- Profiles Scroll ---- */}
        <ScrollArea className="w-full">
          <div className="flex gap-10 md:gap-14 pt-16 pb-16 px-4 justify-center">
            {profiles.map((profile, index) => (
              <div
                key={profile.id}
                className={`group flex flex-col items-center gap-5 min-w-[200px] transition-all duration-700 ${
                  visible
                    ? "opacity-100 translate-y-0 animate-scale-in"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  <div
                    className={`absolute -inset-8 bg-gradient-to-r ${getRankGradient(
                      index
                    )} opacity-0 group-hover:opacity-50 rounded-full blur-3xl transition-all duration-700`}
                  />
                  <div
                    className={`relative p-[4px] bg-gradient-to-br ${getRankGradient(
                      index
                    )} rounded-full shadow-[0_0_40px_rgba(229,56,59,0.6)] group-hover:scale-110 transition-all duration-500`}
                  >
                    <Avatar className="w-36 h-36 border-[3px] border-[#B1A7A6]/30 bg-[#161A1D]/70 backdrop-blur-lg overflow-hidden rounded-full shadow-inner">
                      <AvatarImage
                        src={profile.avatar_url}
                        alt={profile.name}
                        className="object-cover transition-all duration-500 group-hover:scale-110"
                      />
                      <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-[#B1A7A6] to-[#D3D3D3] text-[#161A1D]">
                        {profile.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Rank Badge */}
                  {index < 3 ? (
                    <div
                      className={`absolute -top-6 -left-6 w-14 h-14 bg-gradient-to-br ${getRankGradient(
                        index
                      )} rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(229,56,59,0.6)] border-2 border-[#F5F3F4]/10 group-hover:scale-125 transition-all duration-300`}
                    >
                      {getRankIcon(index)}
                    </div>
                  ) : (
                    <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-[#B1A7A6] to-[#D3D3D3] rounded-full flex items-center justify-center shadow-lg border-2 border-[#F5F3F4]/10">
                      <span className="text-xs font-bold text-[#161A1D]">
                        #{index + 1}
                      </span>
                    </div>
                  )}

                  {/* Streak Badge */}
                  {profile.streak > 0 && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                      <div className="relative flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#660708] via-[#A4161A] to-[#E5383B] text-[#F5F3F4] font-semibold text-sm tracking-tight shadow-[0_0_30px_rgba(229,56,59,0.5)] border border-[#F5F3F4]/10 backdrop-blur-md animate-pulse-glow">
                        <Flame className="w-5 h-5 text-[#F5F3F4]" />
                        <span>{profile.streak}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center space-y-1 mt-3">
                  <h3 className="text-lg font-semibold text-[#F5F3F4] group-hover:text-[#E5383B] transition-colors duration-300">
                    {profile.name}
                  </h3>
                  <p className="text-sm text-[#D3D3D3]/70">Active Member</p>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar
            orientation="horizontal"
            className="h-2 bg-[#D3D3D3]/20 rounded-full"
          />
        </ScrollArea>
      </div>

      {/* ---- Animations ---- */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, -60px) scale(1.15); }
          66% { transform: translate(-40px, 40px) scale(0.95); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.8); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 25px rgba(229,56,59,0.5); transform: scale(1); }
          50% { box-shadow: 0 0 50px rgba(229,56,59,0.8); transform: scale(1.05); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        .animate-blob { animation: blob 9s infinite ease-in-out; }
        .animate-scale-in { animation: scale-in 0.6s ease-out forwards; }
        .animate-pulse-glow { animation: pulse-glow 2.8s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 6s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animate-pulse-slow { animation: pulse-slow 7s ease-in-out infinite; }
      `}</style>
    </section>
  );
};

export default TopProfilesSection;
