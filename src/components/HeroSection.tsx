import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  CheckCircle,
  Zap,
  Package,
} from "lucide-react";
import heroImage from "@/assets/heroimage.mp4";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function StartupHeroSection() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const features = [
    "List unlimited items",
    "Flexible rental terms",
    "Built-in messaging",
    "Easy payments",
  ];

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="pt-4 relative min-h-screen overflow-hidden bg-gradient-to-br from-[#660708] via-[#A4161A] to-[#BA181B]">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-20 left-10 w-96 h-96 bg-[#E5383B] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float-slow"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          }}
        />
        <div
          className="absolute bottom-40 right-20 w-80 h-80 bg-[#BA181B] rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-float-slower"
          style={{
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
          }}
        />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#660708] rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-pulse-slow" />
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 gap-8 h-full p-8">
            {[...Array(48)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-[#F5F3F4] rounded-full animate-twinkle"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-[#161A1D]/20 to-[#161A1D]/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-16 items-center w-full py-20">
          <div className="space-y-8 animate-slide-in-left">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-card border border-[#E5383B]/30">
              <Sparkles className="w-5 h-5 text-[#E5383B]" />
              <span className="text-sm font-semibold text-[#F5F3F4] tracking-wide">
                India's Newest Rental Revolution
              </span>
            </div>

            <h1 className="space-y-2">
              <span className="block text-5xl md:text-6xl lg:text-7xl font-bold text-[#F5F3F4] leading-tight serif-heading">
                Rent Anything,
              </span>
              <span className="block text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="gradient-text serif-heading">
                  Anytime, Anywhere.
                </span>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-[#D3D3D3] leading-relaxed max-w-xl font-light">
              Everything you need, anytime you want. Join India's most
              innovative peer-to-peer rental marketplace and turn your unused
              items into income.
            </p>

            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#E5383B]/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#E5383B]" />
                </div>
                <span className="text-sm text-[#F5F3F4] font-medium">
                  100% Secure
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#E5383B]/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#E5383B]" />
                </div>
                <span className="text-sm text-[#F5F3F4] font-medium">
                  Verified Users
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#E5383B]/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#E5383B]" />
                </div>
                <span className="text-sm text-[#F5F3F4] font-medium">
                  Quick Setup
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => navigate("/login")}
                className="group relative px-8 py-4 bg-[#E5383B] text-white font-semibold text-lg rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-[#E5383B]/50 hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const section = document.getElementById("how-it-works");
                  if (section) {
                    section.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="px-8 py-4 glass-card border border-[#F5F3F4]/30 text-[#F5F3F4] font-semibold text-lg rounded-2xl hover:border-[#F5F3F4]/50 transition-all duration-300 hover:scale-105"
              >
                See How It Works
              </motion.button>
            </div>

            {/* <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="glass-card rounded-xl p-4 border border-[#F5F3F4]/10">
                <div className="text-2xl font-bold text-[#E5383B] mb-1">
                  30 sec
                </div>
                <div className="text-sm text-[#B1A7A6]">Quick Listing</div>
              </div>
              <div className="glass-card rounded-xl p-4 border border-[#F5F3F4]/10">
                <div className="text-2xl font-bold text-[#E5383B] mb-1">₹0</div>
                <div className="text-sm text-[#B1A7A6]">Setup Fee</div>
              </div>
            </div> */}
          </div>

          <div className="relative animate-slide-in-right">
            <div className="relative glass-card-strong rounded-3xl p-4 shadow-2xl border border-[#F5F3F4]/20 overflow-hidden">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#E5383B] to-[#BA181B] rounded-2xl rotate-12 opacity-80 blur-sm" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-[#BA181B] to-[#660708] rounded-2xl -rotate-12 opacity-60 blur-sm" />

              <div className="relative rounded-2xl overflow-hidden">
                <video
                  src={heroImage}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-[500px] object-cover rounded-2xl"
                >
                  Your browser does not support the video tag.
                </video>

                <div className="absolute inset-0 bg-gradient-to-t from-[#0B090A]/80 via-transparent to-transparent" />

                <div className="absolute bottom-8 left-6 right-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <motion.div
                      className="flex-1 glass-card-strong rounded-2xl p-5 border border-white/20 backdrop-blur-xl shadow-xl bg-gradient-to-br from-[#161A1D]/60 to-[#0B090A]/40 hover:from-[#E5383B]/10 hover:to-[#BA181B]/10 transition-all duration-300 group"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.05, rotate: -1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#E5383B] to-[#BA181B] flex items-center justify-center shadow-lg group-hover:shadow-[#E5383B]/40 transition-all">
                          <Zap className="w-7 h-7 text-white" fill="white" />
                        </div>
                        <div>
                          <div className="text-[#F5F3F4] font-semibold text-lg">
                            Instant Connect
                          </div>
                          <div className="text-[#ffffffb3] text-sm tracking-wide">
                            Match with renters nearby
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex-1 glass-card-strong rounded-2xl p-5 border border-white/20 backdrop-blur-xl shadow-xl bg-gradient-to-br from-[#161A1D]/60 to-[#0B090A]/40 hover:from-[#BA181B]/10 hover:to-[#660708]/10 transition-all duration-300 group"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.05, rotate: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#BA181B] to-[#660708] flex items-center justify-center shadow-lg group-hover:shadow-[#BA181B]/40 transition-all">
                          <Package className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <div className="text-[#F5F3F4] font-semibold text-lg">
                            Smart Pricing
                          </div>
                          <div className="text-[#ffffffb3] text-sm tracking-wide">
                            AI-powered recommendations
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              <div className="relative mt-6">
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        staggerChildren: 0.15,
                      },
                    },
                  }}
                >
                  {features.map((feature, i) => (
                    <motion.div
                      key={i}
                      variants={{
                        hidden: { opacity: 0, y: 15 },
                        show: { opacity: 1, y: 0 },
                      }}
                      whileHover={{
                        scale: 1.05,
                        x: 6,
                        transition: { type: "spring", stiffness: 300 },
                      }}
                      className="flex items-center gap-3 group cursor-pointer rounded-lg p-2 transition-all duration-300"
                    >
                      {/* Icon */}
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#E5383B]/25 to-[#BA181B]/15 group-hover:from-[#E5383B] group-hover:to-[#BA181B] transition-all shadow-sm group-hover:shadow-[#E5383B]/40">
                        <CheckCircle className="w-5 h-5 text-[#E5383B] group-hover:text-white transition-colors duration-300" />
                      </div>

                      {/* Text */}
                      <span className="text-[#D3D3D3] group-hover:text-[#F5F3F4] font-medium tracking-wide transition-colors duration-300">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                <div className="w-full h-full rounded-3xl border-2 border-[#E5383B]/20 animate-pulse-slow" />
              </div>
            </div>

            <div className="absolute -top-8 -left-8 w-16 h-16 rounded-full bg-gradient-to-br from-[#E5383B] to-[#BA181B] opacity-60 blur-xl animate-float" />
            <div className="absolute -bottom-8 -right-8 w-20 h-20 rounded-2xl bg-gradient-to-br from-[#BA181B] to-[#660708] opacity-50 blur-xl animate-float-slower" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#0B090A] to-transparent pointer-events-none" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;600;700&display=swap');
        
        body { font-family: 'Inter', sans-serif; }
        .serif-heading { font-family: 'Playfair Display', serif; }
        
        @keyframes float { 
          0%, 100% { transform: translateY(0px); } 
          50% { transform: translateY(-20px); } 
        }
        @keyframes float-delayed { 
          0%, 100% { transform: translateY(0px); } 
          50% { transform: translateY(-15px); } 
        }
        @keyframes float-slow { 
          0%, 100% { transform: translate(0, 0); } 
          50% { transform: translate(-30px, -30px); } 
        }
        @keyframes float-slower { 
          0%, 100% { transform: translate(0, 0); } 
          50% { transform: translate(30px, 30px); } 
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }

        .animate-float-slow {
          animation: floatSlow 3.5s ease-in-out infinite;
        }
        
        .animate-float { 
          animation: float 4s ease-in-out infinite; 
        }
        .animate-float-delayed { 
          animation: float-delayed 4s ease-in-out infinite; 
          animation-delay: 0.5s;
        }
        .animate-float-slow { animation: float-slow 15s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 20s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        .animate-slide-in-left { animation: slide-in-left 0.8s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.8s ease-out; }
        
        .glass-card {
          background: linear-gradient(135deg, rgba(245, 243, 244, 0.08), rgba(177, 167, 166, 0.05));
          backdrop-filter: blur(20px);
        }
        .glass-card-strong {
          background: linear-gradient(135deg, rgba(245, 243, 244, 0.12), rgba(177, 167, 166, 0.08));
          backdrop-filter: blur(30px);
        }
        .gradient-text {
          background: linear-gradient(135deg, #E5383B 0%, #F5F3F4 50%, #E5383B 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }
        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}
