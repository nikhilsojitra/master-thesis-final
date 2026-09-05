import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Package,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  XCircle,
  CloudCog,
} from "lucide-react";
import toast from "react-hot-toast";
import { API_URL } from "../config";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${API_URL}/orders/${id}`);
        setOrder(response.data.order);
      } catch (error) {
        console.error("Failed to fetch order:", error);
        if (error.response?.status === 404) {
          navigate("/orders");
          toast.error("Order not found");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, navigate]);

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    setCancelling(true);
    try {
      await axios.delete(`${API_URL}/orders/${id}`);
      setOrder((prev) => ({ ...prev, status: "CANCELLED" }));
      toast.success("Order cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "SHIPPED":
        return <Truck className="h-5 w-5 text-blue-600" />;
      case "PROCESSING":
        return <Package className="h-5 w-5 text-yellow-600" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
          <div className="h-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order not found
          </h2>
          <p className="text-gray-600 mb-4">
            The order you're looking for doesn't exist.
          </p>
          <button onClick={() => navigate("/orders")} className="btn-primary">
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/orders")}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Orders
      </button>

      {/* Order Header */}
      <div className="card mb-8">
        <div className="card-content p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Order #{order.id}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />$
                  {parseFloat(order.totalAmount).toFixed(2)}
                </div>
              </div>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(order.status)}
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}
                >
                  {order.status}
                </span>
              </div>
              {order.status === "PENDING" && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="btn-outline text-red-600 border-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Cancel Order"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="card mb-8">
        <div className="card-header">
          <h2 className="card-title">Order Items</h2>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            {order.orderItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {item.product.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </span>
                    <span className="text-sm text-gray-500">
                      Price: ${parseFloat(item.price).toFixed(2)} each
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Order Summary</h2>
        </div>
        <div className="card-content">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>$0.00</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Timeline */}
      <div className="card mt-8">
        <div className="card-header">
          <h2 className="card-title">Order Status</h2>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <div
              className={`flex items-center space-x-3 ${order.status !== "CANCELLED" ? "text-green-600" : "text-gray-400"}`}
            >
              <div
                className={`w-3 h-3 rounded-full ${order.status !== "CANCELLED" ? "bg-green-600" : "bg-gray-400"}`}
              ></div>
              <span>Order Placed</span>
              <span className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>

            <div
              className={`flex items-center space-x-3 ${["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status) ? "text-green-600" : "text-gray-400"}`}
            >
              <div
                className={`w-3 h-3 rounded-full ${["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status) ? "bg-green-600" : "bg-gray-400"}`}
              ></div>
              <span>Processing</span>
            </div>

            <div
              className={`flex items-center space-x-3 ${["SHIPPED", "DELIVERED"].includes(order.status) ? "text-green-600" : "text-gray-400"}`}
            >
              <div
                className={`w-3 h-3 rounded-full ${["SHIPPED", "DELIVERED"].includes(order.status) ? "bg-green-600" : "bg-gray-400"}`}
              ></div>
              <span>Shipped</span>
            </div>

            <div
              className={`flex items-center space-x-3 ${order.status === "DELIVERED" ? "text-green-600" : "text-gray-400"}`}
            >
              <div
                className={`w-3 h-3 rounded-full ${order.status === "DELIVERED" ? "bg-green-600" : "bg-gray-400"}`}
              ></div>
              <span>Delivered</span>
            </div>

            {order.status === "CANCELLED" && (
              <div className="flex items-center space-x-3 text-red-600">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span>Order Cancelled</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
