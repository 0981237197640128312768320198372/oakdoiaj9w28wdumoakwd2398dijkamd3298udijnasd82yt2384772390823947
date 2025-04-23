import React from 'react';
import DATAManagement from './DATAManagement';
// import BotActivity from './BotActivity';
import SuccessLogs from './SuccessLogs';
import BotControl from './BotControl';

const TheBot = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5">
        <SuccessLogs />
        {/* <BotActivity /> */}
        <BotControl />
      </div>
      <DATAManagement />
    </div>
  );
};

export default TheBot;
