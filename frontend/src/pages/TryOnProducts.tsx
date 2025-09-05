import React from 'react';
import { useNavigate } from 'react-router-dom';

const TryOnProducts = () => {
  const navigate = useNavigate();
  
  const products = [
    {
      id: "product_1",
      name: "Classic Aviator",
      category: "Glasses",
      price: "$199.99",
      image: "glassses.png",
      description: "Timeless aviator style with premium UV protection",
      colors: ["Gold", "Silver", "Black"],
      brand: "Ray-Ban"
    },
    {
      id: "product_2",
      name: "Raider Sunglasses",
      category: "Glasses", 
      price: "$299.99",
      image: "raider_sunglasses.png",
      description: "Round retro frames for a sophisticated look",
      colors: ["Tortoise", "Black", "Clear"],
      brand: "Oakley"
    },
    {
      id: "product_3",
      name: "Winter Sport Glasses",
      category: "Glasses",
      price: "$349.99", 
      image: "winter-sport-glasses.png",
      description: "High-performance sports sunglasses with anti-glare coating",
      colors: ["Blue", "Green", "Gray"],
      brand: "Smith"
    },
    {
      id: "product_4",
      name: "Polo Hat",
      category: "Hat",
      price: "$29.99",
      image: "hat.png",
      description: "Classic polo hat with adjustable fit",
      colors: ["Navy", "Black", "Gray", "Red"],
      brand: "Nike"
    },
    {
      id: "product_5",
      name: "Cat Eye Sunglasses",
      category: "Glasses",
      price: "$119.99",
      image: "glassses.png",
      description: "Fashionable cat eye frames for a bold statement",
      colors: ["Rose Gold", "Black", "Tortoise"],
      brand: "Ray-Ban"
    },
    {
      id: "product_6",
      name: "Beanie Hat",
      category: "Hat",
      price: "$24.99",
      image: "hat.png",
      description: "Warm and cozy beanie for cold weather",
      colors: ["Black", "Gray", "Navy", "Red"],
      brand: "Nike"
    },
    {
      id: "product_7",
      name: "Pilot Sunglasses",
      category: "Glasses",
      price: "$169.99",
      image: "raider_sunglasses.png",
      description: "Premium pilot sunglasses with polarized lenses",
      colors: ["Gold", "Silver", "Black"],
      brand: "Oakley"
    },
    {
      id: "product_8",
      name: "Bucket Hat",
      category: "Hat",
      price: "$29.99",
      image: "hat.png",
      description: "Casual bucket hat for outdoor activities",
      colors: ["Khaki", "Black", "Blue", "Green"],
      brand: "Nike"
    },
    {
      id: "product_9",
      name: "Reading Glasses",
      category: "Glasses",
      price: "$79.99",
      image: "glassses.png",
      description: "Comfortable reading glasses with anti-reflective coating",
      colors: ["Black", "Brown", "Clear"],
      brand: "Ray-Ban"
    },
    {
      id: "product_10",
      name: "Sport Performance",
      category: "Glasses",
      price: "$149.99",
      image: "winter-sport-glasses.png",
      description: "High-performance sports eyewear for active lifestyles",
      colors: ["Blue", "Green", "Gray"],
      brand: "Smith"
    }
  ];

  const handleTryOn = (productId: string) => {
    console.log(`Starting AR try-on for product ${productId}`);
    navigate('/three-tier-tryon');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <section className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="w-full px-4 sm:px-6 lg:px-8 pl-8">
          {/* Category Filters */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4">
              <button className="px-6 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition duration-300">
                All Products
              </button>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Products Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {products.slice(0, 8).map((product) => (
                  <div key={product.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden group">
                    {/* Product Image */}
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center p-6 overflow-hidden">
                      <img 
                        src={`/src/images/${product.image}`}
                        alt={product.name}
                        className="w-4/5 h-4/5 object-contain group-hover:scale-110 transition duration-300"
                      />
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
                      
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {product.brand}
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
                        <button
                          onClick={() => handleTryOn(product.id)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105"
                        >
                          Virtual Try On
                        </button>
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

            {/* Sidebar with Additional Products */}
            <div className="lg:w-96">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-8 h-screen overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  More Products
                </h3>
                <div className="space-y-4">
                  {products.slice(8, 10).map((product) => (
                    <div key={product.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden">
                          <img 
                            src={`/src/images/${product.image}`}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {product.name}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {product.price}
                            </span>
                            <button
                              onClick={() => handleTryOn(product.id)}
                              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-2 rounded transition duration-300"
                            >
                              Try On
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Featured Product */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Featured Product
                  </h4>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-4xl mb-3">👓</div>
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Premium Collection
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Discover our latest premium eyewear collection
                      </p>
                      <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300">
                        Explore Collection
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional Content to Fill Space */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Popular Categories
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-300">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🕶️</span>
                        <span className="font-medium text-gray-900 dark:text-white">Sunglasses</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">24 items</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-300">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">👓</span>
                        <span className="font-medium text-gray-900 dark:text-white">Eyeglasses</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">18 items</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-300">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🧢</span>
                        <span className="font-medium text-gray-900 dark:text-white">Hats</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">12 items</span>
                    </div>
                  </div>
                </div>

                {/* Newsletter Signup */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Stay Updated
                  </h4>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      Get notified about new products and exclusive offers
                    </p>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 text-sm">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AR Instructions */}
      <section className="py-12 bg-gray-100 dark:bg-gray-800">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
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