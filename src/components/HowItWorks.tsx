import React, { useState, useEffect } from 'react';
import { LogIn, Package, DollarSign } from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      icon: LogIn,
      title: "Log In & Sign Up",
      description: "Create your account in seconds and join our community of sellers",
      color: "from-[#E5383B] to-[#BA181B]",
      bgColor: "bg-[#E5383B]/10",
      iconColor: "text-[#E5383B]"
    },
    {
      icon: Package,
      title: "List a Product",
      description: "Upload photos and details of items you no longer need",
      color: "from-[#161A1D] to-[#660708]",
      bgColor: "bg-[#660708]/10",
      iconColor: "text-[#660708]"
    },
    {
      icon: DollarSign,
      title: "Earn with Unused Material",
      description: "Turn your clutter into cash and help others find what they need",
      color: "from-[#A4161A] to-[#BA181B]",
      bgColor: "bg-[#A4161A]/10",
      iconColor: "text-[#A4161A]"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B090A] via-[#161A1D] to-[#660708] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#E5383B] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-[#BA181B] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-[#A4161A] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#E5383B] rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        {/* Header */}
        <div className={`text-center mb-20 ${isVisible ? 'animate-slideUp' : 'opacity-0'}`}>
          <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-[#F5F3F4] via-[#B1A7A6] to-[#E5383B] bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-xl text-[#B1A7A6] max-w-2xl mx-auto">
            Transform your unused items into cash in three simple steps
          </p>
        </div>

        {/* Steps Container */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;
            
            return (
              <div
                key={index}
                className={`relative group cursor-pointer transition-all duration-500 ${
                  isVisible ? 'animate-scaleIn' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
                onMouseEnter={() => setActiveStep(index)}
              >
                {/* Card */}
                <div className={`
                  relative p-8 rounded-2xl backdrop-blur-lg border transition-all duration-500
                  ${isActive 
                    ? 'bg-gradient-to-br from-[#161A1D]/90 to-[#660708]/50 border-[#E5383B] scale-105 shadow-2xl shadow-[#E5383B]/20' 
                    : 'bg-[#161A1D]/40 border-[#B1A7A6]/20 hover:border-[#E5383B]/40'
                  }
                `}>
                  {/* Step Number */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-[#E5383B] to-[#BA181B] flex items-center justify-center font-bold text-white text-lg shadow-lg">
                    {index + 1}
                  </div>

                  {/* Icon Container */}
                  <div className={`
                    w-20 h-20 rounded-2xl ${step.bgColor} flex items-center justify-center mb-6 
                    transition-all duration-500 group-hover:scale-110 group-hover:rotate-6
                    ${isActive ? 'scale-110 rotate-6' : ''}
                  `}>
                    <Icon className={`w-10 h-10 ${step.iconColor} transition-all duration-300`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-[#F5F3F4] mb-4 group-hover:text-[#E5383B] transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-[#B1A7A6] leading-relaxed">
                    {step.description}
                  </p>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E5383B] to-[#BA181B] rounded-b-2xl"></div>
                  )}
                </div>

                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#E5383B]/50 to-transparent z-0"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className={`text-center ${isVisible ? 'animate-slideUp' : 'opacity-0'}`} style={{ animationDelay: '800ms' }}>
          <button onClick={() => navigate("/signup")} className="group relative px-10 py-4 bg-gradient-to-r from-[#E5383B] to-[#BA181B] text-white text-lg font-bold rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#E5383B]/50">
            <span className="relative z-10">Get Started Now</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#BA181B] to-[#A4161A] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <p className="mt-6 text-[#B1A7A6]">
            Join thousands of users already earning with their unused items
          </p>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-3 mt-12">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeStep === index 
                  ? 'w-12 bg-gradient-to-r from-[#E5383B] to-[#BA181B]' 
                  : 'w-2 bg-[#B1A7A6]/30 hover:bg-[#B1A7A6]/50'
              }`}
            />
          ))}
        </div>
      </div>
       <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out forwards;
        }
        .delay-700 {
          animation-delay: 700ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}