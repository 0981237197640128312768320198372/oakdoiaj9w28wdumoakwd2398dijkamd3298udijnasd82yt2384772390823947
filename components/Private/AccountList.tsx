/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
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
import { Pencil, Trash2, Check, AlertCircle, Loader2, MoreHorizontal } from 'lucide-react';
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
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [order, setOrder] = useState<string>('desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<string | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
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

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: entriesPerPage.toString(),
        ...(filterStatus !== 'All' && { status: filterStatus }),
        sortBy,
        order,
        ...(searchTerm && { search: searchTerm }),
      }).toString();

      const response = await fetch(`/api/v2/account_management?${queryParams}`);
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
  }, [filterStatus, sortBy, order, searchTerm]);

  useEffect(() => {
    fetchAccounts();
  }, [filterStatus, sortBy, order, searchTerm, currentPage, entriesPerPage]);

  const handleStatusChange = (id: string, newStatus: string) => {
    setStatusChanges((prev) => ({ ...prev, [id]: newStatus }));
  };

  const handleSaveChanges = async () => {
    try {
      const token = getAdminToken();
      if (!token) throw new Error('No authentication token found');

      const updatePromises = Object.entries(statusChanges).map(([id, status]) =>
        fetch('/api/v2/account_management', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id, status }),
        }).then((response) => {
          if (!response.ok) {
            return response.json().then((errorData) => {
              throw new Error(errorData.error || `Failed to update account ${id}`);
            });
          }
          return response.json();
        })
      );

      await Promise.all(updatePromises);
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
      .map(
        (account) =>
          `${account.email}\t${account.password}\t${account.status}\t${formatTime(
            account.createdAt
          )}`
      )
      .join('\n');
    copyToClipboard(allText);
  };

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getStatusStyle = (status: string): string => {
    switch (status) {
      case 'Uncheck':
        return 'border-yellow-500 shadow-yellow-500/30';
      case 'Created':
        return 'border-gray-500 shadow-gray-500/30';
      case 'Good':
        return 'border-green-500 shadow-green-500/30';
      case 'Wiped':
        return 'border-red-500 shadow-red-500/30';
      default:
        return 'border-gray-500 shadow-gray-500/30';
    }
  };
  const CardSkeleton = () => (
    <Card className="bg-dark-500 border-dark-400">
      <CardContent className="flex flex-col gap-2 p-4">
        <Skeleton className="h-6 w-3/4 bg-dark-400" />
        <Skeleton className="h-4 w-1/2 bg-dark-400" />
        <Skeleton className="h-10 w-full bg-dark-400" />
        <Skeleton className="h-4 w-1/4 bg-dark-400" />
      </CardContent>
    </Card>
  );

  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  return (
    <Card className="w-full bg-dark-700 border-dark-600 text-light-100 transition-all duration-200">
      <CardHeader>
        <div className="flex flex-col justify-between gap-5">
          <div className="w-full flex justify-between">
            <CardTitle className=" flex w-full justify-between ">
              <p className="text-light-100 text-lg sm:text-xl">Manage Accounts ({totalEntries})</p>
              <button
                onClick={fetchAccounts}
                className="p-1 text-sm rounded-sm h-fit font-aktivGroteskBold bg-primary text-dark-800 hover:bg-primary/70 hover:text-dark-800"
                title="Refresh data">
                <TbRefresh className={`text-xl ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </CardTitle>
          </div>
          <div className="flex flex-col gap-2 w-full justify-between">
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-fit  md:max-w-[120px] bg-dark-500 border-dark-400 text-light-100">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-500 border-dark-400 text-light-100">
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Uncheck">Uncheck</SelectItem>
                    <SelectItem value="Created">Created</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Wiped">Wiped</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={order === 'desc' ? 'Latest' : 'Oldest'}
                  onValueChange={(value) => setOrder(value)}>
                  <SelectTrigger className="w-full md:w-fit md:max-w-[120px] bg-dark-500 border-dark-400 text-light-100">
                    <SelectValue placeholder="Sort by timestamp" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-500 border-dark-400 text-light-100">
                    <SelectItem value="desc ">Latest</SelectItem>
                    <SelectItem value="asc ">Oldest</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search Account"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full md:w-fit md:max-w-[200px] bg-dark-500 border-dark-400 text-light-100"
                />
              </div>
            </div>
            <div className="flex gap-2 w-full ">
              <Button
                onClick={handleCopyAll}
                className="bg-primary hover:bg-primary/90 text-dark-800 max-sm:w-full">
                Copy All ({totalEntries})
              </Button>
              <Button
                onClick={handleSaveChanges}
                className="bg-primary hover:bg-primary/90 text-dark-800 max-sm:w-full">
                Save Changes
              </Button>
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-5 overflow-y-auto max-h-[500px] px-5 pb-5 border-x border-dark-400 __dokmai_scrollbar">
          {loading ? (
            Array.from({ length: 10 }).map((_, index) => <CardSkeleton key={index} />)
          ) : accounts.length === 0 ? (
            <p className="text-center text-light-300 col-span-full">No accounts found</p>
          ) : (
            accounts.map((account) => (
              <Card
                key={account._id}
                className={`bg-dark-500 border-dark-400 border-[1px] rounded shadow-lg ${getStatusStyle(
                  account.status
                )}`}>
                <CardContent className="flex flex-col gap-2 p-4">
                  <div className="flex w-full justify-between items-center ">
                    <div className="text-xs px-1 rounded bg-dark-300 text-white ">
                      {formatTime(account.createdAt)}
                    </div>
                    <div className="flex justify-end items-center gap-2">
                      <Select
                        value={statusChanges[account._id] || account.status}
                        onValueChange={(value) => handleStatusChange(account._id, value)}>
                        <SelectTrigger className="bg-dark-500 border-dark-400 text-light-100 h-9 w-fit">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-500 border-dark-400 text-light-100">
                          <SelectItem value="Uncheck">Uncheck</SelectItem>
                          <SelectItem value="Created">Created</SelectItem>
                          <SelectItem value="Good">Good</SelectItem>
                          <SelectItem value="Wiped">Wiped</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        onClick={() => handleCopyLine(account)}
                        className="text-light-400 hover:text-white hover:bg-dark-400 !p-2">
                        <PiCopySimpleLight className="text-xl" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-start text-xs lg:text-base text-light-300 font-light w-full">
                    <p title={account.email}>{account.email}</p>
                    <p title={account.password}>{account.password}</p>
                  </div>
                  <p className="text-xs text-light-600 p-4 bg-dark-400 border-[1px] border-dark-100 italic font-light">
                    {account.detail}
                  </p>
                  <div className="flex justify-end items-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-light-300 hover:text-light-100 hover:bg-dark-400">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-dark-500 border-dark-400 text-light-100">
                        <DropdownMenuItem onClick={() => handleEditClick(account)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(account)}
                          className="text-red-400">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
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
                  <SelectItem value="Uncheck">Uncheck</SelectItem>
                  <SelectItem value="Created">Created</SelectItem>
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
    </Card>
  );
};

export default AccountList;
