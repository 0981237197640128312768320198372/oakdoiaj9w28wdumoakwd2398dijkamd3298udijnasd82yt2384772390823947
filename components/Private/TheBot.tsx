import React from 'react';
import DATAManagement from './DATAManagement';
import SuccessLogs from './SuccessLogs';
import BotControl from './BotControl';

const TheBot = () => {
  return (
    <div className="flex flex-col gap-32 w-full">
      <SuccessLogs />
      <BotControl />
      <DATAManagement />
    </div>
  );
};

export default TheBot;
