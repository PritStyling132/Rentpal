import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, User, Mail, Phone, MapPin, Lock, Check, ArrowRight, ArrowLeft, Eye, EyeOff, Sparkles, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LoginNavbar } from '@/components/LoginNavbar';
import { TermsDialog } from '@/components/TermsDialog';
import { Button } from '@/components/ui/button';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pin_code: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    phone: '',
    pinCode: '',
    password: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  };

  const validatePinCode = (pinCode: string): boolean => {
    const pinCodeRegex = /^\d{6}$/;
    return pinCodeRegex.test(pinCode);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'email') setErrors(prev => ({ ...prev, email: '' }));
    if (name === 'phone') setErrors(prev => ({ ...prev, phone: '' }));
    if (name === 'pin_code') setErrors(prev => ({ ...prev, pinCode: '' }));
    if (name === 'password' || name === 'confirmPassword') setErrors(prev => ({ ...prev, password: '' }));
  };

  const nextStep = async () => {
    if (step === 1) {
      if (!formData.name || !formData.email) {
        return;
      }
      if (!validateEmail(formData.email)) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!validatePhone(formData.phone)) {
        setErrors(prev => ({ ...prev, phone: 'Enter valid 10-digit phone (starts with 6-9)' }));
        return;
      }
      if (!validatePinCode(formData.pin_code)) {
        setErrors(prev => ({ ...prev, pinCode: 'Enter valid 6-digit PIN code' }));
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!validatePassword(formData.password)) {
        setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }));
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, password: 'Passwords do not match' }));
        return;
      }
      setStep(4);
    }
  };

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions to continue",
        variant: "destructive",
      });
      return;
    }
    if (!validatePassword(formData.password)) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, password: 'Passwords do not match' }));
      return;
    }
    if (!validatePhone(formData.phone)) {
      setErrors(prev => ({ ...prev, phone: 'Enter valid 10-digit phone (starts with 6-9)' }));
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit Indian phone number",
        variant: "destructive",
      });
      return;
    }
    if (!validatePinCode(formData.pin_code)) {
      setErrors(prev => ({ ...prev, pinCode: 'Enter valid 6-digit PIN code' }));
      toast({
        title: "Invalid PIN code",
        description: "Please enter a valid 6-digit PIN code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Try signup directly to catch the specific error
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
            pin_code: formData.pin_code,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signupError) {
        const errorMsg = signupError.message?.toLowerCase() || '';
        const isDuplicateEmail = 
          errorMsg.includes('already registered') ||
          errorMsg.includes('already exists') ||
          errorMsg.includes('user already') ||
          errorMsg.includes('email already') ||
          signupError.status === 422;

        if (isDuplicateEmail) {
          // Email already exists - go back to step 1 and show error
          setStep(1);
          setErrors(prev => ({ 
            ...prev, 
            email: 'This email is already registered. Please login instead.' 
          }));
          toast({
            title: "Email already registered",
            description: "This email is already registered. Please login instead or use a different email.",
            variant: "destructive",
          });
        } else {
          // Other signup errors
          toast({
            title: 'Signup failed',
            description: signupError.message || 'Unable to create account.',
            variant: 'destructive',
          });
        }
        setLoading(false);
        return;
      }

      // Signup successful - show confirmation and navigate
      if (signupData.user) {
        toast({
          title: 'Account created successfully 🎉',
          description: 'Please check your email to verify your account.',
        });

        navigate('/listings');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong while signing up.',
        variant: 'destructive',
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

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceedStep1 = formData.name && formData.email;
  const canProceedStep2 = formData.phone && formData.pin_code;
  const canProceedStep3 = formData.password && formData.confirmPassword && validatePassword(formData.password) && formData.password === formData.confirmPassword;

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: '#0B090A' }}>
      {/* Animated Background */}
      <LoginNavbar />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
          style={{
            background: 'radial-gradient(circle, #E5383B, transparent)',
            animation: 'float 18s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-15"
          style={{
            background: 'radial-gradient(circle, #BA181B, transparent)',
            animation: 'float 15s ease-in-out infinite reverse'
          }}
        />
      </div>

      {/* Left Side - Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=1600&fit=crop"
            alt="Signup Background"
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.6) contrast(1.1)' }}
          />
        </div>

        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(229, 56, 59, 0.45), rgba(11, 9, 10, 0.85))'
          }}
        />

        <div className="relative z-10 flex flex-col justify-end p-12 lg:p-16">
          <div className="space-y-6">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl"
              style={{
                background: 'rgba(229, 56, 59, 0.2)',
                border: '1px solid rgba(229, 56, 59, 0.3)'
              }}
            >
              <Sparkles className="w-4 h-4 text-[#F5F3F4]" />
              <span className="text-sm font-bold text-[#F5F3F4] tracking-wide">Join The Community</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-black text-[#F5F3F4] leading-tight">
              Start Your
              <br />
              <span 
                style={{
                  background: 'linear-gradient(135deg, #E5383B, #BA181B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Rental Adventure
              </span>
            </h1>

            <p className="text-lg text-[#D3D3D3] max-w-md">
              Join thousands of users renting and listing items in your community. It's fast, easy, and secure.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-8">
              <div 
                className="p-6 rounded-2xl backdrop-blur-xl"
                style={{
                  background: 'rgba(22, 26, 29, 0.5)',
                  border: '1px solid rgba(229, 56, 59, 0.2)'
                }}
              >
                <Shield className="w-8 h-8 text-[#E5383B] mb-3" />
                <div className="text-xl font-black text-[#F5F3F4]">Secure</div>
                <div className="text-sm text-[#B1A7A6]">Bank-level encryption</div>
              </div>
              <div 
                className="p-6 rounded-2xl backdrop-blur-xl"
                style={{
                  background: 'rgba(22, 26, 29, 0.5)',
                  border: '1px solid rgba(229, 56, 59, 0.2)'
                }}
              >
                <Sparkles className="w-8 h-8 text-[#E5383B] mb-3" />
                <div className="text-xl font-black text-[#F5F3F4]">Easy</div>
                <div className="text-sm text-[#B1A7A6]">Quick setup process</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center mt-10 p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                      step >= s ? 'scale-110' : 'scale-100'
                    }`}
                    style={{
                      background: step >= s 
                        ? 'linear-gradient(135deg, #E5383B, #BA181B)'
                        : 'rgba(177, 167, 166, 0.2)',
                      color: step >= s ? '#F5F3F4' : '#B1A7A6',
                      boxShadow: step >= s ? '0 4px 20px rgba(229, 56, 59, 0.4)' : 'none'
                    }}
                  >
                    {step > s ? <Check className="w-5 h-5" /> : s}
                  </div>
                  {s < 4 && (
                    <div 
                      className="w-8 h-1 mx-2 rounded-full transition-all duration-500"
                      style={{
                        background: step > s 
                          ? 'linear-gradient(90deg, #E5383B, #BA181B)'
                          : 'rgba(177, 167, 166, 0.2)'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-[#B1A7A6]">Step {step} of 4</p>
            </div>
          </div>

          {/* Card */}
          <div 
            className="rounded-3xl p-8 backdrop-blur-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 243, 244, 0.1), rgba(211, 211, 211, 0.05))',
              border: '1px solid rgba(229, 56, 59, 0.2)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-[#F5F3F4] mb-2">
                {step === 1 && 'Basic Information'}
                {step === 2 && 'Contact Details'}
                {step === 3 && 'Secure Password'}
                {step === 4 && 'Final Step'}
              </h2>
              <p className="text-sm text-[#B1A7A6]">
                {step === 1 && 'Let\'s get to know you'}
                {step === 2 && 'How can we reach you?'}
                {step === 3 && 'Protect your account'}
                {step === 4 && 'Review and confirm'}
              </p>
            </div>
            <div>
              {/* Step 1: Name & Email */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  {/* Name Input */}
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl blur-xl transition-all duration-300"
                      style={{ background: formData.name ? 'linear-gradient(135deg, rgba(229, 56, 59, 0.2), rgba(186, 24, 27, 0.1))' : 'transparent' }}
                    />
                    <div className="relative rounded-2xl p-[1px]" style={{ background: 'linear-gradient(135deg, rgba(229, 56, 59, 0.3), rgba(186, 24, 27, 0.2))' }}>
                      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(22, 26, 29, 0.6)' }}>
                        <div className="flex items-center px-5 py-4 gap-3">
                          <User className="w-5 h-5 text-[#E5383B]" />
                          <input
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Full name"
                            className="flex-1 bg-transparent text-[#F5F3F4] text-base outline-none placeholder:text-[#B1A7A6]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl blur-xl transition-all duration-300"
                      style={{ background: formData.email ? 'linear-gradient(135deg, rgba(229, 56, 59, 0.2), rgba(186, 24, 27, 0.1))' : 'transparent' }}
                    />
                    <div className="relative rounded-2xl p-[1px]" style={{ background: 'linear-gradient(135deg, rgba(229, 56, 59, 0.3), rgba(186, 24, 27, 0.2))' }}>
                      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(22, 26, 29, 0.6)' }}>
                        <div className="flex items-center px-5 py-4 gap-3">
                          <Mail className="w-5 h-5 text-[#E5383B]" />
                          <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            className="flex-1 bg-transparent text-[#F5F3F4] text-base outline-none placeholder:text-[#B1A7A6]"
                          />
                        </div>
                      </div>
                    </div>
                    {errors.email && <p className="text-xs text-[#E5383B] mt-2 ml-2">{errors.email}</p>}
                  </div>

                  <button
                    onClick={nextStep}
                    disabled={!canProceedStep1}
                    className="w-full py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: canProceedStep1 ? 'linear-gradient(135deg, #E5383B, #BA181B)' : 'rgba(177, 167, 166, 0.2)',
                      color: canProceedStep1 ? '#F5F3F4' : '#B1A7A6',
                      boxShadow: canProceedStep1 ? '0 8px 32px rgba(229, 56, 59, 0.4)' : 'none'
                    }}
                  >
                    Continue <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
              {/* Step 2: Phone & PIN */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl blur-xl transition-all duration-300"
                      style={{ background: formData.phone ? 'linear-gradient(135deg, rgba(229, 56, 59, 0.2), rgba(186, 24, 27, 0.1))' : 'transparent' }}
                    />
                    <div className="relative rounded-2xl p-[1px]" style={{ background: 'linear-gradient(135deg, rgba(229, 56, 59, 0.3), rgba(186, 24, 27, 0.2))' }}>
                      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(22, 26, 29, 0.6)' }}>
                        <div className="flex items-center px-5 py-4 gap-3">
                          <Phone className="w-5 h-5 text-[#E5383B]" />
                          <input
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="10-digit mobile"
                            maxLength={10}
                            className="flex-1 bg-transparent text-[#F5F3F4] text-base outline-none placeholder:text-[#B1A7A6]"
                          />
                        </div>
                      </div>
                    </div>
                    {errors.phone && <p className="text-xs text-[#E5383B] mt-2 ml-2">{errors.phone}</p>}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl blur-xl transition-all duration-300"
                      style={{ background: formData.pin_code ? 'linear-gradient(135deg, rgba(229, 56, 59, 0.2), rgba(186, 24, 27, 0.1))' : 'transparent' }}
                    />
                    <div className="relative rounded-2xl p-[1px]" style={{ background: 'linear-gradient(135deg, rgba(229, 56, 59, 0.3), rgba(186, 24, 27, 0.2))' }}>
                      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(22, 26, 29, 0.6)' }}>
                        <div className="flex items-center px-5 py-4 gap-3">
                          <MapPin className="w-5 h-5 text-[#E5383B]" />
                          <input
                            name="pin_code"
                            type="text"
                            value={formData.pin_code}
                            onChange={handleChange}
                            placeholder="6-digit PIN code"
                            maxLength={6}
                            className="flex-1 bg-transparent text-[#F5F3F4] text-base outline-none placeholder:text-[#B1A7A6]"
                          />
                        </div>
                      </div>
                    </div>
                    {errors.pinCode && <p className="text-xs text-[#E5383B] mt-2 ml-2">{errors.pinCode}</p>}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={prevStep} className="py-4 px-6 rounded-2xl font-bold transition-all hover:scale-[1.02]"
                      style={{ background: 'rgba(177, 167, 166, 0.2)', color: '#F5F3F4' }}>
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextStep} disabled={!canProceedStep2}
                      className="flex-1 py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{
                        background: canProceedStep2 ? 'linear-gradient(135deg, #E5383B, #BA181B)' : 'rgba(177, 167, 166, 0.2)',
                        color: canProceedStep2 ? '#F5F3F4' : '#B1A7A6',
                        boxShadow: canProceedStep2 ? '0 8px 32px rgba(229, 56, 59, 0.4)' : 'none'
                      }}>
                      Continue <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
              {/* Step 3: Password */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl blur-xl transition-all duration-300"
                      style={{ background: formData.password ? 'linear-gradient(135deg, rgba(229, 56, 59, 0.2), rgba(186, 24, 27, 0.1))' : 'transparent' }}
                    />
                    <div className="relative rounded-2xl p-[1px]" style={{ background: 'linear-gradient(135deg, rgba(229, 56, 59, 0.3), rgba(186, 24, 27, 0.2))' }}>
                      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(22, 26, 29, 0.6)' }}>
                        <div className="flex items-center px-5 py-4 gap-3">
                          <Lock className="w-5 h-5 text-[#E5383B]" />
                          <input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create password (8+ chars)"
                            className="flex-1 bg-transparent text-[#F5F3F4] text-base outline-none placeholder:text-[#B1A7A6]"
                          />
                          <button onClick={() => setShowPassword(!showPassword)} className="text-[#B1A7A6] hover:text-[#E5383B]">
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl blur-xl transition-all duration-300"
                      style={{ background: formData.confirmPassword ? 'linear-gradient(135deg, rgba(229, 56, 59, 0.2), rgba(186, 24, 27, 0.1))' : 'transparent' }}
                    />
                    <div className="relative rounded-2xl p-[1px]" style={{ background: 'linear-gradient(135deg, rgba(229, 56, 59, 0.3), rgba(186, 24, 27, 0.2))' }}>
                      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(22, 26, 29, 0.6)' }}>
                        <div className="flex items-center px-5 py-4 gap-3">
                          <Lock className="w-5 h-5 text-[#E5383B]" />
                          <input
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm password"
                            className="flex-1 bg-transparent text-[#F5F3F4] text-base outline-none placeholder:text-[#B1A7A6]"
                          />
                          <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-[#B1A7A6] hover:text-[#E5383B]">
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    {errors.password && <p className="text-xs text-[#E5383B] mt-2 ml-2">{errors.password}</p>}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={prevStep} className="py-4 px-6 rounded-2xl font-bold transition-all hover:scale-[1.02]"
                      style={{ background: 'rgba(177, 167, 166, 0.2)', color: '#F5F3F4' }}>
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextStep} disabled={!canProceedStep3}
                      className="flex-1 py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{
                        background: canProceedStep3 ? 'linear-gradient(135deg, #E5383B, #BA181B)' : 'rgba(177, 167, 166, 0.2)',
                        color: canProceedStep3 ? '#F5F3F4' : '#B1A7A6',
                        boxShadow: canProceedStep3 ? '0 8px 32px rgba(229, 56, 59, 0.4)' : 'none'
                      }}>
                      Continue <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
              {/* Step 4: Terms */}
              {step === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-6 rounded-2xl" style={{ background: 'rgba(22, 26, 29, 0.4)', border: '1px solid rgba(229, 56, 59, 0.2)' }}>
                    <div className="flex items-start gap-4">
                      <button onClick={() => setAgreedToTerms(!agreedToTerms)}
                        className="mt-1 flex-shrink-0 w-6 h-6 rounded-lg transition-all duration-300"
                        style={{
                          background: agreedToTerms ? 'linear-gradient(135deg, #E5383B, #BA181B)' : 'rgba(177, 167, 166, 0.2)',
                          border: agreedToTerms ? 'none' : '2px solid rgba(177, 167, 166, 0.4)'
                        }}>
                        {agreedToTerms && <Check className="w-4 h-4 text-[#F5F3F4] m-auto" />}
                      </button>
                      <div className="flex-1">
                        <p className="text-sm text-[#D3D3D3] leading-relaxed">
                          I agree to the{' '}
                          <TermsDialog>
                            <Button 
                              variant="link" 
                              className="text-[#E5383B] hover:text-[#BA181B] font-semibold underline p-0 h-auto"
                            >
                              Terms and Conditions
                            </Button>
                          </TermsDialog>
                          {' '}and{' '}
                          <TermsDialog>
                            <Button 
                              variant="link" 
                              className="text-[#E5383B] hover:text-[#BA181B] font-semibold underline p-0 h-auto"
                            >
                              Privacy Policy
                            </Button>
                          </TermsDialog>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={prevStep} className="py-4 px-6 rounded-2xl font-bold transition-all hover:scale-[1.02]"
                      style={{ background: 'rgba(177, 167, 166, 0.2)', color: '#F5F3F4' }}>
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button onClick={handleSubmit} disabled={!agreedToTerms || loading}
                      className="flex-1 py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{
                        background: agreedToTerms ? 'linear-gradient(135deg, #E5383B, #BA181B)' : 'rgba(177, 167, 166, 0.2)',
                        color: agreedToTerms ? '#F5F3F4' : '#B1A7A6',
                        boxShadow: agreedToTerms ? '0 8px 32px rgba(229, 56, 59, 0.4)' : 'none'
                      }}>
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account <Check className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="text-center mt-8 pt-6" style={{ borderTop: '1px solid rgba(177, 167, 166, 0.2)' }}>
                <button
                  onClick={handleGoogleLogin}
                  className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-3 bg-white/10 border border-[#B1A7A6]/30 text-[#F5F3F4]"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
                <br />
              <p className="text-sm text-[#B1A7A6]">
                Already have an account?{' '}
                <Link to="/login" className="text-[#E5383B] hover:text-[#BA181B] font-semibold transition-colors">Login here</Link>
              </p>
            </div>
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
          50% { transform: translate(40px, -40px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}