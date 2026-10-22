/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ElectionProvider, useElection } from './context/ElectionContext';
import { Navbar } from './components/Navbar';
import { QuickSqlModal } from './components/QuickSqlModal';
import { PublishModal } from './components/PublishModal';
import { StudentLogin } from './views/student/StudentLogin';
import { StudentDashboard } from './views/student/StudentDashboard';
import { AdminLogin } from './views/admin/AdminLogin';
import { AdminLayout } from './views/admin/AdminLayout';

const AppContent: React.FC = () => {
  const { currentRole, setCurrentRole, currentStudent, isAdminAuthenticated } = useElection();
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // 1. Admin Area
  if (currentRole === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
          <Navbar 
            onOpenSqlModal={() => setIsSqlModalOpen(true)}
            onOpenPublishModal={() => setIsPublishModalOpen(true)}
          />
          <AdminLogin
            onBackToStudent={() => setCurrentRole('student')}
            onOpenSqlModal={() => setIsSqlModalOpen(true)}
          />
          <QuickSqlModal
            isOpen={isSqlModalOpen}
            onClose={() => setIsSqlModalOpen(false)}
          />
          <PublishModal
            isOpen={isPublishModalOpen}
            onClose={() => setIsPublishModalOpen(false)}
          />
        </div>
      );
    }

    return (
      <>
        <AdminLayout 
          onOpenSqlModal={() => setIsSqlModalOpen(true)}
          onOpenPublishModal={() => setIsPublishModalOpen(true)}
        />
        <QuickSqlModal
          isOpen={isSqlModalOpen}
          onClose={() => setIsSqlModalOpen(false)}
        />
        <PublishModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
        />
      </>
    );
  }

  // 2. Student / Voter Area
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar 
        onOpenSqlModal={() => setIsSqlModalOpen(true)} 
        onOpenPublishModal={() => setIsPublishModalOpen(true)} 
      />

      <main className="flex-1">
        {currentStudent ? (
          <StudentDashboard />
        ) : (
          <StudentLogin
            onGoToAdmin={() => setCurrentRole('admin')}
            onOpenSqlModal={() => setIsSqlModalOpen(true)}
          />
        )}
      </main>

      <footer className="py-4 border-t border-slate-200/80 bg-white text-center text-xs text-slate-400 no-print">
        <p className="font-medium">
          eOSIS &copy; {new Date().getFullYear()} &bull; Aplikasi Pemilihan Ketua &amp; Wakil Ketua OSIS Terpercaya &bull; LUBER JURDIL
        </p>
      </footer>

      <QuickSqlModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ElectionProvider>
      <AppContent />
    </ElectionProvider>
  );
}
