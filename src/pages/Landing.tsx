import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Users,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Star,
} from "lucide-react";
import { FaYoutube, FaInstagram, FaFacebookF, FaTwitter } from "react-icons/fa";
import Footer from "@/components/Footer";
import TopProfilesSection from "@/components/TopProfilesSection";
import InfluencerPartnersSection from "@/components/InfluencerPartnersSection";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import HowItWorks from "@/components/HowItWorks";
import HeroSection from "@/components/HeroSection";
import { LoginNavbar } from "@/components/LoginNavbar";

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Secure & Verified",
      description:
        "All listings are verified by our team before going live. Your safety is our priority.",
    },
    {
      icon: Zap,
      title: "Quick & Easy",
      description:
        "List your items in minutes and start earning. Renting is just as simple!",
    },
    {
      icon: Users,
      title: "Community Driven",
      description:
        "Join thousands of Indians sharing and renting items in their neighborhood.",
    },
    {
      icon: TrendingUp,
      title: "Earn More",
      description:
        "Turn your unused items into income. Track your earnings with detailed analytics.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F3F4] overflow-hidden">
      <LoginNavbar/>

      <HeroSection />

      <TopProfilesSection />

      <InfluencerPartnersSection />

      <section
        id="features"
        className="relative py-28 overflow-hidden bg-gradient-to-b from-[#F5F3F4] via-white to-[#F5F3F4]"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#E5383B]/10 blur-[160px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#BA181B]/10 blur-[180px] rounded-full animate-pulse-slow" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#E5383B]/10 to-[#BA181B]/10 rounded-full mb-6">
              <span className="text-sm font-semibold tracking-wider text-[#660708] uppercase">
                Premium Features
              </span>
            </div>

            <h2 className="text-5xl font-extrabold text-[#161A1D] mb-6 leading-tight">
              Why Thousands Choose Us for
              <br />
              <span className="bg-gradient-to-r from-[#E5383B] via-[#BA181B] to-[#E5383B] bg-clip-text text-transparent">
                Renting & Earning
              </span>
            </h2>

            <p className="text-lg text-[#161A1D]/70 max-w-2xl mx-auto">
              Experience seamless, secure, and rewarding transactions with our
              industry-leading platform built for trust and growth.
            </p>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ staggerChildren: 0.15 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Card className="group relative p-8 rounded-2xl bg-white border border-[#E5383B]/10 hover:border-[#E5383B]/30 shadow-md hover:shadow-[0_0_40px_rgba(229,56,59,0.15)] transition-all duration-500 hover:-translate-y-3 overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-[#E5383B]/10 via-transparent to-[#BA181B]/10 transition-all duration-700" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-[#E5383B] to-[#BA181B] flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#161A1D] mb-3 group-hover:text-[#E5383B] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-[#161A1D]/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-t from-[#E5383B]/10 to-transparent rounded-full blur-3xl group-hover:opacity-70 transition-opacity duration-700" />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <div id="how-it-works">
        <HowItWorks />
      </div>

      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E5383B] via-[#BA181B] to-[#660708]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,243,244,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(245,243,244,0.08),transparent_50%)]" />
        </div>
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(245,243,244,0.15) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#F5F3F4]/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#F5F3F4]/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#F5F3F4]/10 backdrop-blur-md rounded-full border border-[#F5F3F4]/20 shadow-lg hover:bg-[#F5F3F4]/15 transition-all duration-300">
              <Sparkles className="w-5 h-5 text-[#F5F3F4] animate-pulse" />
              <span className="text-sm font-semibold text-[#F5F3F4]">
                Join 10,000+ Happy Users
              </span>
              <div className="flex -space-x-2 ml-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-[#F5F3F4] to-[#F5F3F4]/70 border-2 border-[#BA181B]"
                  />
                ))}
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-[#F5F3F4] leading-tight tracking-tight">
              Ready to Start Your
              <span className="block mt-2 bg-gradient-to-r from-[#F5F3F4] to-[#F5F3F4]/70 bg-clip-text text-transparent">
                Rental Journey?
              </span>
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className="h-1 w-16 bg-gradient-to-r from-transparent to-[#F5F3F4]/50 rounded-full" />
              <Star className="w-6 h-6 text-[#F5F3F4] fill-[#F5F3F4]" />
              <div className="h-1 w-16 bg-gradient-to-l from-transparent to-[#F5F3F4]/50 rounded-full" />
            </div>
            <p className="text-base md:text-xl lg:text-2xl text-[#F5F3F4]/95 max-w-3xl mx-auto font-light leading-relaxed">
              Join thousands earning from unused items or finding exactly what
              they need at unbeatable prices.
            </p>
            <div className="flex flex-wrap justify-center gap-5 pt-6">
              <button 
                onClick={() => !user && navigate("/signup")}
                className="group relative px-12 py-5 bg-[#F5F3F4] text-[#E5383B] text-lg font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#F5F3F4] to-[#F5F3F4]/90 transition-transform duration-300 group-hover:scale-110" />
                <span className="relative flex items-center gap-3">
                  Create Free Account
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </button>

              <button 
                onClick={() => navigate("/submit-listing")}
                className="group relative px-12 py-5 bg-transparent border-3 border-[#F5F3F4] text-[#F5F3F4] text-lg font-bold rounded-2xl hover:bg-[#F5F3F4] hover:text-[#E5383B] transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <span className="relative flex items-center gap-3">
                  List Your First Item
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                </span>
              </button>
            </div>

            {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 pt-8 md:pt-12 max-w-4xl mx-auto">
              {[
                {
                  icon: Shield,
                  label: "100% Secure",
                  desc: "Bank-level encryption",
                },
                {
                  icon: Zap,
                  label: "Instant Setup",
                  desc: "Ready in 2 minutes",
                },
                {
                  icon: DollarSign,
                  label: "Zero Fees",
                  desc: "List items for free",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group flex flex-col items-center gap-3 p-6 bg-[#F5F3F4]/5 backdrop-blur-sm rounded-2xl border border-[#F5F3F4]/10 hover:bg-[#F5F3F4]/10 transition-all duration-300 hover:scale-105"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5F3F4]/20 to-[#F5F3F4]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <item.icon className="w-8 h-8 text-[#F5F3F4]" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#F5F3F4]">
                      {item.label}
                    </p>
                    <p className="text-sm text-[#F5F3F4]/70 mt-1">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div> */}
            <div className="pt-8 flex items-center justify-center gap-2 text-[#F5F3F4]/80">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-[#F5F3F4] fill-[#F5F3F4]"
                  />
                ))}
              </div>
              <span className="text-sm font-medium ml-2">
                4.9/5 from 2,500+ reviews
              </span>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.5; }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-pulse-slow {
                    animation: pulse-slow 4s ease-in-out infinite;
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
            `}</style>
    </div>
  );
};

export default Landing;
