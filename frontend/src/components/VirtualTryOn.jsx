<<<<<<< HEAD
 
=======
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

  const capture = () => {
    const screenshot = webcamRef.current.getScreenshot();
    setImageSrc(screenshot);
  };

  const retake = () => {
    setImageSrc(null);
    setResult(null);
  };

  const uploadToBackend = async () => {
    if (!imageSrc) return;

    setIsProcessing(true);
    try {
      const blob = await fetch(imageSrc).then((res) => res.blob());
      const formData = new FormData();
      formData.append("file", blob, "captured.jpg");

      const response = await fetch("http://localhost:8000/tryon", {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Virtual Try-On Camera
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Capture and try on glasses with AR technology
          </p>
        </div>

        {/* Main Content */}
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
              <div className="flex justify-center gap-4">
                <button 
                  onClick={retake}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                >
                  Retake
                </button>
                <button 
                  onClick={uploadToBackend}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                >
                  {isProcessing ? "Processing..." : "Try On Glasses"}
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Try-On Output:
              </h3>
              {result.image_base64 && (
                <div className="mb-4">
                  <img 
                    src={`data:image/jpeg;base64,${result.image_base64}`} 
                    alt="Try-On Result" 
                    className="mx-auto rounded-lg border-2 border-gray-300 dark:border-gray-600 max-w-md"
                  />
                </div>
              )}
              <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
>>>>>>> 2c2229392439d724fd2173100e742129bea60f1f
