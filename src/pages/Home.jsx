import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
      <div>
        <h1 className="text-4xl font-semibold mb-4">Try before you buy</h1>
        <p className="text-gray-600 mb-6">Live virtual try-on for glasses, hats and more — right in your browser.</p>
        <div className="flex gap-3">
          <Link className="btn btn-primary" to="/studio">Try On Now</Link>
          <Link className="btn btn-outline" to="/catalog">Shop Catalog</Link>
        </div>
      </div>
      <div className="rounded-2xl bg-white border shadow-sm aspect-video grid place-items-center text-gray-400">
        Hero/preview image here
      </div>
    </div>
  );
}
