import React from 'react';
import { BookOpen, Globe, MapPin, Linkedin, Youtube, Instagram, Twitter } from 'lucide-react';
import { ActiveTab } from '../types';

interface FooterProps {
  onNavigateToLanding?: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToTab?: (tab: ActiveTab) => void;
  onOpenReportDrawer?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigateToLanding, 
  onNavigateToLogin,
  onNavigateToTab,
  onOpenReportDrawer 
}) => {
  const handleTab = (tab: ActiveTab) => {
    if (onNavigateToTab) {
      onNavigateToTab(tab);
    } else if (onNavigateToLogin) {
      onNavigateToLogin();
    }
  };

  return (
    <footer className="w-full bg-black text-white font-sans antialiased mt-auto">
      {/* Main Top Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-12">
        
        {/* Brand Header */}
        <div className="mb-12">
          <button
            onClick={onNavigateToLanding}
            className="text-2xl lg:text-3xl font-bold tracking-tight text-white hover:text-gray-300 transition-colors cursor-pointer"
          >
            Campusr
          </button>
          <p className="text-sm text-gray-400 mt-2">
            Campus civic operations, infrastructure maintenance &amp; environmental governance.
          </p>
        </div>

        {/* 4 Column Directory (Uber Style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 pb-14 border-b border-gray-800">
          
          {/* Column 1: Company / Platform */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <button onClick={onNavigateToLanding} className="hover:text-white transition-colors cursor-pointer text-left">
                  About Campusr
                </button>
              </li>
              <li>
                <button onClick={onNavigateToLanding} className="hover:text-white transition-colors cursor-pointer text-left">
                  Our features
                </button>
              </li>
              <li>
                <button onClick={onNavigateToLanding} className="hover:text-white transition-colors cursor-pointer text-left">
                  How it works
                </button>
              </li>
              <li>
                <button onClick={onNavigateToLogin} className="hover:text-white transition-colors cursor-pointer text-left">
                  Staff login
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Operations */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4">Operations</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <button 
                  onClick={() => onOpenReportDrawer ? onOpenReportDrawer() : handleTab('student_dashboard')} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Report a problem
                </button>
              </li>
              <li>
                <button onClick={() => handleTab('operations')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Sanitation beats
                </button>
              </li>
              <li>
                <button onClick={() => handleTab('operations')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Work orders &amp; dispatch
                </button>
              </li>
              <li>
                <button onClick={() => handleTab('cctv_pipeline')} className="hover:text-white transition-colors cursor-pointer text-left">
                  CCTV camera sweeps
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Climate & Planning */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4">Campus Planning</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <button onClick={() => handleTab('heatisland')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Cool havens &amp; canopies
                </button>
              </li>
              <li>
                <button onClick={() => handleTab('heatisland')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Heat island analysis
                </button>
              </li>
              <li>
                <button onClick={() => handleTab('planning')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Capital works board
                </button>
              </li>
              <li>
                <button onClick={() => handleTab('analytics')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Waste analytics
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Governance */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4">Governance</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <button onClick={() => handleTab('terms')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Terms of service
                </button>
              </li>
              <li>
                <button onClick={() => handleTab('privacy')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Privacy policy
                </button>
              </li>
              <li>
                <button onClick={() => handleTab('terms')} className="hover:text-white transition-colors cursor-pointer text-left">
                  SLA commitments
                </button>
              </li>
              <li>
                <a href="mailto:support@csjmu.ac.in" className="hover:text-white transition-colors">
                  Help &amp; support
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Mid Row: Social Icons + Language/Location Selectors */}
        <div className="pt-8 pb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Social Icons (Black squares with hover) */}
          <div className="flex items-center gap-3">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="w-10 h-10 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="w-10 h-10 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="X (Twitter)"
              className="w-10 h-10 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </a>
          </div>

          {/* Location & Language Buttons (Uber Style Pills) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-gray-900 hover:bg-gray-800 text-sm font-medium text-white transition-colors"
            >
              <Globe className="w-4 h-4 text-gray-300" />
              <span>English</span>
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-gray-900 hover:bg-gray-800 text-sm font-medium text-white transition-colors"
            >
              <MapPin className="w-4 h-4 text-gray-300" />
              <span>CSJMU Kanpur Precinct</span>
            </button>
          </div>

        </div>

        {/* App Badges row (Uber style Google Play / App Store) */}
        <div className="flex flex-wrap items-center gap-3 pb-10">
          <div className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-300 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-white" />
            <div>
              <div className="text-[10px] text-gray-400 uppercase leading-none">Access via</div>
              <div className="font-semibold text-white">Campus Portal Web App</div>
            </div>
          </div>
          <div className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-300 flex items-center gap-2">
            <Globe className="w-4 h-4 text-white" />
            <div>
              <div className="text-[10px] text-gray-400 uppercase leading-none">Verified with</div>
              <div className="font-semibold text-white">Institutional Single Sign-On</div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Campusr Technologies Inc. CSJMU Civic Operations.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => handleTab('privacy')} className="hover:text-gray-300 transition-colors cursor-pointer">
              Privacy
            </button>
            <button onClick={() => handleTab('terms')} className="hover:text-gray-300 transition-colors cursor-pointer">
              Accessibility
            </button>
            <button onClick={() => handleTab('terms')} className="hover:text-gray-300 transition-colors cursor-pointer">
              Terms
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
