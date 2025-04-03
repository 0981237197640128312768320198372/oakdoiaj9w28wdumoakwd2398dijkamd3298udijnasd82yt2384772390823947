'use client';

import PageHeadline from '@/components/PageHeadline';
import EmailsViewer from './EmailsViewer';

const StaffPageContent = () => {
  const handleLogout = () => {
    localStorage.removeItem('auth');
    location.reload();
  };
  const authData = JSON.parse(localStorage.getItem('auth') || '{}');
  const userName = authData.name || 'You';
  return (
    <>
      <PageHeadline
        headline={`Hi, ${userName}`}
        description="Welcome to A streamlined page for Staff, and let staff easily manage any data for smooth operations."
      />
      <div className="w-full flex items-center justify-end mb-10">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-dark-800 hover:bg-red-500/90 active:bg-red-500/80 px-1 font-aktivGroteskBold">
          Logout
        </button>
      </div>
      <div className="flex flex-col lg:flex-row gap-10 justify-center items-start w-full">
        <EmailsViewer />
      </div>
    </>
  );
};

export default StaffPageContent;
