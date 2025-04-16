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
import { Pencil, Trash2, Check, AlertCircle, Loader2, MoreHorizontal, Eye } from 'lucide-react';
import { formatTime } from '@/lib/utils';

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
  const [success, setSuccess] = useState<string | null>(null);
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<IBANEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<IBANEntry | null>(null);
  const [selectedViewEntry, setSelectedViewEntry] = useState<IBANEntry | null>(null);

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
      setError(null);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
    fetchEntries();
  }, [filterType]);

  const handleAdd = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v2/DATAManagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', data: [newEntry] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add entry');
      setSuccess('Entry added successfully');
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
      setIsAddDialogOpen(false);
      fetchEntries();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to add entry');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedEntry) return;
    setLoading(true);
    try {
      const response = await fetch('/api/v2/DATAManagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch('/api/v2/DATAManagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', data: [entryToDelete._id] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete entry');
      setSuccess('Entry deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchEntries();
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
      const response = await fetch('/api/v2/DATAManagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', data: updates }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update entries');
      setSuccess('Entries updated successfully');
      setSelectedRows([]);
      fetchEntries();
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
      const response = await fetch('/api/v2/DATAManagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', data: selectedRows }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to remove entries');
      setSuccess('Entries removed successfully');
      setSelectedRows([]);
      fetchEntries();
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
      license: entry.license,
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
        <Skeleton className="h-4 w-4" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-8" />
      </TableCell>
    </TableRow>
  );

  const usedCount = entries.filter((entry) => entry.type === 'Used').length;
  const unusedCount = entries.filter((entry) => entry.type === 'Unused').length;
  const badCount = entries.filter((entry) => entry.type === 'Bad').length;

  return (
    <Card className="w-full bg-dark-700 border-dark-600 text-light-100 transition-all duration-200">
      <CardHeader>
        <div className="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-light-100 text-lg sm:text-xl">Manage IBAN</CardTitle>
            <div className="flex gap-4 mt-2">
              <span className="text-light-300">Used: {usedCount}</span>
              <span className="text-light-300">Unused: {unusedCount}</span>
              <span className="text-light-300">Bad: {badCount}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchEntries}
              className="bg-primary hover:bg-primary/90 text-dark-800 transition-colors duration-200">
              Refresh
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-dark-800 transition-colors duration-200">
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-dark-600 border-dark-500 text-light-100 w-[calc(100%-2rem)] sm:w-auto sm:max-w-md mx-auto transition-all duration-200">
                <DialogHeader>
                  <DialogTitle className="text-light-100">Add New IBAN Entry</DialogTitle>
                  <DialogDescription className="text-light-500">
                    Create a new IBAN entry with the following details.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName" className="text-light-200">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Enter first name"
                      value={newEntry.firstName}
                      onChange={(e) => setNewEntry({ ...newEntry, firstName: e.target.value })}
                      className="bg-dark-500 border-dark-400 text-light-100"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName" className="text-light-200">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Enter last name"
                      value={newEntry.lastName}
                      onChange={(e) => setNewEntry({ ...newEntry, lastName: e.target.value })}
                      className="bg-dark-500 border-dark-400 text-light-100"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="iban" className="text-light-200">
                      IBAN
                    </Label>
                    <Input
                      id="iban"
                      name="iban"
                      placeholder="Enter IBAN"
                      value={newEntry.iban}
                      onChange={(e) => setNewEntry({ ...newEntry, iban: e.target.value })}
                      className="bg-dark-500 border-dark-400 text-light-100"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="street" className="text-light-200">
                      Street
                    </Label>
                    <Input
                      id="street"
                      name="street"
                      placeholder="Enter street"
                      value={newEntry.street}
                      onChange={(e) => setNewEntry({ ...newEntry, street: e.target.value })}
                      className="bg-dark-500 border-dark-400 text-light-100"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="zipCode" className="text-light-200">
                      Zip Code
                    </Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      placeholder="Enter zip code"
                      value={newEntry.zipCode}
                      onChange={(e) => setNewEntry({ ...newEntry, zipCode: e.target.value })}
                      className="bg-dark-500 border-dark-400 text-light-100"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="city" className="text-light-200">
                      City
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="Enter city"
                      value={newEntry.city}
                      onChange={(e) => setNewEntry({ ...newEntry, city: e.target.value })}
                      className="bg-dark-500 border-dark-400 text-light-100"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="license" className="text-light-200">
                      License
                    </Label>
                    <Input
                      id="license"
                      name="license"
                      placeholder="Enter license"
                      value={newEntry.license}
                      onChange={(e) => setNewEntry({ ...newEntry, license: e.target.value })}
                      className="bg-dark-500 border-dark-400 text-light-100"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type" className="text-light-200">
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
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="bg-dark-500 border-dark-400 text-light-100 hover:bg-dark-400">
                    Cancel
                  </Button>
                  <Button
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
                        Add Entry
                      </>
                    )}
                  </Button>
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
                <Button
                  variant="outline"
                  className="bg-dark-500 border-dark-400 text-light-100 hover:bg-dark-400">
                  Mass Update Type
                </Button>
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
            <Button
              variant="destructive"
              onClick={handleMassDelete}
              className="bg-red-500 hover:bg-red-600 text-light-100">
              Delete Selected ({selectedRows.length})
            </Button>
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
                  <TableHead className="text-light-300">License</TableHead>
                  <TableHead className="text-light-300">Type</TableHead>
                  <TableHead className="text-light-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => <TableRowSkeleton key={index} />)
                ) : entries.length === 0 ? (
                  <TableRow className="border-dark-500 hover:bg-dark-600">
                    <TableCell colSpan={6} className="text-center py-8 text-light-400">
                      No entries found. Add a new entry to get started.
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
                      <TableCell>{entry.license}</TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeColor(entry.type)}>{entry.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-light-300 hover:text-light-100 hover:bg-dark-500">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
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
              <Label htmlFor="edit-license" className="text-light-200">
                License
              </Label>
              <Input
                id="edit-license"
                name="license"
                placeholder="Enter license"
                value={newEntry.license}
                onChange={(e) => setNewEntry({ ...newEntry, license: e.target.value })}
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
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="bg-dark-500 border-dark-400 text-light-100 hover:bg-dark-400">
              Cancel
            </Button>
            <Button
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
            </Button>
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
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="bg-dark-500 border-dark-400 text-light-100 hover:bg-dark-400">
              Cancel
            </Button>
            <Button
              variant="destructive"
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
            </Button>
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
              <div className="text-light-200">License</div>
              <div className="text-light-100">{selectedViewEntry.license}</div>
              <div className="text-light-200">Type</div>
              <div className="text-light-100">{selectedViewEntry.type}</div>
              <div className="text-light-200">Date</div>
              <div className="text-light-100">{formatTime(selectedViewEntry.date)}</div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
              className="bg-dark-500 border-dark-400 text-light-100 hover:bg-dark-400">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DATAManagement;
