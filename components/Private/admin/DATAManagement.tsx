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
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Pencil,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  MoreHorizontal,
  Eye,
  Download,
} from 'lucide-react';
import { formatTime, getAdminToken } from '@/lib/utils';
import { TbRefresh } from 'react-icons/tb';

interface IBANEntry {
  _id: string;
  firstName: string;
  lastName: string;
  iban: string;
  street: string;
  zipCode: string;
  city: string;
  date: string;
  botId: string;
  type: 'Used' | 'Bad' | 'Unused';
}

interface botIdData {
  botId: string;
  lastActivity: string | null;
}

const DATAManagement = () => {
  const [botIdData, setbotIdData] = useState<botIdData[]>([]);
  const [entries, setEntries] = useState<IBANEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [newEntryText, setNewEntryText] = useState('');
  const [newEntry, setNewEntry] = useState({
    firstName: '',
    lastName: '',
    iban: '',
    street: '',
    zipCode: '',
    city: '',
    botId: '',
    type: 'Unused' as 'Used' | 'Bad' | 'Unused',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<IBANEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<IBANEntry | null>(null);
  const [selectedViewEntry, setSelectedViewEntry] = useState<IBANEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [counts, setCounts] = useState({ Used: 0, Unused: 0, Bad: 0 });
  const [countsLoading, setCountsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const fetchCounts = async () => {
    try {
      setCountsLoading(true);
      const token = getAdminToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`/api/v2/DATAManagement?type=All&countsOnly=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch counts');
      setCounts(data.counts);
    } catch (err) {
      console.error('Failed to fetch counts:', err);
    } finally {
      setCountsLoading(false);
    }
  };

  const fetchEntries = async () => {
    setIsRefreshing(true);
    try {
      setLoading(true);
      const token = getAdminToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(
        `/api/v2/DATAManagement?type=${filterType}&page=${currentPage}&limit=${entriesPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch entries');
      setEntries(data.entries);
      setTotalEntries(data.total);
      setError(null);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch entries');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType]);

  useEffect(() => {
    fetchEntries();
  }, [filterType, currentPage, entriesPerPage]);

  const handleAdd = async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      if (!token) throw new Error('No authentication token found');

      const lines = newEntryText.split('\n').filter((line) => line.trim() !== '');
      const entriesToAdd = lines.map((line) => {
        const [firstName, lastName, iban, street, zipCode, city] = line.split('\t');
        return {
          firstName,
          lastName,
          iban,
          street,
          zipCode,
          city,
          botId: 'Admin Panel',
          type: 'Unused' as 'Used' | 'Bad' | 'Unused',
        };
      });

      const response = await fetch('/api/v2/DATAManagement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'add', data: entriesToAdd }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add entries');
      setSuccess('Entries added successfully');
      setNewEntryText('');
      setIsAddDialogOpen(false);
      fetchEntries();
      fetchCounts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to add entries');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedEntry) return;
    setLoading(true);
    try {
      const token = getAdminToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('/api/v2/DATAManagement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'update',
          data: [{ _id: selectedEntry._id, ...newEntry }],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update entry');
      setSuccess('Entry updated successfully');
      setIsEditDialogOpen(false);
      fetchEntries();
      fetchCounts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to update entry');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!entryToDelete) return;
    setLoading(true);
    try {
      const token = getAdminToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('/api/v2/DATAManagement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'remove', data: [entryToDelete._id] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete entry');
      setSuccess('Entry deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchEntries();
      fetchCounts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to delete entry');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleMassUpdate = async (type: 'Used' | 'Bad' | 'Unused') => {
    const updates = selectedRows.map((id) => ({ _id: id, type }));
    setLoading(true);
    try {
      const token = getAdminToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('/api/v2/DATAManagement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'update', data: updates }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update entries');
      setSuccess('Entries updated successfully');
      setSelectedRows([]);
      fetchEntries();
      fetchCounts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to update entries');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleMassDelete = async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('/api/v2/DATAManagement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'remove', data: selectedRows }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to remove entries');
      setSuccess('Entries removed successfully');
      setSelectedRows([]);
      fetchEntries();
      fetchCounts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to remove entries');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleEditClick = (entry: IBANEntry) => {
    setSelectedEntry(entry);
    setNewEntry({
      firstName: entry.firstName,
      lastName: entry.lastName,
      iban: entry.iban,
      street: entry.street,
      zipCode: entry.zipCode,
      city: entry.city,
      botId: entry.botId,
      type: entry.type,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (entry: IBANEntry) => {
    setEntryToDelete(entry);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = (entry: IBANEntry) => {
    setSelectedViewEntry(entry);
    setIsViewDialogOpen(true);
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      const token = getAdminToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('/api/v2/DATAManagement?exportAll=true', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to export entries');

      // Sort entries by date (newest first) on client side to avoid MongoDB memory limit
      const sortedEntries = data.entries.sort(
        (a: IBANEntry, b: IBANEntry) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Create tab-separated content
      const headers = [
        'First Name',
        'Last Name',
        'IBAN',
        'Street',
        'Zip Code',
        'City',
        'Bot ID',
        'Type',
        'Date',
      ];

      const csvContent = [
        headers.join('\t'),
        ...sortedEntries.map((entry: IBANEntry) =>
          [
            entry.firstName,
            entry.lastName,
            entry.iban,
            entry.street,
            entry.zipCode,
            entry.city,
            entry.botId,
            entry.type,
            formatTime(entry.date),
          ].join('\t')
        ),
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `iban-entries-export-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(`Successfully exported ${data.entries.length} entries`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to export entries');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const getTypeBadgeColor = (type: 'Used' | 'Bad' | 'Unused') => {
    switch (type) {
      case 'Used':
        return 'bg-green-500/20 hover:bg-green-500/40 text-green-500';
      case 'Bad':
        return 'bg-red-500/20 hover:bg-red-500/40 text-red-500';
      case 'Unused':
        return 'bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-500';
      default:
        return 'bg-gray-500/20 hover:bg-gray-500/40 text-gray-500';
    }
  };

  const TableRowSkeleton = () => (
    <TableRow className="border-dark-500">
      <TableCell>
        <Skeleton className="h-4 w-4 bg-dark-400 animate-pulse" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24 bg-dark-400 animate-pulse" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32 bg-dark-400 animate-pulse" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16 bg-dark-400 animate-pulse" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-8 bg-dark-400 animate-pulse" />
      </TableCell>
    </TableRow>
  );

  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const start = (currentPage - 1) * entriesPerPage + 1;
  const end = Math.min(currentPage * entriesPerPage, totalEntries);

  return (
    <Card className="w-full  bg-dark-700 border-dark-600 text-light-100 transition-all duration-200">
      <CardHeader>
        <div className="flex flex-col justify-between gap-5">
          <div className="w-full flex justify-between">
            <CardTitle className="text-light-100 text-lg sm:text-xl">Manage IBAN</CardTitle>
            <button
              onClick={fetchEntries}
              className="p-1 text-sm rounded-sm h-fit font-aktivGroteskBold bg-primary text-dark-800 hover:bg-primary/70 hover:text-dark-800"
              title="Refresh data">
              <TbRefresh className={`text-xl ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex flex-col gap-2 w-full justify-between">
            <div className="flex gap-5 mt-2">
              {countsLoading ? (
                <>
                  <Skeleton className="h-4 w-16 bg-dark-400 animate-pulse" />
                  <Skeleton className="h-4 w-16 bg-dark-400 animate-pulse" />
                  <Skeleton className="h-4 w-16 bg-dark-400 animate-pulse" />
                </>
              ) : (
                <>
                  <span className="text-light-300">Used: {counts.Used}</span>
                  <span className="text-light-300">Unused: {counts.Unused}</span>
                  <span className="text-light-300">Bad: {counts.Bad}</span>
                </>
              )}
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px] bg-dark-500 border-dark-400 text-light-100">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-dark-500 border-dark-400 text-light-100">
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Used">Used</SelectItem>
                <SelectItem value="Bad">Bad</SelectItem>
                <SelectItem value="Unused">Unused</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 flex-wrap">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <button className="bg-primary hover:bg-primary/90 text-dark-800 transition-colors duration-200 w-fit">
                    Add Entry
                  </button>
                </DialogTrigger>
              </Dialog>
              <button
                onClick={handleExportAll}
                disabled={isExporting}
                className="bg-blue-600 hover:bg-blue-700 text-light-100 transition-colors duration-200 w-fit px-4 py-2 rounded flex items-center gap-2">
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Save All
                  </>
                )}
              </button>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogContent className="bg-dark-600 border-dark-500 text-light-100 w-[calc(100%-2rem)] sm:w-auto sm:max-w-md mx-auto transition-all duration-200">
                <DialogHeader>
                  <DialogTitle className="text-light-100">Add New IBAN Entries</DialogTitle>
                  <DialogDescription className="text-light-500">
                    Paste multiple entries, each on a new line, separated by tabs (e.g., First
                    Name\tLast Name\tIBAN\tStreet\tZip Code\tCity).
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label htmlFor="entries" className="text-light-200">
                    Entries (tab-separated)
                  </Label>
                  <textarea
                    id="entries"
                    placeholder="Paste entries here, one per line"
                    value={newEntryText}
                    onChange={(e) => setNewEntryText(e.target.value)}
                    className="bg-dark-500 border-dark-400 text-light-100 h-40 w-full p-2"
                  />
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setIsAddDialogOpen(false)}
                    className="bg-dark-500 border-dark-400 text-light-100 hover:bg-dark-400">
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-dark-800">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Add Entries
                      </>
                    )}
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4 bg-red-500/10 border-red-500 text-red-500">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 bg-green-500/10 border-green-500 text-green-500">
            <Check className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        {selectedRows.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="bg-dark-500 border-dark-400 text-light-100 hover:bg-dark-400">
                  Mass Update Type
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-dark-500 border-dark-400 text-light-100">
                <DropdownMenuItem
                  onClick={() => handleMassUpdate('Used')}
                  className="hover:bg-dark-400">
                  Used
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleMassUpdate('Bad')}
                  className="hover:bg-dark-400">
                  Bad
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleMassUpdate('Unused')}
                  className="hover:bg-dark-400">
                  Unused
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={handleMassDelete}
              className="bg-red-500 hover:bg-red-600 text-light-100">
              Delete Selected ({selectedRows.length})
            </button>
          </div>
        )}
        <div className="w-full overflow-x-auto max-h-[700px] __dokmai_scrollbar border border-dark-500">
          <div className="min-h-[400px]">
            <Table>
              <TableHeader className="bg-dark-600">
                <TableRow className="border-dark-500 hover:bg-dark-500">
                  <TableHead className="text-light-300">Select</TableHead>
                  <TableHead className="text-light-300">Time</TableHead>
                  <TableHead className="text-light-300">IBAN</TableHead>
                  <TableHead className="text-light-300">Type</TableHead>
                  <TableHead className="text-light-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, index) => <TableRowSkeleton key={index} />)
                ) : entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-light-300">
                      No entries found
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry._id} className="border-dark-500 hover:bg-dark-600">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(entry._id)}
                          onChange={() => handleRowSelect(entry._id)}
                        />
                      </TableCell>
                      <TableCell>{formatTime(entry.date)}</TableCell>
                      <TableCell>{entry.iban}</TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeColor(entry.type)}>{entry.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-light-300 hover:text-light-100 hover:bg-dark-500">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-dark-500 border-dark-400 text-light-100">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(entry)}
                              className="hover:bg-dark-400">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditClick(entry)}
                              className="hover:bg-dark-400">
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(entry)}
                              className="text-red-400 hover:text-red-400 hover:bg-dark-400">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-light-300">
          <div className="mb-2 sm:mb-0">
            <Select
              value={entriesPerPage.toString()}
              onValueChange={(value) => {
                setEntriesPerPage(Number(value));
                setCurrentPage(1);
              }}>
              <SelectTrigger className="w-[180px] bg-dark-500 border-dark-400 text-light-100">
                <SelectValue placeholder="Entries per page" />
              </SelectTrigger>
              <SelectContent className="bg-dark-500 border-dark-400 text-light-100">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="bg-dark-500 border-dark-400 text-light-100 hover:bg-dark-400 disabled:opacity-50">
              {'<'}
            </button>
            <span>
              Page {totalEntries > 0 ? currentPage : 0} / {totalPages} ({totalEntries})
            </span>
            <button
              disabled={currentPage === totalPages || totalEntries === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="bg-dark-500 border-dark-400 text-light-100 hover:bg-dark-400 disabled:opacity-50">
              {'>'}
            </button>
          </div>
        </div>
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-dark-600 border-dark-500 text-light-100 w-[calc(100%-2rem)] sm:w-auto sm:max-w-md mx-auto transition-all duration-200">
          <DialogHeader>
            <DialogTitle className="text-light-100">Edit IBAN Entry</DialogTitle>
            <DialogDescription className="text-light-500">
              Update the details of the selected IBAN entry.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-firstName" className="text-light-200">
                First Name
              </Label>
              <Input
                id="edit-firstName"
                name="firstName"
                placeholder="Enter first name"
                value={newEntry.firstName}
                onChange={(e) => setNewEntry({ ...newEntry, firstName: e.target.value })}
                className="bg-dark-500 border-dark-400 text-light-100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-lastName" className="text-light-200">
                Last Name
              </Label>
              <Input
                id="edit-lastName"
                name="lastName"
                placeholder="Enter last name"
                value={newEntry.lastName}
                onChange={(e) => setNewEntry({ ...newEntry, lastName: e.target.value })}
                className="bg-dark-500 border-dark-400 text-light-100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-iban" className="text-light-200">
                IBAN
              </Label>
              <Input
                id="edit-iban"
                name="iban"
                placeholder="Enter IBAN"
                value={newEntry.iban}
                onChange={(e) => setNewEntry({ ...newEntry, iban: e.target.value })}
                className="bg-dark-500 border-dark-400 text-light-100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-street" className="text-light-200">
                Street
              </Label>
              <Input
                id="edit-street"
                name="street"
                placeholder="Enter street"
                value={newEntry.street}
                onChange={(e) => setNewEntry({ ...newEntry, street: e.target.value })}
                className="bg-dark-500 border-dark-400 text-light-100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-zipCode" className="text-light-200">
                Zip Code
              </Label>
              <Input
                id="edit-zipCode"
                name="zipCode"
                placeholder="Enter zip code"
                value={newEntry.zipCode}
                onChange={(e) => setNewEntry({ ...newEntry, zipCode: e.target.value })}
                className="bg-dark-500 border-dark-400 text-light-100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-city" className="text-light-200">
                City
              </Label>
              <Input
                id="edit-city"
                name="city"
                placeholder="Enter city"
                value={newEntry.city}
                onChange={(e) => setNewEntry({ ...newEntry, city: e.target.value })}
                className="bg-dark-500 border-dark-400 text-light-100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-botId" className="text-light-200">
                Bot ID
              </Label>
              <Input
                id="edit-botId"
                name="botId"
                placeholder="Enter botId"
                value={newEntry.botId}
                onChange={(e) => setNewEntry({ ...newEntry, botId: e.target.value })}
                className="bg-dark-500 border-dark-400 text-light-100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-type" className="text-light-200">
                Type
              </Label>
              <Select
                value={newEntry.type}
                onValueChange={(value) =>
                  setNewEntry({ ...newEntry, type: value as 'Used' | 'Bad' | 'Unused' })
                }>
                <SelectTrigger className="bg-dark-500 border-dark-400 text-light-100">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-dark-500 border-dark-400 text-light-100">
                  <SelectItem value="Used">Used</SelectItem>
                  <SelectItem value="Bad">Bad</SelectItem>
                  <SelectItem value="Unused">Unused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setIsEditDialogOpen(false)}
              className="bg-dark-500 border-dark-400 text-light-100 hover:bg-dark-400">
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-dark-800">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-dark-600 border-dark-500 text-light-100 w-[calc(100%-2rem)] sm:w-auto sm:max-w-md mx-auto transition-all duration-200">
          <DialogHeader>
            <DialogTitle className="text-light-100">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-light-500">
              Are you sure you want to delete this entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setIsDeleteDialogOpen(false)}
              className="bg-dark-500 border-dark-400 text-light-100 hover:bg-dark-400">
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-light-100">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-dark-600 border-dark-500 text-light-100 w-[calc(100%-2rem)] sm:w-auto sm:max-w-md mx-auto transition-all duration-200">
          <DialogHeader>
            <DialogTitle className="text-light-100">IBAN Entry Details</DialogTitle>
            <DialogDescription className="text-light-500">
              Full details of the selected IBAN entry.
            </DialogDescription>
          </DialogHeader>
          {selectedViewEntry && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-4">
              <div className="text-light-200">First Name</div>
              <div className="text-light-100">{selectedViewEntry.firstName}</div>
              <div className="text-light-200">Last Name</div>
              <div className="text-light-100">{selectedViewEntry.lastName}</div>
              <div className="text-light-200">IBAN</div>
              <div className="text-light-100">{selectedViewEntry.iban}</div>
              <div className="text-light-200">Street</div>
              <div className="text-light-100">{selectedViewEntry.street}</div>
              <div className="text-light-200">Zip Code</div>
              <div className="text-light-100">{selectedViewEntry.zipCode}</div>
              <div className="text-light-200">City</div>
              <div className="text-light-100">{selectedViewEntry.city}</div>
              <div className="text-light-200">Bot ID</div>
              <div className="text-light-100">{selectedViewEntry.botId}</div>
              <div className="text-light-200">Type</div>
              <div className="text-light-100">{selectedViewEntry.type}</div>
              <div className="text-light-200">Date</div>
              <div className="text-light-100">{formatTime(selectedViewEntry.date)}</div>
            </div>
          )}
          <DialogFooter>
            <button
              onClick={() => setIsViewDialogOpen(false)}
              className="bg-dark-500 border-dark-400 text-light-100 hover:bg-dark-400">
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DATAManagement;
