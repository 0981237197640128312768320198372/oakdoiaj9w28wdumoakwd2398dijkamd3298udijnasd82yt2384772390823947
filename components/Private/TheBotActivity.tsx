/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

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

const TheBotActivity = () => {
  const [license, setLicense] = useState<string>('');
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [logType, setLogType] = useState<string>('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [licenses, setLicenses] = useState<string[]>([]);
  const [loadingLicenses, setLoadingLicenses] = useState(true);

  // Fetch licenses when the component mounts
  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        setLoadingLicenses(true);
        const response = await fetch('/api/v2/get_thebot_licenses', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch licenses');
        }

        const data = await response.json();
        setLicenses(data.licenses);
      } catch (err) {
        setError('Failed to load licenses. Please try again later.');
        console.error(err);
      } finally {
        setLoadingLicenses(false);
      }
    };

    fetchLicenses();
  }, []);

  // Fetch logs when license or logType changes
  const fetchLogs = async () => {
    if (!license) return;

    try {
      setLoading(true);
      setError(null);
      const url = `/api/v2/get_thebot_update?license=${encodeURIComponent(
        license
      )}&type=${encodeURIComponent(logType)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch bot logs');
      }

      const data = await response.json();
      setLogs(data.logs);
    } catch (err) {
      setError('Failed to load bot logs. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs when license or logType changes
  useEffect(() => {
    fetchLogs();
  }, [license, logType]);

  // Handle license selection
  const handleLicenseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLicense(e.target.value);
  };

  // Handle log type filter change
  const handleLogTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLogType(e.target.value);
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-5">Bot Activity Logs</h2>

      {/* License Selector */}
      <div className="mb-5 flex gap-3 items-center">
        <label htmlFor="license" className="text-sm font-medium">
          Select License:
        </label>
        {loadingLicenses ? (
          <p className="text-gray-500">Loading licenses...</p>
        ) : (
          <select
            id="license"
            value={license}
            onChange={handleLicenseChange}
            className="border p-2 rounded bg-gray-800 text-white">
            <option value="">-- Select a License --</option>
            {licenses.map((lic) => (
              <option key={lic} value={lic}>
                {lic}
              </option>
            ))}
          </select>
        )}

        {/* Log Type Filter */}
        <label htmlFor="logType" className="text-sm font-medium">
          Filter by Type:
        </label>
        <select
          id="logType"
          value={logType}
          onChange={handleLogTypeChange}
          className="border p-2 rounded bg-gray-800 text-white">
          <option value="All">All</option>
          <option value="error">Error</option>
          <option value="success">Success</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 mb-3">{error}</p>}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center">
          <p className="text-gray-500">Loading logs...</p>
        </div>
      )}

      {/* Logs Table */}
      {!loading && license && logs.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-600">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="border border-gray-600 p-2 text-left">Timestamp</th>
                <th className="border border-gray-600 p-2 text-left">Type</th>
                <th className="border border-gray-600 p-2 text-left">Message</th>
                <th className="border border-gray-600 p-2 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index} className="bg-gray-800 text-white">
                  <td className="border border-gray-600 p-2">{log.timestamp}</td>
                  <td className="border border-gray-600 p-2">{log.type}</td>
                  <td className="border border-gray-600 p-2">{log.message}</td>
                  <td className="border border-gray-600 p-2">
                    {log.details ? (
                      <ul>
                        {log.details.email && <li>Email: {log.details.email}</li>}
                        {log.details.errorCode && <li>Error Code: {log.details.errorCode}</li>}
                        {log.details.stack && <li>Stack: {log.details.stack}</li>}
                      </ul>
                    ) : (
                      'No details'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No Logs Message */}
      {!loading && license && logs.length === 0 && (
        <p className="text-gray-500">No logs found for this license.</p>
      )}

      {/* Prompt to Select License */}
      {!license && !loading && !loadingLicenses && (
        <p className="text-gray-500">Please select a license to view logs.</p>
      )}
    </div>
  );
};

export default TheBotActivity;
