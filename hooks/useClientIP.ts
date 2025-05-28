/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';

interface IpInfo {
  ip: string;
  hostname: string;
  city: string;
  region: string;
  country: string;
  loc: string;
  org: string;
  postal: string;
  timezone: string;
  readme: string;
}

export function useClientIP() {
  const [ipData, setIpData] = useState<IpInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIP = async () => {
      try {
        const response = await fetch('https://ipinfo.io/json?token=9fe5d75694fb66');
        if (!response.ok) {
          throw new Error('Failed to fetch IP');
        }
        const data: IpInfo = await response.json();
        setIpData(data);
      } catch (err) {
        setError('Could not retrieve IP address');
        console.error(err);
      }
    };

    fetchIP();
  }, []);

  return {
    ipAddress: ipData?.ip || null,
    city: ipData?.city || null,
    postal: ipData?.postal || null,
    coordinate: ipData?.loc || null,
    region: ipData?.region || null,
    country: ipData?.country || null,
    hostname: ipData?.hostname || null,
    org: ipData?.org || null,
    timezone: ipData?.timezone || null,
    readme: ipData?.readme || null,
    error,
  };
}
