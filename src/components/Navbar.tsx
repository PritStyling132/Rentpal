import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import { Menu, X, User, LogOut, LayoutDashboard, MessageCircle, Building2, Package } from 'lucide-react';
import heroImage from '@/assets/logo-remove.png';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

export const Navbar = () => {
  const { user, logout, isAdmin, isOwner, userType } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const unreadCount = useUnreadCount();

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  const NavLinks = () => (
    <>
      <Link to="/listings" onClick={() => setOpen(false)}>
        <Button variant="ghost" className="font-medium w-full justify-start text-[#161A1D] hover:text-[#E5383B] hover:bg-[#E5383B]/5 transition-all duration-200">
          Browse Items
        </Button>
      </Link>

      <Link to="/about" className="relative group px-4 py-2">
        <span className="text-[#161A1D] group-hover:text-[#E5383B] font-medium transition-colors duration-200">
          About Us
        </span>
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#E5383B] to-[#BA181B] group-hover:w-full transition-all duration-300"></span>
      </Link>

      <Link to="/blog" onClick={() => setOpen(false)}>
        <Button variant="ghost" className="font-medium w-full justify-start text-[#161A1D] hover:text-[#E5383B] hover:bg-[#E5383B]/5 transition-all duration-200">
          Blog
        </Button>
      </Link>

      <Link to="/leaderboard" onClick={() => setOpen(false)}>
        <Button variant="ghost" className="font-medium w-full justify-start text-[#161A1D] hover:text-[#E5383B] hover:bg-[#E5383B]/5 transition-all duration-200">
          Leaderboard
        </Button>
      </Link>

      {user ? (
        <>
          {/* Owner-specific links */}
          {isOwner && (
            <Link to="/owner-dashboard" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-[#E5383B] hover:text-[#BA181B] hover:bg-[#E5383B]/5 transition-all duration-200">
                <Building2 className="w-5 h-5 mr-2" /> Owner Dashboard
              </Button>
            </Link>
          )}

          <Link to="/submit-listing" onClick={() => setOpen(false)}>
            <Button
              variant="outline"
              className="font-medium w-full justify-start border-2 border-[#E5383B] text-[#660708] hover:bg-[#E5383B] hover:text-[#F5F3F4] transition-all duration-300 hover:shadow-lg hover:shadow-[#E5383B]/20"
            >
              <Package className="w-5 h-5 mr-2" />
              List an Item
            </Button>
          </Link>

          <Link to="/inbox" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start text-[#161A1D] hover:text-[#E5383B] hover:bg-[#E5383B]/5 transition-all duration-200 relative">
              <MessageCircle className={`w-5 h-5 mr-2 ${unreadCount > 0 ? 'animate-pulse' : ''}`} /> Inbox
              {unreadCount > 0 && (
                <Badge className="ml-auto bg-gradient-to-r from-[#E5383B] to-[#BA181B] text-white text-xs animate-bounce">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </Link>

          <Link to="/profile" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start text-[#161A1D] hover:text-[#E5383B] hover:bg-[#E5383B]/5 transition-all duration-200">
              <User className="w-5 h-5 mr-2" /> Profile
            </Button>
          </Link>

          {isAdmin && (
            <Link to="/admin" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-[#161A1D] hover:text-[#E5383B] hover:bg-[#E5383B]/5 transition-all duration-200">
                <LayoutDashboard className="w-5 h-5 mr-2" /> Admin Dashboard
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-[#660708] hover:text-[#E5383B] hover:bg-[#E5383B]/5 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 mr-2" /> Logout
          </Button>
        </>
      ) : (
        <>
          <Link to="/login" onClick={() => setOpen(false)}>
            <Button
              variant="outline"
              className="w-full border-2 border-[#E5383B] text-[#660708] hover:bg-[#E5383B] hover:text-[#F5F3F4] transition-all duration-300 hover:shadow-lg hover:shadow-[#E5383B]/20"
            >
              Login
            </Button>
          </Link>
          <Link to="/signup" onClick={() => setOpen(false)}>
            <Button className="w-full bg-gradient-to-r from-[#E5383B] via-[#BA181B] to-[#A4161A] text-[#F5F3F4] hover:shadow-xl hover:shadow-[#E5383B]/40 transition-all duration-300 font-semibold hover:scale-105">
              Sign Up
            </Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F5F3F4]/95 backdrop-blur-xl border-b border-[#D3D3D3]/70 shadow-lg shadow-[#161A1D]/5">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Brand */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <img
                src={heroImage}
                alt="RentPal Logo"
                className="w-16 h-16 object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#E5383B]/0 via-[#E5383B]/20 to-[#E5383B]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-xl"></div>
            </div>
            <span className="text-[#000000] font-bold text-lg tracking-wide group-hover:text-[#E5383B] transition-all">
              RentPal
            </span>
          </Link>

          {/* Desktop Menu */}
          {!isMobile && (
            <div className="flex items-center gap-2">
              <Link to="/listings" className="relative group px-4 py-2">
                <span className="text-[#161A1D] group-hover:text-[#E5383B] font-medium transition-colors duration-200">
                  Browse Items
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#E5383B] to-[#BA181B] group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/about" className="relative group px-4 py-2">
                <span className="text-[#161A1D] group-hover:text-[#E5383B] font-medium transition-colors duration-200">
                  About us
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#E5383B] to-[#BA181B] group-hover:w-full transition-all duration-300"></span>
              </Link>

              <Link to="/blog" className="relative group px-4 py-2">
                <span className="text-[#161A1D] group-hover:text-[#E5383B] font-medium transition-colors duration-200">
                  Blog
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#E5383B] to-[#BA181B] group-hover:w-full transition-all duration-300"></span>
              </Link>

              <Link to="/leaderboard" className="relative group px-4 py-2">
                <span className="text-[#161A1D] group-hover:text-[#E5383B] font-medium transition-colors duration-200">
                  Leaderboard
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#E5383B] to-[#BA181B] group-hover:w-full transition-all duration-300"></span>
              </Link>

              <div className="h-8 w-px bg-[#D3D3D3] mx-2"></div>

              {user ? (
                <>
                  {/* Owner Dashboard Link */}
                  {isOwner && (
                    <Link to="/owner-dashboard">
                      <Button
                        variant="ghost"
                        className="gap-2 text-[#E5383B] hover:text-[#BA181B] hover:bg-[#E5383B]/10 transition-all duration-200"
                      >
                        <Building2 className="w-5 h-5" />
                        <span className="font-medium">Dashboard</span>
                      </Button>
                    </Link>
                  )}

                  <Link to="/submit-listing">
                    <Button
                      variant="outline"
                      className="border-2 border-[#E5383B] text-[#660708] hover:bg-[#E5383B] hover:text-[#F5F3F4] transition-all duration-300 hover:shadow-lg hover:shadow-[#E5383B]/30 font-medium hover:scale-105"
                    >
                      List an Item
                    </Button>
                  </Link>

                  <Link to="/inbox">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-[#E5383B] text-[#161A1D] hover:bg-[#E5383B]/10 transition-all duration-200 rounded-full relative"
                    >
                      <MessageCircle className={`w-5 h-5 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-[#E5383B] to-[#BA181B] text-white text-xs min-w-[18px] h-5 flex items-center justify-center px-1 animate-bounce">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>

                  <Link to="/profile">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-[#E5383B] text-[#161A1D] hover:bg-[#E5383B]/10 transition-all duration-200 rounded-full"
                    >
                      <User className="w-5 h-5" />
                    </Button>
                  </Link>

                  {isAdmin && (
                    <Link to="/admin">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:text-[#E5383B] text-[#161A1D] hover:bg-[#E5383B]/10 transition-all duration-200 rounded-full"
                      >
                        <LayoutDashboard className="w-5 h-5" />
                      </Button>
                    </Link>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="hover:text-[#E5383B] text-[#660708] hover:bg-[#E5383B]/10 transition-all duration-200 rounded-full"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button
                      variant="outline"
                      className="border-2 border-[#E5383B] text-[#660708] hover:bg-[#E5383B] hover:text-[#F5F3F4] transition-all duration-300 hover:shadow-lg hover:shadow-[#E5383B]/30 font-medium"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-gradient-to-r from-[#E5383B] via-[#BA181B] to-[#A4161A] text-[#F5F3F4] hover:shadow-xl hover:shadow-[#E5383B]/40 transition-all duration-300 font-semibold px-6 hover:scale-105">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Mobile Menu */}
          {isMobile && (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-[#E5383B]/10 transition-colors duration-200 rounded-full"
                >
                  {open ? (
                    <X className="w-6 h-6 text-[#161A1D]" />
                  ) : (
                    <Menu className="w-6 h-6 text-[#161A1D]" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-gradient-to-b from-[#F5F3F4] to-[#F5F3F4]/95 border-l-2 border-[#E5383B]/20">
                <div className="flex flex-col gap-3 mt-8">
                  {/* User Type Badge */}
                  {user && (
                    <div className="mb-4 px-4">
                      <Badge
                        className={`${
                          isOwner
                            ? 'bg-[#E5383B]/10 text-[#E5383B] border-[#E5383B]/30'
                            : 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                        } border`}
                      >
                        {isOwner ? 'Owner Account' : 'User Account'}
                      </Badge>
                    </div>
                  )}
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </nav>
  );
};
