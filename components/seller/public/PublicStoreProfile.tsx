/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/PublicStoreProfile.tsx
import React from 'react';

interface PublicStoreProfileProps {
  seller: any;
}

const PublicStoreProfile: React.FC<PublicStoreProfileProps> = ({ seller }) => {
  return (
    <div className="bg-dark-700 p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">{seller?.store?.name}</h2>
      <p className="text-light-300">{seller?.store?.description}</p>
      {/* Display other profile information here */}
    </div>
  );
};

export default PublicStoreProfile;
