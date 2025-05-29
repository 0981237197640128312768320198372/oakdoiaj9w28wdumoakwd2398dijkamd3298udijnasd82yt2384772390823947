/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import {
  Pencil,
  Trash2,
  Check,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
  _id: string;
  username: string;
  password: string;
  name: string;
  role: 'user' | 'staff' | 'admin';
}

type Role = 'user' | 'staff' | 'admin';

export const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user' as Role,
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    if (!isInitialLoad) setIsLoading(true);

    try {
      const response = await fetch('/api/v2/manage_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'show' }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users);
      setError(null);
    } catch (error) {
      setError('Failed to fetch users');
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleAddUser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v2/manage_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', userData: formData }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add user');
      }
      setSuccess('User added successfully');
      setFormData({ username: '', password: '', name: '', role: 'user' });
      setIsAddDialogOpen(false);
      fetchUsers();

      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Failed to add user');
      console.error(error);

      // Clear error message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/v2/manage_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          userData: { ...formData, _id: selectedUser._id },
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }
      setSuccess('User updated successfully');
      setSelectedUser(null);
      setFormData({ username: '', password: '', name: '', role: 'user' });
      setIsEditDialogOpen(false);
      fetchUsers();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Failed to update user');
      console.error(error);

      // Clear error message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/v2/manage_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', userData: { _id: userToDelete._id } }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      setSuccess('User deleted successfully');
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Failed to delete user');
      console.error(error);

      // Clear error message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setFormData({ username: user.username, password: '', name: user.name, role: user.role });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'admin':
        return 'bg-primary/20 hover:bg-primary/40 text-primary select-none';
      case 'staff':
        return 'bg-fuchsia-500/20 hover:bg-fuchsia-500/40 text-fuchsia-500 select-none';
      default:
        return 'bg-white/20 hover:bg-white/40 text-white select-none';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 1);
  };

  const TableRowSkeleton = () => (
    <TableRow className="border-dark-500">
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full bg-dark-500" />
          <Skeleton className="h-4 w-24 bg-dark-500" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20 bg-dark-500" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-16 rounded-full bg-dark-500" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32 bg-dark-500" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-8 w-8 rounded-md ml-auto bg-dark-500" />
      </TableCell>
    </TableRow>
  );

  return (
    <>
      <Card className="w-full bg-dark-700 border-dark-600 text-light-100 transition-all duration-200">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-light-100">Manage Users</CardTitle>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-dark-800 transition-colors duration-200 whitespace-nowrap">
                  <UserPlus className="h-4 w-4" />
                  <span className="sm:inline">Add User</span>
                </button>
              </DialogTrigger>
              <DialogContent className="bg-dark-600 border-dark-500 text-light-100 sm:max-w-md w-[calc(100%-2rem)] mx-auto transition-all duration-200">
                <DialogHeader>
                  <DialogTitle className="text-light-100">Add New User</DialogTitle>
                  <DialogDescription className="text-light-500">
                    Create a new user account with the following details.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username" className="text-light-200">
                      Username
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="Enter username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="bg-dark-500 border-dark-400 text-light-100 transition-colors duration-200"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-light-200">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword['new'] ? 'text' : 'password'}
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="bg-dark-500 border-dark-400 text-light-100 transition-colors duration-200"
                      />
                      <button
                        type="button"
                        className="absolute right-0 top-0 h-full text-light-300 hover:text-light-100 transition-colors duration-200"
                        onClick={() => togglePasswordVisibility('new')}>
                        {showPassword['new'] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-light-200">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-dark-500 border-dark-400 text-light-100 transition-colors duration-200"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role" className="text-light-200">
                      Role
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => handleSelectChange(value, 'role')}>
                      <SelectTrigger className="bg-dark-500 border-dark-400 text-light-100 transition-colors duration-200">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-500 border-dark-400 text-light-100">
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setIsAddDialogOpen(false)}
                    className="bg-dark-500 border-dark-400 text-light-100 hover:bg-dark-400 transition-colors duration-200 w-full sm:w-auto">
                    Cancel
                  </button>
                  <button
                    onClick={handleAddUser}
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90 text-dark-800 transition-colors duration-200 w-full sm:w-auto">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Add User
                      </>
                    )}
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert
              variant="destructive"
              className="mb-4 bg-red-500/10 border-red-500 text-red-500 transition-all duration-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-500/10 border-green-500 text-green-500 transition-all duration-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="w-full overflow-hidden rounded-md border border-dark-500 transition-all duration-200">
            <div className="min-h-[400px ">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-dark-600">
                    <TableRow className="border-dark-500 hover:bg-dark-500">
                      <TableHead className="text-light-300">User</TableHead>
                      <TableHead className="text-light-300">Role</TableHead>
                      <TableHead className="text-light-300 hidden md:table-cell">
                        Username
                      </TableHead>
                      <TableHead className="text-light-300 hidden sm:table-cell">
                        Password
                      </TableHead>
                      <TableHead className="text-light-300 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, index) => <TableRowSkeleton key={index} />)
                    ) : users.length === 0 ? (
                      <TableRow className="border-dark-500 hover:bg-dark-600">
                        <TableCell colSpan={5} className="text-center py-8 text-light-400">
                          No users found. Add a new user to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow
                          key={user._id}
                          className="border-dark-500 hover:bg-dark-600 transition-colors duration-200">
                          <TableCell className="text-light-100">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-primary text-dark-800 text-xs">
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-light-400 text-sm md:hidden">{user.username}</p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={`${getRoleBadgeColor(
                                user.role
                              )} transition-colors duration-200`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-light-200 hidden md:table-cell">
                            {user.username}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-light-200">
                                {showPassword[user._id] ? user.password : '••••••••'}
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(user._id)}
                                className="text-light-300 hover:text-light-100 hover:bg-dark-500 transition-colors duration-200">
                                {showPassword[user._id] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <TooltipProvider>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="text-light-300 hover:text-light-100 hover:bg-dark-500 transition-colors duration-200">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="bg-dark-500 border-dark-400 text-light-100 transition-all duration-200">
                                  <DropdownMenuLabel className="text-light-300">
                                    Actions
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-dark-400" />
                                  <DropdownMenuItem
                                    onClick={() => handleEditClick(user)}
                                    className="hover:bg-dark-400 focus:bg-dark-400 transition-colors duration-200">
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteClick(user)}
                                    className="text-red-400 hover:text-red-400 hover:bg-dark-400 focus:bg-dark-400 transition-colors duration-200">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-dark-400 sm:hidden" />
                                  <DropdownMenuItem
                                    onClick={() => togglePasswordVisibility(user._id)}
                                    className="sm:hidden hover:bg-dark-400 focus:bg-dark-400 transition-colors duration-200">
                                    {showPassword[user._id] ? (
                                      <>
                                        <EyeOff className="mr-2 h-4 w-4" />
                                        Hide Password
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Show Password
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>{' '}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-dark-600 border-dark-500 text-light-100 sm:max-w-md w-[calc(100%-2rem)] transition-all duration-200">
          <DialogHeader>
            <DialogTitle className="text-light-100">Edit User</DialogTitle>
            <DialogDescription className="text-light-500">
              Update user information for {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-username" className="text-light-200">
                Username
              </Label>
              <Input
                id="edit-username"
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleInputChange}
                className="bg-dark-500 border-dark-400 text-light-100 transition-colors duration-200"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password" className="text-light-200">
                New Password <span className="text-light-500">(leave blank to keep current)</span>
              </Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  name="password"
                  type={showPassword['edit'] ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-dark-500 border-dark-400 text-light-100 transition-colors duration-200"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full text-light-300 hover:text-light-100 transition-colors duration-200"
                  onClick={() => togglePasswordVisibility('edit')}>
                  {showPassword['edit'] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-light-200">
                Full Name
              </Label>
              <Input
                id="edit-name"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-dark-500 border-dark-400 text-light-100 transition-colors duration-200"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role" className="text-light-200">
                Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleSelectChange(value, 'role')}>
                <SelectTrigger className="bg-dark-500 border-dark-400 text-light-100 transition-colors duration-200">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-dark-500 border-dark-400 text-light-100">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <button
              onClick={() => setIsEditDialogOpen(false)}
              className="bg-dark-500 border-dark-400 text-light-100 hover:bg-dark-400 transition-colors duration-200 w-full sm:w-auto">
              Cancel
            </button>
            <button
              onClick={handleUpdateUser}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-dark-800 transition-colors duration-200 w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Update User
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-dark-600 border-dark-500 text-light-100 sm:max-w-md w-[calc(100%-2rem)] mx-auto transition-all duration-200">
          <DialogHeader>
            <DialogTitle className="text-light-100">Delete User</DialogTitle>
            <DialogDescription className="text-light-500">
              Are you sure you want to delete {userToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <button
              onClick={() => setIsDeleteDialogOpen(false)}
              className="bg-dark-500 border-dark-400 text-light-100 hover:bg-dark-400 transition-colors duration-200 w-full sm:w-auto">
              Cancel
            </button>
            <button
              onClick={handleDeleteUser}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 text-dark-800 transition-colors duration-200 w-full sm:w-auto">
              {isLoading ? (
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
    </>
  );
};
