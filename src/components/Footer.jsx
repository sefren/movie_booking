import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Press', path: '/press' },
      { name: 'Blog', path: '/blog' },
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'FAQs', path: '/faq' },
      { name: 'Feedback', path: '/feedback' },
    ],
    legal: [
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Cookie Policy', path: '/cookies' },
      { name: 'Disclaimer', path: '/disclaimer' },
    ],
    experience: [
      { name: 'Now Showing', path: '/?tab=now_playing' },
      { name: 'Coming Soon', path: '/?tab=upcoming' },
      { name: 'Gift Cards', path: '/gift-cards' },
      { name: 'Promotions', path: '/promotions' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  ];

  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Social Links */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {socialLinks.map(({ icon: IconComponent, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label={label}
            >
              <IconComponent className="w-5 h-5 text-white/80" />
            </a>
          ))}
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white/90 font-semibold mb-3 text-sm">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-white/60 hover:text-white/90 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white/90 font-semibold mb-3 text-sm">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-white/60 hover:text-white/90 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white/90 font-semibold mb-3 text-sm">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-white/60 hover:text-white/90 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white/90 font-semibold mb-3 text-sm">Experience</h3>
            <ul className="space-y-2">
              {footerLinks.experience.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-white/60 hover:text-white/90 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mb-8 pb-8 border-b border-white/10">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-white/90 font-semibold mb-2 text-sm">Stay Updated</h3>
            <p className="text-white/60 text-xs mb-4">Get the latest movie news and exclusive offers</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/40 transition-colors"
              />
              <button className="px-4 py-2 bg-cinema-red hover:bg-cinema-red-dark text-white rounded text-sm font-medium transition-colors">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-cinema-red flex items-center justify-center">
              <span className="text-xs font-bold text-white">S9</span>
            </div>
            <span>© {currentYear} Studio 9 Cinema. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="hover:text-white/60 transition-colors">English</button>
            <span>•</span>
            <span>India</span>
          </div>
        </div>

        {/* Attribution */}
        <div className="mt-6 text-center">
          <p className="text-white/30 text-xs">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

