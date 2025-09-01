import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';

const ThreeTierTryOn = () => {
  const [selectedSystem, setSelectedSystem] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [status, setStatus] = useState('');
  const [selectedProduct, setSelectedProduct] = useState({ id: 'product_1', name: 'Classic Aviator', type: 'glasses', category: 'Glasses' });
  const [showMeasurements, setShowMeasurements] = useState(false);
  
  // WebSocket for real-time mode
  const [wsConnection, setWsConnection] = useState(null);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // AR System options
  const arSystems = [
    {
      id: 'single-image',
      name: '📸 Single Image Try-On',
      description: 'High-quality single shots for screenshots & evaluation',
      accuracy: 'Maximum',
      speed: 'Slower',
      target: '640px',
      quality: '95%',
      useCase: 'Product evaluation, screenshots, detailed analysis'
    },
    {
      id: 'realtime',
      name: '⚡ Real-Time Stream',
      description: 'WebSocket-based, fast, adaptive quality for live interaction',
      accuracy: 'Adaptive',
      speed: 'Fast',
      target: '256px',
      quality: '70%',
      useCase: 'Live interaction, continuous try-on experience'
    },
    {
      id: 'high-accuracy',
      name: '🎯 High-Accuracy Stream',
      description: 'Balanced approach for continuous try-on experience',
      accuracy: 'High',
      speed: 'Medium',
      target: '320px',
      quality: '60%',
      useCase: 'Continuous try-on with good accuracy'
    }
  ];

  // Product options - unified list with correct IDs matching backend database
  const allProducts = [
    // Glasses - IDs must match exactly with backend PRODUCT_DATABASE
    { id: 'product_1', name: 'Classic Aviator', type: 'glasses', category: 'Glasses' },
    { id: 'product_2', name: 'Raider Sunglasses', type: 'glasses', category: 'Glasses' },
    { id: 'product_3', name: 'Winter Sport Glasses', type: 'glasses', category: 'Glasses' },
    // Hats - IDs must match exactly with backend PRODUCT_DATABASE
    { id: 'product_4', name: 'Polo Hat', type: 'hat', category: 'Hats' }
  ];

  // Reset state when system changes
  useEffect(() => {
    setProcessedImage(null);
    setStatus('');
    setIsProcessing(false);
    if (wsConnection) {
      wsConnection.close();
      setWsConnection(null);
      setIsRealtimeActive(false);
    }
  }, [selectedSystem]);

  // 1. SINGLE IMAGE TRY-ON
  const handleSingleImageTryOn = async () => {
    if (!webcamRef.current) return;
    
    setIsProcessing(true);
    setStatus('Processing single image for maximum quality...');
    
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      const base64Data = imageSrc.split(',')[1];
      
      const formData = new FormData();
      const blob = await fetch(imageSrc).then(r => r.blob());
      formData.append('file', blob, 'image.jpg');
      formData.append('product_type', selectedProduct.type);
      formData.append('product_id', selectedProduct.id);
      formData.append('show_measurements', showMeasurements);
      
      console.log('Sending to backend:', { product_type: selectedProduct.type, product_id: selectedProduct.id });
      
      const response = await fetch('http://localhost:8001/single-tryon', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        setProcessedImage(`data:image/jpeg;base64,${result.image_base64}`);
        setStatus(`Single image complete - ${result.quality} quality`);
      } else {
        setStatus('Error processing single image');
      }
    } catch (error) {
      console.error('Single image error:', error);
      setStatus('Error processing single image');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. REAL-TIME STREAM (WebSocket)
  const startRealtimeStream = () => {
    if (wsConnection) {
      wsConnection.close();
    }
    
    const ws = new WebSocket('ws://localhost:8001/websocket-tryon');
    
    ws.onopen = () => {
      console.log('WebSocket connected for real-time stream');
      setWsConnection(ws);
      setIsRealtimeActive(true);
      setStatus('Real-time stream active - WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'processed_frame') {
        setProcessedImage(`data:image/jpeg;base64,${data.image_base64}`);
        setStatus(`Real-time: ${data.quality} quality`);
      } else if (data.type === 'error') {
        setStatus(`Real-time error: ${data.error}`);
      }
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWsConnection(null);
      setIsRealtimeActive(false);
      setStatus('Real-time stream disconnected');
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('WebSocket connection error');
    };
  };

  const stopRealtimeStream = () => {
    if (wsConnection) {
      wsConnection.close();
    }
    setIsRealtimeActive(false);
    setStatus('Real-time stream stopped');
  };

  const sendFrameToWebSocket = () => {
    if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    const base64Data = imageSrc.split(',')[1];
    
    const message = {
      type: 'frame',
      image_base64: base64Data,
      product_type: selectedProduct.type,
      product_id: selectedProduct.id
    };
    
    console.log('Sending to WebSocket:', { product_type: selectedProduct.type, product_id: selectedProduct.id });
    wsConnection.send(JSON.stringify(message));
  };

  // 3. HIGH-ACCURACY STREAM (Current system)
  const handleHighAccuracyTryOn = async () => {
    if (!webcamRef.current) return;
    
    setIsProcessing(true);
    setStatus('Processing high-accuracy stream...');
    
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      const base64Data = imageSrc.split(',')[1];
      
      const formData = new FormData();
      const blob = await fetch(imageSrc).then(r => r.blob());
      formData.append('file', blob, 'image.jpg');
      formData.append('product_type', selectedProduct.type);
      formData.append('product_id', selectedProduct.id);
      formData.append('show_measurements', showMeasurements);
      
      console.log('Sending to backend:', { product_type: selectedProduct.type, product_id: selectedProduct.id });
      
      const response = await fetch('http://localhost:8001/tryon', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        setProcessedImage(`data:image/jpeg;base64,${result.image_base64}`);
        setStatus(`High-accuracy complete - ${result.quality} quality`);
      } else {
        setStatus('Error processing high-accuracy stream');
      }
    } catch (error) {
      console.error('High-accuracy error:', error);
      setStatus('Error processing high-accuracy stream');
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-send frames for real-time mode
  useEffect(() => {
    let interval;
    if (isRealtimeActive && wsConnection) {
      interval = setInterval(sendFrameToWebSocket, 100); // 10 FPS
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRealtimeActive, wsConnection]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [wsConnection]);

  const getSelectedSystemInfo = () => {
    return arSystems.find(system => system.id === selectedSystem);
  };

  const renderSystemControls = () => {
    if (!selectedSystem) return null;

    switch (selectedSystem) {
      case 'single-image':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              📸 Single Image Try-On
            </h3>
            <p className="text-blue-700 mb-4">
              High-quality single shots for screenshots & evaluation. Maximum accuracy with comprehensive processing.
            </p>
            <button
              onClick={handleSingleImageTryOn}
              disabled={isProcessing}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Capture & Process Single Image'}
            </button>
          </div>
        );

      case 'realtime':
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">
              ⚡ Real-Time Stream
            </h3>
            <p className="text-green-700 mb-4">
              WebSocket-based, fast, adaptive quality for live interaction. Optimized for speed over accuracy.
            </p>
            <div className="space-x-4">
              {!isRealtimeActive ? (
                <button
                  onClick={startRealtimeStream}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
                >
                  Start Real-Time Stream
                </button>
              ) : (
                <button
                  onClick={stopRealtimeStream}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700"
                >
                  Stop Real-Time Stream
                </button>
              )}
            </div>
          </div>
        );

      case 'high-accuracy':
        return (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">
              🎯 High-Accuracy Stream
            </h3>
            <p className="text-purple-700 mb-4">
              Balanced approach for continuous try-on experience. Good accuracy with reasonable speed.
            </p>
            <button
              onClick={handleHighAccuracyTryOn}
              disabled={isProcessing}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Process High-Accuracy Stream'}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Three-Tier Virtual Try-On System
        </h1>
        
        {/* AR System Selection */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Select AR System</h2>
          {!selectedSystem && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-center">
                🎯 <strong>Choose an AR system below</strong> to start testing products with different accuracy and speed trade-offs.
              </p>
            </div>
          )}
          <select
            value={selectedSystem}
            onChange={(e) => setSelectedSystem(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          >
            <option value="">Choose an AR system...</option>
            {arSystems.map(system => (
              <option key={system.id} value={system.id}>
                {system.name}
              </option>
            ))}
          </select>
          
          {/* System Information */}
          {selectedSystem && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">System Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Accuracy:</span>
                  <p className="text-gray-800">{getSelectedSystemInfo()?.accuracy}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Speed:</span>
                  <p className="text-gray-800">{getSelectedSystemInfo()?.speed}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Target Size:</span>
                  <p className="text-gray-800">{getSelectedSystemInfo()?.target}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Quality:</span>
                  <p className="text-gray-800">{getSelectedSystemInfo()?.quality}</p>
                </div>
              </div>
              <p className="mt-3 text-gray-700">
                <span className="font-medium">Use Case:</span> {getSelectedSystemInfo()?.useCase}
              </p>
              <div className="mt-4 pt-3 border-t border-gray-200">
                <button 
                  onClick={() => setSelectedSystem('')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  ← Change System Selection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Product Configuration - Only show when system is selected */}
        {selectedSystem && (
          <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Product Selection</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Product
                </label>
                <select
                  value={selectedProduct.id}
                  onChange={(e) => {
                    const newProduct = allProducts.find(p => p.id === e.target.value);
                    setSelectedProduct(newProduct);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <optgroup label="👓 Glasses">
                    {allProducts.filter(p => p.type === 'glasses').map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🎩 Hats">
                    {allProducts.filter(p => p.type === 'hat').map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showMeasurements"
                  checked={showMeasurements}
                  onChange={(e) => setShowMeasurements(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showMeasurements" className="ml-2 text-sm text-gray-700">
                  Show Measurements
                </label>
              </div>
            </div>
            
            {/* Selected Product Info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-600">Selected:</span>
                  <p className="text-gray-800 font-medium">{selectedProduct.category}: {selectedProduct.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">Type: {selectedProduct.type}</span>
                  <br />
                  <span className="text-xs text-gray-500">ID: {selectedProduct.id}</span>
                </div>
              </div>
              
              {/* Test Product Selection */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    console.log('Current product selection:', selectedProduct);
                    alert(`Product Selection Test:\n\nType: ${selectedProduct.type}\nID: ${selectedProduct.id}\nName: ${selectedProduct.name}\nCategory: ${selectedProduct.category}\n\nThis will be sent to backend as:\nproduct_type: ${selectedProduct.type}\nproduct_id: ${selectedProduct.id}`);
                  }}
                  className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                >
                  Test Product Selection
                </button>
              </div>
              
              {/* Debug Info */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800">Debug Info</summary>
                  <div className="mt-2 p-2 bg-gray-100 rounded text-gray-700 font-mono">
                    <div>Product Type: {selectedProduct.type}</div>
                    <div>Product ID: {selectedProduct.id}</div>
                    <div>Product Name: {selectedProduct.name}</div>
                    <div>Category: {selectedProduct.category}</div>
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <div><strong>Backend Parameters:</strong></div>
                      <div>product_type: "{selectedProduct.type}"</div>
                      <div>product_id: "{selectedProduct.id}"</div>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        )}

        {/* Camera and Output - Only show when system is selected */}
        {selectedSystem && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Camera Input */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Camera Input</h2>
              <div className="relative">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full rounded-lg"
                  videoConstraints={{
                    width: 640,
                    height: 480,
                    facingMode: "user"
                  }}
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                      Processing...
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Processed Output */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Processed Output</h2>
              <div className="relative min-h-[480px] bg-gray-100 rounded-lg flex items-center justify-center">
                {processedImage ? (
                  <img
                    src={processedImage}
                    alt="Processed"
                    className="w-full rounded-lg"
                  />
                ) : (
                  <div className="text-gray-500 text-center">
                    <div className="text-6xl mb-4">📷</div>
                    <p>Processed image will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* System-Specific Controls */}
        {selectedSystem && (
          <div className="mb-8">
            {renderSystemControls()}
          </div>
        )}

        {/* Status Display */}
        {status && (
          <div className="mt-6 bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
            <h3 className="font-semibold text-gray-800 mb-2">Status</h3>
            <p className="text-gray-600">{status}</p>
          </div>
        )}

        {/* System Comparison - Only show when no system is selected */}
        {!selectedSystem && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">System Comparison</h2>
            <p className="text-gray-600 mb-6 text-center">
              Compare the three AR systems to choose the best one for your needs
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {arSystems.map(system => (
                <div key={system.id} className="text-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border-2 border-transparent hover:border-blue-300" onClick={() => setSelectedSystem(system.id)}>
                  <div className="text-4xl mb-3">{system.name.split(' ')[0]}</div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">{system.name.split(' ').slice(1).join(' ')}</h3>
                  <p className="text-sm text-gray-600 mb-4">{system.description}</p>
                  
                  {/* Performance Metrics */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-gray-600">Accuracy:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        system.accuracy === 'Maximum' ? 'bg-red-100 text-red-800' :
                        system.accuracy === 'High' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {system.accuracy}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-gray-600">Speed:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        system.speed === 'Fast' ? 'bg-green-100 text-green-800' :
                        system.speed === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {system.speed}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-gray-600">Target:</span>
                      <span className="text-gray-800 font-mono">{system.target}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-gray-600">Quality:</span>
                      <span className="text-gray-800 font-mono">{system.quality}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-4 italic">{system.useCase}</p>
                  
                  <div className="mt-4">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      Select This System
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Quick Decision Guide */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3">Quick Decision Guide</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
                <div>
                  <strong>📸 Single Image:</strong> Use when you need high-quality screenshots or detailed analysis
                </div>
                <div>
                  <strong>⚡ Real-Time:</strong> Use for live interaction and continuous try-on experience
                </div>
                <div>
                  <strong>🎯 High-Accuracy:</strong> Use for balanced performance with good accuracy and reasonable speed
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreeTierTryOn; 