/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { formatTime } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { TbRefresh } from 'react-icons/tb';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import CopyToClipboard from '../CopyToClipboard';

interface SuccessLog {
  message: string;
  status: string;
  timestamp: string;
  botId: string;
}

const SuccessLogs = () => {
  const [successLogs, setSuccessLogs] = useState<SuccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSuccessLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/v2/TheBot/report?filter=success-dokmai-bot', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch logs');
      }
      const data = await response.json();
      console.log(data);

      data.forEach((item: { botId: string; activity: any[] }) => {
        console.log(item.botId);
        item.activity.forEach(
          (activity: { timestamp: string; status: string; message: string }) => {
            console.log(activity.timestamp);
            console.log(activity.message);
          }
        );
      });

      const logs: SuccessLog[] = data.flatMap((bot: { botId: string; activity: any[] }) =>
        bot.activity.map((activity: { message: string; status: string; timestamp: string }) => ({
          message: activity.message,
          status: activity.status,
          timestamp: activity.timestamp,
          botId: bot.botId,
        }))
      );
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setSuccessLogs(logs);
    } catch (err) {
      setError('Failed to load logs. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSuccessLogs();
  };

  useEffect(() => {
    fetchSuccessLogs();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      fetchSuccessLogs();
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-5 border-[1px] border-dark-500 bg-dark-700 w-full max-w-[500px]">
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
              <div className="w-full flex flex-col-reverse md:flex-row mb-5 justify-between items-start">
                <span className="flex gap-2 text-light-100">
                  {log.botId} <CopyToClipboard textToCopy={log.botId.replace('bot-', '')} />
                </span>
                <p className="px-2 py-1 rounded-sm bg-light-800/20 h-fit text-light-100 text-xs">
                  {formatTime(log.timestamp)}
                </p>
              </div>

              <p className="text-xs w-full text-end md:justify-center md:text-center">
                {log.message}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-2 py-1 bg-red-600/20 rounded border-[1px] border-red-500/70 text-red-500 w-fit">
          No success logs found.
        </p>
      )}
    </div>
  );
};

export default SuccessLogs;
