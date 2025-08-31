import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero slideshow data
  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'AR Virtual Try-On',
      subtitle: 'Experience fashion like never before with our AI-powered virtual try-on technology',
      cta: 'Try It Now'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Smart Glasses Detection',
      subtitle: 'Advanced YOLO object detection for precise accessory placement',
      cta: 'Learn More'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80',
      title: 'Real-Time Performance',
      subtitle: 'Optimized for lightning-fast processing and smooth user experience',
      cta: 'Get Started'
    }
  ];

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Featured products
  const products = [
    {
      id: 1,
      name: 'Classic Aviator Sunglasses',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&auto=format&fit=crop&w=880&q=80',
      category: 'Sunglasses',
      badge: 'Popular'
    },
    {
      id: 2,
      name: 'Premium Leather Handbag',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80',
      category: 'Bags',
      badge: 'New'
    },
    {
      id: 3,
      name: 'Luxury Smart Watch',
      price: 599.99,
      image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80',
      category: 'Watches',
      badge: 'Featured'
    },
    {
      id: 4,
      name: 'Diamond Stud Earrings',
      price: 1299.99,
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      category: 'Jewelry',
      badge: 'Premium'
    }
  ];

  return (
    <div className="bg-light">
      {/* Hero Carousel */}
      <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              data-bs-target="#heroCarousel"
              data-bs-slide-to={index}
              className={index === currentSlide ? 'active' : ''}
              aria-current={index === currentSlide ? 'true' : 'false'}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
        
        <div className="carousel-inner">
          {slides.map((slide, index) => (
            <div key={slide.id} className={`carousel-item ${index === currentSlide ? 'active' : ''}`}>
              <div className="position-relative" style={{ height: '600px' }}>
                <img
                  src={slide.image}
                  className="d-block w-100 h-100"
                  style={{ objectFit: 'cover' }}
                  alt={slide.title}
                />
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark" style={{ opacity: 0.4 }}></div>
                <div className="position-absolute top-50 start-50 translate-middle text-center text-white">
                  <h1 className="display-4 fw-bold mb-4">{slide.title}</h1>
                  <p className="lead mb-4">{slide.subtitle}</p>
                  <button className="btn btn-primary btn-lg px-5 py-3 fw-semibold">
                    {slide.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      {/* Features Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-lg-8 mx-auto">
              <h2 className="display-6 fw-bold text-dark mb-3">Why Choose Our AR Try-On?</h2>
              <p className="lead text-muted">Experience the future of online shopping with our cutting-edge technology</p>
            </div>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-cpu fs-1 text-primary"></i>
                  </div>
                  <h5 className="card-title fw-bold">AI-Powered Detection</h5>
                  <p className="card-text text-muted">Advanced YOLO object detection ensures precise accessory placement on your face.</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-lightning-charge fs-1 text-success"></i>
                  </div>
                  <h5 className="card-title fw-bold">Real-Time Processing</h5>
                  <p className="card-text text-muted">Optimized for lightning-fast performance with sub-second response times.</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-phone fs-1 text-warning"></i>
                  </div>
                  <h5 className="card-title fw-bold">Mobile Optimized</h5>
                  <p className="card-text text-muted">Works seamlessly on all devices with responsive design and touch-friendly controls.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-lg-8 mx-auto">
              <h2 className="display-6 fw-bold text-dark mb-3">Featured Products</h2>
              <p className="lead text-muted">Try on our premium accessories with our AR technology</p>
            </div>
          </div>

          <div className="row g-4">
            {products.map((product) => (
              <div key={product.id} className="col-md-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm product-card">
                  <div className="position-relative">
                    <img
                      src={product.image}
                      className="card-img-top"
                      style={{ height: '250px', objectFit: 'cover' }}
                      alt={product.name}
                    />
                    <span className={`position-absolute top-0 end-0 m-2 badge ${product.badge === 'Popular' ? 'bg-danger' : product.badge === 'New' ? 'bg-success' : product.badge === 'Featured' ? 'bg-primary' : 'bg-warning'}`}>
                      {product.badge}
                    </span>
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h6 className="card-title fw-bold mb-2">{product.name}</h6>
                    <p className="text-muted small mb-2">{product.category}</p>
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="h5 fw-bold text-primary mb-0">${product.price}</span>
                        <div className="text-warning">
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star"></i>
                        </div>
                      </div>
                      <div className="d-grid gap-2">
                        <Link to={`/product/${product.id}`} className="btn btn-outline-primary btn-sm">
                          <i className="bi bi-eye me-2"></i>View Details
                        </Link>
                        <button className="btn btn-primary btn-sm">
                          <i className="bi bi-camera me-2"></i>Try On
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h2 className="display-6 fw-bold mb-3">Ready to Try AR Shopping?</h2>
              <p className="lead mb-4">Experience the future of online shopping with our AI-powered virtual try-on technology. See how accessories look on you in real-time!</p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <button className="btn btn-light btn-lg px-4 py-3 fw-semibold">
                <i className="bi bi-camera me-2"></i>Start AR Try-On
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 