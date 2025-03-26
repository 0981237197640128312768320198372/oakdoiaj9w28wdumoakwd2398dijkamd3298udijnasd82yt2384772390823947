/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import ActivityLogs from '@/components/ActivityLogs';
import PageHeadline from '@/components/PageHeadline';
import AdminDeposit from './AdminDeposit';
import EmailsViewer from './EmailsViewer';
import ManageHelps from './ManageHelps';
import Statistics from './Statistic';
import StatisticCards from './StatisticCards';
import { useState } from 'react';
import { title } from 'process';

const AdminPageContent = () => {
  const handleLogout = () => {
    localStorage.removeItem('auth');
    location.reload();
  };

  const [currentSection, setCurrentSection] = useState('AdminDeposit');

  const sections: Record<string, JSX.Element> = {
    StatisticCards: <StatisticCards />,
    Statistics: <Statistics />,
    AdminDeposit: <AdminDeposit />,
    EmailsViewer: <EmailsViewer />,
    ActivityLogs: <ActivityLogs />,
    ManageHelps: <ManageHelps />,
  };
  const sectionsButton = [
    { button: 'StatisticCards', title: 'Statistic Cards' },
    { button: 'Statistics', title: 'Statistics Chart' },
    { button: 'AdminDeposit', title: 'Deposit' },
    { button: 'EmailsViewer', title: 'Email' },
    { button: 'ActivityLogs', title: 'Activity' },
    { button: 'ManageHelps', title: 'Manage Helps' },
  ];
  return (
    <div className="w-full max-w-[1140px] flex flex-col justify-center items-center">
      <PageHeadline
        headline="Admin Panel"
        description="A streamlined page for tracking client activities, sales stats, transactions, and deposits, with easy management tools for smooth operations."
      />
      <div className="w-full max-w-4xl flex items-center justify-between mb-10">
        <div className="flex items-center justify-start gap-5">
          {sectionsButton.map((item, i) => (
            <button
              key={i}
              className={`px-2 py-1 rounded-sm text-center text-xs bg-dark-500 ${
                currentSection === item.button ? 'bg-primary text-dark-800' : 'text-white'
              } text-dark-800`}
              onClick={() => setCurrentSection(item.button)}>
              {item.title}
            </button>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-dark-800 hover:bg-red-500/90 active:bg-red-500/80 px-1 font-aktivGroteskBold">
          Logout
        </button>
      </div>
      <div className="flex justify-between flex-col items-center gap-10 w-full max-w-4xl">
        {sections[currentSection] || <div className="p-5">Section not found</div>}
      </div>
    </div>
  );
};

export default AdminPageContent;
