import React, { useState } from 'react';
import { useElection } from '../../context/ElectionContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import { Navbar } from '../../components/Navbar';
import { AdminDashboard } from './AdminDashboard';
import { ClassesManagement } from './ClassesManagement';
import { StudentsManagement } from './StudentsManagement';
import { CandidatesManagement } from './CandidatesManagement';
import { VoteResults } from './VoteResults';
import { SettingsPage } from './SettingsPage';
import { PublishPage } from './PublishPage';
import { ErrorBoundary } from '../../components/ErrorBoundary';

interface AdminLayoutProps {
  onOpenSqlModal: () => void;
  onOpenPublishModal?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onOpenSqlModal, onOpenPublishModal }) => {
  const { adminActiveTab, setAdminActiveTab } = useElection();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (adminActiveTab) {
      case 'beranda':
        return <AdminDashboard onOpenSqlModal={onOpenSqlModal} onOpenPublishModal={onOpenPublishModal} />;
      case 'kelas':
        return <ClassesManagement />;
      case 'siswa':
        return <StudentsManagement />;
      case 'kandidat':
        return <CandidatesManagement />;
      case 'perolehan-suara':
        return <VoteResults />;
      case 'pengaturan':
        return <SettingsPage onOpenSqlModal={onOpenSqlModal} onOpenPublishModal={onOpenPublishModal} />;
      case 'publish':
        return <PublishPage onOpenSqlModal={onOpenSqlModal} />;
      default:
        return <AdminDashboard onOpenSqlModal={onOpenSqlModal} onOpenPublishModal={onOpenPublishModal} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar for Admin */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenSqlModal={onOpenSqlModal}
        onOpenPublishModal={onOpenPublishModal}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          onOpenSqlModal={onOpenSqlModal}
          onOpenPublishModal={onOpenPublishModal}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ErrorBoundary
            fallbackTitle="Gagal Menampilkan Halaman Admin"
            onReset={() => setAdminActiveTab('beranda')}
          >
            {renderActiveView()}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};
