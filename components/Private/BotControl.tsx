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
  type: 'state_change' | 'command' | 'error' | 'dokmai-bot';
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
  const [eventSources, setEventSources] = useState<{ [key: string]: EventSource }>({});

  // Fetch initial bot data
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

  // Initial data fetch
  useEffect(() => {
    fetchBotData();
  }, []);

  // SSE setup for real-time updates
  useEffect(() => {
    const sources: { [key: string]: EventSource } = {};

    bots.forEach((bot) => {
      const eventSource = new EventSource(`/api/v2/TheBot/report?botId=${bot.botId}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // Only process activities of type 'dokmai-bot'
        if (data.type === 'dokmai-bot') {
          const newActivity: BotActivity = {
            _id: data.id || data._id || `${bot.botId}-${Date.now()}`,
            timestamp:
              data.timestamp || data.lastReportedStatus?.timestamp || new Date().toISOString(),
            type: 'dokmai-bot',
            message:
              data.message ||
              data.lastReportedStatus?.message ||
              `State changed to ${bot.botState}`,
            details: data.details || data.asdState || {},
          };
          console.log('New SSE activity:', newActivity); // Debug log
          setBots((prevBots) =>
            prevBots.map((b) =>
              b.botId === bot.botId
                ? { ...b, activity: [newActivity, ...b.activity].slice(0, 50) }
                : b
            )
          );
        }
      };

      eventSource.onerror = () => {
        console.error(`SSE connection error for bot ${bot.botId}`);
        eventSource.close();
        // Attempt to reconnect after a delay
        setTimeout(() => {
          sources[bot.botId] = new EventSource(`/api/v2/TheBot/report?botId=${bot.botId}`);
        }, 5000);
      };

      sources[bot.botId] = eventSource;
    });

    setEventSources(sources);

    return () => {
      Object.values(sources).forEach((source) => source.close());
    };
  }, [bots]);

  // Render bot activities
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
        <p className="text-xs md:text-md">{activity.message || 'No message available'}</p>
        {activity.details && (
          <div>
            <strong>Details:</strong>
            <ul className="list-disc ml-5">
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

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="w-full h-32 bg-dark-300" />
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

        <div className="grid grid-cols-2 overflow-auto max-h-[500px] gap-5 w-full bg-dark-600 p-5 __dokmai_scrollbar">
          {bots.map((bot) => (
            <div
              key={bot.botId}
              className="flex flex-col border border-dark-400 shadow-md p-5 rounded bg-dark-500 hover:shadow-lg transition duration-200">
              <div className="flex justify-between items-center">
                <span className="flex gap-2 text-light-100">
                  {bot.botId} <CopyToClipboard textToCopy={bot.botId.replace('bot-', '')} />
                </span>
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
              <div className="mt-4 flex gap-2">
                {bot.botState === 'stopped' ? (
                  <>
                    <button
                      onClick={() => setBotState(bot.botId, 'running', ['--mailgen', '--smart'])}
                      className="px-4 py-2 bg-green-500 text-white rounded-md">
                      Start Creating
                    </button>
                    <button
                      onClick={() => setBotState(bot.botId, 'running', ['--checking'])}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md">
                      Start Checking
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setBotState(bot.botId, 'stopped')}
                    className="px-4 py-2 bg-red-500 text-white rounded-md">
                    Stop
                  </button>
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
