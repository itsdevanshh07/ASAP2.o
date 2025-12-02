import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getAdminUsers, blockUser, updateUserRole } from '../services/adminApi';
import { toast } from 'react-toastify';

const AdminUsers = () => {
    const { getToken } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const data = await getAdminUsers(token, { search });
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [search]); // Re-fetch on search change (debounce would be better but simple for now)

    const handleBlock = async (userId) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const token = await getToken();
            const data = await blockUser(token, userId);
            if (data.success) {
                toast.success(data.message);
                fetchUsers();
            }
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        if (!window.confirm(`Change role to ${newRole}?`)) return;
        try {
            const token = await getToken();
            const data = await updateUserRole(token, userId, newRole);
            if (data.success) {
                toast.success(data.message);
                fetchUsers();
            }
        } catch (error) {
            toast.error("Action failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                <input
                    type="text"
                    placeholder="Search users..."
                    className="border p-2 rounded-lg w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-medium text-gray-600">Name</th>
                            <th className="p-4 font-medium text-gray-600">Email</th>
                            <th className="p-4 font-medium text-gray-600">Role</th>
                            <th className="p-4 font-medium text-gray-600">Status</th>
                            <th className="p-4 font-medium text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="5" className="p-4 text-center">No users found</td></tr>
                        ) : (
                            users.map(user => (
                                <tr key={user._id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="p-4 flex items-center gap-3">
                                        <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                                        {user.name}
                                    </td>
                                    <td className="p-4">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs ${user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {user.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="p-4 space-x-2">
                                        <button
                                            onClick={() => handleBlock(user._id)}
                                            className={`text-xs px-3 py-1 rounded border ${user.isBlocked ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'}`}
                                        >
                                            {user.isBlocked ? 'Unblock' : 'Block'}
                                        </button>
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => handleRoleChange(user._id, 'admin')}
                                                className="text-xs px-3 py-1 rounded border border-purple-500 text-purple-600"
                                            >
                                                Make Admin
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
