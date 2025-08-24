import { Link, NavLink } from "react-router-dom";

export default function Header() {
  const link = "px-3 py-2 rounded-md hover:bg-gray-100";
  const active = ({ isActive }) => (isActive ? link + " bg-gray-200" : link);
  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold">TryOn</Link>
        <nav className="flex gap-2 text-sm">
          <NavLink to="/catalog" className={active}>Shop</NavLink>
          <NavLink to="/studio" className={active}>Try On</NavLink>
          <NavLink to="/favorites" className={active}>Favorites</NavLink>
        </nav>
      </div>
    </header>
  );
}
