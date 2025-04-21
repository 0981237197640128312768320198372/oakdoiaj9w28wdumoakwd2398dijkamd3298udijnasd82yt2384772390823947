/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { TbRefresh } from 'react-icons/tb';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTime } from '@/lib/utils';
import CopyToClipboard from '../CopyToClipboard';

interface BotActivity {
  _id: string;
  timestamp: string;
  type: 'state_change' | 'command' | 'error';
  message: string;
  details?: Record<string, any>;
  command?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'failed';
  output?: string;
  error?: string;
}

interface BotData {
  _id: string;
  botId: string;
  botState: 'running' | 'stopped' | 'idle' | 'error';
  parameters: string[];
  activity: BotActivity[];
}

const BotControl = () => {
  const [bots, setBots] = useState<BotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [commandInputs, setCommandInputs] = useState<{ [key: string]: string }>({});

  // Fetch bot data
  const fetchBotData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/v2/TheBot/get_TheBot_data');
      if (!response.ok) throw new Error('Failed to fetch bot data');
      const data = await response.json();
      setBots(data.bots);
    } catch (err) {
      setError('Failed to load bot data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Set bot state (start/stop)
  const setBotState = async (
    botId: string,
    botState: 'running' | 'stopped',
    parameters?: string[]
  ) => {
    try {
      const payload = { botId, botState, parameters };
      if (parameters) payload.parameters = parameters;
      const response = await fetch('/api/v2/TheBot/set_TheBot_state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to set bot state');
      fetchBotData();
    } catch (err) {
      setError('Failed to set bot state. Please try again later.');
      console.error(err);
    }
  };

  // Send a one-time command
  const sendCommand = async (botId: string) => {
    const command = commandInputs[botId];
    if (!command) return;
    try {
      const response = await fetch('/api/v2/TheBot/set_one_time_command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, command }),
      });
      if (!response.ok) throw new Error('Failed to send command');
      setCommandInputs((prev) => ({ ...prev, [botId]: '' }));
      fetchBotData();
    } catch (err) {
      setError('Failed to send command. Please try again later.');
      console.error(err);
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBotData();
  };

  // Mass Stop All Bots
  const massStop = () => {
    bots.forEach((bot) => setBotState(bot.botId, 'stopped'));
  };

  // Mass Start Creating All Bots
  const massStartCreating = () => {
    bots.forEach((bot) => setBotState(bot.botId, 'running', ['--mailgen']));
  };

  // Mass Start Checking All Bots
  const massStartChecking = () => {
    bots.forEach((bot) => setBotState(bot.botId, 'running', ['--checking']));
  };

  // Mass Restart All Bots
  const massRestart = () => {
    bots.forEach((bot) => {
      setBotState(bot.botId, 'stopped');
      setBotState(bot.botId, 'running', bot.parameters);
    });
  };

  // Restart Single Bot
  const restartBot = (bot: BotData) => {
    setBotState(bot.botId, 'stopped');
    setBotState(bot.botId, 'running', bot.parameters);
  };

  // Initial data fetch and periodic refresh
  useEffect(() => {
    fetchBotData();
    const interval = setInterval(fetchBotData, 30000); // Fetch every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Calculate bot counts
  const totalBots = bots.length;
  const runningBots = bots.filter((bot) => bot.botState === 'running').length;
  const stoppedBots = bots.filter((bot) => bot.botState === 'stopped').length;

  // Render bot activities
  const renderActivities = (activities: BotActivity[]) => {
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3);
    return sortedActivities.map((activity, index) => (
      <div
        key={index}
        className="border-b border-dark-500 last:border-b-0 py-4 px-2 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-light-100">{activity.type}</span>
          <span className="text-xs text-light-400">{formatTime(activity.timestamp)}</span>
        </div>
        <p className="text-sm text-light-100">{activity.message || 'No message available'}</p>
        {activity.details && (
          <div className="mt-2">
            <strong className="text-light-100">Details:</strong>
            <ul className="list-disc ml-5 text-sm text-light-100">
              {Object.entries(activity.details).map(([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ));
  };

  // Skeleton for bot card
  const BotCardSkeleton = () => (
    <div className="flex flex-col border border-dark-400 shadow-md p-5 rounded bg-dark-500">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32 bg-dark-300" />
        <Skeleton className="h-6 w-16 bg-dark-300" />
      </div>
      <div className="mt-4">
        <Skeleton className="h-4 w-48 bg-dark-300" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-10 w-32 bg-dark-300" />
        <Skeleton className="h-10 w-32 bg-dark-300" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-10 flex-1 bg-dark-300" />
        <Skeleton className="h-10 w-24 bg-dark-300" />
      </div>
      <div className="mt-4">
        <Skeleton className="h-6 w-32 bg-dark-300" />
        <div className="mt-2 space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24 bg-dark-300" />
              <Skeleton className="h-4 w-48 bg-dark-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        {[...Array(3)].map((_, index) => (
          <BotCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Main UI
  return (
    <div className="flex flex-col gap-10">
      <div className="p-5 border-[1px] border-dark-500 bg-dark-700 w-full">
        <div className="w-full flex justify-between items-start gap-5 flex-wrap">
          <h3 className="flex items-center gap-2 font-bold mb-5 text-light-100">Bot Controller</h3>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="text-light-100">
              Total Bots: {totalBots} |{' '}
              <span className="text-green-500">Running: {runningBots}</span> |{' '}
              <span className="text-red-500">Stopped: {stoppedBots}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={massStop} className="px-4 py-2 bg-primary text-black rounded-md">
                Mass Stop
              </button>
              <button
                onClick={massStartCreating}
                className="px-4 py-2 bg-primary text-black rounded-md">
                Mass Start Creating
              </button>
              <button
                onClick={massStartChecking}
                className="px-4 py-2 bg-primary text-black rounded-md">
                Mass Start Checking
              </button>
              <button onClick={massRestart} className="px-4 py-2 bg-primary text-black rounded-md">
                Mass Restart
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-1 text-sm rounded-sm h-fit font-aktivGroteskBold bg-primary text-black hover:bg-primary/70"
                title="Refresh data">
                <TbRefresh className={`text-xl ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 w-full bg-dark-600 p-5 __dokmai_scrollbar">
          {bots.map((bot) => (
            <div
              key={bot.botId}
              className="flex flex-col border border-dark-400 shadow-md p-5 rounded bg-dark-500 hover:shadow-lg transition duration-200">
              <div className="flex justify-between items-center">
                <span className="flex gap-2 text-light-100">
                  {bot.botId} <CopyToClipboard textToCopy={bot.botId.replace('bot-', '')} />
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    bot.botState === 'running' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                  {bot.botState}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-sm text-light-800">Parameters: {bot.parameters.join(', ')}</p>
              </div>
              <div className="mt-4 flex gap-2">
                {bot.botState === 'stopped' ? (
                  <>
                    <button
                      onClick={() => setBotState(bot.botId, 'running', ['--mailgen', '--smart'])}
                      className="px-4 py-2 bg-primary text-black rounded-md">
                      Start Creating
                    </button>
                    <button
                      onClick={() => setBotState(bot.botId, 'running', ['--checking'])}
                      className="px-4 py-2 bg-primary text-black rounded-md">
                      Start Checking
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setBotState(bot.botId, 'stopped')}
                      className="px-4 py-2 bg-primary text-black rounded-md">
                      Stop
                    </button>
                    <button
                      onClick={() => restartBot(bot)}
                      className="px-4 py-2 bg-primary text-black rounded-md">
                      Restart
                    </button>
                  </>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={commandInputs[bot.botId] || ''}
                  onChange={(e) =>
                    setCommandInputs({ ...commandInputs, [bot.botId]: e.target.value })
                  }
                  placeholder="Enter command"
                  className="flex-1 p-2 bg-dark-400 text-light-100 rounded"
                />
                <button
                  onClick={() => sendCommand(bot.botId)}
                  className="px-4 py-2 bg-primary text-black rounded">
                  Send
                </button>
              </div>
              <div className="mt-4">
                <h4 className="text-light-100 mb-2">Recent Activities</h4>
                <div className="space-y-4">{renderActivities(bot.activity)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BotControl;
