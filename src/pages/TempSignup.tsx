import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Check,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// ----------------------------- //
// Main Signup Component
// ----------------------------- //

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pin_code: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    phone: '',
    pinCode: '',
    password: '',
  });

  // ----------------------------- //
  // Validation Helpers
  // ----------------------------- //
  const validatePhone = (phone: string) => /^[6-9]\d{9}$/.test(phone.replace(/[\s-]/g, ''));
  const validatePinCode = (pinCode: string) => /^\d{6}$/.test(pinCode);
  const validatePassword = (password: string) => password.length >= 8;

  // ----------------------------- //
  // Input & Step Logic
  // ----------------------------- //
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.email)) return;
    if (step === 2) {
      if (!validatePhone(formData.phone))
        return setErrors(prev => ({ ...prev, phone: 'Enter valid 10-digit phone number' }));
      if (!validatePinCode(formData.pin_code))
        return setErrors(prev => ({ ...prev, pinCode: 'Enter valid 6-digit PIN code' }));
    }
    if (step === 3) {
      if (!validatePassword(formData.password))
        return setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters long' }));
      if (formData.password !== formData.confirmPassword)
        return setErrors(prev => ({ ...prev, password: 'Passwords do not match' }));
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step > 1 ? step - 1 : 1);

  // ----------------------------- //
  // Submit
  // ----------------------------- //
  const handleSubmit = async () => {
    if (!agreedToTerms) {
      toast({
        title: 'Terms Required',
        description: 'Please agree to the terms and conditions to continue.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const success = await signup({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      pin_code: formData.pin_code,
    });
    setLoading(false);

    if (success) {
      toast({
        title: 'Account created successfully!',
        description: 'Welcome to RentPal 🎉',
      });
      navigate('/listings');
    } else {
      toast({
        title: 'Signup failed',
        description: 'Please check your details and try again.',
        variant: 'destructive',
      });
    }
  };

  // ----------------------------- //
  // Render
  // ----------------------------- //
  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: '#0B090A' }}>
      {/* Animated Background */}
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

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 z-10">
        <div className="w-full max-w-md">
          <StepIndicator step={step} />

          {step === 1 && (
            <Step1 formData={formData} handleChange={handleChange} nextStep={nextStep} />
          )}
          {step === 2 && (
            <Step2 formData={formData} handleChange={handleChange} errors={errors} nextStep={nextStep} prevStep={prevStep} />
          )}
          {step === 3 && (
            <Step3
              formData={formData}
              handleChange={handleChange}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              errors={errors}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}
          {step === 4 && (
            <Step4
              agreedToTerms={agreedToTerms}
              setAgreedToTerms={setAgreedToTerms}
              handleSubmit={handleSubmit}
              prevStep={prevStep}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------- //
// Step Indicator Component
// ----------------------------- //
function StepIndicator({ step }: { step: number }) {
  return (
    <div className="mb-8 flex justify-center gap-3">
      {[1, 2, 3, 4].map(s => (
        <div key={s} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s
                ? 'scale-110 bg-gradient-to-br from-[#E5383B] to-[#BA181B] text-white shadow-[0_4px_20px_rgba(229,56,59,0.4)]'
                : 'bg-[#B1A7A6]/20 text-[#B1A7A6]'
              }`}
          >
            {step > s ? <Check className="w-5 h-5" /> : s}
          </div>
          {s < 4 && (
            <div
              className={`w-8 h-1 mx-2 rounded-full ${step > s ? 'bg-gradient-to-r from-[#E5383B] to-[#BA181B]' : 'bg-[#B1A7A6]/20'
                }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ----------------------------- //
// Reusable Subcomponents
// ----------------------------- //
function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-2xl backdrop-blur-xl bg-[#161A1D]/50 border border-[#E5383B]/20">
      <div className="w-8 h-8 text-[#E5383B] mb-3">{icon}</div>
      <h3 className="text-xl font-black text-[#F5F3F4]">{title}</h3>
      <p className="text-sm text-[#B1A7A6]">{desc}</p>
    </div>
  );
}

// Step 1: Basic Info
function Step1({ formData, handleChange, nextStep }: any) {
  return (
    <div className="space-y-6">
      <InputField icon={<User />} name="name" label="Full Name" value={formData.name} onChange={handleChange} />
      <InputField icon={<Mail />} name="email" label="Email" value={formData.email} onChange={handleChange} />
      <NextButton onClick={nextStep} disabled={!formData.name || !formData.email} />
    </div>
  );
}

// Step 2: Contact
function Step2({ formData, handleChange, errors, nextStep, prevStep }: any) {
  return (
    <div className="space-y-6">
      <InputField
        icon={<Phone />}
        name="phone"
        label="Phone"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
      />
      <InputField
        icon={<MapPin />}
        name="pin_code"
        label="PIN Code"
        value={formData.pin_code}
        onChange={handleChange}
        error={errors.pinCode}
      />
      <StepButtons prevStep={prevStep} nextStep={nextStep} disabled={!formData.phone || !formData.pin_code} />
    </div>
  );
}

// Step 3: Password
function Step3({ formData, handleChange, errors, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, prevStep, nextStep }: any) {
  return (
    <div className="space-y-6">
      <InputField
        icon={<Lock />}
        name="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        toggleIcon={showPassword ? <EyeOff /> : <Eye />}
        onToggle={() => setShowPassword(!showPassword)}
      />
      <InputField
        icon={<Lock />}
        name="confirmPassword"
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        value={formData.confirmPassword}
        onChange={handleChange}
        toggleIcon={showConfirmPassword ? <EyeOff /> : <Eye />}
        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
      />
      <StepButtons prevStep={prevStep} nextStep={nextStep} disabled={!formData.password || !formData.confirmPassword} />
    </div>
  );
}

// Step 4: Confirmation
function Step4({ agreedToTerms, setAgreedToTerms, handleSubmit, prevStep, loading }: any) {
  return (
    <div className="space-y-8">
      <label className="flex items-center gap-3 text-sm text-[#D3D3D3] cursor-pointer">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={e => setAgreedToTerms(e.target.checked)}
          className="accent-[#E5383B] w-5 h-5"
        />
        I agree to the <span className="text-[#E5383B] underline">Terms & Conditions</span>.
      </label>

      <div className="flex justify-between">
        <button onClick={prevStep} className="flex items-center gap-2 text-[#B1A7A6]">
          <ArrowLeft size={16} /> Back
        </button>

        <button
          onClick={handleSubmit}
          disabled={!agreedToTerms || loading}
          className="bg-gradient-to-r from-[#E5383B] to-[#BA181B] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight size={16} /></>}
        </button>
      </div>
    </div>
  );
}

// ----------------------------- //
// Reusable Form Fields
// ----------------------------- //
function InputField({ icon, name, label, value, onChange, type = 'text', error, toggleIcon, onToggle }: any) {
  return (
    <div>
      <label className="text-sm font-medium text-[#F5F3F4]">{label}</label>
      <div className="relative mt-1">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B1A7A6]">{icon}</div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full bg-[#161A1D]/60 text-white pl-10 pr-10 py-2.5 rounded-xl border border-[#B1A7A6]/20 focus:outline-none focus:border-[#E5383B] placeholder:text-[#B1A7A6]"
          placeholder={label}
        />
        {toggleIcon && (
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B1A7A6] cursor-pointer"
            onClick={onToggle}
          >
            {toggleIcon}
          </div>
        )}
      </div>
      {error && <p className="text-[#E5383B] text-xs mt-1">{error}</p>}
    </div>
  );
}

// ----------------------------- //
// Navigation Buttons
// ----------------------------- //
function StepButtons({ prevStep, nextStep, disabled }: any) {
  return (
    <div className="flex justify-between">
      <button onClick={prevStep} className="flex items-center gap-2 text-[#B1A7A6]">
        <ArrowLeft size={16} /> Back
      </button>
      <NextButton onClick={nextStep} disabled={disabled} />
    </div>
  );
}

function NextButton({ onClick, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-gradient-to-r from-[#E5383B] to-[#BA181B] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
    >
      Next <ArrowRight size={16} />
    </button>
  );
}
