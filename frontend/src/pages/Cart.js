import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { Plus, Minus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { API_URL } from "../config";

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } =
    useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
    } else {
      navigate("/checkout");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Start shopping to add items to your cart
          </p>
          <Link to="/products" className="btn-primary">
            Browse Products
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  const total = getCartTotal();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="btn-outline text-red-600 border-red-600 hover:bg-red-50"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="card p-4">
              <div className="flex items-center space-x-4">
                <img
                  src={item.imageUrl || `${API_URL}/placeholder/100/100`}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {item.description}
                  </p>
                  <p className="text-lg font-bold text-primary-600 mt-1">
                    ${parseFloat(item.price).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity - 1)
                    }
                    className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-semibold w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.stock}
                    className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 hover:text-red-800 mt-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {item.quantity >= item.stock && (
                <div className="mt-2 text-sm text-orange-600">
                  Maximum quantity reached ({item.stock} available)
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <div className="card-header">
              <h2 className="card-title">Order Summary</h2>
            </div>
            <div className="card-content space-y-4">
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="truncate mr-2">
                      {item.name} × {item.quantity}
                    </span>
                    <span>
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <hr />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <hr />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full btn-primary text-lg py-3"
              >
                {isAuthenticated ? "Proceed to Checkout" : "Login to Checkout"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>

              <Link
                to="/products"
                className="block text-center text-primary-600 hover:text-primary-700 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
