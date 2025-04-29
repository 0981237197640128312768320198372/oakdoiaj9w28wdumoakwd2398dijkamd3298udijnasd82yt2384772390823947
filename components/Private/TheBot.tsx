import React from 'react';
import DATAManagement from './DATAManagement';
import BotControl from './BotControl';

const TheBot = () => {
  return (
    <div className="flex flex-col gap-32 w-full">
      <BotControl />
      <DATAManagement />
    </div>
  );
};

export default TheBot;
