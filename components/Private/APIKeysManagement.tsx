'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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

interface ApiKey {
  key: string;
  limit: number;
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

  const handleAddKey = async (key: string, limit: number) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/v2/apikey_management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, limit }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add API key');
      }
      setSuccess('API key added successfully');
      fetchKeys();
    } catch (err) {
      setError((err as Error).message);
    }
    setDialogMode(null);
  };

  const handleUpdateKey = async (key: string, limit: number) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/v2/apikey_management', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, limit }),
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

  const openAddDialog = () => setDialogMode('add');
  const openEditDialog = (key: ApiKey) => {
    setCurrentKey(key);
    setDialogMode('edit');
  };

  return (
    <div className="p-6 bg-dark-800 text-light-100 mx-auto max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">API Keys Management</h1>
      {error && (
        <Alert variant="destructive" className="mb-4 bg-red-500/10 text-red-500 border-dark-800">
          {error}
        </Alert>
      )}
      {success && (
        <Alert className="mb-4 bg-green-500/10 text-green-500 border-dark-800">{success}</Alert>
      )}
      <Button
        onClick={openAddDialog}
        className="mb-5 text-xs bg-primary text-dark-800 hover:bg-primary/90">
        Add API Key
      </Button>
      {loading ? (
        <Skeleton className="h-32 w-full bg-dark-700" />
      ) : (
        <div className="gap-5 flex flex-col max-h-[800px] overflow-y-auto __dokmai_scrollbar w-full p-5 bg-dark-800 border-dark-500/70 border-[1px]">
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
        initialLimit={dialogMode === 'edit' && currentKey ? currentKey.limit : 0}
        onSubmit={dialogMode === 'add' ? handleAddKey : handleUpdateKey}
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
  <Card className="bg-dark-700 border-dark-600 w-full hover:shadow-lg transition-shadow">
    <CardContent className="p-4 text-light-100">
      <div>{apiKey.key}</div>
      <div>{apiKey.limit}</div>
      <div className="mt-2 space-x-2">
        <Button onClick={onEdit} className="bg-primary text-dark-800 hover:bg-primary/90">
          Edit
        </Button>
        <Button
          variant="destructive"
          onClick={onDelete}
          className="bg-red-500 text-light-100 hover:bg-red-600">
          Delete
        </Button>
      </div>
    </CardContent>
  </Card>
);

interface ApiKeyFormDialogProps {
  mode: 'add' | 'edit' | null;
  initialKey: string;
  initialLimit: number;
  onSubmit: (key: string, limit: number) => void;
  onClose: () => void;
}

const ApiKeyFormDialog = ({
  mode,
  initialKey,
  initialLimit,
  onSubmit,
  onClose,
}: ApiKeyFormDialogProps) => {
  const [key, setKey] = useState(initialKey);
  const [limit, setLimit] = useState(initialLimit);

  useEffect(() => {
    setKey(initialKey);
    setLimit(initialLimit);
  }, [initialKey, initialLimit]);

  const handleSubmit = () => {
    if (!key || limit < 0) {
      alert('Key cannot be empty and limit must be non-negative.');
      return;
    }
    onSubmit(key, Number(limit));
  };

  return (
    <Dialog open={mode !== null} onOpenChange={onClose}>
      <DialogContent className="bg-dark-800 text-light-100 border-dark-600 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add API Key' : 'Edit API Key'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Key</Label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              disabled={mode === 'edit'}
              className="bg-dark-700 text-light-100 border-dark-600 focus:border-primary focus:ring-primary"
            />
          </div>
          <div>
            <Label>Limit</Label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              min="0"
              className="bg-dark-700 text-light-100 border-dark-600 focus:border-primary focus:ring-primary"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-primary text-primary hover:bg-primary/10">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-primary text-dark-800 hover:bg-primary/90">
            {mode === 'add' ? 'Add' : 'Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default APIKeysManagement;
