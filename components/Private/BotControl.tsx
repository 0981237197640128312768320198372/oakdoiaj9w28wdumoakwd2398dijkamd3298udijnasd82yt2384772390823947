/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { TbRefresh } from 'react-icons/tb';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTime } from '@/lib/utils';
import { SiHackaday } from 'react-icons/si';
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
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | string>(null);
  const [confirmMessage, setConfirmMessage] = useState('');

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

  const setBotState = async (
    botId: string,
    botState: 'running' | 'stopped' | 'idle',
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
      // fetchBotData();
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
      // fetchBotData();
    } catch (err) {
      setError('Failed to send command. Please try again later.');
      console.error(err);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBotData();
  };
  const actionExplanations: { [key: string]: string } = {
    massStop: 'This will stop all bots. Are you sure?',
    massStartCreating: 'This will start all bots in creating mode. Are you sure?',
    massStartChecking: 'This will start all bots in checking mode. Are you sure?',
    massRestart: 'This will restart all bots. Are you sure?',
  };
  const handleMassAction = (action: string) => {
    setConfirmAction(action);
    setConfirmMessage(actionExplanations[action]);
    setShowConfirm(true);
  };

  const confirmMassAction = () => {
    if (confirmAction) {
      switch (confirmAction) {
        case 'massStop':
          massStop();
          break;
        case 'massStartCreating':
          massStartCreating();
          break;
        case 'massStartChecking':
          massStartChecking();
          break;
        case 'massRestart':
          massRestart();
          break;
        default:
          break;
      }
      setShowConfirm(false);
      setConfirmAction(null);
    }
  };

  const massStop = () => {
    bots.forEach((bot) => setBotState(bot.botId, 'stopped'));
  };

  const massStartCreating = () => {
    bots.forEach((bot) => setBotState(bot.botId, 'running', ['--mailgen', '--ibangen']));
  };

  const massStartChecking = () => {
    bots.forEach((bot) => setBotState(bot.botId, 'running', ['--checking']));
  };
  const massRestart = () => {
    bots.forEach((bot) => {
      setBotState(bot.botId, 'stopped');
      setBotState(bot.botId, 'running', bot.parameters);
    });
  };

  const restartBot = (bot: BotData) => {
    setBotState(bot.botId, 'stopped');
    setBotState(bot.botId, 'running', bot.parameters);
  };

  useEffect(() => {
    fetchBotData();
    const interval = setInterval(fetchBotData, 60000 * 5);
    return () => clearInterval(interval);
  }, []);
  const totalBots = bots.length;
  const runningBots = bots.filter((bot) => bot.botState === 'running').length;
  const stoppedBots = bots.filter((bot) => bot.botState === 'stopped').length;
  const idleBots = bots.filter((bot) => bot.botState === 'idle').length;

  const renderActivities = (activities: BotActivity[]) => {
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3);
    return sortedActivities.map((activity, index) => (
      <div key={index} className="bg-dark-300 p-2 flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-light-400">{formatTime(activity.timestamp)}</span>
        </div>
        <p className="text-xs ">{activity.message || 'No message available'}</p>
        {activity.details && (
          <div className="mt-2">
            <p className="text-white text-xs">Details:</p>
            <ul className="list-disc ml-5 text-xs text-light-100/60">
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
    <div className="p-5 border-[1px] border-dark-500 bg-dark-700 w-full ">
      <div className="w-full flex flex-col gap-5 flex-wrap">
        <h3 className="flex items-center gap-2 font-bold  text-light-100">
          <SiHackaday /> Bot Controller
        </h3>
        <div className="flex gap-5">
          Total Bots: {totalBots}
          <span className="bg-green-500/20 text-green-500 px-1">Running: {runningBots}</span>
          <span className="bg-sky-500/20 text-sky-500 px-1">Idle: {idleBots}</span>
          <span className="bg-red-500/20 text-red-500 px-1">Stopped: {stoppedBots}</span>
        </div>
        <div className="flex gap-5 items-center flex-wrap">
          <div className="flex flex-col gap-2 bg-dark-600 w-full p-5">
            <div className="flex justify-between w-full">
              <h3 className="">
                Mass Action <p className="text-xs text-white/40">Action will effect all bot</p>
              </h3>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-1 text-sm rounded-sm h-fit font-aktivGroteskBold bg-primary text-black hover:bg-primary/70"
                title="Refresh data">
                <TbRefresh className={`text-xl ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="grid gap-5 grid-cols-2 font-semibold">
              <button
                onClick={() => handleMassAction('massStop')}
                className="px-1 rounded-sm font-aktivGroteskBold bg-primary text-dark-800 hover:bg-primary/70">
                Stop
              </button>
              <button
                onClick={() => handleMassAction('massStartCreating')}
                className="px-1 rounded-sm font-aktivGroteskBold bg-primary text-dark-800 hover:bg-primary/70">
                Create (Generate Data)
              </button>
              <button
                disabled
                onClick={() => handleMassAction('massStartChecking')}
                className="px-1 rounded-sm font-aktivGroteskBold bg-primary text-dark-800 hover:bg-primary/70">
                Check
              </button>
              <button
                onClick={() => handleMassAction('massRestart')}
                className="px-1 rounded-sm font-aktivGroteskBold bg-primary text-dark-800 hover:bg-primary/70">
                Restart
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 max-h-[800px] w-full bg-dark-600 p-5 mt-10  overflow-y-scroll __dokmai_scrollbar">
        {loading
          ? [...Array(9)].map((_, index) => <BotCardSkeleton key={index} />)
          : bots.map((bot) => (
              <div
                key={bot.botId}
                className={`flex flex-col border shadow-lg 
                  ${bot.botState === 'running' && 'border-green-500 shadow-green-500/30 '}
                  ${bot.botState === 'stopped' && 'border-red-500 shadow-red-500/30 '}
                  ${bot.botState === 'idle' && 'border-sky-500 shadow-sky-500/30 '}
                 p-5 rounded bg-dark-500 transition duration-200`}>
                <div className="flex justify-between items-center">
                  <span className="flex gap-2 text-light-100">
                    {bot.botId} <CopyToClipboard textToCopy={bot.botId.replace('bot-', '')} />
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs 
                       ${bot.botState === 'running' && 'text-green-500 bg-green-500/30 '}
                  ${bot.botState === 'stopped' && 'text-red-500 bg-red-500/30 '}
                  ${bot.botState === 'idle' && 'text-sky-500 bg-sky-500/30 '}`}>
                    {bot.botState}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-light-800">
                    Parameters Active: {bot.parameters.join(', ')}
                  </p>
                </div>
                <div className="mt-5 flex gap-2">
                  {bot.botState === 'stopped' || bot.botState === 'idle' ? (
                    <>
                      <button
                        onClick={() =>
                          setBotState(bot.botId, 'running', ['--mailgen', '--ibangen'])
                        }
                        className="px-1 rounded-sm font-aktivGroteskBold bg-primary text-dark-800 hover:bg-primary/70">
                        Create (Generate Data)
                      </button>
                      <button
                        onClick={() => setBotState(bot.botId, 'running', ['--checking'])}
                        disabled
                        className="px-1 rounded-sm font-aktivGroteskBold bg-primary text-dark-800 hover:bg-primary/70">
                        Check
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setBotState(bot.botId, 'stopped')}
                        className="px-1 rounded-sm font-aktivGroteskBold bg-red-500/20 text-red-500 hover:bg-red-500/40">
                        Stop
                      </button>
                      <button
                        onClick={() => restartBot(bot)}
                        className="px-1 rounded-sm font-aktivGroteskBold bg-cyan-500 text-dark-800 hover:bg-cyan-500">
                        Restart
                      </button>
                    </>
                  )}
                </div>
                <div className="mt-5 flex gap-2">
                  <input
                    type="text"
                    value={commandInputs[bot.botId] || ''}
                    onChange={(e) =>
                      setCommandInputs({ ...commandInputs, [bot.botId]: e.target.value })
                    }
                    placeholder="Enter command"
                    className="border border-primary p-2 w-full focus:border-primary focus:outline-none focus:ring-0 bg-transparent text-sm"
                  />
                  <button
                    onClick={() => sendCommand(bot.botId)}
                    className="px-3 text-sm rounded-sm font-aktivGroteskBold bg-primary text-dark-800 hover:bg-primary/70">
                    Send
                  </button>
                </div>
                <div className="mt-5 p-5 bg-dark-400">
                  <div className="space-y-4">{renderActivities(bot.activity)}</div>
                </div>
              </div>
            ))}
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-dark-700 p-5 rounded border border-dark-500">
              <h4 className="text-light-100">Are you sure?</h4>
              <p className="text-light-500">{confirmMessage}</p>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-2 py-1 bg-gray-500 text-white rounded">
                  Cancel
                </button>
                <button
                  onClick={confirmMassAction}
                  className="px-2 py-1 bg-red-500 text-white rounded">
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BotControl;
