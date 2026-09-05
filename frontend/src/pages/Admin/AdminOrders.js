import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Eye, Package, Calendar, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import { API_URL } from "../../config";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.currentPage, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: "10",
      });

      if (statusFilter) params.append("status", statusFilter);

      const response = await axios.get(`${API_URL}/admin/orders?${params}`);
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/admin/orders/${orderId}/status`, {
        status: newStatus,
      });
      toast.success("Order status updated successfully");
      fetchOrders();
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update order status",
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Orders</h1>
        <p className="text-gray-600">View and update order status</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, currentPage: 1 }));
            }}
          >
            <option value="">All Orders</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-content p-0">
          {loading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {order.orderItems.length} item(s)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            ${parseFloat(order.totalAmount).toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusUpdate(order.id, e.target.value)
                          }
                          className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(order.status)}`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            /* View order details */
                          }}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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

export default AdminOrders;
