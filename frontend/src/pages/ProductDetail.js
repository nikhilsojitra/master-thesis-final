import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShoppingCart, Plus, Minus, ArrowLeft, Package } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import toast from "react-hot-toast";
import { API_URL } from "../config";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, getCartItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_URL}/products/${id}`);
        setProduct(response.data.product);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        if (error.response?.status === 404) {
          navigate("/products");
          toast.error("Product not found");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1);
  };

  const cartItem = product ? getCartItem(product.id) : null;
  const availableStock = product
    ? product.stock - (cartItem?.quantity || 0)
    : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-300 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              <div className="h-12 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product not found
          </h2>
          <p className="text-gray-600 mb-4">
            The product you're looking for doesn't exist.
          </p>
          <button onClick={() => navigate("/products")} className="btn-primary">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative">
          <img
            src={product.image || `${API_URL}/placeholder/600/400`}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg shadow-lg"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center rounded-lg">
              <span className="text-white text-xl font-semibold">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-2xl font-bold text-primary-600">
              ${parseFloat(product.price).toFixed(2)}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Description
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Availability
            </h3>
            <div className="flex items-center space-x-2">
              {product.stock > 0 ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">
                    {product.stock} in stock
                  </span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">Out of stock</span>
                </>
              )}
            </div>
            {cartItem && (
              <p className="text-sm text-gray-500 mt-1">
                {cartItem.quantity} already in cart
              </p>
            )}
          </div>

          {/* Quantity Selector and Add to Cart */}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= availableStock}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {availableStock < product.stock && (
                  <p className="text-sm text-orange-600 mt-1">
                    Only {availableStock} more available (you have{" "}
                    {cartItem?.quantity} in cart)
                  </p>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={availableStock === 0}
                className="w-full btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {availableStock === 0 ? "Cannot Add More" : "Add to Cart"}
              </button>
            </div>
          )}

          {/* Product Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Product Details
            </h3>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Product ID
                </dt>
                <dd className="text-sm text-gray-900">{product.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Stock Quantity
                </dt>
                <dd className="text-sm text-gray-900">{product.stock} units</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Added</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(product.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
