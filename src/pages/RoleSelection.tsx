import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Building2, ArrowRight, Sparkles, Shield, TrendingUp, Package } from 'lucide-react';
import { LoginNavbar } from '@/components/LoginNavbar';

type SelectedRole = 'user' | 'owner' | null;

export default function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null);
  const [action, setAction] = useState<'login' | 'signup'>('login');

  const handleContinue = () => {
    if (!selectedRole) return;

    if (action === 'login') {
      navigate(`/login?role=${selectedRole}`);
    } else {
      navigate(`/signup?role=${selectedRole}`);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: '#0B090A' }}>
      <LoginNavbar />

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20"
          style={{
            background: 'radial-gradient(circle, #E5383B, transparent)',
            animation: 'float 15s ease-in-out infinite'
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15"
          style={{
            background: 'radial-gradient(circle, #BA181B, transparent)',
            animation: 'float 12s ease-in-out infinite reverse'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="w-full flex items-center justify-center p-6 lg:p-12 relative z-10 mt-16">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl mb-6"
              style={{
                background: 'rgba(229, 56, 59, 0.2)',
                border: '1px solid rgba(229, 56, 59, 0.3)'
              }}
            >
              <Sparkles className="w-4 h-4 text-[#F5F3F4]" />
              <span className="text-sm font-bold text-[#F5F3F4] tracking-wide">Welcome to RentPal</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-[#F5F3F4] mb-4">
              How would you like to{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #E5383B, #BA181B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                continue?
              </span>
            </h1>
            <p className="text-lg text-[#B1A7A6] max-w-xl mx-auto">
              Choose your role to get started. You can always switch or upgrade later.
            </p>
          </div>

          {/* Action Toggle */}
          <div className="flex justify-center mb-8">
            <div
              className="inline-flex p-1 rounded-2xl"
              style={{ background: 'rgba(177, 167, 166, 0.2)' }}
            >
              <button
                onClick={() => setAction('login')}
                className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all ${
                  action === 'login'
                    ? 'bg-gradient-to-r from-[#E5383B] to-[#BA181B] text-[#F5F3F4] shadow-lg'
                    : 'text-[#B1A7A6] hover:text-[#F5F3F4]'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setAction('signup')}
                className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all ${
                  action === 'signup'
                    ? 'bg-gradient-to-r from-[#E5383B] to-[#BA181B] text-[#F5F3F4] shadow-lg'
                    : 'text-[#B1A7A6] hover:text-[#F5F3F4]'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* User Card */}
            <button
              onClick={() => setSelectedRole('user')}
              className={`relative p-8 rounded-3xl text-left transition-all duration-300 hover:scale-[1.02] ${
                selectedRole === 'user' ? 'ring-4 ring-[#E5383B]' : ''
              }`}
              style={{
                background: selectedRole === 'user'
                  ? 'linear-gradient(135deg, rgba(229, 56, 59, 0.2), rgba(186, 24, 27, 0.1))'
                  : 'rgba(22, 26, 29, 0.6)',
                border: selectedRole === 'user'
                  ? '2px solid rgba(229, 56, 59, 0.5)'
                  : '1px solid rgba(177, 167, 166, 0.2)'
              }}
            >
              {selectedRole === 'user' && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#E5383B] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6">
                <User className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-[#F5F3F4] mb-2">I want to Rent</h3>
              <p className="text-[#B1A7A6] mb-6">
                Browse and rent items from verified owners in your area. Perfect for temporary needs.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-[#D3D3D3]">
                  <Package className="w-4 h-4 text-blue-400" />
                  <span>Access thousands of rental items</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#D3D3D3]">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Secure identity verification</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#D3D3D3]">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span>Build your rental history</span>
                </div>
              </div>
            </button>

            {/* Owner Card */}
            <button
              onClick={() => setSelectedRole('owner')}
              className={`relative p-8 rounded-3xl text-left transition-all duration-300 hover:scale-[1.02] ${
                selectedRole === 'owner' ? 'ring-4 ring-[#E5383B]' : ''
              }`}
              style={{
                background: selectedRole === 'owner'
                  ? 'linear-gradient(135deg, rgba(229, 56, 59, 0.2), rgba(186, 24, 27, 0.1))'
                  : 'rgba(22, 26, 29, 0.6)',
                border: selectedRole === 'owner'
                  ? '2px solid rgba(229, 56, 59, 0.5)'
                  : '1px solid rgba(177, 167, 166, 0.2)'
              }}
            >
              {selectedRole === 'owner' && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#E5383B] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E5383B] to-[#BA181B] flex items-center justify-center mb-6">
                <Building2 className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-[#F5F3F4] mb-2">I want to List & Earn</h3>
              <p className="text-[#B1A7A6] mb-6">
                List your items for rent and earn money. Manage rentals with our powerful dashboard.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-[#D3D3D3]">
                  <Package className="w-4 h-4 text-[#E5383B]" />
                  <span>List unlimited items</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#D3D3D3]">
                  <Shield className="w-4 h-4 text-[#E5383B]" />
                  <span>Verify renters before approval</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#D3D3D3]">
                  <TrendingUp className="w-4 h-4 text-[#E5383B]" />
                  <span>Track earnings & analytics</span>
                </div>
              </div>

              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                <span className="text-xs font-bold text-amber-400">RECOMMENDED FOR BUSINESSES</span>
              </div>
            </button>
          </div>

          {/* Continue Button */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleContinue}
              disabled={!selectedRole}
              className="w-full max-w-md py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: selectedRole
                  ? 'linear-gradient(135deg, #E5383B, #BA181B)'
                  : 'rgba(177, 167, 166, 0.2)',
                color: selectedRole ? '#F5F3F4' : '#B1A7A6',
                boxShadow: selectedRole ? '0 8px 32px rgba(229, 56, 59, 0.4)' : 'none'
              }}
            >
              Continue as {selectedRole === 'owner' ? 'Owner' : selectedRole === 'user' ? 'User' : '...'}
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-sm text-[#B1A7A6]">
              {action === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setAction('signup')}
                    className="text-[#E5383B] hover:text-[#BA181B] font-semibold"
                  >
                    Sign up here
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setAction('login')}
                    className="text-[#E5383B] hover:text-[#BA181B] font-semibold"
                  >
                    Login here
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(50px, -50px); }
        }
      `}</style>
    </div>
  );
}
