'use client';

import React from 'react';

interface LandingWrapperProps {
  children: React.ReactNode;
}

export default function LandingWrapper({ children }: LandingWrapperProps) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
