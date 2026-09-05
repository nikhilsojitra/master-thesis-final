import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Package, Eye, Calendar, DollarSign } from "lucide-react";
import { API_URL } from "../config";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/orders?page=${pagination.currentPage}&limit=10`,
      );
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start shopping to see your orders here
          </p>
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="card-content p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id}
                      </h3>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="h-4 w-4 mr-2" />
                        {order.orderItems.length} item(s)
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />$
                        {parseFloat(order.totalAmount).toFixed(2)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {order.orderItems.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2"
                        >
                          <img
                            src={
                              item.product.imageUrl ||
                              `${API_URL}/placeholder/40/40`
                            }
                            alt={item.product.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                          <span className="text-sm text-gray-700 truncate max-w-32">
                            {item.product.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            ×{item.quantity}
                          </span>
                        </div>
                      ))}
                      {order.orderItems.length > 3 && (
                        <div className="flex items-center justify-center bg-gray-100 rounded-lg p-2 text-sm text-gray-600">
                          +{order.orderItems.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 lg:ml-6">
                    <Link
                      to={`/orders/${order.id}`}
                      className="btn-outline flex items-center justify-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                    {order.status === "PENDING" && (
                      <button className="btn-outline text-red-600 border-red-600 hover:bg-red-50">
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
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
                  const showPage =
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= pagination.currentPage - 1 &&
                      page <= pagination.currentPage + 1);

                  if (!showPage) {
                    if (
                      page === pagination.currentPage - 2 ||
                      page === pagination.currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

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
      )}
    </div>
  );
};

export default Orders;
