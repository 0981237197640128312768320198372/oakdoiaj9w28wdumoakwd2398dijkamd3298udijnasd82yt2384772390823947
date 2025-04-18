/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { TbRefresh } from 'react-icons/tb';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTime } from '@/lib/utils';

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

// /api/v2/TheBot/get_TheBot_data
// /api/v2/TheBot/report
// /api/v2/TheBot/get_TheBot_state
// /api/v2/TheBot/set_TheBot_state
// /api/v2/TheBot/get_one_time_command
// /api/v2/TheBot/set_one_time_command

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
  console.log(bots);
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

  const setBotState = async (botId: string, state: 'running' | 'stopped') => {
    try {
      const response = await fetch('/api/v2/TheBot/set_TheBot_state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, state }),
      });
      if (!response.ok) throw new Error('Failed to set bot state');
      fetchBotData();
    } catch (err) {
      setError('Failed to set bot state. Please try again later.');
      console.error(err);
    }
  };

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBotData();
  };

  useEffect(() => {
    fetchBotData();
    const interval = setInterval(fetchBotData, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderActivities = (activities: BotActivity[]) => {
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3);
    return sortedActivities.map((activity, index) => (
      <div key={index} className="border-l-[1px] border-light-100 bg-dark-400 p-5">
        <div className="flex w-full justify-between mb-5">
          <p className="px-2 bg-light-100/10 w-fit text-light-400 rounded">{activity.type}</p>
          <p>{formatTime(activity.timestamp)}</p>
        </div>
        <p className="text-xs md:text-md">{activity.message}</p>
        {activity.details && (
          <p>
            <strong>Details:</strong>
            <ul className="list-disc ml-5">
              {Object.entries(activity.details).map(([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))}
            </ul>
          </p>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="w-full h-32 bg-dark-300" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="p-5 border-[1px] border-dark-500 bg-dark-700 w-full max-w-4xl md:min-w-[500px]">
        <div className="w-full flex justify-between items-start gap-5">
          <h3 className="flex items-center gap-2 font-bold mb-5">Bot Controller</h3>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1 text-sm rounded-sm h-fit font-aktivGroteskBold bg-primary text-dark-800 hover:bg-primary/70"
            title="Refresh data">
            <TbRefresh className={`text-xl ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex flex-col overflow-auto max-h-[500px] gap-5 w-full bg-dark-600 p-5 __dokmai_scrollbar">
          {bots.map((bot) => (
            <div
              key={bot.botId}
              className="flex flex-col border border-dark-400 shadow-md p-5 rounded bg-dark-500 hover:shadow-lg transition duration-200">
              <div className="flex justify-between items-center">
                <span className="text-light-100">{bot.botId}</span>
                <span
                  className={`text-sm ${
                    bot.botState === 'running' ? 'text-green-500' : 'text-red-500'
                  }`}>
                  {bot.botState}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-sm text-light-800">Parameters: {bot.parameters.join(', ')}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() =>
                    setBotState(bot.botId, bot.botState === 'running' ? 'stopped' : 'running')
                  }
                  className={`px-4 py-2 rounded-md ${
                    bot.botState === 'running' ? 'bg-red-500' : 'bg-green-500'
                  } text-white`}>
                  {bot.botState === 'running' ? 'Stop' : 'Start'}
                </button>
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
                  className="px-4 py-2 bg-blue-500 text-white rounded">
                  Send
                </button>
              </div>
              <div className="mt-4">
                <h4 className="text-light-100 mb-2">Recent Activities</h4>
                {renderActivities(bot.activity)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BotControl;
