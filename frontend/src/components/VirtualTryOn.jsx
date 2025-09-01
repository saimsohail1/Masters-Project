import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 480,
  height: 480,
  facingMode: "user", // front camera
};

const VirtualTryOn = () => {
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("product_1");
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [measurements, setMeasurements] = useState(null);
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [customDimensions, setCustomDimensions] = useState({
    frame_width_mm: 135,
    frame_height_mm: 50,
    lens_width_mm: 58,
    lens_height_mm: 40,
    bridge_width_mm: 18
  });

  const products = [
    { 
      id: "product_1", 
      name: "Classic Aviator", 
      type: "glasses",
      image: "glassses.png",
      brand: "Ray-Ban",
      price: 199.99
    },
    { 
      id: "product_2", 
      name: "Raider Sunglasses", 
      type: "glasses",
      image: "raider_sunglasses.png",
      brand: "Oakley",
      price: 299.99
    },
    { 
      id: "product_3", 
      name: "Winter Sport Glasses", 
      type: "glasses",
      image: "winter-sport-glasses.png",
      brand: "Smith",
      price: 349.99
    },
    { 
      id: "product_4", 
      name: "Polo Hat", 
      type: "hat",
      image: "hat.png",
      brand: "Nike",
      price: 29.99
    },
  ];

  const capture = () => {
    const screenshot = webcamRef.current.getScreenshot();
    setImageSrc(screenshot);
  };

  const retake = () => {
    setImageSrc(null);
    setResult(null);
    setMeasurements(null);
  };

  const getMeasurementsOnly = async () => {
    if (!imageSrc) return;

    setIsProcessing(true);
    try {
      const blob = await fetch(imageSrc).then((res) => res.blob());
      const formData = new FormData();
      formData.append("file", blob, "captured.jpg");

      const response = await fetch("http://localhost:8001/measurements", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setMeasurements(data);
      console.log("Measurements:", data);
    } catch (error) {
      console.error("Measurement error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const uploadToBackend = async () => {
    if (!imageSrc) return;

    setIsProcessing(true);
    try {
      const blob = await fetch(imageSrc).then((res) => res.blob());
      const formData = new FormData();
      formData.append("file", blob, "captured.jpg");
      formData.append("product_type", "glasses");
      formData.append("product_id", selectedProduct);
      formData.append("show_measurements", showMeasurements.toString());

      const response = await fetch("http://localhost:8001/tryon", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
      console.log("Try-On Result:", data);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getProductDatabase = async () => {
    try {
      const response = await fetch("http://localhost:8001/products");
      const data = await response.json();
      console.log("Product Database:", data);
    } catch (error) {
      console.error("Product database error:", error);
    }
  };

  const debugMeasurements = async () => {
    if (!imageSrc) return;

    setIsProcessing(true);
    try {
      const blob = await fetch(imageSrc).then((res) => res.blob());
      const formData = new FormData();
      formData.append("file", blob, "captured.jpg");

      const response = await fetch("http://localhost:8001/debug-measurements", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Debug Measurements:", data);
      setMeasurements(data);
    } catch (error) {
      console.error("Debug error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const calibrateGlasses = async () => {
    if (!imageSrc) return;

    setIsProcessing(true);
    try {
      const blob = await fetch(imageSrc).then((res) => res.blob());
      const formData = new FormData();
      formData.append("file", blob, "captured.jpg");
      formData.append("frame_width_mm", customDimensions.frame_width_mm);
      formData.append("frame_height_mm", customDimensions.frame_height_mm);
      formData.append("lens_width_mm", customDimensions.lens_width_mm);
      formData.append("lens_height_mm", customDimensions.lens_height_mm);
      formData.append("bridge_width_mm", customDimensions.bridge_width_mm);

      const response = await fetch("http://localhost:8001/calibrate-glasses", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
      console.log("Calibration Result:", data);
    } catch (error) {
      console.error("Calibration error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Virtual Try-On Camera
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Capture and try on products with accurate measurements and dimensions
          </p>
        </div>

        {/* Product Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Select Product
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedProduct === product.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img 
                    src={`/src/images/${product.image}`} 
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">{product.name}</div>
                    <div className="text-sm text-gray-600">
                      {product.brand} • ${product.price} • {product.type}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showMeasurements}
                onChange={(e) => setShowMeasurements(e.target.checked)}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">Show Measurements</span>
            </label>
            
            <button
              onClick={() => setCalibrationMode(!calibrationMode)}
              className={`px-4 py-2 rounded-lg font-semibold transition duration-300 ${
                calibrationMode 
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              {calibrationMode ? "Exit Calibration" : "Calibrate Dimensions"}
            </button>
            
            <button
              onClick={getProductDatabase}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition duration-300"
            >
              View Product Database
            </button>
          </div>

          {/* Calibration Mode */}
          {calibrationMode && (
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                Calibrate Your Glasses Dimensions (in mm)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Frame Width
                  </label>
                  <input
                    type="number"
                    value={customDimensions.frame_width_mm}
                    onChange={(e) => setCustomDimensions({
                      ...customDimensions,
                      frame_width_mm: parseFloat(e.target.value) || 135
                    })}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Frame Height
                  </label>
                  <input
                    type="number"
                    value={customDimensions.frame_height_mm}
                    onChange={(e) => setCustomDimensions({
                      ...customDimensions,
                      frame_height_mm: parseFloat(e.target.value) || 50
                    })}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Lens Width
                  </label>
                  <input
                    type="number"
                    value={customDimensions.lens_width_mm}
                    onChange={(e) => setCustomDimensions({
                      ...customDimensions,
                      lens_width_mm: parseFloat(e.target.value) || 58
                    })}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Lens Height
                  </label>
                  <input
                    type="number"
                    value={customDimensions.lens_height_mm}
                    onChange={(e) => setCustomDimensions({
                      ...customDimensions,
                      lens_height_mm: parseFloat(e.target.value) || 40
                    })}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Bridge Width
                  </label>
                  <input
                    type="number"
                    value={customDimensions.bridge_width_mm}
                    onChange={(e) => setCustomDimensions({
                      ...customDimensions,
                      bridge_width_mm: parseFloat(e.target.value) || 18
                    })}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.1"
                  />
                </div>
              </div>
              <div className="mt-4 text-sm text-blue-700 dark:text-blue-300">
                <p><strong>Tip:</strong> Measure your actual glasses or use standard sizes:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Small: 125-130mm frame width</li>
                  <li>Medium: 130-135mm frame width</li>
                  <li>Large: 135-140mm frame width</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            {!imageSrc ? (
              <div className="text-center">
                <div className="mb-6">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="mx-auto rounded-lg border-2 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <button 
                  onClick={capture}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 text-lg"
                >
                  Capture Photo
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-6">
                  <img 
                    src={imageSrc} 
                    alt="Captured" 
                    className="mx-auto rounded-lg border-2 border-gray-300 dark:border-gray-600 max-w-md"
                  />
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={retake}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                  >
                    Retake
                  </button>
                  <button 
                    onClick={getMeasurementsOnly}
                    disabled={isProcessing}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                  >
                    {isProcessing ? "Processing..." : "Get Measurements"}
                  </button>
                  <button 
                    onClick={debugMeasurements}
                    disabled={isProcessing}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                  >
                    {isProcessing ? "Processing..." : "Debug Sizing"}
                  </button>
                  <button 
                    onClick={uploadToBackend}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                  >
                    {isProcessing ? "Processing..." : "Try On Product"}
                  </button>
                  {calibrationMode && (
                    <button 
                      onClick={calibrateGlasses}
                      disabled={isProcessing}
                      className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                    >
                      {isProcessing ? "Processing..." : "Calibrate Glasses"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Results & Measurements
            </h2>
            
            {/* Measurements Display */}
            {measurements && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  Facial Measurements
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-800 dark:text-blue-200">IPD:</span>
                    <span className="ml-2 text-blue-700 dark:text-blue-300">
                      {measurements.facial_measurements?.ipd_mm}mm
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800 dark:text-blue-200">Face Width:</span>
                    <span className="ml-2 text-blue-700 dark:text-blue-300">
                      {measurements.facial_measurements?.face_width_mm}mm
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800 dark:text-blue-200">Head Yaw:</span>
                    <span className="ml-2 text-blue-700 dark:text-blue-300">
                      {measurements.facial_measurements?.head_yaw_degrees}°
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800 dark:text-blue-200">Head Roll:</span>
                    <span className="ml-2 text-blue-700 dark:text-blue-300">
                      {measurements.facial_measurements?.head_roll_degrees}°
                    </span>
                  </div>
                </div>
                
                {measurements.recommended_products && (
                  <div className="mt-4">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Recommended Product Dimensions:
                    </h4>
                    <div className="text-xs text-blue-700 dark:text-blue-300">
                      <div>Frame Width: {measurements.recommended_products.glasses?.frame_width_mm}mm</div>
                      <div>Frame Height: {measurements.recommended_products.glasses?.frame_height_mm}mm</div>
                      <div>Lens Width: {measurements.recommended_products.glasses?.lens_width_mm}mm</div>
                    </div>
                  </div>
                )}
                
                <div className="mt-3 text-xs">
                  <span className="font-medium text-blue-800 dark:text-blue-200">Accuracy:</span>
                  <span className={`ml-2 px-2 py-1 rounded ${
                    measurements.measurement_accuracy === 'high' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}>
                    {measurements.measurement_accuracy}
                  </span>
                </div>
              </div>
            )}

            {/* Try-On Results */}
            {result && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Try-On Output:
                </h3>
                
                {result.image_base64 && (
                  <div className="mb-4">
                    <img 
                      src={`data:image/jpeg;base64,${result.image_base64}`} 
                      alt="Try-On Result" 
                      className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                )}

                {/* Product Information */}
                {result.product_dimensions && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      Product Dimensions Applied:
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-green-800 dark:text-green-200">Frame Width:</span>
                        <span className="ml-2 text-green-700 dark:text-green-300">
                          {result.product_dimensions.frame_width_mm}mm
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-green-800 dark:text-green-200">Frame Height:</span>
                        <span className="ml-2 text-green-700 dark:text-green-300">
                          {result.product_dimensions.frame_height_mm}mm
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-green-800 dark:text-green-200">Lens Width:</span>
                        <span className="ml-2 text-green-700 dark:text-green-300">
                          {result.product_dimensions.lens_width_mm}mm
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-green-800 dark:text-green-200">Bridge Width:</span>
                        <span className="ml-2 text-green-700 dark:text-green-300">
                          {result.product_dimensions.bridge_width_mm}mm
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Placement Accuracy */}
                {result.placement_info && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                      Placement Accuracy:
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-yellow-800 dark:text-yellow-200">IPD Accuracy:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          result.placement_info.accuracy_metrics?.ipd_accuracy === 'high'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          {result.placement_info.accuracy_metrics?.ipd_accuracy}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-yellow-800 dark:text-yellow-200">Positioning:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          result.placement_info.accuracy_metrics?.positioning_accuracy === 'high'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          {result.placement_info.accuracy_metrics?.positioning_accuracy}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Raw Data */}
                <details className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
                    View Raw Data
                  </summary>
                  <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto mt-2">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
