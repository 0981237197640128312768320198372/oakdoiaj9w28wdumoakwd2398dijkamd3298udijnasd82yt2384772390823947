/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { formatTime } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { TbRefresh } from 'react-icons/tb';
import { RiDeleteBin7Line } from 'react-icons/ri';
import { PiCodeBold } from 'react-icons/pi';
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
}

interface LicenseData {
  license: string;
  lastActivity: string | null;
}

const getBotStatusCounts = (licenseData: LicenseData[]) => {
  const onlineCount = licenseData.filter(
    ({ lastActivity }) =>
      lastActivity && new Date().getTime() - new Date(lastActivity).getTime() <= 5 * 60 * 1000
  ).length;
  const offlineCount = licenseData.length - onlineCount;
  return (
    <div className="flex flex-col md:flex-row gap-1 text-sm text-light-500">
      <span>
        Online: <span className="px-1 text-green-500">{onlineCount}</span>
      </span>
      <span>
        Offline: <span className="px-1 text-red-500">{offlineCount}</span>
      </span>
    </div>
  );
};

const BotActivity = () => {
  const [licenseData, setLicenseData] = useState<LicenseData[]>([]);
  const [licenseLogs, setLicenseLogs] = useState<{ [key: string]: BotLog[] }>({});
  const [activeLicense, setActiveLicense] = useState<string | null>(null);
  const [loadingLicenses, setLoadingLicenses] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [licenseToDelete, setLicenseToDelete] = useState<string | null>(null);

  const fetchLicenses = async () => {
    try {
      setLoadingLicenses(true);
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
      setLoadingLicenses(false);
      setIsRefreshing(false);
    }
  };

  const fetchLogs = async (license: string) => {
    if (licenseLogs[license]) return;
    try {
      setLoadingLogs((prev) => ({ ...prev, [license]: true }));
      setError(null);
      const url = `/api/v2/get_thebot_log?license=${encodeURIComponent(license)}&type=All`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch logs for ${license}`);
      }
      const data = await response.json();
      const sortedLogs = data.logs
        .sort(
          (a: BotLog, b: BotLog) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 2);
      setLicenseLogs((prev) => ({ ...prev, [license]: sortedLogs }));
    } catch (err) {
      setError(`Failed to load logs for ${license}. Please try again later.`);
      console.error(err);
    } finally {
      setLoadingLogs((prev) => ({ ...prev, [license]: false }));
    }
  };

  const deleteLogs = async (license: string) => {
    try {
      setError(null);
      const response = await fetch('/api/v2/delete_thebot_log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_LOGGING_API_KEY || '',
        },
        body: JSON.stringify({ license }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete logs for ${license}`);
      }
      setLicenseData((prev) => prev.filter((data) => data.license !== license));
      setLicenseLogs((prev) => {
        const newLogs = { ...prev };
        delete newLogs[license];
        return newLogs;
      });
      if (activeLicense === license) {
        setActiveLicense(null);
      }
    } catch (err) {
      setError(`Failed to delete logs for ${license}. Please try again later.`);
      console.error(err);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setLicenseLogs({});
    setActiveLicense(null);
    fetchLicenses();
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      setLicenseLogs({});
      setActiveLicense(null);
      fetchLicenses();
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleLicense = (license: string) => {
    if (activeLicense === license) {
      setActiveLicense(null);
    } else {
      setActiveLicense(license);
      fetchLogs(license);
    }
  };

  const getOnlineStatus = (lastActivity: string | null) => {
    if (!lastActivity) {
      return <span className="text-sm text-red-500">Offline</span>;
    }
    try {
      const lastActivityTime = new Date(lastActivity).getTime();
      const currentTime = new Date().getTime();
      const fiveMinutesInMs = 5 * 60 * 1000;
      if (currentTime - lastActivityTime <= fiveMinutesInMs) {
        return <span className="text-sm text-green-500 px-2 py-1 bg-green-500/20">Online</span>;
      } else {
        return <span className="text-sm text-red-500 px-2 py-1 bg-red-500/20">Offline</span>;
      }
    } catch {
      return <span className="text-sm text-red-500 px-2 py-1 bg-red-500/20">Offline</span>;
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="p-5 border-[1px] border-dark-500 bg-dark-700 w-full max-w-4xl md:min-w-[500px]">
        <div className="w-full flex justify-between items-start gap-5">
          <h3 className="flex items-center gap-2 font-bold mb-5">
            <PiCodeBold />
            Bot Activity
          </h3>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1 text-sm rounded-sm h-fit font-aktivGroteskBold bg-primary text-dark-800 hover:bg-primary/70"
            title="Refresh data">
            <TbRefresh className={`text-xl ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="w-full flex justify-between items-start pb-3 gap-5">
          {getBotStatusCounts(licenseData)}
        </div>

        {loadingLicenses ? (
          <div className="w-full flex flex-col gap-5 bg-dark-600 p-5">
            {[...Array(8)].map((_, index) => (
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
        ) : licenseData.length > 0 ? (
          <div className="flex flex-col overflow-y-scroll max-h-[700px] gap-5 w-full bg-dark-600 p-5 __dokmai_scrollbar">
            {licenseData.map(({ license, lastActivity }) => (
              <button
                key={license}
                onClick={() => toggleLicense(license)}
                className="flex flex-col border border-dark-400 shadow-md px-5 rounded bg-dark-500 hover:shadow-lg transition duration-200 text-left w-full">
                <div className="flex justify-between w-full items-center py-3 lg:gap-10">
                  <span className="text-light-100">
                    {license}
                    <br />
                    <span className="text-xs text-light-800">{formatTime(lastActivity)}</span>
                  </span>
                  <div className="gap-3 flex items-center">
                    {getOnlineStatus(lastActivity)}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLicenseToDelete(license);
                        setIsConfirmDialogOpen(true);
                      }}
                      className="p-2 rounded-md bg-red-500/30 text-red-500 hover:bg-red-500/50 transition-colors">
                      <RiDeleteBin7Line className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {activeLicense === license && (
                  <div
                    className={`my-5 text-light-700 font-aktivGroteskThin transition-all duration-300 ease-in-out ${
                      activeLicense === license ? 'max-h-screen block' : 'max-h-0 hidden'
                    }`}>
                    {loadingLogs[license] ? (
                      <p className="text-gray-500">Loading logs...</p>
                    ) : licenseLogs[license] && licenseLogs[license].length > 0 ? (
                      <div className="flex flex-col gap-5">
                        {licenseLogs[license].map((log, index) => (
                          <div
                            key={index}
                            className="border-l-[1px] border-light-100 bg-dark-400 p-5">
                            <div className="flex w-full justify-between mb-5">
                              <p className="px-2 bg-light-100/10 w-fit text-light-400 rounded">
                                {log.type}
                              </p>
                              <p>{formatTime(log.timestamp)}</p>
                            </div>
                            <p className="text-xs md:text-md">{log.message}</p>
                            {log.details && (
                              <p>
                                <strong>Details:</strong>
                                <ul className="list-disc ml-5">
                                  {log.details.email && <li>Email: {log.details.email}</li>}
                                  {log.details.errorCode && (
                                    <li>Error Code: {log.details.errorCode}</li>
                                  )}
                                  {log.details.stack && <li>Stack: {log.details.stack}</li>}
                                </ul>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">No recent activities.</p>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="px-2 py-1 bg-red-600/20 rounded border-[1px] border-red-500/70 text-red-500 w-fit">
            No licenses found.
          </p>
        )}

        {isConfirmDialogOpen && (
          <Alert
            variant="destructive"
            className="fixed inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur">
            <AlertTitle className="text-xl">Are You Sure?</AlertTitle>
            <AlertDescription className="text-white/80">
              Are you sure you want to delete all logs for {licenseToDelete}?
            </AlertDescription>
            <div className="flex gap-5 mt-5">
              <button
                onClick={() => {
                  setIsConfirmDialogOpen(false);
                  setLicenseToDelete(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded">
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (licenseToDelete) {
                    await deleteLogs(licenseToDelete);
                  }
                  setIsConfirmDialogOpen(false);
                  setLicenseToDelete(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded">
                Delete
              </button>
            </div>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default BotActivity;
