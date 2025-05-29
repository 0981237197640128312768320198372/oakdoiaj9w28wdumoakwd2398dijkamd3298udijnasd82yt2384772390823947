import React from 'react';
import AccountList from './AccountList';
import DATAManagement from './DATAManagement';

const Management = () => {
  return (
    <div className="flex flex-col gap-32 w-full">
      <AccountList />
      <DATAManagement />
    </div>
  );
};

export default Management;
