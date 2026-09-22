import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  GraduationCap, 
  Search, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  Sparkles,
  Award,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  onOpenAuth: (roleFocus?: Role) => void;
  onOpenVerifier: () => void;
  onOpenAppForm: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenVerifier,
  onOpenAppForm,
  activeView,
  setActiveView,
  searchTerm,
  setSearchTerm,
  onSearch
}) => {
  const { user, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);

  const handleRoleTabClick = (targetRole: Role) => {
    if (!user) {
      onOpenAuth(targetRole);
    } else if (role === targetRole) {
      setActiveView('dashboard');
    } else {
      // If logged in as another role, ask them to sign in as that role or log out
      onOpenAuth(targetRole);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer group shrink-0" onClick={() => setActiveView('landing')}>
            <img 
              src="/logo.png" 
              alt="Websums Logo" 
              className="w-12 h-12 object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300 shrink-0" 
            />
            <div className="flex flex-col justify-center">
              <div className="flex items-center space-x-2 whitespace-nowrap">
                <span className="font-extrabold text-[22px] tracking-tight text-orange-600 transition-colors duration-300">
                  WEBSUMS
                </span>
                <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/20">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block -mt-0.5 whitespace-nowrap">Software Pvt. Ltd. • Internship Platform</p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={(event) => { event.preventDefault(); onSearch(); }} className="hidden md:flex items-center relative max-w-[16rem] lg:max-w-xs xl:max-w-sm w-full md:mx-4 lg:mx-8">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder="Search domains..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-16 py-2.5 text-sm rounded-full border border-slate-200/70 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/15 transition-all shadow-sm hover:shadow-md hover:border-slate-300 outline-none"
            />
            <button type="submit" className="absolute right-1.5 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600 transition-colors">
              Search
            </button>
          </form>

          {/* Quick Role Navigation & Active Panel Indicator */}
          <div className="hidden lg:flex items-center space-x-3 bg-slate-50/80 p-1.5 rounded-full border border-slate-200/60 text-xs font-semibold shadow-sm whitespace-nowrap">
            <button
              onClick={() => setActiveView('landing')}
              className={`px-4 py-1.5 rounded-full transition-all duration-300 ${
                activeView === 'landing' ? 'bg-white text-orange-600 shadow-md shadow-slate-200/50 font-bold border border-slate-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              Public Site
            </button>

            {user ? (
              <button
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
                  activeView === 'dashboard'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {role === 'CEO' && <ShieldCheck className="w-3.5 h-3.5 text-purple-100" />}
                {role === 'Mentor' && <UserCheck className="w-3.5 h-3.5 text-blue-100" />}
                {role === 'Student' && <GraduationCap className="w-3.5 h-3.5 text-emerald-100" />}
                <span>My {role} Panel</span>
              </button>
            ) : (
              <>
                {/* Company Login Dropdown */}
                <div 
                  className="relative group"
                  onMouseEnter={() => setCompanyDropdownOpen(true)}
                  onMouseLeave={() => setCompanyDropdownOpen(false)}
                >
                  <button
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${companyDropdownOpen ? 'bg-white text-indigo-600 shadow-md shadow-slate-200/50 border border-slate-100 font-bold' : 'text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm'}`}
                  >
                    <Building2 className={`w-3.5 h-3.5 ${companyDropdownOpen ? 'text-indigo-600' : 'text-indigo-400'}`} />
                    <span>Company Login</span>
                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-300 ${companyDropdownOpen ? 'rotate-180 text-indigo-500' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  <div className={`absolute top-full left-0 mt-1.5 w-[200px] bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-50 transition-all duration-200 origin-top-left ${companyDropdownOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                    <button
                      onClick={() => { handleRoleTabClick('CEO'); setCompanyDropdownOpen(false); }}
                      className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 transition-all duration-200 text-left group/btn"
                    >
                      <div className="p-1.5 bg-purple-100 rounded-lg group-hover/btn:bg-purple-200 transition-colors">
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 group-hover/btn:text-purple-700 transition-colors">CEO / Admin</div>
                        <div className="text-[10px] text-slate-500 font-medium">Manage organization</div>
                      </div>
                    </button>
                    <div className="h-px bg-slate-100 my-1 mx-2"></div>
                    <button
                      onClick={() => { handleRoleTabClick('Mentor'); setCompanyDropdownOpen(false); }}
                      className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-xl text-slate-600 hover:bg-blue-50 transition-all duration-200 text-left group/btn"
                    >
                      <div className="p-1.5 bg-blue-100 rounded-lg group-hover/btn:bg-blue-200 transition-colors">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 group-hover/btn:text-blue-700 transition-colors">Mentor</div>
                        <div className="text-[10px] text-slate-500 font-medium">Guide students</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Student Login */}
                <button
                  onClick={() => handleRoleTabClick('Student')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-slate-600 hover:text-emerald-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all duration-300 group"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-500" />
                  <span>Student</span>
                </button>
              </>
            )}
          </div>

          {/* Right Action Icons & User Profile */}
          <div className="flex items-center space-x-5 shrink-0 ml-4 lg:ml-8">

            {/* Verify Certificate Quick Button */}
            <button
              onClick={onOpenVerifier}
              className="hidden sm:flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-full shadow-sm hover:shadow transition-all duration-300 group whitespace-nowrap"
            >
              <Award className="w-4 h-4 text-purple-500 group-hover:scale-110 group-hover:text-purple-700 transition-all" />
              <span>Verify Certificate</span>
            </button>



            {/* Notifications Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-300 relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white animate-pulse"></span>
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                      <span className="text-sm font-bold text-slate-900">Notifications</span>
                      <span className="text-xs text-orange-600 font-semibold cursor-pointer hover:text-orange-700">Mark all as read</span>
                    </div>
                    <div className="space-y-3 max-h-72 overflow-y-auto text-sm">
                      <div className="p-3 bg-orange-50/80 rounded-xl border border-orange-100 shadow-sm">
                        <p className="font-semibold text-slate-900 flex items-center gap-2">
                          <span>🚀</span> Live Class starting in 15 mins
                        </p>
                        <p className="text-slate-500 text-xs mt-1">Enterprise MERN Architecture with Dr. Rajesh Verma</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                        <p className="font-semibold text-slate-900 flex items-center gap-2">
                          <span>📝</span> Assignment Submissions Open
                        </p>
                        <p className="text-slate-500 text-xs mt-1">Due date: August 5, 2026</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile Avatar / Login */}
            {user ? (
              <div className="flex items-center space-x-3 pl-4 border-l border-slate-200/80">
                <div className="relative group">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500/30 group-hover:ring-orange-500/60 transition-all duration-300 cursor-pointer"
                  />
                  <div className="absolute inset-0 rounded-full shadow-inner pointer-events-none"></div>
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-sm font-bold text-slate-900 truncate max-w-[130px]">{user.name}</div>
                  <div className="text-xs font-semibold text-orange-600">{user.role}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setActiveView('landing');
                  }}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-all duration-300 ml-2"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth()}
                className="px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-full shadow-md shadow-orange-500/30 hover:shadow-lg hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all duration-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200/80 space-y-4 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-3 text-sm font-semibold px-2">
              <button
                onClick={() => { setActiveView('landing'); setMobileMenuOpen(false); }}
                className="p-3 rounded-xl bg-slate-100 text-slate-800 text-center font-bold hover:bg-slate-200 transition-colors"
              >
                Public Site
              </button>
              {user ? (
                <button
                  onClick={() => { setActiveView('dashboard'); setMobileMenuOpen(false); }}
                  className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-center font-bold shadow-md shadow-orange-500/20"
                >
                  My {role} Panel
                </button>
              ) : (
                <button
                  onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                  className="p-3 rounded-xl bg-orange-50 text-orange-600 text-center font-bold border border-orange-200 hover:bg-orange-100 transition-colors"
                >
                  🔐 Sign In to Portal
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
