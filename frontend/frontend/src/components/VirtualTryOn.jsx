import React, { useRef, useState, useEffect, useCallback } from 'react';

const VirtualTryOn = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [processingStats, setProcessingStats] = useState({
    fps: 0,
    lastFrameTime: 0,
    totalFrames: 0
  });

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      setError('Failed to access camera: ' + err.message);
      console.error('Camera access error:', err);
    }
  }, []);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Send frame to backend
  const sendFrameToBackend = useCallback(async (imageBlob) => {
    if (isProcessing) return; // Skip if already processing
    
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', imageBlob, 'frame.jpg');

      const response = await fetch('/api/tryon', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Update processing stats
      setProcessingStats(prev => ({
        ...prev,
        totalFrames: prev.totalFrames + 1
      }));

      // If we have a processed image, display it on canvas
      if (result.image_base64) {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
          };
          img.src = `data:image/jpeg;base64,${result.image_base64}`;
        }
      }

    } catch (err) {
      console.error('Backend processing error:', err);
      setError('Backend processing failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  // Capture and process frame
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !isStreaming || isProcessing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (canvas && video.videoWidth > 0 && video.videoHeight > 0) {
      const ctx = canvas.getContext('2d');
      
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0);
      
      // Convert canvas to blob and send to backend
      canvas.toBlob((blob) => {
        if (blob) {
          sendFrameToBackend(blob);
        }
      }, 'image/jpeg', 0.8);
    }

    // Schedule next frame capture
    animationFrameRef.current = requestAnimationFrame(captureFrame);
  }, [isStreaming, isProcessing, sendFrameToBackend]);

  // Start frame capture loop
  const startFrameCapture = useCallback(() => {
    if (isStreaming && !animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(captureFrame);
    }
  }, [isStreaming, captureFrame]);

  // Stop frame capture loop
  const stopFrameCapture = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // FPS calculation
  useEffect(() => {
    if (isStreaming) {
      const interval = setInterval(() => {
        setProcessingStats(prev => {
          const now = Date.now();
          const timeDiff = now - prev.lastFrameTime;
          const fps = timeDiff > 0 ? Math.round(1000 / timeDiff) : 0;
          
          return {
            ...prev,
            fps,
            lastFrameTime: now
          };
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isStreaming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      stopFrameCapture();
    };
  }, [stopCamera, stopFrameCapture]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Virtual Try-On Camera
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Real-time AR try-on with object detection and glasses overlay
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Camera Controls */}
        <div className="flex justify-center gap-4 mb-8">
          {!isStreaming ? (
            <button
              onClick={startCamera}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              Start Camera
            </button>
          ) : (
            <>
              <button
                onClick={startFrameCapture}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
              >
                Start Processing
              </button>
              <button
                onClick={stopFrameCapture}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
              >
                Stop Processing
              </button>
              <button
                onClick={stopCamera}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
              >
                Stop Camera
              </button>
            </>
          )}
        </div>

        {/* Stats Display */}
        {isStreaming && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {processingStats.fps}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">FPS</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {processingStats.totalFrames}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Frames Processed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {isProcessing ? 'Processing' : 'Ready'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
              </div>
            </div>
          </div>
        )}

        {/* Video and Canvas Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Camera Feed */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Live Camera Feed
            </h3>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto rounded-lg border-2 border-gray-300 dark:border-gray-600"
              />
              {!isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📷</div>
                    <p className="text-gray-600 dark:text-gray-400">Camera not active</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Processed Output */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Processed Output
            </h3>
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="w-full h-auto rounded-lg border-2 border-gray-300 dark:border-gray-600"
              />
              {!isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🔄</div>
                    <p className="text-gray-600 dark:text-gray-400">No processed output</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            How to Use:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200">
            <li>Click "Start Camera" to begin video capture</li>
            <li>Click "Start Processing" to begin sending frames to the backend</li>
            <li>The backend will process each frame with YOLO object detection and glasses overlay</li>
            <li>Processed frames will appear in the right panel</li>
            <li>Monitor the stats panel for real-time performance metrics</li>
            <li>Click "Stop Processing" to pause frame processing</li>
            <li>Click "Stop Camera" to end the session</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn; 