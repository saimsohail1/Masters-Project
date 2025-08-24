import { useParams, Link } from "react-router-dom";
import { getProduct } from "../api/products"; // see next section about filename

export default function Product() {
  const { id } = useParams();          // keep it as string

  if (!id) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Invalid product</h2>
        <Link className="btn btn-outline mt-4" to="/catalog">Back to Catalog</Link>
      </div>
    );
  }

  const product = getProduct(id);      // <-- pass string id directly
  if (!product) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Product not found</h2>
        <Link className="btn btn-outline mt-4" to="/catalog">Back to Catalog</Link>
      </div>
    );
  }

  const img = product.images?.[0]?.large || "/img/placeholder.jpg";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-6">
      <img src={img} alt={product.name} className="w-full rounded-xl border object-cover" />
      <div>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <div className="text-gray-600 mt-1 mb-4">€{product.price}</div>
        <div className="flex gap-2">
          <Link className="btn btn-primary" to="/studio" state={{ productId: product.id }}>
            Try On
          </Link>
          <button className="btn btn-outline">Add to Favorites</button>
        </div>
      </div>
    </div>
  );
}
