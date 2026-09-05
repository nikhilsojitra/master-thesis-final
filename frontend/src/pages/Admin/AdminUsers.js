import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Trash2, Users, Calendar, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { API_URL } from "../../config";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.currentPage, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: "10",
      });

      if (searchTerm) params.append("search", searchTerm);

      const response = await axios.get(`${API_URL}/admin/users?${params}`);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchUsers();
  };

  const handleDeleteUser = async (userId, userName) => {
    if (
      !window.confirm(`Are you sure you want to delete user "${userName}"?`)
    ) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Users</h1>
        <p className="text-gray-600">View and manage user accounts</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-content p-0">
          {loading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <ShoppingBag className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {user._count.orders} orders
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {user.role !== "ADMIN" && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="text-red-600 hover:text-red-900"
                            disabled={user._count.orders > 0}
                            title={
                              user._count.orders > 0
                                ? "Cannot delete user with orders"
                                : "Delete user"
                            }
                          >
                            <Trash2
                              className={`h-4 w-4 ${user._count.orders > 0 ? "opacity-50" : ""}`}
                            />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No users found
          </h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {[...Array(pagination.totalPages)].map((_, index) => {
              const page = index + 1;
              const isCurrentPage = page === pagination.currentPage;

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded ${isCurrentPage ? "bg-primary-600 text-white" : "btn-outline"}`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
