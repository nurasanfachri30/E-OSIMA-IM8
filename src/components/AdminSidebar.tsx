import React from 'react';
import { useElection } from '../context/ElectionContext';
import { AdminActiveTab } from '../types';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSqlModal: () => void;
  onOpenPublishModal?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  isOpen, 
  onClose, 
  onOpenSqlModal,
  onOpenPublishModal 
}) => {
  const { 
    settings, 
    adminActiveTab, 
    setAdminActiveTab, 
    logoutAdmin,
    candidates,
    students,
    classes
  } = useElection();

  const menuItems: { id: AdminActiveTab; label: string; icon: string; badge?: string | number }[] = [
    { id: 'beranda', label: 'Beranda', icon: 'bi-speedometer2' },
    { id: 'kelas', label: 'Kelas', icon: 'bi-building', badge: classes.length },
    { id: 'siswa', label: 'Siswa / User', icon: 'bi-people-fill', badge: students.length },
    { id: 'kandidat', label: 'Calon Kandidat', icon: 'bi-person-badge-fill', badge: candidates.length },
    { id: 'perolehan-suara', label: 'Perolehan Suara', icon: 'bi-bar-chart-line-fill' },
    { id: 'pengaturan', label: 'Pengaturan', icon: 'bi-gear-fill' },
    { id: 'publish', label: 'Publish / Hosting', icon: 'bi-rocket-takeoff-fill', badge: 'Free' },
  ];

  const handleSelectTab = (tab: AdminActiveTab) => {
    setAdminActiveTab(tab);
    onClose();
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari panel administrator?')) {
      logoutAdmin();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 font-bold text-white text-lg">
              {settings.school_logo_url ? (
                <img
                  src={settings.school_logo_url}
                  alt="Logo"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    // Fallback to icon
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <i className="bi bi-box-seam-fill"></i>
              )}
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                <span>eOSIS</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Admin
                </span>
              </div>
              <div className="text-xs text-slate-400 truncate font-medium">
                {settings.school_name}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>



        {/* Navigation items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-2 pt-1">
            Menu Utama
          </div>
          {menuItems.map((item) => {
            const isActive = adminActiveTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className={`bi ${item.icon} text-base ${isActive ? 'text-white' : 'text-slate-400'}`}></i>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive ? 'bg-blue-700/60 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User profile & logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/50">
          <div className="p-2 rounded-xl bg-slate-800/60 mb-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <i className="bi bi-shield-lock-fill"></i>
              </div>
              <div className="truncate">
                <div className="font-semibold text-white leading-tight truncate">
                  {settings.admin_username}
                </div>
                <div className="text-[10px] text-slate-400">Panitia Pemilihan</div>
              </div>
            </div>
            <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
              {settings.election_period}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-600/20 border border-rose-500/20 transition-all cursor-pointer"
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Keluar dari Admin</span>
          </button>
        </div>
      </aside>
    </>
  );
};
