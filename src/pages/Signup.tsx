import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Loader2, User, Mail, Phone, MapPin, Lock, Check, ArrowRight, ArrowLeft, Eye, EyeOff, Sparkles, Shield, Building2, Briefcase, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { LoginNavbar } from '@/components/LoginNavbar';
import { TermsDialog } from '@/components/TermsDialog';
import { Button } from '@/components/ui/button';

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'user' | 'owner'>(
    (searchParams.get('role') as 'user' | 'owner') || 'user'
  );
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pin_code: '',
    password: '',
    confirmPassword: '',
    // Owner-specific fields
    businessName: '',
    businessAddress: '',
    gstNumber: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    phone: '',
    pinCode: '',
    password: '',
    gst: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    const role = searchParams.get('role');
    if (role === 'owner' || role === 'user') {
      setSelectedRole(role);
    }
  }, [searchParams]);

  const isOwner = selectedRole === 'owner';
  const totalSteps = isOwner ? 5 : 4;

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

  const validateGST = (gst: string): boolean => {
    if (!gst) return true; // GST is optional
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'email') setErrors(prev => ({ ...prev, email: '' }));
    if (name === 'phone') setErrors(prev => ({ ...prev, phone: '' }));
    if (name === 'pin_code') setErrors(prev => ({ ...prev, pinCode: '' }));
    if (name === 'password' || name === 'confirmPassword') setErrors(prev => ({ ...prev, password: '' }));
    if (name === 'gstNumber') setErrors(prev => ({ ...prev, gst: '' }));
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
      if (isOwner) {
        setStep(4); // Go to business details for owners
      } else {
        setStep(4); // Go to terms for users
      }
    } else if (step === 4 && isOwner) {
      // Validate business details
      if (formData.gstNumber && !validateGST(formData.gstNumber)) {
        setErrors(prev => ({ ...prev, gst: 'Enter valid GST number (e.g., 22AAAAA0000A1Z5)' }));
        return;
      }
      setStep(5); // Go to terms for owners
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

    setLoading(true);

    try {
      const success = await signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        pin_code: formData.pin_code,
        userType: selectedRole,
        businessName: formData.businessName || undefined,
        businessAddress: formData.businessAddress || undefined,
        gstNumber: formData.gstNumber || undefined,
      });

      if (success) {
        toast({
          title: 'Account created successfully!',
          description: 'Please check your email to verify your account.',
        });
        navigate(isOwner ? '/owner-dashboard' : '/listings');
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

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceedStep1 = formData.name && formData.email;
  const canProceedStep2 = formData.phone && formData.pin_code;
  const canProceedStep3 = formData.password && formData.confirmPassword && validatePassword(formData.password) && formData.password === formData.confirmPassword;
  const canProceedStep4Owner = true; // Business details are optional

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: '#0B090A' }}>
      {/* Animated Background */}
      <LoginNavbar />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
          style={{
            background: isOwner
              ? 'radial-gradient(circle, #E5383B, transparent)'
              : 'radial-gradient(circle, #3B82F6, transparent)',
            animation: 'float 18s ease-in-out infinite'
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-15"
          style={{
            background: isOwner
              ? 'radial-gradient(circle, #BA181B, transparent)'
              : 'radial-gradient(circle, #1D4ED8, transparent)',
            animation: 'float 15s ease-in-out infinite reverse'
          }}
        />
      </div>

      {/* Left Side - Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={isOwner
              ? "https://images.unsplash.com/photo-1560472355-536de3962603?w=1200&h=1600&fit=crop"
              : "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=1600&fit=crop"
            }
            alt="Signup Background"
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.6) contrast(1.1)' }}
          />
        </div>

        <div
          className="absolute inset-0"
          style={{
            background: isOwner
              ? 'linear-gradient(135deg, rgba(229, 56, 59, 0.45), rgba(11, 9, 10, 0.85))'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.45), rgba(11, 9, 10, 0.85))'
          }}
        />

        <div className="relative z-10 flex flex-col justify-end p-12 lg:p-16">
          <div className="space-y-6">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl"
              style={{
                background: isOwner
                  ? 'rgba(229, 56, 59, 0.2)'
                  : 'rgba(59, 130, 246, 0.2)',
                border: isOwner
                  ? '1px solid rgba(229, 56, 59, 0.3)'
                  : '1px solid rgba(59, 130, 246, 0.3)'
              }}
            >
              {isOwner ? (
                <Building2 className="w-4 h-4 text-[#F5F3F4]" />
              ) : (
                <User className="w-4 h-4 text-[#F5F3F4]" />
              )}
              <span className="text-sm font-bold text-[#F5F3F4] tracking-wide">
                {isOwner ? 'Owner Registration' : 'User Registration'}
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-black text-[#F5F3F4] leading-tight">
              {isOwner ? (
                <>
                  Start Your
                  <br />
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #E5383B, #BA181B)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Rental Business
                  </span>
                </>
              ) : (
                <>
                  Start Your
                  <br />
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Rental Adventure
                  </span>
                </>
              )}
            </h1>

            <p className="text-lg text-[#D3D3D3] max-w-md">
              {isOwner
                ? 'List your items, verify renters with ID proof, and earn money from your assets.'
                : 'Join thousands of users renting items in your community. It\'s fast, easy, and secure.'}
            </p>

            <div className="grid grid-cols-2 gap-6 pt-8">
              <div
                className="p-6 rounded-2xl backdrop-blur-xl"
                style={{
                  background: 'rgba(22, 26, 29, 0.5)',
                  border: isOwner
                    ? '1px solid rgba(229, 56, 59, 0.2)'
                    : '1px solid rgba(59, 130, 246, 0.2)'
                }}
              >
                <Shield className={`w-8 h-8 mb-3 ${isOwner ? 'text-[#E5383B]' : 'text-blue-500'}`} />
                <div className="text-xl font-black text-[#F5F3F4]">Secure</div>
                <div className="text-sm text-[#B1A7A6]">
                  {isOwner ? 'Verify renters with ID' : 'Bank-level encryption'}
                </div>
              </div>
              <div
                className="p-6 rounded-2xl backdrop-blur-xl"
                style={{
                  background: 'rgba(22, 26, 29, 0.5)',
                  border: isOwner
                    ? '1px solid rgba(229, 56, 59, 0.2)'
                    : '1px solid rgba(59, 130, 246, 0.2)'
                }}
              >
                <Sparkles className={`w-8 h-8 mb-3 ${isOwner ? 'text-[#E5383B]' : 'text-blue-500'}`} />
                <div className="text-xl font-black text-[#F5F3F4]">
                  {isOwner ? 'Earnings' : 'Easy'}
                </div>
                <div className="text-sm text-[#B1A7A6]">
                  {isOwner ? 'Track your income' : 'Quick setup process'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center mt-10 p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Role Toggle */}
          <div className="mb-6">
            <div
              className="inline-flex w-full p-1 rounded-2xl"
              style={{ background: 'rgba(177, 167, 166, 0.2)' }}
            >
              <button
                onClick={() => {
                  setSelectedRole('user');
                  setStep(1);
                }}
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
                onClick={() => {
                  setSelectedRole('owner');
                  setStep(1);
                }}
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
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 ${
                      step >= s ? 'scale-110' : 'scale-100'
                    }`}
                    style={{
                      background: step >= s
                        ? isOwner
                          ? 'linear-gradient(135deg, #E5383B, #BA181B)'
                          : 'linear-gradient(135deg, #3B82F6, #1D4ED8)'
                        : 'rgba(177, 167, 166, 0.2)',
                      color: step >= s ? '#F5F3F4' : '#B1A7A6',
                      boxShadow: step >= s
                        ? isOwner
                          ? '0 4px 20px rgba(229, 56, 59, 0.4)'
                          : '0 4px 20px rgba(59, 130, 246, 0.4)'
                        : 'none'
                    }}
                  >
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </div>
                  {s < totalSteps && (
                    <div
                      className="w-6 h-1 mx-1 rounded-full transition-all duration-500"
                      style={{
                        background: step > s
                          ? isOwner
                            ? 'linear-gradient(90deg, #E5383B, #BA181B)'
                            : 'linear-gradient(90deg, #3B82F6, #1D4ED8)'
                          : 'rgba(177, 167, 166, 0.2)'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-[#B1A7A6]">Step {step} of {totalSteps}</p>
            </div>
          </div>

          {/* Card */}
          <div
            className="rounded-3xl p-8 backdrop-blur-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 243, 244, 0.1), rgba(211, 211, 211, 0.05))',
              border: isOwner
                ? '1px solid rgba(229, 56, 59, 0.2)'
                : '1px solid rgba(59, 130, 246, 0.2)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-[#F5F3F4] mb-2">
                {step === 1 && 'Basic Information'}
                {step === 2 && 'Contact Details'}
                {step === 3 && 'Secure Password'}
                {step === 4 && isOwner && 'Business Details'}
                {((step === 4 && !isOwner) || (step === 5 && isOwner)) && 'Final Step'}
              </h2>
              <p className="text-sm text-[#B1A7A6]">
                {step === 1 && 'Let\'s get to know you'}
                {step === 2 && 'How can we reach you?'}
                {step === 3 && 'Protect your account'}
                {step === 4 && isOwner && 'Optional business information'}
                {((step === 4 && !isOwner) || (step === 5 && isOwner)) && 'Review and confirm'}
              </p>
            </div>

            <div>
              {/* Step 1: Name & Email */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  {/* Name Input */}
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl blur-xl transition-all duration-300"
                      style={{ background: formData.name ? (isOwner ? 'linear-gradient(135deg, rgba(229, 56, 59, 0.2), rgba(186, 24, 27, 0.1))' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(29, 78, 216, 0.1))') : 'transparent' }}
                    />
                    <div className="relative rounded-2xl p-[1px]" style={{ background: isOwner ? 'linear-gradient(135deg, rgba(229, 56, 59, 0.3), rgba(186, 24, 27, 0.2))' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(29, 78, 216, 0.2))' }}>
                      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(22, 26, 29, 0.6)' }}>
                        <div className="flex items-center px-5 py-4 gap-3">
                          <User className={`w-5 h-5 ${isOwner ? 'text-[#E5383B]' : 'text-blue-500'}`} />
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
                      style={{ background: formData.email ? (isOwner ? 'linear-gradient(135deg, rgba(229, 56, 59, 0.2), rgba(186, 24, 27, 0.1))' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(29, 78, 216, 0.1))') : 'transparent' }}
                    />
                    <div className="relative rounded-2xl p-[1px]" style={{ background: isOwner ? 'linear-gradient(135deg, rgba(229, 56, 59, 0.3), rgba(186, 24, 27, 0.2))' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(29, 78, 216, 0.2))' }}>
                      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(22, 26, 29, 0.6)' }}>
                        <div className="flex items-center px-5 py-4 gap-3">
                          <Mail className={`w-5 h-5 ${isOwner ? 'text-[#E5383B]' : 'text-blue-500'}`} />
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
                      background: canProceedStep1
                        ? isOwner
                          ? 'linear-gradient(135deg, #E5383B, #BA181B)'
                          : 'linear-gradient(135deg, #3B82F6, #1D4ED8)'
                        : 'rgba(177, 167, 166, 0.2)',
                      color: canProceedStep1 ? '#F5F3F4' : '#B1A7A6',
                      boxShadow: canProceedStep1
                        ? isOwner
                          ? '0 8px 32px rgba(229, 56, 59, 0.4)'
                          : '0 8px 32px rgba(59, 130, 246, 0.4)'
                        : 'none'
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
                      style={{ background: formData.phone ? (isOwner ? 'linear-gradient(135deg, rgba(229, 56, 59, 0.2), rgba(186, 24, 27, 0.1))' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(29, 78, 216, 0.1))') : 'transparent' }}
                    />
                    <div className="relative rounded-2xl p-[1px]" style={{ background: isOwner ? 'linear-gradient(135deg, rgba(229, 56, 59, 0.3), rgba(186, 24, 27, 0.2))' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(29, 78, 216, 0.2))' }}>
                      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(22, 26, 29, 0.6)' }}>
                        <div className="flex items-center px-5 py-4 gap-3">
                          <Phone className={`w-5 h-5 ${isOwner ? 'text-[#E5383B]' : 'text-blue-500'}`} />
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
                      style={{ background: formData.pin_code ? (isOwner ? 'linear-gradient(135deg, rgba(229, 56, 59, 0.2), rgba(186, 24, 27, 0.1))' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(29, 78, 216, 0.1))') : 'transparent' }}
                    />
                    <div className="relative rounded-2xl p-[1px]" style={{ background: isOwner ? 'linear-gradient(135deg, rgba(229, 56, 59, 0.3), rgba(186, 24, 27, 0.2))' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(29, 78, 216, 0.2))' }}>
                      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(22, 26, 29, 0.6)' }}>
                        <div className="flex items-center px-5 py-4 gap-3">
                          <MapPin className={`w-5 h-5 ${isOwner ? 'text-[#E5383B]' : 'text-blue-500'}`} />
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
                        background: canProceedStep2
                          ? isOwner
                            ? 'linear-gradient(135deg, #E5383B, #BA181B)'
                            : 'linear-gradient(135deg, #3B82F6, #1D4ED8)'
                          : 'rgba(177, 167, 166, 0.2)',
                        color: canProceedStep2 ? '#F5F3F4' : '#B1A7A6',
                        boxShadow: canProceedStep2
                          ? isOwner
                            ? '0 8px 32px rgba(229, 56, 59, 0.4)'
                            : '0 8px 32px rgba(59, 130, 246, 0.4)'
                          : 'none'
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
                      style={{ background: formData.password ? (isOwner ? 'linear-gradient(135deg, rgba(229, 56, 59, 0.2), rgba(186, 24, 27, 0.1))' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(29, 78, 216, 0.1))') : 'transparent' }}
                    />
                    <div className="relative rounded-2xl p-[1px]" style={{ background: isOwner ? 'linear-gradient(135deg, rgba(229, 56, 59, 0.3), rgba(186, 24, 27, 0.2))' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(29, 78, 216, 0.2))' }}>
                      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(22, 26, 29, 0.6)' }}>
                        <div className="flex items-center px-5 py-4 gap-3">
                          <Lock className={`w-5 h-5 ${isOwner ? 'text-[#E5383B]' : 'text-blue-500'}`} />
                          <input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create password (8+ chars)"
                            className="flex-1 bg-transparent text-[#F5F3F4] text-base outline-none placeholder:text-[#B1A7A6]"
                          />
                          <button onClick={() => setShowPassword(!showPassword)} className={`hover:${isOwner ? 'text-[#E5383B]' : 'text-blue-500'} text-[#B1A7A6]`}>
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl blur-xl transition-all duration-300"
                      style={{ background: formData.confirmPassword ? (isOwner ? 'linear-gradient(135deg, rgba(229, 56, 59, 0.2), rgba(186, 24, 27, 0.1))' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(29, 78, 216, 0.1))') : 'transparent' }}
                    />
                    <div className="relative rounded-2xl p-[1px]" style={{ background: isOwner ? 'linear-gradient(135deg, rgba(229, 56, 59, 0.3), rgba(186, 24, 27, 0.2))' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(29, 78, 216, 0.2))' }}>
                      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(22, 26, 29, 0.6)' }}>
                        <div className="flex items-center px-5 py-4 gap-3">
                          <Lock className={`w-5 h-5 ${isOwner ? 'text-[#E5383B]' : 'text-blue-500'}`} />
                          <input
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm password"
                            className="flex-1 bg-transparent text-[#F5F3F4] text-base outline-none placeholder:text-[#B1A7A6]"
                          />
                          <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={`hover:${isOwner ? 'text-[#E5383B]' : 'text-blue-500'} text-[#B1A7A6]`}>
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
                        background: canProceedStep3
                          ? isOwner
                            ? 'linear-gradient(135deg, #E5383B, #BA181B)'
                            : 'linear-gradient(135deg, #3B82F6, #1D4ED8)'
                          : 'rgba(177, 167, 166, 0.2)',
                        color: canProceedStep3 ? '#F5F3F4' : '#B1A7A6',
                        boxShadow: canProceedStep3
                          ? isOwner
                            ? '0 8px 32px rgba(229, 56, 59, 0.4)'
                            : '0 8px 32px rgba(59, 130, 246, 0.4)'
                          : 'none'
                      }}>
                      Continue <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Business Details (Owner only) */}
              {step === 4 && isOwner && (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-4">
                    <p className="text-sm text-amber-400">
                      These details are optional but help build trust with renters.
                    </p>
                  </div>

                  <div className="relative">
                    <div className="relative rounded-2xl p-[1px]" style={{ background: 'linear-gradient(135deg, rgba(229, 56, 59, 0.3), rgba(186, 24, 27, 0.2))' }}>
                      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(22, 26, 29, 0.6)' }}>
                        <div className="flex items-center px-5 py-4 gap-3">
                          <Briefcase className="w-5 h-5 text-[#E5383B]" />
                          <input
                            name="businessName"
                            type="text"
                            value={formData.businessName}
                            onChange={handleChange}
                            placeholder="Business name (optional)"
                            className="flex-1 bg-transparent text-[#F5F3F4] text-base outline-none placeholder:text-[#B1A7A6]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="relative rounded-2xl p-[1px]" style={{ background: 'linear-gradient(135deg, rgba(229, 56, 59, 0.3), rgba(186, 24, 27, 0.2))' }}>
                      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(22, 26, 29, 0.6)' }}>
                        <div className="flex items-start px-5 py-4 gap-3">
                          <Building2 className="w-5 h-5 text-[#E5383B] mt-1" />
                          <textarea
                            name="businessAddress"
                            value={formData.businessAddress}
                            onChange={handleChange}
                            placeholder="Business address (optional)"
                            rows={2}
                            className="flex-1 bg-transparent text-[#F5F3F4] text-base outline-none placeholder:text-[#B1A7A6] resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="relative rounded-2xl p-[1px]" style={{ background: 'linear-gradient(135deg, rgba(229, 56, 59, 0.3), rgba(186, 24, 27, 0.2))' }}>
                      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(22, 26, 29, 0.6)' }}>
                        <div className="flex items-center px-5 py-4 gap-3">
                          <FileText className="w-5 h-5 text-[#E5383B]" />
                          <input
                            name="gstNumber"
                            type="text"
                            value={formData.gstNumber}
                            onChange={handleChange}
                            placeholder="GST number (optional)"
                            className="flex-1 bg-transparent text-[#F5F3F4] text-base outline-none placeholder:text-[#B1A7A6] uppercase"
                          />
                        </div>
                      </div>
                    </div>
                    {errors.gst && <p className="text-xs text-[#E5383B] mt-2 ml-2">{errors.gst}</p>}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={prevStep} className="py-4 px-6 rounded-2xl font-bold transition-all hover:scale-[1.02]"
                      style={{ background: 'rgba(177, 167, 166, 0.2)', color: '#F5F3F4' }}>
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextStep}
                      className="flex-1 py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, #E5383B, #BA181B)',
                        color: '#F5F3F4',
                        boxShadow: '0 8px 32px rgba(229, 56, 59, 0.4)'
                      }}>
                      Continue <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Final Step: Terms */}
              {((step === 4 && !isOwner) || (step === 5 && isOwner)) && (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-6 rounded-2xl" style={{ background: 'rgba(22, 26, 29, 0.4)', border: isOwner ? '1px solid rgba(229, 56, 59, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <div className="flex items-start gap-4">
                      <button onClick={() => setAgreedToTerms(!agreedToTerms)}
                        className="mt-1 flex-shrink-0 w-6 h-6 rounded-lg transition-all duration-300"
                        style={{
                          background: agreedToTerms
                            ? isOwner
                              ? 'linear-gradient(135deg, #E5383B, #BA181B)'
                              : 'linear-gradient(135deg, #3B82F6, #1D4ED8)'
                            : 'rgba(177, 167, 166, 0.2)',
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
                              className={`${isOwner ? 'text-[#E5383B] hover:text-[#BA181B]' : 'text-blue-500 hover:text-blue-600'} font-semibold underline p-0 h-auto`}
                            >
                              Terms and Conditions
                            </Button>
                          </TermsDialog>
                          {' '}and{' '}
                          <TermsDialog>
                            <Button
                              variant="link"
                              className={`${isOwner ? 'text-[#E5383B] hover:text-[#BA181B]' : 'text-blue-500 hover:text-blue-600'} font-semibold underline p-0 h-auto`}
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
                        background: agreedToTerms
                          ? isOwner
                            ? 'linear-gradient(135deg, #E5383B, #BA181B)'
                            : 'linear-gradient(135deg, #3B82F6, #1D4ED8)'
                          : 'rgba(177, 167, 166, 0.2)',
                        color: agreedToTerms ? '#F5F3F4' : '#B1A7A6',
                        boxShadow: agreedToTerms
                          ? isOwner
                            ? '0 8px 32px rgba(229, 56, 59, 0.4)'
                            : '0 8px 32px rgba(59, 130, 246, 0.4)'
                          : 'none'
                      }}>
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create {isOwner ? 'Owner' : 'User'} Account <Check className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center mt-8 pt-6" style={{ borderTop: '1px solid rgba(177, 167, 166, 0.2)' }}>
              <p className="text-sm text-[#B1A7A6]">
                Already have an account?{' '}
                <Link to={`/login?role=${selectedRole}`} className={`${isOwner ? 'text-[#E5383B] hover:text-[#BA181B]' : 'text-blue-500 hover:text-blue-600'} font-semibold transition-colors`}>Login here</Link>
              </p>
            </div>
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
