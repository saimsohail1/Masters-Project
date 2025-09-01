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
          video: { facingMode: "user", width: 640, height: 640 },
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

        // draw current frame to canvas at a larger size for better quality
        const W = 640, H = 640;
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Live Try-On Stream
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300">
            Real-time glasses try-on with continuous processing
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Live Video Feed */}
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Live Camera Feed
              </h3>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full max-w-lg mx-auto rounded-xl border-4 border-gray-300 dark:border-gray-600 shadow-lg" 
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Controls */}
              <div className="flex justify-center gap-6 mt-6">
                <button 
                  onClick={() => setRunning(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition duration-300 text-lg"
                >
                  Start Processing
                </button>
                <button 
                  onClick={() => setRunning(false)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition duration-300 text-lg"
                >
                  Stop Processing
                </button>
              </div>

              {/* Status Messages */}
              {note === "no_face" && (
                <div className="mt-6 p-4 bg-red-100 border-2 border-red-400 text-red-700 rounded-xl text-lg">
                  No face detected—move closer / better lighting.
                </div>
              )}
            </div>

            {/* Processed Output */}
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Processed Output
              </h3>
              {outSrc ? (
                <img 
                  src={outSrc} 
                  alt="Try-On" 
                  className="w-full max-w-lg mx-auto rounded-xl border-4 border-gray-300 dark:border-gray-600 shadow-lg" 
                />
              ) : (
                <div className="w-full max-w-lg mx-auto h-96 bg-gray-200 dark:bg-gray-700 rounded-xl border-4 border-gray-300 dark:border-gray-600 flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🔄</div>
                    <p className="text-xl text-gray-600 dark:text-gray-400">Waiting for processed frames...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8">
            <h3 className="text-2xl font-semibold text-blue-900 dark:text-blue-100 mb-6">
              How to Use Live Try-On:
            </h3>
            <ol className="list-decimal list-inside space-y-3 text-blue-800 dark:text-blue-200 text-lg">
              <li>Allow camera access when prompted</li>
              <li>Position your face in the camera view</li>
              <li>Click "Start Processing" to begin real-time processing</li>
              <li>The system will continuously process frames at ~5 FPS</li>
              <li>Processed frames with glasses overlay will appear on the right</li>
              <li>Click "Stop Processing" to pause processing</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
