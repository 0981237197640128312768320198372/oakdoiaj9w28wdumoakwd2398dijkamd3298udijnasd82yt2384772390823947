// app/[subdomain]/ClientStorePage.tsx
'use client';

import React from 'react';

const ClientStorePage = ({ subdomain }: { subdomain: string }) => {
  if (typeof window !== 'undefined' && window.location.hostname !== `${subdomain}.dokmai.store`) {
    return <p>This page is only accessible via the dokmai.store domain.</p>;
  }
  return <h2>Store: {subdomain}</h2>;
};

export default ClientStorePage;
