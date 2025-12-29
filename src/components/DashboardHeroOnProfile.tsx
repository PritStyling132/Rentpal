import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Award, Flame } from 'lucide-react';
interface DashboardHeroProps {
  user: {
    email?: string;
  };
  totalViews: number;
  avgRating: number;
  streakData?: {
    current_streak?: number;
    longest_streak?: number;
  };
  avatarUrl?: string;
  userName?: string;
  onEditProfile?: () => void;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({
  user,
  totalViews,
  avgRating,
  streakData,
  avatarUrl,
  userName,
  onEditProfile
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; size: number; duration: number; delay: number }[]
  >([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Generate floating particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] p-3 sm:p-4 md:p-8 overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Large gradient orbs */}
          <div 
            className="absolute w-[600px] h-[600px] rounded-full animate-pulse-glow"
            style={{
              background: 'radial-gradient(circle, #E5383B 0%, transparent 70%)',
              top: '10%',
              right: '10%',
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
            }}
          />
          <div 
            className="absolute w-[500px] h-[500px] rounded-full animate-pulse-glow"
            style={{
              background: 'radial-gradient(circle, #BA181B 0%, transparent 70%)',
              bottom: '5%',
              left: '5%',
              animationDelay: '1s',
              transform: `translate(${-mousePosition.x * 0.015}px, ${-mousePosition.y * 0.015}px)`
            }}
          />
          <div 
            className="absolute w-[400px] h-[400px] rounded-full animate-pulse-glow"
            style={{
              background: 'radial-gradient(circle, #A4161A 0%, transparent 70%)',
              top: '50%',
              left: '50%',
              animationDelay: '2s',
              transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
            }}
          />

          {/* Floating particles */}
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full bg-gradient-to-br from-[#E5383B] to-[#BA181B] opacity-20 animate-float"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDuration: `${particle.duration}s`,
                animationDelay: `${particle.delay}s`
              } as React.CSSProperties}
            />
          ))}

          {/* Rotating geometric shapes */}
          <div className="absolute top-20 right-40 w-32 h-32 animate-rotate opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,10 90,35 75,80 25,80 10,35" fill="#E5383B" />
            </svg>
          </div>
          <div className="absolute bottom-20 left-40 w-24 h-24 animate-rotate opacity-10" style={{ animationDirection: 'reverse', animationDuration: '15s' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#BA181B" strokeWidth="3" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="#E5383B" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 animate-slide-up">
          <div className="gradient-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 overflow-hidden relative">
            {/* Shimmer effect overlay */}
            <div className="absolute inset-0 animate-shimmer opacity-50" />
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `repeating-linear-gradient(0deg, #E5383B 0px, transparent 1px, transparent 40px),
                               repeating-linear-gradient(90deg, #E5383B 0px, transparent 1px, transparent 40px)`
            }} />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 md:gap-8">
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
                  {/* Avatar with glow effect */}
                  <div className="relative group mx-auto sm:mx-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#E5383B] to-[#BA181B] rounded-2xl blur-2xl opacity-60 group-hover:opacity-100 transition-all duration-500 animate-pulse-glow" />
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-[#BA181B] via-[#E5383B] to-[#A4161A] p-1 shadow-2xl transform group-hover:scale-110 transition-transform duration-500">
                      <div className="w-full h-full rounded-xl bg-[#F5F3F4] flex items-center justify-center overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#E5383B]/10 to-transparent animate-shimmer" />
                        {avatarUrl ? (
                          <img 
                            src={avatarUrl} 
                            alt="Profile" 
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <span className="relative text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#660708] via-[#BA181B] to-[#E5383B]">
                            {userName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 text-center sm:text-left w-full">
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 glass-effect rounded-full mb-2 sm:mb-3 shadow-lg group hover:shadow-[#E5383B]/50 transition-all duration-300">
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#E5383B] animate-pulse" />
                      <span className="text-xs sm:text-sm font-bold text-[#F5F3F4] tracking-wide">DASHBOARD OVERVIEW</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black text-[#F5F3F4] mb-2 tracking-tight relative">
                      <span className="relative inline-block">
                        {userName || user.email?.split('@')[0] || 'User'}
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#E5383B] to-[#BA181B] blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                      </span>
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-[#B1A7A6] font-medium mb-3 sm:mb-4 tracking-wide break-all">
                      {user.email}
                    </p>
                    {onEditProfile && (
                      <button 
                        onClick={onEditProfile}
                        className="group relative inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 bg-gradient-to-r from-[#BA181B] via-[#E5383B] to-[#BA181B] text-white font-bold rounded-lg sm:rounded-xl shadow-lg shadow-[#E5383B]/40 hover:shadow-2xl hover:shadow-[#E5383B]/60 transition-all duration-500 overflow-hidden text-xs sm:text-sm md:text-base"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 relative z-10 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="relative z-10 whitespace-nowrap">Edit Profile</span>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="group glass-effect px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:border-[#E5383B] transition-all duration-300 shadow-lg hover:shadow-[#E5383B]/30 transform hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#E5383B]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#A4161A] to-[#E5383B] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl font-black text-[#F5F3F4] tracking-tight">{totalViews.toLocaleString()}</div>
                        <div className="text-[10px] sm:text-xs text-[#B1A7A6] font-bold uppercase tracking-wider">Total Reach</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group glass-effect px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:border-[#E5383B] transition-all duration-300 shadow-lg hover:shadow-[#E5383B]/30 transform hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#E5383B]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#BA181B] to-[#E5383B] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl font-black text-[#F5F3F4] tracking-tight">{avgRating.toFixed(1)}★</div>
                        <div className="text-[10px] sm:text-xs text-[#B1A7A6] font-bold uppercase tracking-wider">Avg Rating</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Streak Card */}
              {streakData && streakData.current_streak > 0 && (
                <div className="relative group w-full lg:w-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#E5383B] to-[#BA181B] rounded-2xl sm:rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 animate-pulse-glow" />
                  <div className="relative p-6 sm:p-8 md:p-10 bg-gradient-to-br from-[#BA181B] via-[#E5383B] to-[#A4161A] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
                    {/* Animated grid pattern */}
                    <div className="absolute inset-0" style={{
                      backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 30px),
                                       repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 30px)`
                    }} />
                    
                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    
                    <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border-2 border-white/30 group-hover:rotate-12 transition-transform duration-500">
                        <Flame className="w-10 h-10 sm:w-14 sm:h-14 text-white drop-shadow-2xl animate-pulse" />
                      </div>
                      <div className="text-center sm:text-left">
                        <div className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-1 sm:mb-2 tracking-tighter drop-shadow-lg">
                          {streakData.current_streak}
                        </div>
                        <div className="text-base sm:text-lg md:text-xl text-white font-bold mb-1 tracking-wide">
                          Day Streak 🔥
                        </div>
                        <div className="text-xs sm:text-sm text-white/80 font-semibold flex items-center justify-center sm:justify-start gap-2">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          Best: {streakData.longest_streak} days
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slide-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-float { animation: float var(--duration) ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .animate-shimmer { 
          background: linear-gradient(90deg, transparent, rgba(229, 56, 59, 0.3), transparent);
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }
        .animate-rotate { animation: rotate 20s linear infinite; }
        .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
        .glass-effect {
          background: rgba(22, 26, 29, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(229, 56, 59, 0.2);
        }
        .gradient-border {
          position: relative;
          background: linear-gradient(#161A1D, #161A1D) padding-box,
                      linear-gradient(135deg, #E5383B, #BA181B, #660708) border-box;
          border: 2px solid transparent;
        }
      `}</style>
    </div>
  );
};

export default DashboardHero;