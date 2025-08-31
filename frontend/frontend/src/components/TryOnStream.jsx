import React, { useEffect, useRef, useState } from "react";

export default function TryOnStream() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [outSrc, setOutSrc] = useState(null);
  const [running, setRunning] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 480, height: 480 },
          audio: false
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera error:", err);
      }
    })();
  }, []);

  useEffect(() => {
    let timer;
    if (running) {
      const tick = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState !== 4) return;

        // draw current frame to canvas at a smaller size for speed
        const W = 480, H = 480;
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, W, H);

        // canvas → Blob → FormData
        const blob = await new Promise(res => canvas.toBlob(res, "image/jpeg", 0.85));
        const form = new FormData();
        form.append("file", blob, "frame.jpg");

        try {
          const resp = await fetch("http://localhost:8000/tryon", {
            method: "POST",
            body: form
          });
          const data = await resp.json();
          if (data.image_base64) {
            setOutSrc(`data:image/jpeg;base64,${data.image_base64}`);
            setNote(data.note || "");
          }
        } catch (e) {
          console.error("Frame upload failed:", e);
        }
      };

      timer = setInterval(tick, 200); // ~5 FPS; adjust to taste
    }
    return () => clearInterval(timer);
  }, [running]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Live Try-On Stream
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Real-time glasses try-on with continuous processing
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Live Video Feed */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Live Camera Feed
              </h3>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full max-w-sm mx-auto rounded-lg border-2 border-gray-300 dark:border-gray-600" 
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Controls */}
              <div className="flex justify-center gap-4 mt-4">
                <button 
                  onClick={() => setRunning(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                >
                  Start
                </button>
                <button 
                  onClick={() => setRunning(false)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                >
                  Stop
                </button>
              </div>

              {/* Status Messages */}
              {note === "no_face" && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  No face detected—move closer / better lighting.
                </div>
              )}
            </div>

            {/* Processed Output */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Processed Output
              </h3>
              {outSrc ? (
                <img 
                  src={outSrc} 
                  alt="Try-On" 
                  className="w-full max-w-sm mx-auto rounded-lg border-2 border-gray-300 dark:border-gray-600" 
                />
              ) : (
                <div className="w-full max-w-sm mx-auto h-64 bg-gray-200 dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🔄</div>
                    <p className="text-gray-600 dark:text-gray-400">Waiting for processed frames...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
              How to Use Live Try-On:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200">
              <li>Allow camera access when prompted</li>
              <li>Position your face in the camera view</li>
              <li>Click "Start" to begin real-time processing</li>
              <li>The system will continuously process frames at ~5 FPS</li>
              <li>Processed frames with glasses overlay will appear on the right</li>
              <li>Click "Stop" to pause processing</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 