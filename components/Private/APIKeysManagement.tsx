'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { formatTime } from '@/lib/utils';

interface ApiKey {
  resetDate: Date;
  key: string;
  remainingLimit: number;
}

const APIKeysManagement = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
  const [currentKey, setCurrentKey] = useState<ApiKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const fetchKeys = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/v2/apikey_management');
      if (!response.ok) throw new Error('Failed to fetch API keys');
      const data: ApiKey[] = await response.json();
      setApiKeys(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleAddKeys = async (keysInput: string) => {
    setError('');
    setSuccess('');
    const lines = keysInput.split('\n').filter((line) => line.trim() !== '');
    const keysToAdd = lines
      .map((line) => {
        const parts = line.split(/\t|\|/);
        if (parts.length !== 2) return null;
        const key = parts[0].trim();
        const remainingLimit = parseInt(parts[1].trim(), 10);
        if (isNaN(remainingLimit) || remainingLimit < 0) return null;
        return { key, remainingLimit };
      })
      .filter((key) => key !== null);

    if (keysToAdd.length === 0) {
      setError('No valid API keys provided');
      return;
    }

    try {
      setLoading(true);
      for (const keyData of keysToAdd) {
        const response = await fetch('/api/v2/apikey_management', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(keyData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to add API key ${keyData.key}: ${errorData.error}`);
        }
      }
      setSuccess('API keys added successfully');
      fetchKeys();
    } catch (err) {
      setError((err as Error).message);
    }
    setDialogMode(null);
  };

  const handleUpdateKey = async (key: string, remainingLimit: number) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/v2/apikey_management', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, remainingLimit }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update API key');
      }
      setSuccess('API key updated successfully');
      fetchKeys();
    } catch (err) {
      setError((err as Error).message);
    }
    setDialogMode(null);
  };

  const handleDelete = async (key: string) => {
    if (confirm('Are you sure you want to delete this API key?')) {
      setError('');
      setSuccess('');
      try {
        const response = await fetch('/api/v2/apikey_management', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete API key');
        }
        setSuccess('API key deleted successfully');
        fetchKeys();
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  const handleSubmit = (
    data: { mode: 'add'; keysInput: string } | { mode: 'edit'; key: string; remainingLimit: number }
  ) => {
    if (data.mode === 'add') {
      handleAddKeys(data.keysInput);
    } else if (data.mode === 'edit') {
      handleUpdateKey(data.key, data.remainingLimit);
    }
  };

  const openAddDialog = () => setDialogMode('add');
  const openEditDialog = (key: ApiKey) => {
    setCurrentKey(key);
    setDialogMode('edit');
  };

  return (
    <div className="p-6 bg-dark-800 text-light-100 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">API Keys Management</h1>
      {error && (
        <Alert variant="destructive" className="mb-4 bg-red-500/10 text-red-500 border-dark-800">
          {error}
        </Alert>
      )}
      {success && (
        <Alert className="mb-4 bg-green-500/10 text-green-500 border-dark-800">{success}</Alert>
      )}
      <button
        onClick={openAddDialog}
        className="mb-5 text-xs bg-primary text-dark-800 hover:bg-primary/90">
        Add API Keys
      </button>
      {loading ? (
        <Skeleton className="h-32 w-fit bg-dark-700" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 max-h-[800px] overflow-y-auto __dokmai_scrollbar w-fit p-5 bg-dark-800 border-dark-500/70 border-[1px]">
          {apiKeys.map((key) => (
            <ApiKeyCard
              key={key.key}
              apiKey={key}
              onEdit={() => openEditDialog(key)}
              onDelete={() => handleDelete(key.key)}
            />
          ))}
        </div>
      )}
      <ApiKeyFormDialog
        mode={dialogMode}
        initialKey={dialogMode === 'edit' && currentKey ? currentKey.key : ''}
        initialRemainingLimit={dialogMode === 'edit' && currentKey ? currentKey.remainingLimit : 0}
        onSubmit={handleSubmit}
        onClose={() => setDialogMode(null)}
      />
    </div>
  );
};

interface ApiKeyCardProps {
  apiKey: ApiKey;
  onEdit: () => void;
  onDelete: () => void;
}

const ApiKeyCard = ({ apiKey, onEdit, onDelete }: ApiKeyCardProps) => (
  <Card className="bg-dark-700 border-dark-600 w-fit hover:shadow-lg transition-shadow">
    <CardContent className="p-5 text-xs text-light-100">
      <div>{apiKey.key}</div>
      <div>{apiKey.remainingLimit}</div>
      <div>{formatTime(apiKey.resetDate as unknown as string)}</div>
      <div className="mt-2 space-x-2">
        <button onClick={onEdit} className="bg-primary text-dark-800 hover:bg-primary/90">
          Edit
        </button>
        <button onClick={onDelete} className="bg-red-500 text-light-100 hover:bg-red-600">
          Delete
        </button>
      </div>
    </CardContent>
  </Card>
);

interface ApiKeyFormDialogProps {
  mode: 'add' | 'edit' | null;
  initialKey: string;
  initialRemainingLimit: number;
  onSubmit: (
    data: { mode: 'add'; keysInput: string } | { mode: 'edit'; key: string; remainingLimit: number }
  ) => void;
  onClose: () => void;
}

const ApiKeyFormDialog = ({
  mode,
  initialKey,
  initialRemainingLimit,
  onSubmit,
  onClose,
}: ApiKeyFormDialogProps) => {
  const [keysInput, setKeysInput] = useState('');
  const [key, setKey] = useState(initialKey);
  const [remainingLimit, setRemainingLimit] = useState(initialRemainingLimit);

  useEffect(() => {
    if (mode === 'edit' && initialKey && initialRemainingLimit) {
      setKey(initialKey);
      setRemainingLimit(initialRemainingLimit);
    } else {
      setKeysInput('');
    }
  }, [initialKey, initialRemainingLimit, mode]);

  const handleSubmit = () => {
    if (mode === 'add') {
      onSubmit({ mode: 'add', keysInput });
    } else if (mode === 'edit') {
      onSubmit({ mode: 'edit', key, remainingLimit: Number(remainingLimit) });
    }
    onClose();
  };

  return (
    <Dialog open={mode !== null} onOpenChange={onClose}>
      <DialogContent className="bg-dark-800 text-light-100 border-dark-600 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add API Keys' : 'Edit API Key'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {mode === 'add' ? (
            <div>
              <Label>API Keys (one per line, format: key\tlimit or key|limit)</Label>
              <Textarea
                value={keysInput}
                onChange={(e) => setKeysInput(e.target.value)}
                placeholder="apikey remain limit"
                className="bg-dark-700 text-light-100 border-dark-600 focus:border-primary focus:ring-primary"
                rows={10}
              />
            </div>
          ) : (
            <>
              <div>
                <Label>Key</Label>
                <Input
                  value={key}
                  disabled
                  className="bg-dark-700 text-light-100 border-dark-600"
                />
              </div>
              <div>
                <Label>Remaining Limit</Label>
                <Input
                  type="number"
                  value={remainingLimit}
                  onChange={(e) => setRemainingLimit(Number(e.target.value))}
                  min="0"
                  className="bg-dark-700 text-light-100 border-dark-600 focus:border-primary focus:ring-primary"
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <button onClick={onClose} className="border-primary text-primary hover:bg-primary/10">
            Cancel
          </button>
          <button onClick={handleSubmit} className="bg-primary text-dark-800 hover:bg-primary/90">
            {mode === 'add' ? 'Add' : 'Update'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default APIKeysManagement;
