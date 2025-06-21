/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { TbRefresh } from 'react-icons/tb';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTime } from '@/lib/utils';
import { SiHackaday } from 'react-icons/si';
import CopyToClipboard from '@/components/home/general/CopyToClipboard';

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
  selectedParameters?: string[]; // New field for user-selected parameters
  webhookUrl?: string;
  lastSeen?: string;
  activity: BotActivity[];
}

// Available parameters for bot configuration
const AVAILABLE_PARAMETERS = [
  { value: '--proxy', label: 'Proxy Mode', description: 'Use proxy for requests' },
  {
    value: '--test',
    label: 'Testing Mode',
    description: 'Testing mode (prevent force browser close)',
  },
  { value: '--once', label: 'Single Run', description: 'Process only one account then exit' },
  {
    value: '--mailgen',
    label: 'Mail Generator',
    description: 'Generate random emails instead of reading files',
  },
  {
    value: '--generate-email',
    label: 'Email Gen Only',
    description: 'Only generate email/password, no processing',
  },
  {
    value: '--ibangen',
    label: 'IBAN Generator',
    description: 'Generate IBAN instead of using pre-made ones',
  },
  {
    value: '--check',
    label: 'Account Checker',
    description: 'Check existing accounts (login + determine good/bad)',
  },
  {
    value: '--NoEmail',
    label: 'No Email Access',
    description: 'When email cannot use fetchEmail function (cannot access the email)',
  },
];

const BotControl = () => {
  const [bots, setBots] = useState<BotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [commandInputs, setCommandInputs] = useState<{ [key: string]: string }>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | string>(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [botToDelete, setBotToDelete] = useState<string | null>(null);
  const [showParameterModal, setShowParameterModal] = useState(false);
  const [currentBotForParams, setCurrentBotForParams] = useState<string | null>(null);
  const [botParameters, setBotParameters] = useState<{ [key: string]: string[] }>({});
  const [tempSelectedParams, setTempSelectedParams] = useState<string[]>([]);

  const fetchBotData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/v3/thebot');
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

  const getBotHealthStatus = (bot: BotData) => {
    if (!bot.lastSeen) {
      return { status: 'unknown', color: 'dark', message: 'Never seen' };
    }

    const lastSeenTime = new Date(bot.lastSeen).getTime();
    const now = Date.now();
    const timeDiff = now - lastSeenTime;
    const healthyThreshold = 13 * 60 * 60 * 1000; // 13 hours in ms

    if (timeDiff < healthyThreshold) {
      return {
        status: 'healthy',
        color: 'green',
        message: `Last seen ${formatTime(bot.lastSeen)}`,
      };
    } else {
      return {
        status: 'offline',
        color: 'red',
        message: `Offline since ${formatTime(bot.lastSeen)}`,
      };
    }
  };

  const setBotState = async (
    botId: string,
    botState: 'running' | 'stopped' | 'idle',
    parameters?: string[]
  ) => {
    try {
      const payload: { botState: 'running' | 'stopped' | 'idle'; parameters?: string[] } = {
        botState,
      };
      if (parameters) payload.parameters = parameters;

      const response = await fetch(`/api/v3/thebot/state?botId=${botId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to set bot state');
      }

      const result = await response.json();
      console.log(`✅ Bot ${botId} state command sent:`, result.message);
      setTimeout(() => fetchBotData(), 1000);
    } catch (err: any) {
      setError(`Failed to set bot state: ${err.message}`);
      console.error('Bot state error:', err);
    }
  };

  const sendCommand = async (botId: string) => {
    const command = commandInputs[botId]?.trim();
    if (!command) return;

    try {
      const response = await fetch(`/api/v3/thebot/command?botId=${botId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to send command');
      }

      const result = await response.json();
      console.log(`✅ Command sent to bot ${botId}:`, result.message);
      setCommandInputs((prev) => ({ ...prev, [botId]: '' }));
      setTimeout(() => fetchBotData(), 1000);
    } catch (err: any) {
      setError(`Failed to send command: ${err.message}`);
      console.error('Command error:', err);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBotData();
  };

  const actionExplanations: { [key: string]: string } = {
    massDeleteStopped:
      'This will permanently delete all stopped and idle bots. This action cannot be undone. Are you sure?',
  };

  const handleMassAction = (action: string) => {
    setConfirmAction(action);
    setConfirmMessage(actionExplanations[action]);
    setShowConfirm(true);
  };

  const confirmMassAction = () => {
    if (confirmAction) {
      switch (confirmAction) {
        case 'massDeleteStopped':
          massDeleteStopped();
          break;
        default:
          break;
      }
      setShowConfirm(false);
      setConfirmAction(null);
    }
  };

  const deleteBot = async (botId: string) => {
    try {
      const response = await fetch(`/api/v3/thebot/delete?botId=${botId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to delete bot');
      }

      const result = await response.json();
      console.log(`✅ Bot ${botId} deleted:`, result.message);
      setTimeout(() => fetchBotData(), 1000);
    } catch (err: any) {
      setError(`Failed to delete bot: ${err.message}`);
      console.error('Delete bot error:', err);
    }
  };

  const handleDeleteBot = (botId: string) => {
    setBotToDelete(botId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBot = () => {
    if (botToDelete) {
      deleteBot(botToDelete);
      setShowDeleteConfirm(false);
      setBotToDelete(null);
    }
  };

  const massDeleteStopped = () => {
    const stoppedBots = bots.filter((bot) => bot.botState === 'stopped' || bot.botState === 'idle');
    stoppedBots.forEach((bot) => deleteBot(bot.botId));
  };

  const restartBot = (bot: BotData) => {
    setBotState(bot.botId, 'stopped');
    setTimeout(() => {
      const selectedParams = botParameters[bot.botId] || bot.parameters || [];
      setBotState(bot.botId, 'running', selectedParams);
    }, 1000);
  };

  // Parameter management functions
  const openParameterModal = (botId: string) => {
    setCurrentBotForParams(botId);
    const currentParams = botParameters[botId] || [];
    setTempSelectedParams(currentParams);
    setShowParameterModal(true);
  };

  const closeParameterModal = () => {
    setShowParameterModal(false);
    setCurrentBotForParams(null);
    setTempSelectedParams([]);
  };

  const toggleParameter = (paramValue: string) => {
    setTempSelectedParams((prev) =>
      prev.includes(paramValue) ? prev.filter((p) => p !== paramValue) : [...prev, paramValue]
    );
  };

  const applyParameters = () => {
    if (currentBotForParams) {
      setBotParameters((prev) => ({
        ...prev,
        [currentBotForParams]: tempSelectedParams,
      }));
    }
    closeParameterModal();
  };

  const getBotSelectedParameters = (botId: string) => {
    return botParameters[botId] || [];
  };

  const startBotWithSelectedParams = (botId: string) => {
    const selectedParams = getBotSelectedParameters(botId);
    setBotState(botId, 'running', selectedParams.length > 0 ? selectedParams : ['--mailgen']);
  };

  useEffect(() => {
    fetchBotData();
    const interval = setInterval(fetchBotData, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalBots = bots.length;
  const runningBots = bots.filter((bot) => bot.botState === 'running').length;
  const stoppedBots = bots.filter((bot) => bot.botState === 'stopped').length;
  const idleBots = bots.filter((bot) => bot.botState === 'idle').length;

  const BotCardSkeleton = () => (
    <div className="flex flex-col border border-dark-600 shadow-md p-4 rounded-lg bg-dark-600">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-32 bg-dark-600" />
        <Skeleton className="h-5 w-16 bg-dark-600" />
      </div>
      <div className="mt-3">
        <Skeleton className="h-4 w-48 bg-dark-600" />
      </div>
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-8 w-20 bg-dark-600" />
        <Skeleton className="h-8 w-20 bg-dark-600" />
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
    <div className="p-5 border border-dark-600 bg-dark-700 w-full rounded-lg">
      <div className="w-full flex flex-col gap-6">
        <h3 className="flex items-center gap-3 font-bold text-white text-lg">
          <SiHackaday className="text-emerald-400" /> Bot Controller
        </h3>

        <div className="flex gap-5 text-sm items-center">
          <span className="bg-sky-500/20 text-sky-400 px-2 py-1 rounded border border-sky-500/30">
            Total Bots: {totalBots}
          </span>
          <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30">
            Running: {runningBots}
          </span>
          <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded border border-amber-500/30">
            Idle: {idleBots}
          </span>
          <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30">
            Stopped: {stoppedBots}
          </span>
        </div>

        <div className="flex gap-5 items-center flex-wrap">
          <div className="flex flex-col gap-5 bg-dark-600 border-dark-500 w-full p-5 rounded-lg border ">
            <div className="flex justify-between w-full">
              <div>
                <h4 className="text-light-200 font-medium">Mass Actions</h4>
                <p className="text-xs text-light-500">Actions will affect all bots</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-sm rounded-md h-fit font-medium bg-primary text-black hover:bg-primary/90 transition-colors"
                title="Refresh data">
                <TbRefresh className={`text-lg ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="grid gap-3 grid-cols-3 font-medium">
              <button
                onClick={() => handleMassAction('massDeleteStopped')}
                className="px-3 py-2 rounded-md font-medium bg-red-700/80 text-red-200 hover:bg-red-600/80 border border-red-600/30 transition-colors">
                Delete Stopped
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 max-h-[75vh] w-full bg-dark-950 p-5 mt-5 overflow-y-scroll __dokmai_scrollbar rounded-lg border bg-dark-600 border-dark-500">
        {loading
          ? [...Array(9)].map((_, index) => <BotCardSkeleton key={index} />)
          : bots.map((bot) => {
              const healthStatus = getBotHealthStatus(bot);
              const lastActivity =
                bot.activity.length > 0
                  ? bot.activity.sort(
                      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    )[0]
                  : null;
              const uptime = bot.lastSeen
                ? Math.floor((Date.now() - new Date(bot.lastSeen).getTime()) / (1000 * 60))
                : null;

              return (
                <div
                  key={bot.botId}
                  className="bg-dark-500 border-dark-400 border rounded-lg font-mono text-xs overflow-hidden hover:border-dark-200 hover:shadow-xl transition-all duration-200 ">
                  {/* Enhanced Header with More Info */}
                  <div className="bg-dark-400 px-3 py-2.5 border-b border-dark-300">
                    {/* Quick Stats Row */}
                    <div className="flex items-center justify-between text-xs text-light-400">
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-dark-500 rounded-full"></span>
                        {bot.activity.length} activities
                      </span>{' '}
                      <span
                        className={`px-1 py-0.5 rounded-md text-xs font-medium ${
                          bot.botState === 'running' &&
                          'text-emerald-300 bg-emerald-500/20 border border-emerald-500/30'
                        } ${
                          bot.botState === 'stopped' &&
                          'text-red-300 bg-red-500/20 border border-red-500/30'
                        } ${
                          bot.botState === 'idle' &&
                          'text-amber-300 bg-amber-500/20 border border-amber-500/30'
                        }`}>
                        {bot.botState.toUpperCase()}
                      </span>
                      {uptime !== null && (
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-light-500 rounded-full"></span>
                          {uptime < 60 ? `${uptime}m ago` : `${Math.floor(uptime / 60)}h ago`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Content */}
                  <div className="p-3 bg-dark-900 text-light-300">
                    {/* Selected Parameters Display */}
                    <div className="mb-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-light-500 font-medium">Selected Parameters:</span>
                        <button
                          onClick={() => openParameterModal(bot.botId)}
                          className="px-2 py-1 bg-purple-700/80 text-purple-200 rounded text-xs hover:bg-purple-600/80 border border-purple-600/30 transition-colors">
                          Settings
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {getBotSelectedParameters(bot.botId).length > 0 ? (
                          getBotSelectedParameters(bot.botId).map((param) => {
                            const paramInfo = AVAILABLE_PARAMETERS.find((p) => p.value === param);
                            return (
                              <span
                                key={param}
                                className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-xs border border-emerald-500/30"
                                title={paramInfo?.description}>
                                {paramInfo?.label || param}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-light-400 text-xs italic">
                            No parameters selected
                          </span>
                        )}
                      </div>

                      {/* Current Running Parameters */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-light-500 font-medium min-w-[45px]">Running:</span>
                        <span className="text-light-300 bg-dark-600 px-2 py-0.5 rounded text-xs border border-dark-600">
                          {bot.parameters?.length > 0 ? bot.parameters.join(', ') : 'none'}
                        </span>
                      </div>

                      {bot.webhookUrl && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-light-500 font-medium min-w-[45px]">Hook:</span>
                          <span
                            className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-xs border border-blue-500/20 truncate max-w-[120px]"
                            title={bot.webhookUrl}>
                            {bot.webhookUrl.split('/').pop()}
                          </span>
                        </div>
                      )}

                      {lastActivity && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-light-500 font-medium min-w-[45px]">Last:</span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs border ${
                              lastActivity.status === 'completed'
                                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                : lastActivity.status === 'failed'
                                ? 'text-red-400 bg-red-500/10 border-red-500/20'
                                : lastActivity.status === 'in-progress'
                                ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                                : 'text-light-400 bg-dark-500/10 border-dark-500/20'
                            }`}>
                            {lastActivity.type} - {lastActivity.status || 'unknown'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div className="flex gap-1 mb-3">
                      {bot.botState === 'stopped' || bot.botState === 'idle' ? (
                        <>
                          <button
                            onClick={() => startBotWithSelectedParams(bot.botId)}
                            className="px-2 py-1.5 bg-emerald-700/80 text-emerald-200 rounded-md text-xs hover:bg-emerald-600/80 border border-emerald-600/30 transition-colors">
                            Start
                          </button>
                          <button
                            onClick={() => handleDeleteBot(bot.botId)}
                            className="px-2 py-1.5 bg-red-700/80 text-red-200 rounded-md text-xs hover:bg-red-600/80 border border-red-600/30 transition-colors">
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setBotState(bot.botId, 'stopped')}
                            className="px-2 py-1.5 bg-red-700/80 text-red-200 rounded-md text-xs hover:bg-red-600/80 border border-red-600/30 transition-colors">
                            Stop
                          </button>
                          <button
                            onClick={() => restartBot(bot)}
                            className="px-2 py-1.5 bg-cyan-700/80 text-cyan-200 rounded-md text-xs hover:bg-cyan-600/80 border border-cyan-600/30 transition-colors">
                            Restart
                          </button>
                        </>
                      )}
                    </div>

                    {/* Enhanced Command Input */}
                    <div className="flex gap-1 mb-3 items-center text-white bg-dark-600 rounded-md border border-dark-600 p-2">
                      <span className="text-emerald-400 font-medium">{'>'}</span>
                      <input
                        type="text"
                        value={commandInputs[bot.botId] || ''}
                        onChange={(e) =>
                          setCommandInputs({ ...commandInputs, [bot.botId]: e.target.value })
                        }
                        placeholder="command..."
                        className="bg-transparent border-none outline-none text-emerald-300 flex-1 pl-2 text-xs placeholder-dark-100"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            sendCommand(bot.botId);
                          }
                        }}
                      />
                      <button
                        onClick={() => sendCommand(bot.botId)}
                        className="px-2 py-1 bg-emerald-700/80 text-emerald-200 rounded text-xs hover:bg-emerald-600/80 border border-emerald-600/30 transition-colors">
                        Send
                      </button>
                    </div>

                    {/* Enhanced Activity Output */}
                    {bot.activity.length > 0 && (
                      <div className="border-t border-dark-600 pt-3">
                        <div className="text-xs text-light-400 mb-2 font-medium">
                          Recent Activity:
                        </div>
                        <div className="bg-dark-800 border border-dark-500 rounded-md p-2 max-h-48 overflow-y-auto __dokmai_scrollbar">
                          {bot.activity
                            .sort(
                              (a, b) =>
                                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                            )
                            .slice(0, 5)
                            .map((activity, index) => (
                              <div
                                key={index}
                                className="mb-3 pb-2 border-b border-dark-600/30 last:border-b-0">
                                {/* Activity Header */}
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-light-500">
                                    [{formatTime(activity.timestamp)}]
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-xs px-1.5 py-0.5 rounded ${
                                        activity.type === 'error'
                                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                          : activity.type === 'command'
                                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      }`}>
                                      {activity.type}
                                    </span>
                                    <span
                                      className={`text-xs px-1.5 py-0.5 rounded ${
                                        activity.status === 'completed'
                                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                          : activity.status === 'failed'
                                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                          : activity.status === 'in-progress'
                                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                          : 'bg-dark-500/20 text-light-400 border border-dark-500/30'
                                      }`}>
                                      {activity.status || 'unknown'}
                                    </span>
                                  </div>
                                </div>

                                {/* Activity Message */}
                                <div className="text-xs text-light-300 mb-1">
                                  {activity.message || 'No message available'}
                                </div>

                                {/* Command */}
                                {activity.command && (
                                  <div className="text-xs mb-1">
                                    <span className="text-blue-400">$ </span>
                                    <span className="text-emerald-400">{activity.command}</span>
                                  </div>
                                )}

                                {/* Output */}
                                {activity.output && (
                                  <div className="bg-dark-600 border border-dark-600 rounded p-2 mt-1">
                                    <div className="text-xs text-emerald-400 mb-1">Output:</div>
                                    <pre className="text-xs text-light-300 whitespace-pre-wrap overflow-x-auto max-h-24 overflow-y-auto">
                                      {activity.output}
                                    </pre>
                                  </div>
                                )}

                                {/* Error */}
                                {activity.error && (
                                  <div className="bg-red-900/20 border border-red-600/30 rounded p-2 mt-1">
                                    <div className="text-xs text-red-400 mb-1">Error:</div>
                                    <pre className="text-xs text-red-300 whitespace-pre-wrap overflow-x-auto max-h-24 overflow-y-auto">
                                      {activity.error}
                                    </pre>
                                    <button
                                      onClick={() =>
                                        navigator.clipboard.writeText(activity.error || '')
                                      }
                                      className="text-xs text-blue-400 hover:text-blue-300 mt-1">
                                      Copy Error
                                    </button>
                                  </div>
                                )}

                                {/* Details */}
                                {activity.details && Object.keys(activity.details).length > 0 && (
                                  <div className="bg-dark-700 border border-dark-600 rounded p-2 mt-1">
                                    <div className="text-xs text-amber-400 mb-1">Details:</div>
                                    <div className="text-xs text-light-300 space-y-1">
                                      {Object.entries(activity.details).map(([key, value]) => (
                                        <div key={key} className="flex gap-2">
                                          <span className="text-amber-400">{key}:</span>
                                          <span className="break-all">{JSON.stringify(value)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Copy ID */}
                    <div className="flex items-center justify-between border-t border-dark-600 pt-2 mt-2">
                      <span className="text-xs text-light-500">ID: {bot.botId}</span>
                      <CopyToClipboard textToCopy={bot.botId.replace('bot-', '')} />
                    </div>
                  </div>
                </div>
              );
            })}

        {/* Confirmation Modals */}
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-dark-600 p-6 rounded-lg border border-dark-600 max-w-md">
              <h4 className="text-light-100 font-bold">Are you sure?</h4>
              <p className="text-light-400 mt-2">{confirmMessage}</p>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-3 py-2 bg-dark-600 text-light-200 rounded-md hover:bg-dark-500 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={confirmMassAction}
                  className="px-3 py-2 bg-red-600 text-red-100 rounded-md hover:bg-red-500 transition-colors">
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-dark-600 p-6 rounded-lg border border-dark-600 max-w-md">
              <h4 className="text-light-100 font-bold">Delete Bot</h4>
              <p className="text-light-400 mt-2">
                Are you sure you want to permanently delete bot{' '}
                <span className="font-mono text-red-400">{botToDelete}</span>?
              </p>
              <p className="text-red-400 text-xs mt-2">
                This action cannot be undone. All bot data and activity history will be lost.
              </p>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setBotToDelete(null);
                  }}
                  className="px-3 py-2 bg-dark-600 text-light-200 rounded-md hover:bg-dark-500 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteBot}
                  className="px-3 py-2 bg-red-600 text-red-100 rounded-md hover:bg-red-500 transition-colors">
                  Delete Bot
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Parameter Selection Modal */}
        {showParameterModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-dark-600 p-6 rounded-lg border border-dark-600 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-light-100 font-bold text-lg">
                  Configure Parameters for Bot {currentBotForParams}
                </h4>
                <button
                  onClick={closeParameterModal}
                  className="text-light-400 hover:text-light-200 text-xl">
                  ×
                </button>
              </div>

              <p className="text-light-400 text-sm mb-4">
                Select the parameters you want this bot to use when starting. You can select
                multiple parameters.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {AVAILABLE_PARAMETERS.map((param) => (
                  <div
                    key={param.value}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      tempSelectedParams.includes(param.value)
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-dark-700 border-dark-500 text-light-300 hover:border-dark-400'
                    }`}
                    onClick={() => toggleParameter(param.value)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={tempSelectedParams.includes(param.value)}
                          onChange={() => toggleParameter(param.value)}
                          className="w-4 h-4 text-emerald-600 bg-dark-800 border-dark-600 rounded focus:ring-emerald-500"
                        />
                        <span className="font-medium text-sm">{param.label}</span>
                      </div>
                      <span className="text-xs font-mono text-light-500">{param.value}</span>
                    </div>
                    <p className="text-xs text-light-400 mt-1 ml-6">{param.description}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-dark-500 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-light-300 text-sm font-medium">
                    Selected Parameters ({tempSelectedParams.length}):
                  </span>
                  {tempSelectedParams.length > 0 && (
                    <button
                      onClick={() => setTempSelectedParams([])}
                      className="text-xs text-red-400 hover:text-red-300">
                      Clear All
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
                  {tempSelectedParams.length > 0 ? (
                    tempSelectedParams.map((param) => {
                      const paramInfo = AVAILABLE_PARAMETERS.find((p) => p.value === param);
                      return (
                        <span
                          key={param}
                          className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-xs border border-emerald-500/30 flex items-center gap-1">
                          {paramInfo?.label || param}
                          <button
                            onClick={() => toggleParameter(param)}
                            className="text-emerald-400 hover:text-emerald-200 ml-1">
                            ×
                          </button>
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-light-500 text-xs italic">No parameters selected</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeParameterModal}
                  className="px-4 py-2 bg-dark-700 text-light-200 rounded-md hover:bg-dark-600 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={applyParameters}
                  className="px-4 py-2 bg-emerald-600 text-emerald-100 rounded-md hover:bg-emerald-500 transition-colors">
                  Apply Parameters
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
