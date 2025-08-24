const BASE = import.meta.env.VITE_API_BASE;

export async function tryonPhoto(file, payload = {}) {
  const fd = new FormData();
  fd.append("file", file, "photo.jpg");
  Object.entries(payload).forEach(([k, v]) => v !== undefined && fd.append(k, v));

  const res = await fetch(`${BASE}/tryon`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function tryonFrame(file, payload = {}) {
  const fd = new FormData();
  fd.append("file", file, "frame.jpg");
  Object.entries(payload).forEach(([k, v]) => v !== undefined && fd.append(k, v));

  const res = await fetch(`${BASE}/tryon/frame`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
