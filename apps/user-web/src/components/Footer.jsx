import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Instagram, Bike } from 'lucide-react';

function Footer() {
  return (
    <footer className=" bg-[#141414] text-white py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16">
          
          {/* Left Section - Logo and Icon */}
          <div className="flex flex-col items-start gap-6 w-full md:w-[45%]">
            <img 
              src="/unilogo.jpg" 
              alt="Unieats Logo" 
              className="w-40 object-contain"
            />
            <div className="flex items-center justify-center">
              <img 
              src="/images/Unieats Insta.png" 
              alt="Unieats Instagram" 
              className="w-40 object-contain"
            />
            </div>
          </div>

          {/* Right Section - Navigation Links */}
          <nav className="flex flex-col w-full md:w-[50%]">
            {[
              { id: "01", label: "ORDER", path: "/orders" },
              { id: "02", label: "ABOUT", path: "/" },
              { id: "03", label: "TEAM", path: "/team" },
              { id: "04", label: "CAREERS", path: "/careers" },
              { id: "05", label: "PARTNERS", path: "/partners" },
              { id: "06", label: "CONTACT", path: "/contact" },
            ].map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="flex items-center justify-between group gap-10 py-4 border-b border-neutral-800 hover:border-orange-500 transition-colors"
              >
                <span className="text-gray-500 text-s px-4 font-mono">
                  {item.id}
                </span>
                <span className="text-gray-300 text-lg font-semibold tracking-wide group-hover:text-orange-500 transition-colors">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-16 pt-8 border-t border-neutral-800 gap-6">
          <div className="flex gap-8 text-sm text-gray-400">
            <Link
              to="/privacy"
              className="hover:text-orange-500 transition-colors relative after:block after:h-[1px] after:w-0 after:bg-orange-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              PRIVACY POLICY
            </Link>
            <Link
              to="/terms"
              className="hover:text-orange-500 transition-colors relative after:block after:h-[1px] after:w-0 after:bg-orange-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              TERMS AND CONDITIONS
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 uppercase tracking-wide">
              Follow Us
            </span>
            
            <a
              href="https://www.instagram.com/unieats.muj?igsh=MjIzYWJ2MXU3Z2ti"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-orange-500 transition-colors"
            >
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
