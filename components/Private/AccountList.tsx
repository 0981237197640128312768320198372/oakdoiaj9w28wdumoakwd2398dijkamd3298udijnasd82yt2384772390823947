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
import { Pencil, Trash2, Check, AlertCircle, Loader2, MoreHorizontal, Eye } from 'lucide-react';
import { formatTime, getAdminToken } from '@/lib/utils';
import { TbRefresh } from 'react-icons/tb';
import { PiCopySimpleLight } from 'react-icons/pi';

interface Account {
  password: string;
  _id: string;
  email: string;
  status: 'Uncheck' | 'Created' | 'Good' | 'Wiped';
  detail: string;
  createdAt: string;
}

const AccountList = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<string | null>(null); // Email of account to edit
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [selectedViewAccount, setSelectedViewAccount] = useState<Account | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [totalEntries, setTotalEntries] = useState(0);
  const [statusChanges, setStatusChanges] = useState<{ [key: string]: string }>({});
  const [newAccount, setNewAccount] = useState({
    email: '',
    status: 'Uncheck' as 'Uncheck' | 'Created' | 'Good' | 'Wiped',
    detail: '',
  });

  const fetchAccounts = async () => {
    setIsRefreshing(true);
    try {
      setLoading(true);
      const token = getAdminToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(
        `/api/v2/account_management?page=${currentPage}&limit=${entriesPerPage}`
      );
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to fetch accounts');
      setAccounts(data.accounts);
      setTotalEntries(data.total);
      setError(null);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch accounts');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  useEffect(() => {
    fetchAccounts();
  }, [filterStatus, currentPage, entriesPerPage]);

  const handleStatusChange = (id: string, newStatus: string) => {
    setStatusChanges((prev) => ({ ...prev, [id]: newStatus }));
  };

  const handleSaveChanges = async () => {
    try {
      const token = getAdminToken();
      if (!token) throw new Error('No authentication token found');

      const updates = Object.entries(statusChanges).map(([id, status]) => ({ _id: id, status }));
      if (updates.length === 0) return;

      const response = await fetch('/api/v2/account_management', {
        method: 'POST',
        body: JSON.stringify({ action: 'update', data: updates }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update accounts');
      setSuccess('Accounts updated successfully');
      setStatusChanges({});
      fetchAccounts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to update accounts');
      setTimeout(() => setError(null), 3000);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleCopyLine = (account: Account) => {
    const text = `${account.email}\t${account.password}`;
    copyToClipboard(text);
  };

  const handleCopyAll = () => {
    const allText = accounts
      .map((account) => `${account.email}\t${account.password}\t${formatTime(account.createdAt)}`)
      .join('\n');
    copyToClipboard(allText);
  };

  // Edit account
  const handleEdit = async () => {
    if (!accountToEdit) return;
    setLoading(true);
    try {
      const token = getAdminToken();
      if (!token) throw new Error('No authentication token found');

      const account = accounts.find((acc) => acc.email === accountToEdit);
      if (!account) throw new Error('Account not found');

      const response = await fetch('/api/v2/account_management', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update',
          data: [
            {
              _id: account._id,
              email: newAccount.email,
              status: newAccount.status,
              detail: newAccount.detail,
            },
          ],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update account');
      setSuccess('Account updated successfully');
      setIsEditDialogOpen(false);
      fetchAccounts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to update account');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Delete account
  const handleDelete = async () => {
    if (!accountToDelete) return;
    setLoading(true);
    try {
      const token = getAdminToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('/api/v2/account_management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'remove', data: [accountToDelete._id] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete account');
      setSuccess('Account deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchAccounts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to delete account');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (account: Account) => {
    setAccountToEdit(account.email);
    setNewAccount({
      email: account.email,
      status: account.status,
      detail: account.detail,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (account: Account) => {
    setAccountToDelete(account);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = (account: Account) => {
    setSelectedViewAccount(account);
    setIsViewDialogOpen(true);
  };

  const TableRowSkeleton = () => (
    <TableRow className="border-dark-500">
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

  return (
    <Card className="w-full max-w-[900px] bg-dark-700 border-dark-600 text-light-100 transition-all duration-200">
      <CardHeader>
        <div className="flex flex-col justify-between gap-5">
          <div className="w-full flex justify-between">
            <CardTitle className="text-light-100 text-lg sm:text-xl">Manage Accounts</CardTitle>
            <button
              onClick={fetchAccounts}
              className="p-1 text-sm rounded-sm h-fit font-aktivGroteskBold bg-primary text-dark-800 hover:bg-primary/70 hover:text-dark-800"
              title="Refresh data">
              <TbRefresh className={`text-xl ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex flex-col gap-2 w-full justify-between">
            <div className="flex gap-5 mt-2">
              <span className="text-light-300">Total: {totalEntries}</span>
            </div>
            <Button
              onClick={handleCopyAll}
              className="bg-primary hover:bg-primary/90 text-dark-800">
              Copy All
            </Button>
            <Button
              onClick={handleSaveChanges}
              className="bg-primary hover:bg-primary/90 text-dark-800">
              Save Changes
            </Button>
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
        <div className="w-full overflow-x-auto max-h-[700px] __dokmai_scrollbar border border-x-[1px] border-y-0 border-dark-500">
          <div className="min-h-[400px]">
            <Table>
              <TableHeader className="bg-dark-600">
                <TableRow className="border-dark-500 hover:bg-dark-500">
                  <TableHead className="text-light-300">Email</TableHead>
                  <TableHead className="text-light-300">Password</TableHead>
                  <TableHead className="text-light-300">Copy</TableHead>
                  <TableHead className="text-light-300">Status</TableHead>
                  <TableHead className="text-light-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, index) => <TableRowSkeleton key={index} />)
                ) : accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-light-300">
                      No accounts found
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((account) => (
                    <TableRow key={account._id} className="border-dark-500 hover:bg-dark-600">
                      <TableCell>{account.email}</TableCell>
                      <TableCell>{account.password}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleCopyLine(account)}
                          className="items-center text-light-800 hover:text-white p-2 rounded bg-dark-800">
                          <PiCopySimpleLight />
                        </button>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={statusChanges[account._id] || account.status}
                          onValueChange={(value) => handleStatusChange(account._id, value)}>
                          <SelectTrigger className="bg-dark-500 border-dark-400 text-light-100">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="bg-dark-500 border-dark-400 text-light-100">
                            <SelectItem value="Good">Good</SelectItem>
                            <SelectItem value="Wiped">Wiped</SelectItem>
                          </SelectContent>
                        </Select>
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
                              onClick={() => handleViewDetails(account)}
                              className="hover:bg-dark-400">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditClick(account)}
                              className="hover:bg-dark-400">
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(account)}
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
                <SelectItem value={totalEntries.toString()}>All</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="bg-dark-500 border-dark-400 text-light-100 hover:bg-dark-400 disabled:opacity-50">
              {'<'}
            </Button>
            <span>
              Page {totalEntries > 0 ? currentPage : 0} / {totalPages} ({totalEntries})
            </span>
            <Button
              disabled={currentPage === totalPages || totalEntries === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="bg-dark-500 border-dark-400 text-light-100 hover:bg-dark-400 disabled:opacity-50">
              {'>'}
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-dark-600 border-dark-500 text-light-100 w-[calc(100%-2rem)] sm:w-auto sm:max-w-md mx-auto transition-all duration-200">
          <DialogHeader>
            <DialogTitle className="text-light-100">Edit Account</DialogTitle>
            <DialogDescription className="text-light-500">
              Update the details of the selected account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-email" className="text-light-200">
                Email
              </Label>
              <Input
                id="edit-email"
                name="email"
                placeholder="Enter email"
                value={newAccount.email}
                onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                className="bg-dark-500 border-dark-400 text-light-100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status" className="text-light-200">
                Status
              </Label>
              <Select
                value={newAccount.status}
                onValueChange={(value) =>
                  setNewAccount({
                    ...newAccount,
                    status: value as 'Uncheck' | 'Created' | 'Good' | 'Wiped',
                  })
                }>
                <SelectTrigger className="bg-dark-500 border-dark-400 text-light-100">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-dark-500 border-dark-400 text-light-100">
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Wiped">Wiped</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-detail" className="text-light-200">
                Detail
              </Label>
              <Input
                id="edit-detail"
                name="detail"
                placeholder="Enter detail"
                value={newAccount.detail}
                onChange={(e) => setNewAccount({ ...newAccount, detail: e.target.value })}
                className="bg-dark-500 border-dark-400 text-light-100"
              />
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

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-dark-600 border-dark-500 text-light-100 w-[calc(100%-2rem)] sm:w-auto sm:max-w-md mx-auto transition-all duration-200">
          <DialogHeader>
            <DialogTitle className="text-light-100">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-light-500">
              Are you sure you want to delete this account? This action cannot be undone.
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-dark-600 border-dark-500 text-light-100 w-[calc(100%-2rem)] sm:w-auto sm:max-w-md mx-auto transition-all duration-200">
          <DialogHeader>
            <DialogTitle className="text-light-100">Account Details</DialogTitle>
            <DialogDescription className="text-light-500">
              Full details of the selected account.
            </DialogDescription>
          </DialogHeader>
          {selectedViewAccount && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-4">
              <div className="text-light-200">Email</div>
              <div className="text-light-100">{selectedViewAccount.email}</div>
              <div className="text-light-200">Status</div>
              <div className="text-light-100">{selectedViewAccount.status}</div>
              <div className="text-light-200">Detail</div>
              <div className="text-light-100">{selectedViewAccount.detail}</div>
              <div className="text-light-200">Created At</div>
              <div className="text-light-100">{formatTime(selectedViewAccount.createdAt)}</div>
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

export default AccountList;
