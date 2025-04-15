/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface IBANEntry {
  _id: string;
  firstName: string;
  lastName: string;
  iban: string;
  street: string;
  zipCode: string;
  city: string;
  date: string;
  license: string;
  type: 'Used' | 'Bad' | 'Unused';
}

interface LicenseData {
  license: string;
  lastActivity: string | null;
}

const DATAManagement = () => {
  const [licenseData, setLicenseData] = useState<LicenseData[]>([]);
  const [entries, setEntries] = useState<IBANEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [newEntry, setNewEntry] = useState({
    firstName: '',
    lastName: '',
    iban: '',
    street: '',
    zipCode: '',
    city: '',
    license: '',
    type: 'Unused' as 'Used' | 'Bad' | 'Unused',
  });

  const fetchLicenses = async () => {
    try {
      const response = await fetch('/api/v2/get_thebot_licenses');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch licenses');
      setLicenseData(data.licenses);
    } catch (err) {
      console.error('Error fetching licenses:', err);
    }
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v2/DATAManagement?type=${filterType}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch entries');
      setEntries(data.entries);
    } catch (err) {
      setError((err as string) || 'Failed to fetch entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [filterType]);
  const handleAdd = async () => {
    try {
      const response = await fetch('/api/v2/DATAManagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', data: [newEntry] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add entry');
      setNewEntry({
        firstName: '',
        lastName: '',
        iban: '',
        street: '',
        zipCode: '',
        city: '',
        license: '',
        type: 'Unused',
      });
      fetchEntries();
    } catch (err) {
      setError((err as string) || 'Failed to add entry');
    }
  };

  const handleUpdate = async (updates: Partial<IBANEntry>[]) => {
    try {
      const response = await fetch('/api/v2/DATAManagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', data: updates }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update entries');
      fetchEntries();
      setSelectedRows([]);
    } catch (err) {
      setError((err as string) || 'Failed to update entries');
    }
  };

  const handleRemove = async (ids: string[]) => {
    try {
      const response = await fetch('/api/v2/DATAManagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', data: ids }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to remove entries');
      fetchEntries();
      setSelectedRows([]);
    } catch (err) {
      setError((err as string) || 'Failed to remove entries');
    }
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleMassUpdateType = (type: 'Used' | 'Bad' | 'Unused') => {
    const updates = selectedRows.map((id) => ({
      _id: id,
      type,
    }));
    handleUpdate(updates);
  };

  return (
    <div className="p-5 border-[1px] border-dark-500 bg-dark-700 w-full max-w-4xl md:min-w-[500px]">
      <div className="bg-dark-600 p-5 rounded-sm mt-5">
        <h4 className="text-lg font-bold text-light-500 mb-4">Add New IBAN Entry</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="First Name"
            value={newEntry.firstName}
            onChange={(e) => setNewEntry({ ...newEntry, firstName: e.target.value })}
          />
          <Input
            placeholder="Last Name"
            value={newEntry.lastName}
            onChange={(e) => setNewEntry({ ...newEntry, lastName: e.target.value })}
          />
          <Input
            placeholder="IBAN"
            value={newEntry.iban}
            onChange={(e) => setNewEntry({ ...newEntry, iban: e.target.value })}
          />
          <Input
            placeholder="Street"
            value={newEntry.street}
            onChange={(e) => setNewEntry({ ...newEntry, street: e.target.value })}
          />
          <Input
            placeholder="Zip Code"
            value={newEntry.zipCode}
            onChange={(e) => setNewEntry({ ...newEntry, zipCode: e.target.value })}
          />
          <Input
            placeholder="City"
            value={newEntry.city}
            onChange={(e) => setNewEntry({ ...newEntry, city: e.target.value })}
          />
          <Input
            placeholder="License"
            value={newEntry.license}
            onChange={(e) => setNewEntry({ ...newEntry, license: e.target.value })}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">{newEntry.type}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {['Used', 'Bad', 'Unused'].map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() =>
                    setNewEntry({ ...newEntry, type: type as 'Used' | 'Bad' | 'Unused' })
                  }>
                  {type}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button onClick={handleAdd} className="mt-4">
          Add Entry
        </Button>
      </div>

      {selectedRows.length > 0 && (
        <div className="bg-dark-600 p-5 rounded-sm mt-5 flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Mass Update Type</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {['Used', 'Bad', 'Unused'].map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => handleMassUpdateType(type as 'Used' | 'Bad' | 'Unused')}>
                  {type}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="destructive" onClick={() => handleRemove(selectedRows)}>
            Delete Selected ({selectedRows.length})
          </Button>
        </div>
      )}

      <div className="bg-dark-600 p-5 rounded-sm mt-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Select</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>IBAN</TableHead>
              <TableHead>Street</TableHead>
              <TableHead>Zip Code</TableHead>
              <TableHead>City</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry._id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(entry._id)}
                    onChange={() => handleRowSelect(entry._id)}
                  />
                </TableCell>
                <TableCell>{entry.firstName}</TableCell>
                <TableCell>{entry.lastName}</TableCell>
                <TableCell>{entry.iban}</TableCell>
                <TableCell>{entry.street}</TableCell>
                <TableCell>{entry.zipCode}</TableCell>
                <TableCell>{entry.city}</TableCell>
                <TableCell>{entry.license}</TableCell>
                <TableCell>{entry.type}</TableCell>
                <TableCell>
                  <Button variant="destructive" size="sm" onClick={() => handleRemove([entry._id])}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DATAManagement;
