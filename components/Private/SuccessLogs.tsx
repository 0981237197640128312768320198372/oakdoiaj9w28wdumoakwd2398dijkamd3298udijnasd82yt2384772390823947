/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { formatTime } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { TbRefresh } from 'react-icons/tb';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface BotLog {
  timestamp: string;
  type: 'error' | 'success' | 'status' | 'info';
  message: string;
  details?: {
    email?: string;
    errorCode?: string;
    stack?: string;
  };
  license: string;
}

interface LicenseData {
  license: string;
  lastActivity: string | null;
}

const SuccessLogs = () => {
  const [licenseData, setLicenseData] = useState<LicenseData[]>([]);
  const [successLogs, setSuccessLogs] = useState<BotLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const logType = 'success'; // Hardcoded to 'success'

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/v2/get_thebot_licenses', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch licenses');
      }
      const data = await response.json();
      setLicenseData(data.licenses);
    } catch (err) {
      setError('Failed to load licenses. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchSuccessLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const allLogs: BotLog[] = [];
      for (const { license } of licenseData) {
        const url = `/api/v2/get_thebot_log?license=${encodeURIComponent(
          license
        )}&type=${encodeURIComponent(logType)}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          console.error(`Failed to fetch logs for ${license}: ${response.status}`);
          continue;
        }
        const data = await response.json();
        const logsWithLicense = data.logs.map((log: BotLog) => ({ ...log, license }));
        allLogs.push(...logsWithLicense);
      }
      allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setSuccessLogs(allLogs);
    } catch (err) {
      setError('Failed to load logs. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLicenses();
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  useEffect(() => {
    if (licenseData.length > 0) {
      fetchSuccessLogs();
    }
  }, [licenseData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      fetchLicenses();
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-10">
      <div className="p-5 border-[1px] border-dark-500 bg-dark-700 w-full max-w-4xl md:min-w-[500px]">
        <div className="w-full flex justify-between items-start gap-5">
          <h3 className="flex items-center gap-2 font-bold mb-5">
            Success Created ({successLogs.length})
          </h3>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1 text-sm rounded-sm h-fit font-aktivGroteskBold bg-primary text-dark-800 hover:bg-primary/70"
            title="Refresh data">
            <TbRefresh className={`text-xl ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="w-full flex flex-col gap-5 bg-dark-600 p-5">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="flex border border-dark-400 shadow-md p-5 rounded bg-dark-500 hover:shadow-lg transition duration-200 justify-between">
                <Skeleton className="w-24 h-6 bg-dark-300 rounded-sm" />
                <div className="flex flex-col items-end gap-2">
                  <Skeleton className="w-32 h-4 bg-dark-300 rounded-sm" />
                  <Skeleton className="w-16 h-5 bg-dark-300 rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : successLogs.length > 0 ? (
          <div className="flex flex-col overflow-auto max-h-[500px] gap-5 w-full bg-dark-600 p-5 __dokmai_scrollbar">
            {successLogs.map((log, index) => (
              <div
                key={index}
                className="flex flex-col border border-dark-400 shadow-md p-5 rounded bg-dark-500 hover:shadow-lg transition duration-200">
                <div className="flex w-full justify-end">
                  <p className="text-sm text-light-800">{formatTime(log.timestamp)}</p>
                </div>
                <p className="text-xs md:text-md">{log.message}</p>
                <p className="text-sm text-light-800">License: {log.license}</p>
                {log.details && (
                  <p>
                    <strong>Details:</strong>
                    <ul className="list-disc ml-5">
                      {log.details.email && <li>Email: {log.details.email}</li>}
                      {log.details.errorCode && <li>Error Code: {log.details.errorCode}</li>}
                      {log.details.stack && <li>Stack: {log.details.stack}</li>}
                    </ul>
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="px-2 py-1 bg-red-600/20 rounded border-[1px] border-red-500/70 text-red-500 w-fit">
            No success logs found.
          </p>
        )}
      </div>
    </div>
  );
};

export default SuccessLogs;
