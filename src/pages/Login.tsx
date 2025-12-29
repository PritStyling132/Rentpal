import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Loader2,
  Mail,
  Lock,
  Check,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LoginNavbar } from "@/components/LoginNavbar";
import { TermsDialog } from "@/components/TermsDialog";
import { Button } from "@/components/ui/button";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.password) {
      toast({
        title: "Password Required",
        description: "Please enter your password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        toast({
          title: "Login Successful",
          description: "Redirecting to your dashboard...",
        });
        navigate("/listings");
      } else {
        toast({
          title: "Login Failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Something went wrong during login.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast({
          title: "Google Login Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Login Failed",
        description: "Failed to login with Google",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    if (step === 1 && formData.email) setStep(2);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{ background: "#0B090A" }}
    >
      <LoginNavbar />
      <div className="absolute inset-0 overflow-hidden pointer-events-none pt-10">
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20"
          style={{
            background: "radial-gradient(circle, #E5383B, transparent)",
            animation: "float 15s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15"
          style={{
            background: "radial-gradient(circle, #BA181B, transparent)",
            animation: "float 12s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=1600&fit=crop"
            alt="Login Background"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.6) contrast(1.1)" }}
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(229,56,59,0.4), rgba(11,9,10,0.8))",
          }}
        />
        <div className="relative z-10 flex flex-col justify-end p-12 lg:p-16">
          <div className="space-y-6">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl"
              style={{
                background: "rgba(229, 56, 59, 0.2)",
                border: "1px solid rgba(229, 56, 59, 0.3)",
              }}
            >
              <Sparkles className="w-4 h-4 text-[#F5F3F4]" />
              <span className="text-sm font-bold text-[#F5F3F4] tracking-wide">
                Welcome Back
              </span>
            </div>

            <h1 className="text-6xl font-black text-[#F5F3F4] leading-tight">
              Continue Your <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #E5383B, #BA181B)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Rental Journey
              </span>
            </h1>
            <p className="text-lg text-[#D3D3D3] max-w-md">
              Access thousands of items available for rent in your area.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section (Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10 mt-10">
        <div className="w-full max-w-md">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      step >= s ? "scale-110" : "scale-100"
                    }`}
                    style={{
                      background:
                        step >= s
                          ? "linear-gradient(135deg, #E5383B, #BA181B)"
                          : "rgba(177, 167, 166, 0.2)",
                      color: step >= s ? "#F5F3F4" : "#B1A7A6",
                    }}
                  >
                    {step > s ? <Check className="w-5 h-5" /> : s}
                  </div>
                  {s < 2 && (
                    <div
                      className="w-12 h-1 mx-2 rounded-full"
                      style={{
                        background:
                          step > s
                            ? "linear-gradient(90deg, #E5383B, #BA181B)"
                            : "rgba(177, 167, 166, 0.2)",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-[#B1A7A6]">Step {step} of 2</p>
            </div>
          </div>

          {/* Step Content */}
          <div className="rounded-3xl p-8 backdrop-blur-2xl border border-[#E5383B]/20 bg-white/5">
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                {/* Email Input */}
                <div className="relative group">
                  <div
                    className="relative rounded-2xl p-[1px]"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(229,56,59,0.3), rgba(186,24,27,0.2))",
                    }}
                  >
                    <div className="rounded-2xl overflow-hidden bg-[#161A1D]/60">
                      <div className="flex items-center px-5 py-4 gap-3">
                        <Mail className="w-5 h-5 text-[#E5383B]" />
                        <input
                          name="email"
                          type="text"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          className="flex-1 bg-transparent text-[#F5F3F4] outline-none placeholder:text-[#B1A7A6]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <button
                  onClick={nextStep}
                  disabled={!formData.email}
                  className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-[#E5383B]/30"
                  style={{
                    background: formData.email
                      ? "linear-gradient(135deg, #E5383B, #BA181B)"
                      : "rgba(177,167,166,0.2)",
                    color: formData.email ? "#F5F3F4" : "#B1A7A6",
                  }}
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>

                {/* Reset Password */}
                <button
                  onClick={() => {
                    if (!formData.email) {
                      toast({
                        title: "Email Required",
                        description: "Please enter your email address first",
                        variant: "destructive",
                      });
                      return;
                    }
                    supabase.auth
                      .resetPasswordForEmail(formData.email, {
                        redirectTo: `${window.location.origin}/reset-password`,
                      })
                      .then(({ error }) => {
                        if (error) {
                          toast({
                            title: "Error",
                            description: error.message,
                            variant: "destructive",
                          });
                        } else {
                          toast({
                            title: "Check Your Email",
                            description:
                              "Password reset link has been sent to your email",
                          });
                        }
                      });
                  }}
                  className="w-full py-3 rounded-2xl text-sm font-medium text-[#E5383B] hover:text-[#BA181B] transition-colors"
                >
                  Forgot Password?
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-[1px] bg-[#B1A7A6]/20" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 text-xs tracking-wider text-[#B1A7A6] uppercase bg-[#161A1D]/60">
                      or continue with
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-3 bg-white/10 border border-[#B1A7A6]/30 text-[#F5F3F4] hover:bg-white/15 transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign in with Google
                </button>

                {/* Signup Redirect */}
                <div className="text-center mt-8">
                  <p className="text-sm text-[#B1A7A6]">
                    Don’t have an account?{" "}
                    <Link
                      to="/signup"
                      className="text-[#E5383B] hover:text-[#BA181B] font-semibold"
                    >
                      Sign up here
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="relative group">
                  <div
                    className="relative rounded-2xl p-[1px]"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(229,56,59,0.3), rgba(186,24,27,0.2))",
                    }}
                  >
                    <div className="rounded-2xl overflow-hidden bg-[#161A1D]/60">
                      <div className="flex items-center px-5 py-4 gap-3">
                        <Lock className="w-5 h-5 text-[#E5383B]" />
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter password"
                          className="flex-1 bg-transparent text-[#F5F3F4] outline-none placeholder:text-[#B1A7A6]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[#B1A7A6] hover:text-[#E5383B]"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={prevStep}
                    className="py-4 px-6 rounded-2xl bg-[#B1A7A6]/20 text-[#F5F3F4] hover:bg-[#B1A7A6]/30 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.password || loading}
                    className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-[#E5383B]/30"
                    style={{
                      background: formData.password
                        ? "linear-gradient(135deg, #E5383B, #BA181B)"
                        : "rgba(177,167,166,0.2)",
                      color: formData.password ? "#F5F3F4" : "#B1A7A6",
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Logging
                        in...
                      </>
                    ) : (
                      <>
                        Login <Check className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
          box-shadow: 0 0 0px 1000px transparent inset !important;
          -webkit-text-fill-color: #F5F3F4 !important;
          caret-color: #F5F3F4 !important;
          background-color: transparent !important;
          transition: background-color 9999s ease-in-out 0s;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(50px, -50px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
    </div>
  );
}
