import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <div className="card p-3">
      <img src={product.images[0].thumb} alt={product.name} className="w-full aspect-square object-cover rounded-lg" />
      <div className="mt-3">
        <div className="font-medium">{product.name}</div>
        <div className="text-gray-600 text-sm">€{product.price}</div>
      </div>
      <div className="mt-3 flex gap-2">
        <Link className="btn btn-outline w-full text-center" to={`/product/${product.id}`}>View</Link>
        <Link className="btn btn-primary w-full text-center" to="/studio" state={{ productId: product.id }}>
          Try On
        </Link>
      </div>
    </div>
  );
}
