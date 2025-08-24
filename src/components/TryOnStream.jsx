import { useEffect, useRef, useState } from "react";
import { tryonFrame } from "../api/tryon";

export default function TryOnStream({
  productId = "glasses-001",
  controls = { scale: 1, offsetX: 0, offsetY: 0, rotationDeg: 0 }
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [outSrc, setOutSrc] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 480, height: 480 },
          audio: false
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) { console.error(e); }
    })();
  }, []);

  useEffect(() => {
    let id;
    const tick = async () => {
      const video = videoRef.current, canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== 4) return;

      canvas.width = 480; canvas.height = 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, 480, 480);
      const blob = await new Promise(res => canvas.toBlob(res, "image/jpeg", 0.85));
      try {
        const data = await tryonFrame(blob, { productId, ...controls });
        if (data.image_base64) setOutSrc(`data:image/jpeg;base64,${data.image_base64}`);
        setNote(data.note || "");
      } catch (e) {
        console.error("frame error", e);
      }
    };
    if (running) id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [running, productId, controls]);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="card p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">Live Camera</div>
          <div className="flex gap-2">
            <button className="btn" onClick={() => setRunning(true)}>Start</button>
            <button className="btn" onClick={() => setRunning(false)}>Stop</button>
          </div>
        </div>
        <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
        <canvas ref={canvasRef} className="hidden" />
        {note === "no_face" && <div className="mt-2 text-sm text-amber-700">No face detected — adjust lighting/position.</div>}
      </div>

      <div className="card p-3">
        <div className="font-medium mb-2">Processed Output</div>
        {outSrc ? (
          <img src={outSrc} alt="Try-On" className="w-full rounded-lg" />
        ) : (
          <div className="h-72 grid place-items-center text-gray-400">No output yet</div>
        )}
      </div>
    </div>
  );
}
