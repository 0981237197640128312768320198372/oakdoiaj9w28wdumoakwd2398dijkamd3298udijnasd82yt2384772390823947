'use client';

import { useState } from 'react';
import ActivityLogs from '@/components/Private/ActivityLogs';
import AdminDeposit from './AdminDeposit';
import EmailsViewer from './EmailsViewer';
import ManageHelps from './ManageHelps';
import Statistics from './Statistic';
import StatisticCards from './StatisticCards';
import { ManageUsers } from './ManageUser';
import DataRemain from './DataRemain';
import TheBot from './TheBot';
import { AdminSidebar } from './AdminSidebar';

const AdminPageContent = () => {
  const [currentSection, setCurrentSection] = useState('AdminDeposit');

  const handleLogout = () => {
    localStorage.removeItem('auth');
    location.reload();
  };

  const authData = JSON.parse(localStorage.getItem('auth') || '{}');
  const userName = authData.name || 'You';

  const sections: Record<string, JSX.Element> = {
    StatisticCards: <StatisticCards />,
    Statistics: <Statistics />,
    AdminDeposit: <AdminDeposit />,
    EmailsViewer: <EmailsViewer />,
    ActivityLogs: <ActivityLogs />,
    ManageHelps: <ManageHelps />,
    ManageUsers: <ManageUsers />,
    DataRemain: <DataRemain />,
    TheBot: <TheBot />,
  };

  return (
    <AdminSidebar
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
      onLogout={handleLogout}
      userName={userName}>
      <div className="w-full flex flex-col justify-center items-center">
        <div className="flex justify-between flex-col items-start w-full mt-10">
          {sections[currentSection] || <div>Section not found</div>}
        </div>
      </div>
    </AdminSidebar>
  );
};

export default AdminPageContent;
