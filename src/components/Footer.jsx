export default function Footer() {
    return (
      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-500">
          © {new Date().getFullYear()} TryOn — Demo UI
        </div>
      </footer>
    );
  }
  