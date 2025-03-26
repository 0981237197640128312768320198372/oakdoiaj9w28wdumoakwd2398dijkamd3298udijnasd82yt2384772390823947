'use client';

import { useState, useEffect } from 'react';

// Define the User interface
interface User {
  _id: string;
  username: string;
  name: string;
  role: 'user' | 'staff' | 'admin';
}
// Define the Role type
type Role = 'user' | 'staff' | 'admin';

// Initialize formData with the Role type

export const ManageUsers = () => {
  // State for managing users, forms, and feedback
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user' as Role,
  });
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch users when the component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to fetch users from the API
  const fetchUsers = async () => {
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
    } catch (error) {
      setError('Failed to fetch users');
      console.error(error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add a new user
  const handleAddUser = async () => {
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
      setIsAdding(false);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      setError('Failed to add user');
      console.error(error);
    }
  };

  // Update an existing user
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
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
      fetchUsers(); // Refresh the user list
    } catch (error) {
      setError('Failed to update user');
      console.error(error);
    }
  };

  // Delete a user
  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch('/api/v2/manage_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', userData: { _id: userId } }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      setSuccess('User deleted successfully');
      fetchUsers(); // Refresh the user list
    } catch (error) {
      setError('Failed to delete user');
      console.error(error);
    }
  };

  // Handle clicking the Edit button
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setFormData({ username: user.username, password: '', name: user.name, role: user.role });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setSelectedUser(null);
    setFormData({ username: '', password: '', name: '', role: 'user' });
  };

  return (
    <div className="w-full p-5">
      <h2 className="text-2xl font-bold mb-5">Manage Users</h2>

      {/* Success and Error Messages */}
      {success && <p className="text-green-500 mb-3">{success}</p>}
      {error && <p className="text-red-500 mb-3">{error}</p>}

      {/* Add User Button */}
      {!isAdding && !selectedUser && (
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-500 text-white px-3 py-1 rounded mb-5">
          Add User
        </button>
      )}

      {/* Add User Form */}
      {isAdding && (
        <div className="mb-5 p-5 border rounded">
          <h3 className="text-lg font-bold mb-3">Add User</h3>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            className="border p-2 mb-2 w-full"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="border p-2 mb-2 w-full"
          />
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            className="border p-2 mb-2 w-full"
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="border p-2 mb-2 w-full">
            <option value="user">User</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleAddUser} className="bg-green-500 text-white px-3 py-1 rounded">
              Save
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="bg-gray-500 text-white px-3 py-1 rounded">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Update User Form */}
      {selectedUser && (
        <div className="mb-5 p-5 border rounded">
          <h3 className="text-lg font-bold mb-3">Update User</h3>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            className="border p-2 mb-2 w-full"
          />
          <input
            type="password"
            name="password"
            placeholder="New Password (optional)"
            value={formData.password}
            onChange={handleInputChange}
            className="border p-2 mb-2 w-full"
          />
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            className="border p-2 mb-2 w-full"
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="border p-2 mb-2 w-full">
            <option value="user">User</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleUpdateUser}
              className="bg-green-500 text-white px-3 py-1 rounded">
              Update
            </button>
            <button onClick={handleCancelEdit} className="bg-gray-500 text-white px-3 py-1 rounded">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* User List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map((user) => (
          <div key={user._id} className="p-5 border rounded">
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleEditClick(user)}
                className="bg-yellow-500 text-white px-2 py-1 rounded">
                Edit
              </button>
              <button
                onClick={() => handleDeleteUser(user._id)}
                className="bg-red-500 text-white px-2 py-1 rounded">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
