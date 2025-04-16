/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { formatTime } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { TbRefresh } from 'react-icons/tb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface BotLog {
  timestamp: string;
  type: string;
  message: string;
  details: {
    email?: string;
    errorCode?: string;
    stack?: string;
  };
  license: string; // Added to identify the license
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
        const url = `/api/v2/get_thebot_log?license=${encodeURIComponent(license)}&type=success`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch logs for ${license}`);
        }
        const data = await response.json();
        const logsWithLicense = data.logs.map((log: BotLog) => ({ ...log, license }));
        allLogs.push(...logsWithLicense);
      }
      // Sort logs by timestamp in descending order (latest first)
      allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setSuccessLogs(allLogs);
    } catch (err) {
      setError('Failed to load success logs. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLicenses();
    fetchSuccessLogs();
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  useEffect(() => {
    if (licenseData.length > 0) {
      fetchSuccessLogs();
    }
  }, [licenseData]);

  return (
    <div className="flex flex-col gap-10">
      <Card className="p-5 border-[1px] border-dark-500 bg-dark-700 w-full max-w-4xl md:min-w-[500px]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-light-100">Success Logs</CardTitle>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 text-sm rounded-sm h-fit font-aktivGroteskBold bg-primary text-dark-800 hover:bg-primary/70 hover:text-dark-800"
              title="Refresh data">
              <TbRefresh className={`text-xl ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
            <div className="flex flex-col gap-5 w-full bg-dark-600 p-5 __dokmai_scrollbar">
              {successLogs.map((log, index) => (
                <div key={index} className="border-l-[1px] border-light-100 bg-dark-400 p-5">
                  <div className="flex w-full justify-between mb-5">
                    <p className="px-2 bg-light-100/10 w-fit text-light-400 rounded">{log.type}</p>
                    <p>{formatTime(log.timestamp)}</p>
                  </div>
                  <p className="text-xs md:text-md">{log.message}</p>
                  {log.details && (
                    <p>
                      <strong>Details:</strong>
                      {log.details ? (
                        <ul className="list-disc ml-5">
                          {log.details.email && <li>Email: {log.details.email}</li>}
                          {log.details.errorCode && <li>Error Code: {log.details.errorCode}</li>}
                          {log.details.stack && <li>Stack: {log.details.stack}</li>}
                        </ul>
                      ) : (
                        ' No details'
                      )}
                    </p>
                  )}
                  <p className="text-light-500">License: {log.license}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-2 py-1 bg-red-600/20 rounded border-[1px] border-red-500/70 text-red-500 w-fit">
              No success logs found.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuccessLogs;
