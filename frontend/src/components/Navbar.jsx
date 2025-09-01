import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../images/logo.png';

const Navbar = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('[data-dropdown-toggle]')) {
        setIsCartOpen(false);
        setIsUserOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
    setIsUserOpen(false);
  };

  const toggleUser = () => {
    setIsUserOpen(!isUserOpen);
    setIsCartOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-gray-100 dark:bg-gray-800 antialiased w-full">
      <div className="w-full px-8 mx-auto py-8">
        <div className="flex items-center justify-between">

          <div className="flex items-center space-x-16">
            <div className="shrink-0">
              <Link to="/" title="Fashion Retailer" className="flex items-center">
                {/* Logo Image */}
                <img 
                  src={logoImage} 
                  alt="Fashion Retailer Logo" 
                  className="w-56 h-56 object-contain"
                />
              </Link>
            </div>

            <ul className="hidden lg:flex items-center justify-start gap-12 md:gap-14 py-6 sm:justify-center">
              <li>
                <Link to="/" title="" className="flex text-2xl font-semibold text-gray-900 hover:text-primary-700 dark:text-white dark:hover:text-primary-500">
                  Home
                </Link>
              </li>
              <li className="shrink-0">
                <Link to="/try-on" title="" className="flex text-2xl font-semibold text-gray-900 hover:text-primary-700 dark:text-white dark:hover:text-primary-500">
                  Accessories
                </Link>
              </li>
              <li className="shrink-0">
                <Link to="/three-tier-tryon" title="" className="text-2xl font-semibold text-gray-900 hover:text-primary-700 dark:text-white dark:hover:text-primary-500">
                  Try-On System
                </Link>
              </li>
              <li className="shrink-0">
                <Link to="/" title="" className="text-2xl font-semibold text-gray-900 hover:text-primary-700 dark:text-white dark:hover:text-primary-500">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex items-center lg:space-x-6">

            <button 
              onClick={toggleCart}
              type="button" 
              className="inline-flex items-center rounded-lg justify-center p-4 hover:bg-gray-200 dark:hover:bg-gray-700 text-xl font-semibold leading-none text-gray-900 dark:text-white"
            >
              <span className="sr-only">
                Cart
              </span>
              <svg className="w-8 h-8 lg:me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 4h1.5L9 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8.5-3h9.25L19 7H7.312"/>
              </svg> 
              <span className="hidden sm:flex text-xl">My Cart</span>
              <svg className="hidden sm:flex w-6 h-6 text-gray-900 dark:text-white ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7"/>
              </svg>              
            </button>

            {isCartOpen && (
              <div className="absolute top-full right-0 mt-2 z-10 mx-auto max-w-sm space-y-4 overflow-hidden rounded-lg bg-white p-6 antialiased shadow-lg dark:bg-gray-800">
                <div className="grid grid-cols-2">
                  <div>
                    <a href="#" className="truncate text-xl font-semibold leading-none text-gray-900 dark:text-white hover:underline">Designer Sunglasses</a>
                    <p className="mt-1 truncate text-xl font-normal text-gray-500 dark:text-gray-400">$299</p>
                  </div>
          
                  <div className="flex items-center justify-end gap-6">
                    <p className="text-xl font-normal leading-none text-gray-500 dark:text-gray-400">Qty: 1</p>
          
                    <button type="button" className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-600">
                      <span className="sr-only"> Remove </span>
                      <svg className="h-6 w-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm7.7-3.7a1 1 0 0 0-1.4 1.4l2.3 2.3-2.3 2.3a1 1 0 1 0 1.4 1.4l2.3-2.3 2.3 2.3a1 1 0 0 0 1.4-1.4L13.4 12l2.3-2.3a1 1 0 0 0-1.4-1.4L12 10.6 9.7 8.3Z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
          
                <div className="grid grid-cols-2">
                  <div>
                    <a href="#" className="truncate text-xl font-semibold leading-none text-gray-900 dark:text-white hover:underline">Premium Watch</a>
                    <p className="mt-1 truncate text-xl font-normal text-gray-500 dark:text-gray-400">$599</p>
                  </div>
          
                  <div className="flex items-center justify-end gap-6">
                    <p className="text-xl font-normal leading-none text-gray-500 dark:text-gray-400">Qty: 1</p>
          
                    <button type="button" className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-600">
                      <span className="sr-only"> Remove </span>
                      <svg className="h-6 w-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm7.7-3.7a1 1 0 0 0-1.4 1.4l2.3 2.3-2.3 2.3a1 1 0 1 0 1.4 1.4l2.3-2.3 2.3 2.3a1 1 0 0 0 1.4-1.4L13.4 12l2.3-2.3a1 1 0 0 0-1.4-1.4L12 10.6 9.7 8.3Z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
          
                <a href="#" title="" className="mb-2 me-2 inline-flex w-full items-center justify-center rounded-lg bg-primary-700 px-6 py-3 text-xl font-semibold text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" role="button"> 
                  Proceed to Checkout 
                </a>
              </div>
            )}

            <button 
              onClick={toggleUser}
              type="button" 
              className="inline-flex items-center rounded-lg justify-center p-4 hover:bg-gray-200 dark:hover:bg-gray-700 text-xl font-semibold leading-none text-gray-900 dark:text-white"
            >
              <svg className="w-8 h-8 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth="2" d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
              </svg>              
              Account
              <svg className="w-6 h-6 text-gray-900 dark:text-white ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7"/>
              </svg> 
            </button>

            {isUserOpen && (
              <div className="absolute top-full right-0 mt-2 z-10 w-64 divide-y divide-gray-100 overflow-hidden overflow-y-auto rounded-lg bg-white antialiased shadow dark:divide-gray-600 dark:bg-gray-700">
                <ul className="p-3 text-start text-xl font-semibold text-gray-900 dark:text-white">
                  <li><a href="#" title="" className="inline-flex w-full items-center gap-3 rounded-md px-4 py-3 text-xl hover:bg-gray-100 dark:hover:bg-gray-600"> My Account </a></li>
                  <li><a href="#" title="" className="inline-flex w-full items-center gap-3 rounded-md px-4 py-3 text-xl hover:bg-gray-100 dark:hover:bg-gray-600"> My Orders </a></li>
                  <li><a href="#" title="" className="inline-flex w-full items-center gap-3 rounded-md px-4 py-3 text-xl hover:bg-gray-100 dark:hover:bg-gray-600"> Settings </a></li>
                  <li><a href="#" title="" className="inline-flex w-full items-center gap-3 rounded-md px-4 py-3 text-xl hover:bg-gray-100 dark:hover:bg-gray-600"> Favourites </a></li>
                  <li><a href="#" title="" className="inline-flex w-full items-center gap-3 rounded-md px-4 py-3 text-xl hover:bg-gray-100 dark:hover:bg-gray-600"> Delivery Addresses </a></li>
                  <li><a href="#" title="" className="inline-flex w-full items-center gap-3 rounded-md px-4 py-3 text-xl hover:bg-gray-100 dark:hover:bg-gray-600"> Billing Data </a></li>
                </ul>
        
                <div className="p-3 text-xl font-semibold text-gray-900 dark:text-white">
                  <a href="#" title="" className="inline-flex w-full items-center gap-3 rounded-md px-4 py-3 text-xl hover:bg-gray-100 dark:hover:bg-gray-600"> Sign Out </a>
                </div>
              </div>
            )}

            <button 
              type="button" 
              onClick={toggleMobileMenu}
              className="inline-flex lg:hidden items-center justify-center hover:bg-gray-200 rounded-md dark:hover:bg-gray-700 p-4 text-gray-900 dark:text-white"
            >
              <span className="sr-only">
                Open Menu
              </span>
              <svg className="w-8 h-8" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h14"/>
              </svg>                
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 border border-gray-300 rounded-lg py-6 px-8 mt-6">
            <ul className="text-gray-900 dark:text-white text-2xl font-semibold dark:text-white space-y-6">
              <li>
                <Link to="/" className="hover:text-primary-700 dark:hover:text-primary-500">Home</Link>
              </li>
              <li>
                <Link to="/try-on" className="hover:text-primary-700 dark:hover:text-primary-500">Accessories</Link>
              </li>
              <li>
                <Link to="/three-tier-tryon" className="hover:text-primary-700 dark:hover:text-primary-500">Try-On System</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary-700 dark:hover:text-primary-500">About</Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 