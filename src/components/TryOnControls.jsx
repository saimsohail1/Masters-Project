export default function TryOnControls({
  value = { scale: 1, offsetX: 0, offsetY: 0, rotationDeg: 0 },
  onChange = () => {}
}) {
  const set = (k) => (e) => onChange({ ...value, [k]: Number(e.target.value) });
    return (
      <div className="card p-4 space-y-4">
        <div>
          <label className="block text-sm mb-1">Scale ({value.scale.toFixed(2)})</label>
          <input type="range" min="0.6" max="2" step="0.05" value={value.scale} onChange={set("scale")} className="w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Offset X ({value.offsetX})</label>
            <input type="range" min="-80" max="80" step="2" value={value.offsetX} onChange={set("offsetX")} className="w-full" />
          </div>
          <div>
            <label className="block text-sm mb-1">Offset Y ({value.offsetY})</label>
            <input type="range" min="-80" max="80" step="2" value={value.offsetY} onChange={set("offsetY")} className="w-full" />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Rotation ({value.rotationDeg}°)</label>
          <input type="range" min="-20" max="20" step="1" value={value.rotationDeg} onChange={set("rotationDeg")} className="w-full" />
        </div>
      </div>
    );
  }
  