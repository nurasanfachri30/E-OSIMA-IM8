import React from 'react';
import { useElection } from '../context/ElectionContext';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenSqlModal?: () => void;
  onOpenPublishModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onToggleSidebar, 
  onOpenSqlModal,
  onOpenPublishModal 
}) => {
  const { 
    settings, 
    currentRole, 
    setCurrentRole, 
    isAdminAuthenticated, 
    currentStudent, 
    logoutStudent, 
    logoutAdmin
  } = useElection();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left branding & menu button */}
        <div className="flex items-center gap-3">
          {currentRole === 'admin' && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Buka Menu"
            >
              <i className="bi bi-list text-2xl"></i>
            </button>
          )}

          <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
            if (currentRole === 'guest') return;
            // keep current view
          }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20 shrink-0">
              {settings.school_logo_url ? (
                <img
                  src={settings.school_logo_url}
                  alt="School Logo"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-sm">OSIS</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">eOSIS</span>
                <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70">
                  {settings.election_period}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs">
                {settings.school_name}
              </p>
            </div>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Role specific actions */}
          {currentRole === 'student' && currentStudent && (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800">{currentStudent.name}</span>
                <span className="text-[10px] text-slate-500">{currentStudent.class_name} • NISN: {currentStudent.nisn}</span>
              </div>
              <button
                onClick={logoutStudent}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Keluar</span>
              </button>
            </div>
          )}

          {currentRole === 'admin' && (
            <div className="flex items-center gap-2">
              <button
                onClick={logoutAdmin}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Keluar</span>
              </button>
            </div>
          )}

          {currentRole === 'guest' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentRole('admin')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <i className="bi bi-shield-lock"></i>
                <span>Portal Admin</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
