import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import UploadModal from '../ui/UploadModal';

export default function Layout({ children, onUploadSuccess }) {
  const [collapsed, setCollapsed] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Wrapper */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Navbar */}
        <Navbar
          collapsed={collapsed}
          onOpenUpload={() => setUploadModalOpen(true)}
        />

        {/* Content area */}
        <main className="flex-1 pt-20 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Upload Modal accessible everywhere */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={() => {
          if (onUploadSuccess) onUploadSuccess();
        }}
      />
    </div>
  );
}
