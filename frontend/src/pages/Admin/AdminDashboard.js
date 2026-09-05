import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { API_URL } from "../../config";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/analytics`);
        setAnalytics(response.data.analytics);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">Overview of your store performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-content p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.totalUsers || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.totalProducts || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <ShoppingBag className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.totalOrders || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${parseFloat(analytics?.totalRevenue || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="card-content p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Pending Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics?.pendingOrders || 0}
                  </p>
                </div>
              </div>
              <Link
                to="/admin/orders?status=PENDING"
                className="btn-outline text-sm"
              >
                View All
              </Link>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Package className="h-6 w-6 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Low Stock Products
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics?.lowStockProducts || 0}
                  </p>
                </div>
              </div>
              <Link
                to="/admin/products/low-stock"
                className="btn-outline text-sm"
              >
                View All
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="card-title flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Top Selling Products
              </h2>
              <Link
                to="/admin/products"
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="card-content">
            {analytics?.topProducts?.length > 0 ? (
              <div className="space-y-4">
                {analytics.topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500 w-6">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-48">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${parseFloat(product.price).toFixed(2)} •{" "}
                          {product.stock} in stock
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {product.totalSold} sold
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No sales data available
              </p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="card-title flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Recent Orders
              </h2>
              <Link
                to="/admin/orders"
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="card-content">
            {analytics?.recentOrders?.length > 0 ? (
              <div className="space-y-4">
                {analytics.recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        Order #{order.id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.user.name} •{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${parseFloat(order.totalAmount).toFixed(2)}
                      </p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : order.status === "SHIPPED"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "PROCESSING"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "CANCELLED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/products"
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="card-content p-6 text-center">
              <Package className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Manage Products</h3>
              <p className="text-sm text-gray-500">
                Add, edit, or remove products
              </p>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="card-content p-6 text-center">
              <ShoppingBag className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Manage Orders</h3>
              <p className="text-sm text-gray-500">
                View and update order status
              </p>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="card-content p-6 text-center">
              <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-500">
                View and manage user accounts
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
