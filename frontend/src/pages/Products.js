import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Search, Filter, ShoppingCart, Grid, List } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { API_URL } from "../config";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, [pagination.currentPage, searchTerm, filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: "12",
      });

      if (searchTerm) params.append("search", searchTerm);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);

      const response = await axios.get(`${API_URL}/products?${params}`);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchProducts();
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({ minPrice: "", maxPrice: "" });
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>

        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                className="input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-primary-600 text-white" : "bg-gray-200"}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-primary-600 text-white" : "bg-gray-200"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  name="minPrice"
                  placeholder="0"
                  className="input"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="1000"
                  className="input"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="flex items-end space-x-2">
                <button onClick={clearFilters} className="btn-secondary">
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Info */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {products.length} of {pagination.totalProducts} products
        </div>
      </div>

      {/* Products Grid/List */}
      {loading ? (
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
        >
          {[...Array(12)].map((_, index) => (
            <div key={index} className="card animate-pulse">
              <div
                className={`bg-gray-300 rounded-t-lg ${viewMode === "grid" ? "h-48" : "h-32"}`}
              ></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className={`card hover:shadow-lg transition-shadow ${viewMode === "list" ? "flex" : ""}`}
            >
              <div
                className={`relative ${viewMode === "list" ? "w-32 flex-shrink-0" : ""}`}
              >
                <img
                  src={product.imageUrl || `${API_URL}/placeholder/300/200`}
                  alt={product.name}
                  className={`object-cover ${viewMode === "grid" ? "w-full h-48 rounded-t-lg" : "w-full h-32 rounded-l-lg"}`}
                />
                {product.stock === 0 && (
                  <div
                    className={`absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center ${viewMode === "grid" ? "rounded-t-lg" : "rounded-l-lg"}`}
                  >
                    <span className="text-white font-semibold text-sm">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
              <div
                className={`p-4 ${viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""}`}
              >
                <div>
                  <h3
                    className={`font-semibold text-gray-900 mb-2 ${viewMode === "grid" ? "text-lg line-clamp-2" : "text-base"}`}
                  >
                    {product.name}
                  </h3>
                  <p
                    className={`text-gray-600 mb-3 ${viewMode === "grid" ? "text-sm line-clamp-2" : "text-sm line-clamp-1"}`}
                  >
                    {product.description}
                  </p>
                </div>
                <div
                  className={`${viewMode === "list" ? "flex items-center justify-between" : ""}`}
                >
                  <div
                    className={`${viewMode === "list" ? "" : "flex items-center justify-between mb-2"}`}
                  >
                    <span className="text-2xl font-bold text-primary-600">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    {viewMode === "grid" && (
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/products/${product.id}`}
                          className="btn-outline text-sm"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {viewMode === "list" && (
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/products/${product.id}`}
                        className="btn-outline text-sm"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add to Cart
                      </button>
                    </div>
                  )}
                  <div
                    className={`text-sm text-gray-500 ${viewMode === "list" ? "ml-4" : "mt-2"}`}
                  >
                    {product.stock > 0
                      ? `${product.stock} in stock`
                      : "Out of stock"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
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
  );
};

export default Products;
