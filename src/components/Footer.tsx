import { FaYoutube, FaInstagram, FaFacebookF, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#161A1D] text-[#F5F3F4] py-16 relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#E5383B]/5 to-[#BA181B]/5" />

      {/* Main container */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[#E5383B] to-[#BA181B] bg-clip-text text-transparent mb-4">
              RentPal
            </h3>
            <p className="text-sm text-[#F5F3F4]/70 leading-relaxed">
              RentPal is a peer-to-peer rental platform in India where users
              can rent household items, camera gear, bikes, tools, furniture and
              more at affordable prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-[#F5F3F4] mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-[#F5F3F4]/70">
              <li>
                <a
                  href="/listings"
                  className="hover:text-[#E5383B] transition-colors"
                >
                  Browse Listings
                </a>
              </li>
              <li>
                <a
                  href="/submit-listing"
                  className="hover:text-[#E5383B] transition-colors"
                >
                  List Your Item
                </a>
              </li>
              <li>
                <a
                  href="/leaderboard"
                  className="hover:text-[#E5383B] transition-colors"
                >
                  Leaderboard
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="hover:text-[#E5383B] transition-colors"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-[#F5F3F4] mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-[#F5F3F4]/70">
              <li>
                <a href="/terms-and-conditions" className="hover:text-[#E5383B] transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/terms-and-conditions" className="hover:text-[#E5383B] transition-colors">
                  Privacy Policy
                </a>
              </li>
              {/* <li>
                <a href="#" className="hover:text-[#E5383B] transition-colors">
                  Refund Policy
                </a>
              </li> */}
              <li>
                <a href="/terms-and-conditions" className="hover:text-[#E5383B] transition-colors">
                  Community Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-[#F5F3F4] mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-[#F5F3F4]/70">
              <li className="flex items-center gap-2">
                <span className="text-[#E5383B]">📧</span>
                <a
                  href="mailto:rentpal15@gmail.com"
                  className="hover:text-[#E5383B] transition-colors"
                >
                  rentpal15@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#E5383B]">📞</span>
                <a
                  href="tel:+917906744723"
                  className="hover:text-[#E5383B] transition-colors"
                >
                  +91 79067 44723
                </a>
              </li>

              {/* Social Links */}
              <li className="flex gap-3 mt-4 text-xl">
                <a
                  href="https://youtube.com/@rentpal?si=Su67ymW9sOrkSygF"
                  className="hover:text-[#E5383B] transition-colors"
                >
                  <FaYoutube />
                </a>
                <a
                  href="https://www.instagram.com/rentpal/"
                  className="hover:text-[#E5383B] transition-colors"
                >
                  <FaInstagram />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61581953741666"
                  className="hover:text-[#E5383B] transition-colors"
                >
                  <FaFacebookF />
                </a>
                <a
                  href="https://x.com/heyrenter86"
                  className="hover:text-[#E5383B] transition-colors"
                >
                  <FaTwitter />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#F5F3F4]/10 pt-6 text-center">
          <p className="text-sm text-[#F5F3F4]/70">
            © 2025 RentPal. All rights reserved. Made with ❤️ in India.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
