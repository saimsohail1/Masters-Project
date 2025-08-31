import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleStartTryOn = () => {
    navigate('/try-on');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-700 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Experience Fashion
                <span className="block text-gray-300">Like Never Before</span>
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-gray-300">
                Try on clothes virtually with our cutting-edge AR technology. 
                See how you look before you buy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleStartTryOn}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105"
                >
                  Start Virtual Try-On
                </button>
                <button 
                  onClick={handleStartTryOn}
                  className="border-2 border-white hover:bg-white hover:text-gray-800 font-bold py-4 px-8 rounded-lg text-lg transition duration-300"
                >
                  Explore Collections
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="aspect-square bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🕶️</div>
                    <p className="text-lg font-semibold">AR Try-On Demo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our AR Experience?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover the future of online shopping with our innovative virtual try-on technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Real-time Try-On
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                See how clothes fit in real-time with our advanced AR technology
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Perfect Fit
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get accurate sizing recommendations based on your body measurements
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Instant Results
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                No waiting time - see your virtual outfit instantly
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💾</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Save & Share
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Save your favorite looks and share them with friends
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Our Collections
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Discover the latest trends in fashion with our AR try-on experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* His Collection */}
            <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className="aspect-[4/5] bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">👔</div>
                  <h3 className="text-2xl font-bold mb-2">His Collection</h3>
                  <p className="text-gray-200">Men's Fashion</p>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Men's Fashion
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Explore our collection of men's clothing with virtual try-on
                </p>
                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300">
                  Try On Now
                </button>
              </div>
            </div>

            {/* Her Collection */}
            <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className="aspect-[4/5] bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🕶️</div>
                  <h3 className="text-2xl font-bold mb-2">Her Collection</h3>
                  <p className="text-gray-200">Women's Fashion</p>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Women's Fashion
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Discover the latest women's trends with AR try-on technology
                </p>
                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300">
                  Try On Now
                </button>
              </div>
            </div>

            {/* New In */}
            <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className="aspect-[4/5] bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🆕</div>
                  <h3 className="text-2xl font-bold mb-2">New In</h3>
                  <p className="text-gray-200">Latest Arrivals</p>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Latest Arrivals
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Be the first to try on our newest arrivals with AR technology
                </p>
                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300">
                  Explore New
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your Shopping Experience?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of customers who are already using our AR try-on technology to make better fashion choices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleStartTryOn}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105"
            >
              Start Shopping Now
            </button>
            <button className="border-2 border-white hover:bg-white hover:text-gray-900 font-bold py-4 px-8 rounded-lg text-lg transition duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Fashion Retailer</h3>
              <p className="text-gray-400">
                Experience the future of fashion shopping with our innovative AR try-on technology.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition duration-300">Home</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">His Collection</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Her Collection</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">New In</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition duration-300">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Size Guide</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition duration-300">About Us</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Blog</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Careers</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Fashion Retailer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 