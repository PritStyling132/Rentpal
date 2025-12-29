import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { X, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  link_url: string | null;
  display_duration: number;
  active: boolean;
}

export const AdPopup = () => {
  const [open, setOpen] = useState(false);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const hasSeenAd = sessionStorage.getItem('hasSeenAd');
    
    if (!hasSeenAd) {
      fetchRandomAd();
    }
  }, []);

  useEffect(() => {
    if (currentAd && open && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && open) {
      handleClose();
    }
  }, [timeLeft, open, currentAd]);

  const fetchRandomAd = async () => {
    try {
      const { data } = await supabase
        .from('ads')
        .select('*')
        .eq('active', true);

      if (data && data.length > 0) {
        const randomAd = data[Math.floor(Math.random() * data.length)];
        setCurrentAd(randomAd);
        setTimeLeft(randomAd.display_duration);
        setOpen(true);
      }
    } catch (error) {
      console.error('Error fetching ad:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem('hasSeenAd', 'true');
  };

  const handleAdClick = () => {
    if (currentAd?.link_url) {
      window.open(currentAd.link_url, '_blank');
    }
  };

  if (!currentAd) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-0 bg-transparent shadow-2xl">
        <div className="relative rounded-2xl overflow-hidden" style={{
          background: 'linear-gradient(135deg, #0B090A 0%, #161A1D 50%, #660708 100%)',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          {/* Animated background accent */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: 'radial-gradient(circle at 20% 50%, #E5383B 0%, transparent 50%), radial-gradient(circle at 80% 50%, #BA181B 0%, transparent 50%)',
              animation: 'pulse 3s ease-in-out infinite'
            }}
          />

          {/* Sparkle effect overlay */}
          <div className="absolute top-4 right-20 text-[#E5383B] opacity-60 animate-bounce">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="absolute bottom-8 left-8 text-[#BA181B] opacity-40 animate-pulse">
            <Sparkles className="w-4 h-4" />
          </div>

          {/* Close button with elegant design */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-20 rounded-full transition-all duration-300 hover:scale-110 hover:rotate-90"
            style={{
              background: 'rgba(11, 9, 10, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(229, 56, 59, 0.3)'
            }}
            onClick={handleClose}
          >
            <X className="w-5 h-5 text-[#F5F3F4]" />
          </Button>
          
          {/* Stylish timer badge */}
          {timeLeft > 0 && (
            <div 
              className="absolute top-4 left-4 z-20 rounded-full px-4 py-2 font-bold text-sm shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #A4161A, #BA181B)',
                color: '#F5F3F4',
                border: '2px solid rgba(229, 56, 59, 0.5)',
                boxShadow: '0 0 20px rgba(229, 56, 59, 0.4)',
                animation: timeLeft <= 3 ? 'shake 0.5s infinite' : 'none'
              }}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E5383B] animate-pulse" />
                {timeLeft}s
              </span>
            </div>
          )}

          {/* Main content container */}
          <div className="relative z-10">
            {/* Media section with gradient overlay */}
            <div 
              className={`relative group ${currentAd.link_url ? 'cursor-pointer' : ''} overflow-hidden`}
              onClick={handleAdClick}
            >
              {currentAd.video_url ? (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={currentAd.video_url}
                    className="absolute top-0 left-0 w-full h-full"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                  />
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-[#0B090A] via-transparent to-transparent opacity-60 pointer-events-none"
                  />
                </div>
              ) : currentAd.image_url ? (
                <div className="relative">
                  <img
                    src={currentAd.image_url}
                    alt={currentAd.title}
                    className="w-full h-auto max-h-[60vh] object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-[#0B090A] via-transparent to-transparent opacity-70"
                  />
                </div>
              ) : (
                <div 
                  className="w-full h-64 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #660708, #A4161A)'
                  }}
                >
                  <Sparkles className="w-16 h-16 text-[#F5F3F4] opacity-50" />
                </div>
              )}

              {/* Hover overlay effect */}
              {currentAd.link_url && (
                <div className="absolute inset-0 bg-gradient-to-t from-[#BA181B] via-transparent to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none" />
              )}
            </div>

            {/* Content section with premium styling */}
            <div 
              className="p-8 relative"
              style={{
                background: 'linear-gradient(to bottom, rgba(11, 9, 10, 0.95), rgba(22, 26, 29, 0.98))',
                backdropFilter: 'blur(10px)'
              }}
            >
              {/* Decorative top border */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background: 'linear-gradient(90deg, transparent, #E5383B, #BA181B, #A4161A, transparent)'
                }}
              />

              <h3 
                className="text-3xl font-bold mb-3 tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #F5F3F4, #D3D3D3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 30px rgba(229, 56, 59, 0.3)'
                }}
              >
                {currentAd.title}
              </h3>
              
              {currentAd.description && (
                <p 
                  className="text-base leading-relaxed mb-6"
                  style={{ color: '#B1A7A6' }}
                >
                  {currentAd.description}
                </p>
              )}
              
              {currentAd.link_url && (
                <Button 
                  className="w-full py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group overflow-hidden relative"
                  style={{
                    background: 'linear-gradient(135deg, #A4161A, #BA181B, #E5383B)',
                    color: '#F5F3F4',
                    border: '2px solid rgba(229, 56, 59, 0.5)',
                    boxShadow: '0 10px 40px rgba(229, 56, 59, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                  onClick={handleAdClick}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Learn More
                    <ExternalLink className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </span>
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #BA181B, #E5383B)'
                    }}
                  />
                </Button>
              )}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 0.2;
            }
            50% {
              opacity: 0.4;
            }
          }

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            75% { transform: translateX(2px); }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};