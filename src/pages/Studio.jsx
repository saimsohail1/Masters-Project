import { useLocation } from "react-router-dom";
import { useState } from "react";
import TryOnStream from "../components/TryOnStream";
import TryOnControls from "../components/TryOnControls";

export default function Studio() {
  const loc = useLocation();
  const [productId, setProductId] = useState(loc.state?.productId || "glasses-001");
  const [controls, setControls] = useState({ scale: 1, offsetX: 0, offsetY: 0, rotationDeg: 0 });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Try-On Studio</h2>
        <select className="border rounded p-2"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          <option value="glasses-001">Wayfarer – Black</option>
          <option value="hat-001">Beanie – Gray</option>
        </select>
      </div>

      <TryOnStream productId={productId} controls={controls} />
      <TryOnControls value={controls} onChange={setControls} />
    </div>
  );
}
