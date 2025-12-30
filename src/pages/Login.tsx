import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  Loader2,
  Mail,
  Lock,
  Check,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  User,
  Building2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { LoginNavbar } from "@/components/LoginNavbar";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'user' | 'owner'>(
    (searchParams.get('role') as 'user' | 'owner') || 'user'
  );
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const role = searchParams.get('role');
    if (role === 'owner' || role === 'user') {
      setSelectedRole(role);
    }
  }, [searchParams]);

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
      const result = await login(formData.email, formData.password);
      if (result.success) {
        // Redirect based on user type
        if (result.userType === 'owner') {
          navigate("/owner-dashboard");
        } else {
          navigate("/listings");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && formData.email) setStep(2);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const isOwner = selectedRole === 'owner';

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
            background: isOwner
              ? "radial-gradient(circle, #E5383B, transparent)"
              : "radial-gradient(circle, #3B82F6, transparent)",
            animation: "float 15s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15"
          style={{
            background: isOwner
              ? "radial-gradient(circle, #BA181B, transparent)"
              : "radial-gradient(circle, #1D4ED8, transparent)",
            animation: "float 12s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={isOwner
              ? "https://images.unsplash.com/photo-1560472355-536de3962603?w=1200&h=1600&fit=crop"
              : "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=1600&fit=crop"
            }
            alt="Login Background"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.6) contrast(1.1)" }}
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background: isOwner
              ? "linear-gradient(135deg, rgba(229,56,59,0.4), rgba(11,9,10,0.8))"
              : "linear-gradient(135deg, rgba(59,130,246,0.4), rgba(11,9,10,0.8))",
          }}
        />
        <div className="relative z-10 flex flex-col justify-end p-12 lg:p-16">
          <div className="space-y-6">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl"
              style={{
                background: isOwner
                  ? "rgba(229, 56, 59, 0.2)"
                  : "rgba(59, 130, 246, 0.2)",
                border: isOwner
                  ? "1px solid rgba(229, 56, 59, 0.3)"
                  : "1px solid rgba(59, 130, 246, 0.3)",
              }}
            >
              {isOwner ? (
                <Building2 className="w-4 h-4 text-[#F5F3F4]" />
              ) : (
                <User className="w-4 h-4 text-[#F5F3F4]" />
              )}
              <span className="text-sm font-bold text-[#F5F3F4] tracking-wide">
                {isOwner ? "Owner Login" : "User Login"}
              </span>
            </div>

            <h1 className="text-6xl font-black text-[#F5F3F4] leading-tight">
              {isOwner ? (
                <>
                  Manage Your <br />
                  <span
                    style={{
                      background: "linear-gradient(135deg, #E5383B, #BA181B)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Rental Business
                  </span>
                </>
              ) : (
                <>
                  Continue Your <br />
                  <span
                    style={{
                      background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Rental Journey
                  </span>
                </>
              )}
            </h1>
            <p className="text-lg text-[#D3D3D3] max-w-md">
              {isOwner
                ? "Access your dashboard to manage listings, approve requests, and track earnings."
                : "Access thousands of items available for rent in your area."}
            </p>
          </div>
        </div>
      </div>

      {/* Right Section (Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10 mt-10">
        <div className="w-full max-w-md">
          {/* Role Toggle */}
          <div className="mb-6">
            <div
              className="inline-flex w-full p-1 rounded-2xl"
              style={{ background: 'rgba(177, 167, 166, 0.2)' }}
            >
              <button
                onClick={() => setSelectedRole('user')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  !isOwner
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-[#F5F3F4] shadow-lg'
                    : 'text-[#B1A7A6] hover:text-[#F5F3F4]'
                }`}
              >
                <User className="w-4 h-4" />
                User
              </button>
              <button
                onClick={() => setSelectedRole('owner')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  isOwner
                    ? 'bg-gradient-to-r from-[#E5383B] to-[#BA181B] text-[#F5F3F4] shadow-lg'
                    : 'text-[#B1A7A6] hover:text-[#F5F3F4]'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Owner
              </button>
            </div>
          </div>

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
                          ? isOwner
                            ? "linear-gradient(135deg, #E5383B, #BA181B)"
                            : "linear-gradient(135deg, #3B82F6, #1D4ED8)"
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
                            ? isOwner
                              ? "linear-gradient(90deg, #E5383B, #BA181B)"
                              : "linear-gradient(90deg, #3B82F6, #1D4ED8)"
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
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#F5F3F4]">
                {isOwner ? "Owner Login" : "User Login"}
              </h2>
              <p className="text-sm text-[#B1A7A6] mt-1">
                {isOwner
                  ? "Access your owner dashboard"
                  : "Sign in to start renting"}
              </p>
            </div>

            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                {/* Email Input */}
                <div className="relative group">
                  <div
                    className="relative rounded-2xl p-[1px]"
                    style={{
                      background: isOwner
                        ? "linear-gradient(135deg, rgba(229,56,59,0.3), rgba(186,24,27,0.2))"
                        : "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(29,78,216,0.2))",
                    }}
                  >
                    <div className="rounded-2xl overflow-hidden bg-[#161A1D]/60">
                      <div className="flex items-center px-5 py-4 gap-3">
                        <Mail className={`w-5 h-5 ${isOwner ? 'text-[#E5383B]' : 'text-blue-500'}`} />
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
                  className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md"
                  style={{
                    background: formData.email
                      ? isOwner
                        ? "linear-gradient(135deg, #E5383B, #BA181B)"
                        : "linear-gradient(135deg, #3B82F6, #1D4ED8)"
                      : "rgba(177,167,166,0.2)",
                    color: formData.email ? "#F5F3F4" : "#B1A7A6",
                  }}
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>

                {/* Signup Redirect */}
                <div className="text-center mt-8">
                  <p className="text-sm text-[#B1A7A6]">
                    Don't have an account?{" "}
                    <Link
                      to={`/signup?role=${selectedRole}`}
                      className={`font-semibold ${
                        isOwner
                          ? 'text-[#E5383B] hover:text-[#BA181B]'
                          : 'text-blue-500 hover:text-blue-600'
                      }`}
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
                      background: isOwner
                        ? "linear-gradient(135deg, rgba(229,56,59,0.3), rgba(186,24,27,0.2))"
                        : "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(29,78,216,0.2))",
                    }}
                  >
                    <div className="rounded-2xl overflow-hidden bg-[#161A1D]/60">
                      <div className="flex items-center px-5 py-4 gap-3">
                        <Lock className={`w-5 h-5 ${isOwner ? 'text-[#E5383B]' : 'text-blue-500'}`} />
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
                    className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                    style={{
                      background: formData.password
                        ? isOwner
                          ? "linear-gradient(135deg, #E5383B, #BA181B)"
                          : "linear-gradient(135deg, #3B82F6, #1D4ED8)"
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

          {/* Switch Role Link */}
          <div className="text-center mt-6">
            <Link
              to="/get-started"
              className="text-sm text-[#B1A7A6] hover:text-[#F5F3F4] transition-colors"
            >
              Switch account type
            </Link>
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
