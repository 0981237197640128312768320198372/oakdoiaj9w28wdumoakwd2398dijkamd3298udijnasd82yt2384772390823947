/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { formatTime } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface BotLog {
  timestamp: string;
  type: string;
  message: string;
  details: {
    email?: string;
    errorCode?: string;
    stack?: string;
  };
}

interface LicenseData {
  license: string;
  lastActivity: string | null;
}

const TheBotActivity = () => {
  const [licenseData, setLicenseData] = useState<LicenseData[]>([]);
  const [licenseLogs, setLicenseLogs] = useState<{ [key: string]: BotLog[] }>({});
  const [activeLicense, setActiveLicense] = useState<string | null>(null);
  const [loadingLicenses, setLoadingLicenses] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch licenses and last activity timestamps
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

  // Fetch licenses when the component mounts
  useEffect(() => {
    fetchLicenses();
  }, []);

  // Fetch logs for a specific license when clicked
  const fetchLogs = async (license: string) => {
    if (licenseLogs[license]) return; // Skip if logs are already fetched

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
      // Sort logs by timestamp (descending) and take the latest 2
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
    if (!confirm(`Are you sure you want to delete all logs for ${license}?`)) return;

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
        return <span className="text-sm text-green-500">Online</span>;
      } else {
        return <span className="text-sm text-red-500">Offline</span>;
      }
    } catch {
      return <span className="text-sm text-red-500">Offline</span>;
    }
  };

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">Bot Activity Logs</h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`px-4 py-2 rounded text-white ${
            isRefreshing ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loadingLicenses && (
        <div className="space-y-2">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-10 bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 mb-3">{error}</p>}

      {!loadingLicenses && licenseData.length > 0 && (
        <div className="space-y-2">
          {licenseData.map(({ license, lastActivity }) => (
            <div key={license} className="__nofocus">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => toggleLicense(license)}
                  className="w-full text-left flex justify-between items-center py-4 __nofocus">
                  <span className="text-xl font-aktivGroteskRegular text-light-300 __nofocus">
                    {license}{' '}
                    <span className="text-sm text-gray-400">({formatTime(lastActivity)})</span>{' '}
                    {getOnlineStatus(lastActivity)}
                  </span>
                  <button
                    onClick={() => deleteLogs(license)}
                    className="ml-2 text-red-500 hover:text-red-600 text-sm">
                    Delete
                  </button>
                  <span className="text-light-500 transition-all duration-700">
                    {activeLicense === license ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </span>
                </button>
              </div>
              {activeLicense === license && (
                <div
                  className={`px-7 pb-4 text-light-600 font-aktivGroteskThin transition-all duration-300 ease-in-out ${
                    activeLicense === license ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                  {loadingLogs[license] ? (
                    <p className="text-gray-500">Loading logs...</p>
                  ) : licenseLogs[license] && licenseLogs[license].length > 0 ? (
                    <div>
                      {licenseLogs[license].map((log, index) => (
                        <div key={index} className="mb-4">
                          <p>
                            <strong>Timestamp:</strong> {formatTime(log.timestamp)}
                          </p>
                          <p>
                            <strong>Type:</strong> {log.type}
                          </p>
                          <p>
                            <strong>Message:</strong> {log.message}
                          </p>
                          {log.details && (
                            <p>
                              <strong>Details:</strong>
                              {log.details ? (
                                <ul className="list-disc ml-5">
                                  {log.details.email && <li>Email: {log.details.email}</li>}
                                  {log.details.errorCode && (
                                    <li>Error Code: {log.details.errorCode}</li>
                                  )}
                                  {log.details.stack && <li>Stack: {log.details.stack}</li>}
                                </ul>
                              ) : (
                                ' No details'
                              )}
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
            </div>
          ))}
        </div>
      )}

      {/* No Licenses Message */}
      {!loadingLicenses && licenseData.length === 0 && (
        <p className="text-gray-500">No licenses found.</p>
      )}
    </div>
  );
};

export default TheBotActivity;
