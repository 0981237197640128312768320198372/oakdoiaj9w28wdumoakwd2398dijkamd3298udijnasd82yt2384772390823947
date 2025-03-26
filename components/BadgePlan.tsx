import React from 'react';

interface BadgeProps {
  icon?: React.ReactNode;
  text: string;
}

const BadgePlan: React.FC<BadgeProps> = ({ icon, text }) => {
  const color =
    (text === 'Basic' && 'bg-primary/15  font-aktivGroteskBold text-primary') ||
    (text === 'VIP' && 'bg-goldVIP/15  font-aktivGroteskBold text-goldVIP') ||
    (text === 'VVIP' && 'bg-purpleVVIP/15 font-aktivGroteskBold text-purpleVVIP');

  return (
    <span
      className={`flex gap-1 rounded text-sm items-center w-fit px-2 py-1 ${color} select-none`}>
      {icon}
      {text}
    </span>
  );
};

export default BadgePlan;
