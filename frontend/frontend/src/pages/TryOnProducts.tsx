import React from 'react';
import { useNavigate } from 'react-router-dom';

const TryOnProducts = () => {
  const navigate = useNavigate();
  
  const products = [
    {
      id: 1,
      name: "Classic Aviator Sunglasses",
      category: "Glasses",
      price: "$129.99",
      image: "🕶️",
      description: "Timeless aviator style with premium UV protection",
      colors: ["Gold", "Silver", "Black"]
    },
    {
      id: 2,
      name: "Round Retro Glasses",
      category: "Glasses", 
      price: "$89.99",
      image: "👓",
      description: "Vintage-inspired round frames for a sophisticated look",
      colors: ["Tortoise", "Black", "Clear"]
    },
    {
      id: 3,
      name: "Sport Performance Sunglasses",
      category: "Glasses",
      price: "$149.99", 
      image: "🕶️",
      description: "High-performance sports sunglasses with anti-glare coating",
      colors: ["Blue", "Green", "Gray"]
    },
    {
      id: 4,
      name: "Baseball Cap",
      category: "Hat",
      price: "$34.99",
      image: "🧢",
      description: "Classic baseball cap with adjustable fit",
      colors: ["Navy", "Black", "Gray", "Red"]
    },
    {
      id: 5,
      name: "Fedora Hat",
      category: "Hat",
      price: "$59.99",
      image: "🎩",
      description: "Elegant fedora hat for a sophisticated appearance",
      colors: ["Brown", "Black", "Gray"]
    }
  ];

  const handleTryOn = (productId: number, type: 'single' | 'stream') => {
    console.log(`Starting AR try-on for product ${productId} with type ${type}`);
    if (type === 'stream') {
      navigate('/tryon-stream');
    } else {
      navigate('/virtual-tryon');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <section className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Virtual Try-On Products
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Try on our products virtually with AR technology
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filters */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4">
              <button className="px-6 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition duration-300">
                All Products
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden group">
                {/* Product Image */}
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center p-8">
                  <div className="text-8xl group-hover:scale-110 transition duration-300">
                    {product.image}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      {product.category}
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {product.price}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {product.name}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {product.description}
                  </p>

                  {/* Color Options */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Available Colors:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleTryOn(product.id, 'single')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition duration-300 transform hover:scale-105 text-sm"
                      >
                        Single Shot
                      </button>
                      <button
                        onClick={() => handleTryOn(product.id, 'stream')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition duration-300 transform hover:scale-105 text-sm"
                      >
                        Live Stream
                      </button>
                    </div>
                    <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300 flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                      Wishlist
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AR Instructions */}
      <section className="py-12 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            How to Use AR Try-On
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Allow Camera Access
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Grant camera permissions to enable AR try-on functionality
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Position Your Face
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Center your face in the camera view for accurate placement
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Try Different Styles
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Switch between products and colors to find your perfect match
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TryOnProducts; 