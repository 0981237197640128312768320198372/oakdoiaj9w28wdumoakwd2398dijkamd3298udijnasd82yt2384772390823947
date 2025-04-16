import React from 'react';
import DATAManagement from './DATAManagement';
import BotActivity from './BotActivity';
import SuccessLogs from './SuccessLogs';

const TheBot = () => {
  return (
    <div className="flex flex-col gap-10">
      <SuccessLogs />
      <BotActivity />
      <DATAManagement />
    </div>
  );
};

export default TheBot;
