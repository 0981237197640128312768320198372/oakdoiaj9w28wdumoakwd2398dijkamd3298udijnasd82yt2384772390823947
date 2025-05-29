import React, { useEffect, useState } from 'react';
import { FaRegClock } from 'react-icons/fa';

const RealTimeClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = currentTime.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <div className="flex items-center gap-3 bg-primary/20 px-2 py-1 rounded-sm text-primary text-sm">
      <FaRegClock />
      <span>{formattedDate}</span>
      <span>{formattedTime}</span>
    </div>
  );
};

export default RealTimeClock;
